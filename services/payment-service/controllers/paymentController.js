const { getUserData } = require("../services/userService");
const Payment = require("../models/paymentModel");

const merchant_id = process.env.PAYHERE_MERCHANT_ID.trim();
const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
const return_url = process.env.PAYHERE_RETURN_URL;
const cancel_url = process.env.PAYHERE_CANCEL_URL;
const notify_url = process.env.PAYHERE_NOTIFY_URL;
const checkout_url = process.env.PAYHERE_CHECKOUT_URL;
const sandboxMode = process.env.SANDBOX_MODE;
const { customAlphabet } = require("nanoid");

const { sendToQueue } = require("../utils/rabbitmq");

const crypto = require("crypto");
const axios = require("axios");
const https = require("https");

const generateCheckoutHash = (orderId, amount) => {
  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashString = [
    merchant_id,
    orderId,
    amountFormatted,
    "LKR",
    crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase(),
  ].join("|");

  return crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();
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

  // const hashedSecret = crypto
  //   .createHash("md5")
  //   .update(config.merchantSecret)
  //   .digest("hex")
  //   .toUpperCase();

  // const localMd5sig = crypto
  //   .createHash("md5")
  //   .update(
  //     merchant_id +
  //       order_id +
  //       payhere_amount +
  //       payhere_currency +
  //       status_code +
  //       hashedSecret
  //   )
  //   .digest("hex")
  //   .toUpperCase();

  const localHash = crypto
    .createHash("md5")
    .update(
      [
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        crypto
          .createHash("md5")
          .update(merchant_secret)
          .digest("hex")
          .toUpperCase(),
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
    // await checkPayHereConnectivity();
    const orderId = req.params.orderID;

    const order = await Payment.findOne({ orderID: orderId });
    if (!order) {
      return res.status(404).json({ message: "No payment record found." });
    }

    const hash = generateCheckoutHash(orderId.toString(), order.amount);

    console.log("Hash : ", hash);

    // if (order.shorterID.orderID_short === null) {
    //   const shortOrderID = customAlphabet(orderId, 8);
    //   console.log(shortOrderID());
    // }

    // const itemDetails = order.items
    //   .map((i) => {
    //     const shortId = Buffer.from(i.menu.toString(), "hex")
    //       .toString("base64")
    //       .replace(/[^a-zA-Z0-9]/g, "") // remove symbols like =, /, +
    //       .slice(0, 8);

    //     return `${shortId} x ${i.quantity}`;
    //   })
    //   .join(", ");

    const token = req.headers.authorization || req.headers.Authorization;
    const user = await getUserData(req.user.id, token);

    if (!user) {
      return res.status(404).json({ message: "No user record found." });
    }

    const amountFormatted = parseFloat(order.amount).toFixed(2);

    const paymentData = {
      merchant_id: merchant_id,
      return_url: return_url,
      cancel_url: cancel_url,
      notify_url: notify_url,
      order_id: orderId.toString(),
      items: order.items
        .map((item) => item.menu)
        .join(", ")
        .substring(0, 255),
      currency: "LKR",
      amount: amountFormatted,
      first_name: user.data.first_name.substring(0, 50),
      last_name: user.data.last_name.substring(0, 50),
      email: user.data.email.substring(0, 100),
      phone: user.data.phone.substring(0, 20),
      address: user.data.address.substring(0, 100),
      city: "Colombo",
      country: "Sri Lanka",
      hash: hash,
      custom_1: orderId,
    };

    // res.json({
    //   paymentUrl: checkout_url, //sandboxMode
    //   // ? "https://sandbox.payhere.lk/pay/checkout"
    //   // : "https://www.payhere.lk/pay/checkout",
    //   paymentData: paymentData
    // });

    res.json({
      paymentUrl: `https://sandbox.payhere.lk/pay/checkout`,
      paymentData: {
        ...paymentData,
        // Ensure all values are strings
        amount: paymentData.amount.toString(),
        custom_1: encodeURIComponent(paymentData.custom_1),
      },
    });

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
      data: {
        orderID: orderId,
        status: "confirmed",
      },
    });

    await sendToQueue("user_notifications", {
      type: "ORDER_CONFIRMED",
      data: {
        orderID: orderId,
        userID: req.user.id,
        status: "confirmed",
      },
    });

    console.log("Initiate over");
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const notifyPayment = async (req, res) => {
  try {
    const paymentData = req.body;
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
      console.error("Order not found for payment:", paymentData.order_id);
      return res.status(404).send("Order not found");
    }
    // TODO: Update your database with payment status
    console.log("Payment notification:", {
      orderId: paymentData.order_id,
      paymentId: paymentData.payment_id,
      amount: paymentData.payhere_amount,
      currency: paymentData.payhere_currency,
      status: isSuccess ? "success" : "failed",
      // method: paymentData.method,
    });

    await order.save();

    if (isSuccess) {
      // TODO: Trigger order fulfillment, send confirmation email, etc.
      console.log(`Payment successful for order ${order.orderID}`);
    }

    // Respond with 200 OK to acknowledge receipt
    res.status(200).send("Notification received");
  } catch (error) {
    console.error("Payment notification error:", error);
    res.status(500).send("Internal server error");
  }
};

const handleCallback = async (req, res) => {
  try {
    // Verify payment (simplified for sandbox)
    console.log("Payment callback received:", req.body);
    res.status(200).send("Callback received");
  } catch (error) {
    console.error("Callback processing error:", error);
    res.status(500).send("Error processing callback");
  }
};

module.exports = { initiatePayment, notifyPayment, handleCallback };
