const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      // unique: [true],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "LKR",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "cashOnDelivery", "payHere"],
    },
    payhere: {
      paymentID: { type: String },
      reference: { type: String },
      merchantID: { type: String },
    },
    paymentData: {
      type: Object,
    },
    items: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        quantity: {
          type: Number,
        },
      },
    ],

    // shorterID: {
    //   orderID_short: {
    //     type: String,
    //     unique: [true],
    //   },
    //   itemID_short: {
    //     type: String,
    //     unique: [true],
    //   },
    // },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payments", paymentSchema);
module.exports = Payment;
