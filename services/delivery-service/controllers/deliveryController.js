const Delivery = require("../models/deliveryModel");
const { getUserData } = require("../services/userService");
const { sendToQueue } = require("../utils/rabbitmq");
const EventType = require("@shared/events/eventTypes");

const createDelivery = async (orderData) => {
  try {
    const newDelivery = new Delivery({
      orderID: orderData.orderID,
      restaurant: orderData.restaurantID,
      customer: orderData.userID,
      status: "Pending",
      deliveryAddress: orderData.deliveryAddress,
    });

    await newDelivery.save();

    await sendToQueue("delivery_assignments", {
      type: EventType.DELIVERY_CREATED,
      data: newDelivery.toObject(),
    });

    console.log(newDelivery);
  } catch (error) {
    console.error(error);
  }
};

const deliveryPersonAssign = async (req, res) => {
  try {
    const orderID = req.params.orderID;

    const token = req.headers.authorization || req.headers.Authorization;

    const user = await getUserData(req.user.id, token);

    if (!user) {
      return res.status(403).json({ message: "🚫Access denied" });
    }

    const deliveries = await Delivery.findOne({ orderID: orderID });
    if (!deliveries) {
      return res.status(404).json({ message: "No delivery record found." });
    }

    if (deliveries.status === "Assigned") {
      return res
        .status(404)
        .json({ message: "❗delivery person assign for this order." });
    }

    // const deliveryPersonAssign = await Delivery.find({
    //   deliveryPersonID: req.user.id,
    // });
    //for deliver check two deliveries

    if (req.user.role !== "deliveryPerson") {
      return res
        .status(403)
        .json({ message: "🚫You are forbidden for this action." });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      deliveries.id,
      {
        deliveryPersonID: req.user.id,
        status: "Assigned",
        assignedAt: new Date(),
      },
      { new: true }
    );

    await sendToQueue("order_updates", {
      type: "DRIVER_ASSIGNED",
      data: {
        orderID: delivery.orderID,
        deliveryID: delivery._id,
        deliveryPersonID: delivery.deliveryPersonID,
      },
    });

    await sendToQueue("driver_notifications", {
      type: "DRIVER_NOTIFICATION",
      data: {
        deliveryPersonID: delivery.deliveryPersonID,
        message: `New delivery assigned: Order #${delivery.orderID} to ${delivery.deliveryPersonID}`,
      },
    });

    if (!delivery) {
      return res
        .status(400)
        .json({ message: "❌Delivery person not assign for this order." });
    }

    res
      .status(200)
      .json({ message: "✅Delivery Data updated.", data: delivery });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "❌Internal server error", error: error });
  }
};

const updateDeliverStatus = async (deliveryPersonID, status) => {
  return async (req, res) => {
    try {
      const deliveryID = req.params.id;

      const { status } = req.body;

      const updatedDelivery = await Delivery.findByIdAndUpdate(
        deliveryID,
        { status },
        { new: true }
      );

      if (!updatedDelivery) {
        return res.status(400).json({ message: "Error occurs.", error });
      }

      res.status(200).json({ message: "Update complete" });
    } catch (error) {
      console.error(error);
    }
  };
};

const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();

    if (!deliveries) {
      return res.status(404).json({ message: "No deliveries found." });
    }

    res
      .status(200)
      .json({ message: "Delivery record found.", data: deliveries });
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  deliveryPersonAssign,
  createDelivery,
  updateDeliverStatus,
  getAllDeliveries,
};
