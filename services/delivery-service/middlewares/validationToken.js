const jwt = require("jsonwebtoken");

const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "❌ Access token required" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "❌ Token not provided" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "❌ JWT secret not configured in environment" });
    }

    const verifyUser = jwt.verify(token, process.env.JWT_SECRET);

    if (!verifyUser) {
      return res.status(403).json({
        message: "❌ Invalid or expired token. Please log in again.",
      });
    }

    req.user = verifyUser; // Attach decoded user info
    next();
  } catch (err) {
    console.error("JWT Validation Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "❌ Token expired. Please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "❌ Invalid token. Please log in again." });
    }

    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌ Internal server error", error: err.message });
    }
  }
};

module.exports = validateToken;
