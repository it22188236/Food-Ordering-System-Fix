const Notification = require("../models/notificationModel");

// Create a new notification
// const createNotification = async (data) => {
//   try {
//     const { userId, orderId, title, message, type, metadata } = data;

//     const notification = new Notification({
//       userId,
//       orderId,
//       title,
//       message,
//       type,
//       metadata,
//     });

//     await notification.save();

//     // Emit real-time event
//     io.to(userId.toString()).emit("newNotification", notification);

//     console.log({ data: notification });
//   } catch (error) {
//     console.log("Error occurs : ", error.message);
//   }
// };

const createNotification = async (data) => {
  try {
    const notification = new Notification();

    notification.userId = data.userId;
    notification.orderId = data.orderId;
    notification.title = data.title;
    notification.message = data.message;
    notification.type = data.type;
    notification.metadata = data.metadata;

    await notification.save();

    // Emit real-time event
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

    res.json(notifications);
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

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createNotification, markAsRead, getUserNotifications };
