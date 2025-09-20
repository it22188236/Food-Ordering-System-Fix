const User = require("../models/userModel");
const validator = require("validator");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const user = req.user.id;

    if (!users.length === 0) {
      return res.status(400).json({ message: "❗No record found." });
    }

    if(req.user.id !== user.id && req.user.role !== "systemAdmin"){
      return res.status(403).json({message:"🚫Access Denied."})
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

const getUserByID = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "❗No user found." });
    }

    if(req.user.id !== user.id && req.user.role !== "systemAdmin"){
      return res.status(403).json({message:"🚫Access Denied."})
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

const addUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, address } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "❗Email is not in right order." });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      return res
        .status(400)
        .json({
          message:
            "❗Password contain 8 or more characters. including uppercase, lowercase, number or special character.",
        });
    }

    const phoneRegex = /^(\+94|0)(70|71|72|74|75|76|77|78)[0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "❗Invalid Mobile number" });
    }

    const existUser = await User.findOne({ email: email, phone: phone });

    if (existUser) {
      return res
        .status(400)
        .json({ message: "🚫User is registered. Please use login." });
    }

    const newUser = new User({
      name,
      email,
      phone,
      password,
      role,
      address,
    });

    await newUser.save();

    if (!newUser) {
      return res.status(400).json({ message: "❌Record created failed." });
    }

    res.status(201).json({ message: `✅new ${role} created.` });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "❗No user found." });
    }

    const { email, phone, password, address } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "❗Email is not in right order." });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      return res
        .status(400)
        .json({
          message:
            "❗Password contain 8 or more characters. including uppercase, lowercase, number or special character.",
        });
    }

    const updateUser = await User.findByIdAndUpdate(id, {
      email: email,
      phone: phone,
      password: password,
      address: address,
    });

    if (!updateUser) {
      return res.status(400).json({ message: "❌Update failed." });
    }

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

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "❗No user found." });
    }

    const deleteUser = await User.findByIdAndDelete(id);

    if (!deleteUser) {
      return res.status(400).json({ message: "❌Delete failed." });
    }

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

module.exports = { getAllUsers, getUserByID, updateUserDetails, deleteUser, addUser };
