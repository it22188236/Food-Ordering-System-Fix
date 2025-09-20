const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        menuName: { type: String, required:true },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number },
  },
  { timestamps: true }
);

const Cart = mongoose.model("carts", cartSchema);
module.exports = Cart;
