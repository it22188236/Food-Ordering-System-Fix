const express = require("express");

const router = express.Router();

const {
  createRestaurant,
  updateRestaurant,
  getRestaurantByID,
  getRestaurants,
  isRestaurantOpen,
  getRestaurantByUserID,
  getRestaurantOrder,
} = require("../controllers/restaurantController");
const validateToken = require("../middlewares/validateToken");
const authorizeRoles = require("../middlewares/authorizedRoles");

router.post(
  "/create-restaurant",
  validateToken,
  authorizeRoles("restaurantAdmin"),
  createRestaurant
);

router.put(
  "/update-restaurant/:restaurantID",
  validateToken,
  authorizeRoles("restaurantAdmin"),
  updateRestaurant
);

router.get("/get-restaurants", getRestaurants);

router.get("/get-restaurant/:restaurantID", getRestaurantByID);

router.get(
  "/get-restaurant-order/:restaurantID",
  validateToken,
  getRestaurantOrder
);

router.get("/get-restaurant", validateToken, getRestaurantByUserID);

router.get("/is-restaurant-open/:restaurantID", isRestaurantOpen);

module.exports = router;
