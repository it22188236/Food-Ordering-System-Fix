const express = require("express");
const router = express.Router();

const {
  initiatePayment,
  notifyPayment,
  handleCallback,
} = require("../controllers/paymentController");

const validateToken = require("../middlewares/validateToken");

router.post("/notify", notifyPayment);
router.post("/initiate/:orderID", validateToken, initiatePayment);
router.post("/callback", handleCallback);
// router.post("/pay/:orderID",validateToken,paymentCreate);

module.exports = router;
