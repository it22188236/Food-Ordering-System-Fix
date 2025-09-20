require("./utils/setupAlias");
const express = require("express");
const http = require("http");
const dbConnection = require("./database");
const dotenv = require("dotenv");
const restaurantRoute = require("./routes/restaurantRoute");
const menuItemRoute = require("./routes/menuItemRoute");
const cors = require("cors");
const Restaurant = require("./models/restaurantModel");
const { Server } = require("socket.io");
const path = require('path');
const { consumeFromQueue } = require("./utils/rabbitmq");
const EventType = require("@shared/events/eventTypes");

const app = express();
const server = http.createServer(app);


app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",  // Allow frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname,"public/uploads")));

dotenv.config();
dbConnection();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle disconnection
  socket.on("join-room", (restaurantID) => {
    socket.join(restaurantID); // join room
    console.log(`Socket joined room ${restaurantID}`);
  });
});

consumeFromQueue("restaurant_notifications", async (message) => {
  try {
    console.log(
      `New order details for restaurant : ${message.data.restaurantID} `,
      message
    );

    const restaurant = await Restaurant.findById(message.data.restaurantID);

    if (!restaurant) {
      console.error(
        `User with ID ${message.data.restaurantID} not found. Sending to dead-letter queue or skipping.`
      );
    }

    switch (message.type) {
      case "ORDER_CREATED":
        console.log(
          `Notifying restaurant ${restaurant.name} about new order ${message.data.orderID}`
        );

        io.to(message.data.restaurantID).emit("new-order", {
          restaurantID: message.data.restaurantID,
          orderID: message.data.orderID,
          orderDetails: message.data.items,
        });

        console.log("👀 Emitting new order event with data:", {
          restaurantID: message.data.restaurantID,
          orderID: message.data.orderID,
          orderDetails: message.data.items,
        });
        // Here you would implement actual notification (email, push, etc.)
        break;
    }
  } catch (error) {
    console.log(error);
  }
});

const port = process.env.PORT || 5012;

app.use("/api/restaurant", restaurantRoute);
app.use("/api/menu", menuItemRoute);


server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
