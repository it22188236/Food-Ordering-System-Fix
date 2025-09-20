const express = require("express");
const dotenv = require("dotenv");
const dbConnection = require("./database");
const http = require("http");
const { Server } = require("socket.io");
const notificationRoute = require("./routes/notificationRoute");
const { consumeFromQueue } = require("./utils/rabbitmq");
const { createNotification } = require("./controllers/notificationController");
const app = express();
app.use(express.json());

consumeFromQueue("order_updates", async (message) => {
  switch (message.type) {
    case "ORDER_CONFIRMED":
      await createNotification(message.data);
      break;
  }
});

dotenv.config();
dbConnection();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("a user connected");

  // Join user-specific room
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Make io accessible in routes
app.set("io", io);

const port = process.env.PORT || 5052;

app.use("/api/notification", notificationRoute);

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
