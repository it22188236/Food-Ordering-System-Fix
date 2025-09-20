const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Customer is required."],
      ref: "User",
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Restaurant is required."],
      ref: "Restaurant",
    },

    items: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true],
          ref: "MenuItems",
        },
        menuName:{
          type:String,
          required:true
        },
        quantity: {
          type: Number,
          required:[true],
          min:1
        },
      },
    ],

    totalPrice: {
      type: Number ,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "outForDelivery",
        "delivered",
        "cancel"
      ],
      default: "pending",
      // required:[true]
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
      // required:[true]
    },

    deliveryAddress:{
      type:String,
      required:[true,"Delivery address is required."]
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
