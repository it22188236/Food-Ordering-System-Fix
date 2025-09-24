const { getUserData } = require("../services/userService");
const Payment = require("../models/paymentModel");
const crypto = require("crypto");
const { sendToQueue } = require("../utils/rabbitmq");
const validator = require("validator");

// Load env vars safely
const merchant_id = process.env.PAYHERE_MERCHANT_ID?.trim();
const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
const return_url = process.env.PAYHERE_RETURN_URL;
const cancel_url = process.env.PAYHERE_CANCEL_URL;
const notify_url = process.env.PAYHERE_NOTIFY_URL;

if (!merchant_id || !merchant_secret) {
  console.error("⚠️ PayHere credentials are missing in environment variables!");
}

const generateCheckoutHash = (orderId, amount) => {
  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashString = [
    merchant_id,
    orderId,
    amountFormatted,
    "LKR",
    crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase(),
  ].join("|");

  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
};

const verifyPayment = (paymentData) => {
  const {
    merchant_id: receivedMerchantId,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = paymentData;

  if (receivedMerchantId !== merchant_id) {
    return { isValid: false, isSuccess: false };
  }

  const localHash = crypto
    .createHash("md5")
    .update(
      [
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase(),
      ].join("|")
    )
    .digest("hex")
    .toUpperCase();

  const isValid = localHash === md5sig;
  const isSuccess = isValid && status_code === "2";

  return { isValid, isSuccess };
};

const initiatePayment = async (req, res) => {
  try {
    const orderId = req.params.orderID;

    if (!validator.isAlphanumeric(orderId)) {
      return res.status(400).json({ message: "Invalid orderID format" });
    }

    const order = await Payment.findOne({ orderID: orderId });
    if (!order) {
      return res.status(404).json({ message: "No payment record found." });
    }

    const hash = generateCheckoutHash(orderId.toString(), order.amount);

    const token = req.headers.authorization || req.headers.Authorization;
    const user = await getUserData(req.user.id, token);

    if (!user || !user.data) {
      return res.status(404).json({ message: "No user record found." });
    }

    const amountFormatted = parseFloat(order.amount).toFixed(2);

    // Sanitize user data
    const paymentData = {
      merchant_id,
      return_url,
      cancel_url,
      notify_url,
      order_id: orderId.toString(),
      items: order.items.map((item) => String(item.menu)).join(", ").substring(0, 255),
      currency: "LKR",
      amount: amountFormatted,
      first_name: String(user.data.first_name || "").substring(0, 50),
      last_name: String(user.data.last_name || "").substring(0, 50),
      email: validator.isEmail(user.data.email || "") ? user.data.email : "noreply@example.com",
      phone: String(user.data.phone || "").substring(0, 20),
      address: String(user.data.address || "").substring(0, 100),
      city: "Colombo",
      country: "Sri Lanka",
      hash,
      custom_1: orderId,
    };

    res.json({
      paymentUrl: `https://sandbox.payhere.lk/pay/checkout`,
      paymentData: {
        ...paymentData,
        amount: paymentData.amount.toString(),
        custom_1: encodeURIComponent(paymentData.custom_1),
      },
    });

    // Messaging queues
    await sendToQueue("delivery_requests", {
      type: "DELIVERY_CREATED",
      data: {
        orderID: orderId,
        userID: user.data._id,
        restaurantID: order.restaurant,
        status: "confirmed",
      },
    });

    await sendToQueue("restaurant_notifications", {
      type: "ORDER_CONFIRMED",
      data: { orderID: orderId, status: "confirmed" },
    });

    await sendToQueue("user_notifications", {
      type: "ORDER_CONFIRMED",
      data: { orderID: orderId, userID: req.user.id, status: "confirmed" },
    });

  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const notifyPayment = async (req, res) => {
  try {
    const paymentData = req.body;

    if (!paymentData || !paymentData.order_id) {
      return res.status(400).send("Invalid payment data");
    }

    const { isValid, isSuccess } = verifyPayment(paymentData);

    if (!isValid) {
      console.error("Invalid payment notification:", {
        orderId: paymentData.order_id,
        reason: "Hash verification failed",
      });
      return res.status(400).send("Invalid payment notification");
    }

    const order = await Payment.findOne({
      orderID: paymentData.custom_1 || paymentData.order_id,
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Update order/payment status if needed
    order.status = isSuccess ? "success" : "failed";
    await order.save();

    console.log("Payment notification processed:", {
      orderId: paymentData.order_id,
      status: order.status,
    });

    res.status(200).send("Notification received");
  } catch (error) {
    console.error("Payment notification error:", error);
    res.status(500).send("Internal server error");
  }
};

const handleCallback = async (req, res) => {
  try {
    console.log("Payment callback received:", req.body);
    res.status(200).send("Callback received");
  } catch (error) {
    console.error("Callback processing error:", error);
    res.status(500).send("Error processing callback");
  }
};

module.exports = { initiatePayment, notifyPayment, handleCallback };
