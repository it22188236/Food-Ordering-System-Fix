const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleID: {
      type: String,
      unique: [true],
    },
    facebookID: {
      type: String,
      unique: [true],
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: [true, "Email is already taken"],
    },
    phone: {
      type: String,
      sparse: true,
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      // required: [true, "Password is required."],
    },
    role: {
      type: String,
      enum: ["customer", "restaurantAdmin", "deliveryPerson", "systemAdmin"],
      default: "customer",
      // required: [true, "User role is required."],
    },
    address: {
      type: String,
      // required: [true, "Address is required."],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
module.exports = User;
