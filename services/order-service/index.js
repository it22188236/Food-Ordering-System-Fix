require("./utils/setupAlias");
const express = require("express");
const dotenv = require("dotenv");
const dbConnection = require("./database");
const orderRouter = require("./routes/orderRoute");
const cartRouter = require("./routes/cartRoute");
const cors = require("cors");
const { consumeFromQueue } = require("./utils/rabbitmq");
const orderController = require("./controllers/orderController");

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();
dbConnection();

consumeFromQueue("user_notifications", async (message) => {
  switch (message.type) {
    case "ORDER_CONFIRMED":
      await orderController.updateOrderStatus(
        message.data.orderID,
        message.data.status
      );
      break;
  }
});

const port = process.env.PORT || 5022;

app.use("/api/order/", orderRouter);
app.use("/api/cart/", cartRouter);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
