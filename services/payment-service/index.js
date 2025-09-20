const express = require("express");
const dbConnection = require("./database");
const dotenv = require("dotenv");
const { consumeFromQueue } = require("./utils/rabbitmq");
const cors = require("cors");
const paymentRoute = require("./routes/paymentRoute");
const Payment = require("./models/paymentModel");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Add CSP headers to your Express server
app.use((req, res, next) => {
  res.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://sandbox.payhere.lk; style-src 'self' 'unsafe-inline'"
  );
  next();
});
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

dotenv.config();
dbConnection();

consumeFromQueue("payment_requests", async (paymentData) => {
  console.log("received data for payment:", paymentData);

  const newPayment = new Payment({
    orderID: paymentData.data.orderID,
    amount: paymentData.data.total,
    customer: paymentData.data.customer,
    restaurant: paymentData.data.restaurant,
    items: paymentData.data.items,
    currency: "LKR",
    paymentStatus: "pending",
  });

  if (!newPayment) {
    return res.status(400).json({ message: "No payment recorded." });
  }

  const orderPaymentExist = await Payment.findOne({
    orderID: paymentData.data.orderID,
  });

  if (!orderPaymentExist) {
    await newPayment.save();
    console.log(
      `Payment record created for Order ID: ${paymentData.data.orderID}`
    );
  }
});

const port = process.env.PORT || 5042;

app.use("/api/payment", paymentRoute);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
