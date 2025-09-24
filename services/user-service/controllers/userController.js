const User = require("../models/userModel");
const validator = require("validator");
const bcrypt = require("bcryptjs"); // for password hashing

// ✅ Get all users (Only systemAdmin can access)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "systemAdmin") {
      return res.status(403).json({ message: "🚫Access Denied." });
    }

    const users = await User.find().select("-password"); // hide password
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "❗No record found." });
    }

    res.status(200).json({ message: "✅Users data found.", data: users });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

// ✅ Get user by ID (User can access own record, Admin can access all)
const getUserByID = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "❗No user found." });
    }

    if (req.user.id !== user.id.toString() && req.user.role !== "systemAdmin") {
      return res.status(403).json({ message: "🚫Access Denied." });
    }

    res.status(200).json({ message: "✅User record found.", data: user });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

// ✅ Add new user (Only systemAdmin can create accounts)
const addUser = async (req, res) => {
  try {
    if (req.user.role !== "systemAdmin") {
      return res.status(403).json({ message: "🚫Access Denied." });
    }

    const { name, email, phone, password, role, address } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "❗Invalid email format." });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "❗Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.",
      });
    }

    const phoneRegex = /^(\+94|0)(70|71|72|74|75|76|77|78)[0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "❗Invalid Mobile number" });
    }

    const existUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existUser) {
      return res
        .status(400)
        .json({ message: "🚫User already registered. Please use login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      address,
    });

    await newUser.save();

    res.status(201).json({ message: `✅New ${role} created.` });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

// ✅ Update user (User can update own details, Admin can update anyone)
const updateUserDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, phone, password, address } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "❗No user found." });
    }

    if (req.user.id !== id && req.user.role !== "systemAdmin") {
      return res.status(403).json({ message: "🚫Access Denied." });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: "❗Invalid email format." });
    }

    let hashedPassword = user.password;
    if (password) {
      if (
        !validator.isStrongPassword(password, {
          minLength: 8,
          minNumbers: 1,
          minUppercase: 1,
          minSymbols: 1,
        })
      ) {
        return res.status(400).json({
          message:
            "❗Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.",
        });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateUser = await User.findByIdAndUpdate(
      id,
      { email, phone, password: hashedPassword, address },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "✅Update successful.", data: updateUser });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

// ✅ Delete user (Only Admin can delete)
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "❗No user found." });
    }

    if (req.user.role !== "systemAdmin") {
      return res.status(403).json({ message: "🚫Access Denied." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "✅User record deleted." });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

module.exports = {
  getAllUsers,
  getUserByID,
  addUser,
  updateUserDetails,
  deleteUser,
};
