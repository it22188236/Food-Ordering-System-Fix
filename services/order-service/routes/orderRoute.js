const express = require("express");
const validateToken = require("../middlewares/validateToken");

const {
  checkoutCart,
  getOrders,
  getOrdersByID,
  deleteOrder,
  getRestaurantOrder,
  updateOrderStatus,
  getOrderByID
} = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", validateToken, checkoutCart);

router.get("/all-orders", validateToken, getOrders);
router.get(
  "/get-restaurant-order/:restaurantID",
  validateToken,
  getRestaurantOrder
);
router.get("/:orderID", validateToken, getOrdersByID);
router.get("/get-order/:orderID", validateToken, getOrderByID);
router.patch("/update-order-status/:orderID", validateToken, updateOrderStatus);
router.delete("/:orderID", validateToken, deleteOrder);

module.exports = router;
