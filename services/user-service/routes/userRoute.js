const express = require("express");

const router = express.Router();
const validateToken = require("../middlewares/validateToken");
const authorizeRoles = require("../middlewares/authorizedRoles");

const {
  getAllUsers,
  getUserByID,
  updateUserDetails,
  deleteUser,
  addUser,
} = require("../controllers/userController");

//get all users
router.get("/get-all-users", validateToken,authorizeRoles("systemAdmin"),getAllUsers);
router.get("/get-user/:id", validateToken, getUserByID);
router.put("/update-user/:id", validateToken, updateUserDetails);
router.delete("/delete-user/:id", validateToken, deleteUser);
router.post("/create-user", validateToken, addUser);

module.exports = router;
