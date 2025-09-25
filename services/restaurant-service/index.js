require("./utils/setupAlias");
const express = require("express");
const http = require("http");
const dbConnection = require("./database");
const dotenv = require("dotenv");
const cors = require("cors");
const { consumeFromQueue } = require("./utils/rabbitmq");
const User = require("./models/userModel");
const EventType = require("@shared/events/eventTypes");
const { ObjectId } = require("mongoose").Types;

// CSRF protection middlewares
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const app = express();

app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true, // allow cookies/auth
  })
);

// Cookie parser must come before csurf
app.use(cookieParser());

// Enable CSRF protection for all routes using cookies
app.use(csurf({ cookie: true }));

// CSRF token endpoint for the frontend to fetch a valid token
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

dotenv.config();
dbConnection();

/*
// Example of commented-out consumeFromQueue
consumeFromQueue("user_notifications", async (message) => {
  const user = await User.findById(message.userID);

  switch (message.type) {
    case EventType.ORDER_CONFIRMED:
      console.log(
        `Notifying user ${user.name} about order confirmation ${message.orderID}`
      );
      break;
    case EventType.ORDER_STATUS_UPDATE:
      console.log(
        `Notifying user ${user.name} about status update for order ${message.orderID}: ${message.status}`
      );
      break;
  }
});
*/

consumeFromQueue("user_notifications", async (message) => {
  try {
    console.log(`User service received order : `, message);

    const user = await User.findById(message.data.userID);

    if (!user) {
      console.error(
        `User with ID ${message.data.userID} not found. Sending to dead-letter queue or skipping.`
      );
      // If you use manual ack/nack, you might nack here:
      // channel.nack(message, false, false); // don't requeue
      return;
    }

    switch (message.type) {
      case "ORDER_CONFIRMED":
        console.log(
          `Notifying user ${user.name} about order confirmation ${message.data.orderID}`
        );
        break;
      case "ORDER_STATUS_UPDATE":
        console.log(
          `Notifying user ${user.name} about status update for order ${message.data.orderID}: ${message.data.status}`
        );
        break;
      default:
        console.warn(`Unknown event type: ${message.type}`);
    }
  } catch (error) {
    console.error("Error processing user notification:", error);
    // Optionally nack the message to retry later
    // channel.nack(message, false, true); // requeue for retry
  }
});

const port = process.env.PORT || 5002;

const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

app.use("/api/users/", userRoute);
app.use("/api/auth/", authRoute);

// CSRF error handler (recommended)
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    // CSRF token errors
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next(err);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on ${port}`);
});
