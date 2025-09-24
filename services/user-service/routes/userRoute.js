const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validateToken");
const authorizeRoles = require("../middlewares/authorizedRoles");
const csrf = require("csurf");

// Ensure csurf is applied and errors are handled
router.use(csrf({ cookie: true }));

const {
  getAllUsers,
  getUserByID,
  updateUserDetails,
  deleteUser,
  addUser,
} = require("../controllers/userController");

// Endpoint to get CSRF token (frontend requests this before sending state-changing requests)
router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// GET all users (no state change)
router.get("/get-all-users", validateToken, authorizeRoles("systemAdmin"), getAllUsers);

// GET single user (no state change)
router.get("/get-user/:id", validateToken, getUserByID);

// PUT, DELETE, POST require CSRF tokens
router.put("/update-user/:id", validateToken, updateUserDetails);
router.delete("/delete-user/:id", validateToken, deleteUser);
router.post("/create-user", validateToken, addUser);

// Optional: Central CSRF error handler in your middleware chain
router.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next(err);
});

module.exports = router;
