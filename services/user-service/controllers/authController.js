const User = require("../models/userModel");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
<<<<<<< HEAD
<<<<<<< HEAD
const sanitize = require('mongo-sanitize')
=======
const { limiterSlowBruteByIP, limiterConsecutiveFailsByUsernameAndIP } = require("../middlewares/rateLimit");
>>>>>>> origin/amashi
=======
const { limiterSlowBruteByIP, limiterConsecutiveFailsByUsernameAndIP } = require("../middlewares/rateLimit");
>>>>>>> origin/amashi

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, address } = sanitize(req.body);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "❌Enter correct format of email." });
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
          "❌Password must include uppercase, lowercase, numbers, symbols and be at least 8 characters.",
      });
    }

    // Validate phone format
    const phoneRegex = /^(\+94|0)(70|71|72|74|75|76|77|78)[0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "❗Invalid Mobile number" });
    }

    // Check existing user
    const existUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existUser) {
      return res.status(400).json({ message: "❗Email or Phone already registered." });
    }

    // Hash password
    const hashPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashPassword,
      role,
      address,
    });

    await newUser.save();

    if (newUser) {
      res.status(201).json({ message: `✅New ${role} created.` });
    } else {
      return res.status(400).json({ message: "❌Error occurred. Please try again." });
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "❌Internal server error", error: err });
    }
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const ipAddr = req.ip;

    const userKey = `${username}_${ipAddr}`;

    if (!email || !password) {
      return res.status(400).json({ message: "❗Please enter email and password." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "❗Email is not valid." });
    }

<<<<<<< HEAD
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({ message: "❗Password not strong." });
    }

    await limiterSlowBruteByIP.consume(ipAddr);

    await limiterConsecutiveFailsByUsernameAndIP.consume(userKey);

    //find user
=======
    // Find user
>>>>>>> origin/sahan
    const existUser = await User.findOne({ email: email });
    if (!existUser) {
      return res.status(400).json({ message: "❌User not registered! Please register first." });
    }

    // Compare password
    const comparePassword = await bcryptjs.compare(password, existUser.password);
    if (!comparePassword) {
      return res.status(400).json({ message: "❌Wrong password." });
    }

<<<<<<< HEAD
    await limiterConsecutiveFailsByUsernameAndIP.delete(userKey);

    //create jsonwebtoken
    if (existUser && comparePassword) {
      const token = jwt.sign(
        { id: existUser.id, role: existUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
=======
    // Create JWT
    const token = jwt.sign(
      { id: existUser.id, role: existUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
>>>>>>> origin/sahan

    let response = {};

    if (existUser.role === "restaurantAdmin") {
      try {
        const restaurantData = await fetch(
          "http://restaurant-service:5011/api/restaurant/get-restaurant",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (restaurantData.ok) {
          const restaurant = await restaurantData.json();
          response.restaurantID = restaurant.data._id;
        }
      } catch (error) {
        console.log(error);
      }
    }
<<<<<<< HEAD
  } catch (rlRejected) {
    if (rlRejected instanceof err) {
      console.error(err);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ message: "❌Internal server error", error: err });
      } else {
        const retrySecs = Math.round(rlRejected.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(retrySecs));
        return res.status(429).send('Too many login attempts. Try again later.');
      }
=======

    // Only send safe user info (no password, no __v, etc.)
    const safeUser = {
      id: existUser._id,
      name: existUser.name,
      email: existUser.email,
      phone: existUser.phone,
      role: existUser.role,
      address: existUser.address,
    };

    res.status(200).json({
      message: "✅Login successful.",
      data: { token, user: safeUser, response },
      role: existUser.role,
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "❌Internal server error", error: err });
>>>>>>> origin/sahan
    }

  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      return res.status(404).json({ message: "❗User not found." });
    }

    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "❌New password must contain uppercase, lowercase, numbers, symbols and be at least 8 characters.",
      });
    }

    const hashPassword = await bcryptjs.hash(newPassword, 10);

    findUser.password = hashPassword;
    await findUser.save();

    res.status(200).json({ message: "✅Password reset successful." });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "❌Internal server error", error: err });
    }
  }
};

module.exports = { registerUser, loginUser, resetPassword };
