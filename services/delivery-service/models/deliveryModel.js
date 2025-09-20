const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
    },
    deliveryPersonID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "PickedUp", "OnTheWay", "Delivered"],
      default: "Pending",
    },
    deliveryAddress: {
      type: String,
      // required: [true],
    },
    assignedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("deliveries", deliverySchema);

module.exports = Delivery;
