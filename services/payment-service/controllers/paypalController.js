const { client } = require("../config/PaypalClient.js");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModel.js");

export const createOrder = async (req, res) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "1.5",
        },
      },
    ],
  });

  try {
    const order = await client().execute(request);
    console.log("Creating PayPal order...");
    console.log("Using PayPal client ID:", process.env.PAYPAL_CLIENT_ID);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("PayPal createOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const captureOrder = async (req, res) => {
  const orderId = req.params.orderID;
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    res.json({ capture: capture.result });

    if (capture.result.status === 200) {
      const userID = req.user.id;

      const user = await User.findById(userID);
      if (!user) {
        return res.status(401).json({ message: "User not logging" });
      }

      const updateUser = await User.findByIdAndUpdate(
        userID,
        { accType: "paid", paymentDate: new Date() },
        { new: true }
      );

      if (!updateUser) {
        return res.status(400).json({ message: "User update unsuccessful." });
      }

      await updateUser.save();

      res.status(200).json({ message: "User update successful." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
