const express = require("express");
const router = express.Router();

const {
  initiatePayment,
  notifyPayment,
  handleCallback,
} = require("../controllers/paymentController");

const validateToken = require("../middlewares/validateToken");

// Public route → PayHere sends notifications
router.post("/notify", notifyPayment);

// Protected route → Only logged-in users can initiate payments
router.post("/initiate/:orderID", validateToken, initiatePayment);

// Public route → PayHere callback
router.post("/callback", handleCallback);

module.exports = router;
