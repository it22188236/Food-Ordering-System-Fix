const express = require("express");
const {
  createNotification,
  getUserNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const protect = require("../middlewares/validateToken");

const router = express.Router();

router.post("/", createNotification);
router.get("/", getUserNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
