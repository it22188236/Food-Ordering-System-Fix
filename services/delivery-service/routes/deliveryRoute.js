const express = require("express");
const router = express.Router();

const {
  deliveryPersonAssign,
  getAllDeliveries,
} = require("../controllers/deliveryController");

const validateToken = require("../middlewares/validationToken");

// Protected routes
router.put("/:orderID/assign", validateToken, deliveryPersonAssign);
router.get("/deliveries", validateToken, getAllDeliveries);

module.exports = router;
