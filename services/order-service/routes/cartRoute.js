const express = require("express");
const { addToCart, getCart, deleteCart, updateCart } = require("../controllers/cartController");
const validate = require("../middlewares/validateToken");
const router = express.Router();

router.post("/:restaurantID/menu/:menuItemID", validate, addToCart);
router.get("/", validate, getCart);
router.put("/:cartID/menu/:menuItemID", validate, updateCart);
router.delete("/:cartID",validate,deleteCart);

module.exports = router;
