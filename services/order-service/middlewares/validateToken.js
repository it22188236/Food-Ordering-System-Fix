const jwt = require("jsonwebtoken");

const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "❌ Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "❌ JWT secret not configured in environment variables" });
    }

    let verifyUser;
    try {
      verifyUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "❌ Token expired. Please log in again." });
      } else if (err.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "❌ Invalid token. Please log in again." });
      } else {
        console.error("JWT verification failed:", err);
        return res
          .status(500)
          .json({ message: "❌ Token verification failed" });
      }
    }

    // Attach verified payload to request (e.g. { id, role, email })
    req.user = verifyUser;
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌ Internal server error" });
    }
  }
};

module.exports = validateToken;
