const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required."],
    },
    address: {
      type: String,
      required: [true, "Address is required."],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      unique: [true, "Phone number already taken."],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: [true, "Owner is required."],
    },
    openingHours: {
      type: Map,
      of: { open: Number, close: Number },
      required: [true, "Opening hours is required."],
    },
    status: {
      type: String,
      enum: ["open", "close"],
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;
