const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

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

// 🔐 Hash password before save (only if modified or new)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

const User = mongoose.model("users", userSchema);
module.exports = User;
