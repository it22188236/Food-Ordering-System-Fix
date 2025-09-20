const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const validateToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(404)
        .json({ message: "JWT secret not found in environment variables." });
    }
    const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
    console.log(verifyUser);

    if (!verifyUser) {
      return res
        .status(403)
        .json({ message: "Your session time is out. Please re-login." });
    }

    const user = await User.findById(verifyUser.id);
    if (!user) {
      return res.status(400).json("User not found.");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err });
    }
  }
};

module.exports = validateToken;
