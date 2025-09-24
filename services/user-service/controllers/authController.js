const User = require("../models/userModel");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { limiterSlowBruteByIP, limiterConsecutiveFailsByUsernameAndIP } = require("../middlewares/rateLimit");

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, address } = req.body;

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ message: "❌Enter correct format of email." });
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
          "❌Password contains uppercase, lowercase letters, numbers, special characters. And password length minimum 8 characters.",
      });
    }

    const existUser = await User.findOne({ email: email, phone: phone });
    if (existUser) {
      return res.status(400).json({ message: "❗User already registered." });
    }

    const existPhone = await User.findOne({ phone: phone });
    if (existPhone) {
      return res.status(400).json({ message: "❗Phone number already taken." });
    }

    const existEmail = await User.findOne({ email: email });
    if (existEmail) {
      return res.status(400).json({ message: "❗Email already taken." });
    }

    const phoneRegex = /^(\+94|0)(70|71|72|74|75|76|77|78)[0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "❗Invalid Mobile number" });
    }

    //hash password

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
      res.status(201).json({ message: `✅new ${role} created.` });
    } else {
      return res
        .status(400)
        .json({ message: "❌Error occurs please try again." });
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const ipAddr = req.ip;

    const userKey = `${username}_${ipAddr}`;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "❗Please enter email and password." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "❗Email is not valid." });
    }

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
    const existUser = await User.findOne({ email: email });
    if (!existUser) {
      return res
        .status(400)
        .json({ message: "❌User not registered! Please register first." });
    }

    //compare password
    const comparePassword = await bcryptjs.compare(
      password,
      existUser.password
    );

    if (!comparePassword) {
      return res.status(400).json({ message: "❌Wrong password." });
    }

    await limiterConsecutiveFailsByUsernameAndIP.delete(userKey);

    //create jsonwebtoken
    if (existUser && comparePassword) {
      const token = jwt.sign(
        { id: existUser.id, role: existUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

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

      res.status(200).json({
        message: "✅Login successful.",
        data: { token, existUser, response },
        role: existUser.role,
      });
    } else {
      return res.status(400).json({ message: "❌Login failed." });
    }
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
    }

  }
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      return res.status(404).json({ message: "❗User not found." });
    }

    //for notification
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

module.exports = { registerUser, loginUser, resetPassword };
