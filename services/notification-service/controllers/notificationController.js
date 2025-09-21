const Notification = require("../models/notificationModel");
const sanitizeHtml = require("sanitize-html"); // npm install sanitize-html

// Create a new notification
const createNotification = async (data) => {
  try {
    // Sanitize inputs to prevent XSS injection
    const cleanTitle = sanitizeHtml(data.title, { allowedTags: [], allowedAttributes: {} });
    const cleanMessage = sanitizeHtml(data.message, { allowedTags: [], allowedAttributes: {} });

    const notification = new Notification({
      userId: data.userId,
      orderId: data.orderId,
      title: cleanTitle,
      message: cleanMessage,
      type: data.type,
      metadata: data.metadata,
    });

    await notification.save();

    // Emit real-time event (safe data only)
    io.to(data.userId.toString()).emit("newNotification", notification);

    console.log({ data: notification });
  } catch (error) {
    console.log("Error occurs : ", error.message);
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    // Ensure output is safe before sending to frontend
    const sanitizedNotifications = notifications.map((n) => ({
      ...n._doc,
      title: sanitizeHtml(n.title, { allowedTags: [], allowedAttributes: {} }),
      message: sanitizeHtml(n.message, { allowedTags: [], allowedAttributes: {} }),
    }));

    res.json(sanitizedNotifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    // Sanitize before sending back
    notification.title = sanitizeHtml(notification.title, { allowedTags: [], allowedAttributes: {} });
    notification.message = sanitizeHtml(notification.message, { allowedTags: [], allowedAttributes: {} });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createNotification, markAsRead, getUserNotifications };
