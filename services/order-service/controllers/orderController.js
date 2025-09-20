const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
// const sendOrderMessages = require("../utils/msgProducer");
const { getUserData } = require("../services/userService");
const { getMenuItemData } = require("../services/restaurantService");
const { sendToQueue } = require("../utils/rabbitmq");
const EventType = require("@shared/events/eventTypes");
const axios = require("axios");
const { sendOrderNotification } = require("../services/notificationService");

const checkoutCart = async (req, res) => {
  try {
    const userID = req.user.id;
    const cart = await Cart.findOne({ customer: userID });

    const token = req.headers.authorization;

    const user = await getUserData(req.user.id, token);

    // const user = await axios(
    //   `${process.env.USER_SERVICE_URL}/api/users/get-user/${userID}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `${token}`,
    //     },
    //   }
    // );

    if (!user) {
      return res.status(404).json({ message: "User record not found." });
    }
    console.log("user records ", user);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "❗Your cart is empty." });
    }

    if (req.user.id !== user.id && req.user.id !== cart.customer.toString()) {
      return res.status(403).json({ message: "🚫Access denied." });
    }

    const { deliveryAddress } = req.body;

    if (!deliveryAddress) {
      return res
        .status(400)
        .json({ message: "❗Please added delivery address." });
    }
    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      // console.log(item.menu)
      // total += item.menu * item.quantity;
      // orderItems.push({
      //   menu: item.menu.id,
      //   quantity: item.quantity,
      // });
      const menuData = await getMenuItemData(cart.restaurant, item.menu); // item.menu = menu ID
      if (!menuData) {
        return res
          .status(404)
          .json({ message: `❌Menu item not found: ${item.menu}` });
      }

      // console.log("menu name:", item.name);

      total += item.quantity * menuData.data.price;

      orderItems.push({
        menu: item.menu, // just the ID, unless you want to store full menu info
        menuName: item.menuName,
        quantity: item.quantity,
      });

      if (menuData.data.availability === false) {
        return res.status(400).json({ message: "Item not available" });
      }
    }

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
              deliveryAddress:newOrder.deliveryAddress,
              status: "pending",
            },
          });

      if (!newOrder) {
        return res.status(400).json({ message: "New order unsaved." });
      }
      await newOrder.save();

      if (newOrder.status === "confirmed") {
        await Cart.findByIdAndDelete(cart._id);
      }

      sendOrderNotification(newOrder, "order_placed");
      res.status(201).json({
        message: "✅Order placed successfully.",
        data: newOrder,
      });
    }

    //await sendOrderMessages(newOrder, cart.restaurant, userID);

    // if (newOrder.paymentStatus === "paid") {

    // }
  } catch (error) {
    console.error("❌Checkout failed:", error);
    // res
    //   .status(500)
    //   .json({ message: "❌Internal Server Error", error: err.message });
  }
};

const updateOrderStatus = async (orderID, status) => {
  try {
    // const orderID = req.params.orderID;

    // const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderID,
      { status },
      { new: true }
    );

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
    }

    if (notificationType) {
      await sendOrderNotification(order, notificationType);
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
    // res.status(200).json({ message: "✅Order status updated.", data: order });
    console.log("Order updated success.");
  } catch (error) {
    console.error(error);
  }
};

const getOrders = async (req, res) => {
  try {
    const userID = req.user.id;
    const orders = await Order.find({ customer: userID });

    const token = req.headers.authorization;

    const user = await getUserData(userID, token);
    console.log(user);

    if (req.user.id !== user.data._id) {
      return res.status(403).json({ message: "🚫Access denied." });
    }

    if (!orders) {
      return res.status(404).json({ message: "❌No order found." });
    }

    res.status(200).json({ message: "✅Order data found.", data: orders });
  } catch (error) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const getRestaurantOrder = async (req, res) => {
  try {
    const restaurantID = req.params.restaurantID;

    console.log("restaurant ID", restaurantID);

    const order = await Order.find({ restaurant: restaurantID });

    if (!order) {
      res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json({ message: "Restaurant orders found.", data: order });
  } catch (error) {
    console.log(error);
  }
};

const getOrdersByID = async (orderID) => {
  try {
    const order = await Order.findById(orderID);

    if (!order) {
      return res.status(404).json({ message: "❗No order record found." });
    }

    res.status(200).json({ message: "✅Order Data found.", data: order });
  } catch (error) {
    console.error(error);
  }
};

const getOrderByID = async (req, res) => {
  try {
    const { orderID } = req.params.orderID;

    if (!orderID) {
      return res.status(404).json({ message: "No order found." });
    }

    const order = await Order.findById(orderID);

    if (!order) {
      return res.status(404).json({ message: "No order record found." });
    }

    res.status(200).json({ message: "Order data found.", data: order });
  } catch (error) {
    console.error(error);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderID);

    if (!order) {
      return res.status(404).json({ message: "❗No record found." });
    }

    const deleteOrder = await Order.findByIdAndDelete(req.params.id);

    await sendToQueue("restaurant_notifications", {
      type: EventType.ORDER_CANCELLED,
    });

    await sendToQueue("user_notifications", {
      type: EventType.ORDER_CANCELLED,
    });

    if (!deleteOrder) {
      return res.status(400).json({ message: "❌Order delete failed." });
    }

    res.status(200).json({ message: "✅Order deleted." });
  } catch (error) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
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
