// services/order-service/controllers/orderController.js

const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
// const sendOrderMessages = require("../utils/msgProducer");
const { getUserData } = require("../services/userService");
const { getMenuItemData } = require("../services/restaurantService");
const { sendToQueue } = require("../utils/rabbitmq");
const EventType = require("@shared/events/eventTypes");
const { sendOrderNotification } = require("../services/notificationService");

/**
 * Helper: validate ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Create new order from cart
 */
const checkoutCart = async (req, res) => {
  try {
    const userID = req.user.id;
    const cart = await Cart.findOne({ customer: userID });

    const token = req.headers.authorization;

    const user = await getUserData(req.user.id, token);

    if (!user) {
      return res.status(404).json({ message: "User record not found." });
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // ensure requester is either the user or matches the cart customer
    if (req.user.id !== user.id && req.user.id !== cart.customer.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { deliveryAddress } = req.body;

    if (!deliveryAddress) {
      return res
        .status(400)
        .json({ message: "Please added delivery address." });
    }

    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const menuData = await getMenuItemData(cart.restaurant, item.menu);
      if (!menuData) {
        return res
          .status(404)
          .json({ message: `Menu item not found: ${item.menu}` });
      }

      // compute total
      total += item.quantity * menuData.data.price;

      orderItems.push({
        menu: item.menu, // menu ID
        menuName: item.menuName,
        quantity: item.quantity,
      });

      if (menuData.data.availability === false) {
        return res.status(400).json({ message: "Item not available" });
      }
    }

    // check if similar pending order exists
    const existOrderDetails = await Order.findOne({
      customer: userID,
      restaurant: cart.restaurant,
      items: orderItems,
      status: "pending",
      paymentStatus: "pending",
    });

    if (!existOrderDetails) {
      const newOrder = new Order({
        customer: userID,
        restaurant: cart.restaurant,
        items: orderItems,
        totalPrice: total,
        deliveryAddress: deliveryAddress,
      });

      // push events to queues (non-blocking)
      await sendToQueue("restaurant_notifications", {
        type: "ORDER_CREATED",
        data: {
          orderID: newOrder._id,
          restaurantID: newOrder.restaurant,
          items: newOrder.items,
        },
      });

      await sendToQueue("user_notifications", {
        type: "ORDER_CONFIRMED",
        data: {
          orderID: newOrder._id,
          userID: newOrder.customer,
          message: `Your order #${newOrder._id} has been placed.`,
        },
      });

      await sendToQueue("payment_requests", {
        type: "PAYMENT_INITIATED",
        data: {
          orderID: newOrder._id,
          total: newOrder.totalPrice,
          customer: newOrder.customer,
          restaurant: newOrder.restaurant,
          items: newOrder.items,
        },
      });

      await sendToQueue("delivery_requests", {
        type: "DELIVERY_CREATED",
        data: {
          orderID: newOrder._id,
          userID: newOrder.customer,
          restaurantID: newOrder.restaurant,
          deliveryAddress: newOrder.deliveryAddress,
          status: "pending",
        },
      });

      // save order
      await newOrder.save();

      // remove cart only if order got confirmed (if your logic requires)
      if (newOrder.status === "confirmed") {
        await Cart.findByIdAndDelete(cart._id);
      }

      // send notifications
      try {
        sendOrderNotification(newOrder, "order_placed");
      } catch (notifyErr) {
        console.error("Notification error:", notifyErr);
      }

      return res.status(201).json({
        message: "Order placed successfully.",
        data: newOrder,
      });
    }

    // If similar pending order exists, respond accordingly
    return res
      .status(200)
      .json({ message: "An existing pending order found.", data: existOrderDetails });
  } catch (error) {
    console.error("Checkout failed:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
};

/**
 * Update order status (called by restaurant service or admin)
 * Router: PATCH /update-order-status/:orderID
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(orderID)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(orderID);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization: only restaurant (or admin) can update status
    // Adjust this logic if you have a dedicated restaurant-role and linking field
    if (req.user.role !== "admin" && req.user.role !== "restaurant") {
      return res
        .status(403)
        .json({ message: "You are not authorized to update order status" });
    }

    // If user is restaurant role, ensure they belong to the same restaurant (if such field exists)
    if (req.user.role === "restaurant") {
      // If req.user stores restaurant id in e.g., req.user.restaurantId, check it:
      if (req.user.restaurantId && order.restaurant.toString() !== req.user.restaurantId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized for this restaurant's orders" });
      }
    }

    order.status = status;
    await order.save();

    let notificationType;
    switch (status) {
      case "confirmed":
        notificationType = "order_accepted";
        break;
      case "preparing":
        notificationType = "order_preparing";
        break;
      case "outForDelivery":
        notificationType = "order_ready";
        break;
      case "delivered":
        notificationType = "order_delivered";
        break;
      case "cancel":
        notificationType = "order_cancel";
        break;
      default:
        notificationType = null;
    }

    if (notificationType) {
      try {
        await sendOrderNotification(order, notificationType);
      } catch (err) {
        console.error("Notification send failed:", err);
      }
    }

    await sendToQueue("user_notifications", {
      type: EventType.ORDER_STATUS_UPDATE,
      data: {
        userId: order.customer,
        orderId: order._id,
        status: order.status,
        message: `Your order #${order._id} status changed to ${status}`,
      },
    });

    if (status === "preparing") {
      await sendToQueue("delivery_requests", {
        type: "DELIVERY_CREATED",
        data: {
          orderID: order._id,
          restaurantID: order.restaurant,
          userID: order.customer,
          deliveryAddress: order.deliveryAddress,
          totalPrice: order.totalPrice,
        },
      });
    }

    return res.status(200).json({ message: "Order status updated.", data: order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

/**
 * Get orders of the authenticated user
 * Router: GET /all-orders
 */
const getOrders = async (req, res) => {
  try {
    const userID = req.user.id;

    const orders = await Order.find({ customer: userID }).lean();

    // (Optional) double-check user service data if needed
    const token = req.headers.authorization;
    let user;
    try {
      user = await getUserData(userID, token);
    } catch (err) {
      console.warn("Warning: getUserData failed", err);
    }

    // If you expect getUserData to return user.data._id, ensure check; otherwise skip
    if (user && user.data && req.user.id !== user.data._id) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No order found." });
    }

    return res.status(200).json({ message: "Order data found.", data: orders });
  } catch (error) {
    console.error("getOrders error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
};

/**
 * Get orders for a restaurant (protected)
 * Router: GET /get-restaurant-order/:restaurantID
 * NOTE: Authorization here is application specific. We allow admins and restaurant-role users who match restaurantId.
 */
const getRestaurantOrder = async (req, res) => {
  try {
    const { restaurantID } = req.params;

    if (!isValidObjectId(restaurantID)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    // Authorization: only admin or restaurant owner can fetch
    if (req.user.role !== "admin" && req.user.role !== "restaurant") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (req.user.role === "restaurant") {
      // If restaurant users have a restaurantId field, ensure match
      if (req.user.restaurantId && req.user.restaurantId.toString() !== restaurantID.toString()) {
        return res.status(403).json({ message: "Unauthorized for this restaurant" });
      }
    }

    const orders = await Order.find({ restaurant: restaurantID }).lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    return res.status(200).json({ message: "Restaurant orders found.", data: orders });
  } catch (error) {
    console.error("getRestaurantOrder error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

/**
 * Get a single order by ID (ownership enforced)
 * Router: GET /:orderID
 */
const getOrdersByID = async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!isValidObjectId(orderID)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderID).lean();
    if (!order) {
      return res.status(404).json({ message: "No order record found." });
    }

    // Ownership check: owner or admin or restaurant (if applicable)
    if (order.customer.toString() !== req.user.id && req.user.role !== "admin" && req.user.role !== "restaurant") {
      return res.status(403).json({ message: "You are not authorized to view this order" });
    }

    // If restaurant role, ensure same restaurant
    if (req.user.role === "restaurant" && req.user.restaurantId && order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: "You are not authorized for this restaurant order" });
    }

    return res.status(200).json({ message: "Order Data found.", data: order });
  } catch (error) {
    console.error("getOrdersByID error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

/**
 * Alternative single order fetch (router had /get-order/:orderID)
 * Router: GET /get-order/:orderID
 */
const getOrderByID = async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!isValidObjectId(orderID)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderID).lean();
    if (!order) {
      return res.status(404).json({ message: "No order record found." });
    }

    // Ownership check same as above
    if (order.customer.toString() !== req.user.id && req.user.role !== "admin" && req.user.role !== "restaurant") {
      return res.status(403).json({ message: "You are not authorized to view this order" });
    }

    if (req.user.role === "restaurant" && req.user.restaurantId && order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: "You are not authorized for this restaurant order" });
    }

    return res.status(200).json({ message: "Order data found.", data: order });
  } catch (error) {
    console.error("getOrderByID error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

/**
 * Delete an order (ownership enforced)
 * Router: DELETE /:orderID
 */
const deleteOrder = async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!isValidObjectId(orderID)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderID);
    if (!order) {
      return res.status(404).json({ message: "No record found." });
    }

    // Only owner or admin can delete
    if (order.customer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this order" });
    }

    const deleted = await Order.findByIdAndDelete(orderID);

    // push cancel notifications
    await sendToQueue("restaurant_notifications", {
      type: EventType.ORDER_CANCELLED,
      data: { orderId: orderID },
    });

    await sendToQueue("user_notifications", {
      type: EventType.ORDER_CANCELLED,
      data: { orderId: orderID },
    });

    if (!deleted) {
      return res.status(400).json({ message: "Order delete failed." });
    }

    return res.status(200).json({ message: "Order deleted." });
  } catch (error) {
    console.error("deleteOrder error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
};

module.exports = {
  checkoutCart,
  getOrdersByID,
  getOrders,
  deleteOrder,
  getRestaurantOrder,
  updateOrderStatus,
  getOrderByID,
};
