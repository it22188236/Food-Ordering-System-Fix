import axios from "axios";

export const sendOrderNotification = async (order, type) => {
  try {
    let title, message;

    switch (type) {
      case "order_placed":
        title = "Order Placed";
        message = `Your order #${order.orderNumber} has been placed successfully`;
        break;
      case "order_accepted":
        title = "Order Accepted";
        message = `Restaurant has accepted your order #${order.orderNumber}`;
        break;
      case "order_ready":
        title = "Order Ready";
        message = `Your order #${order.orderNumber} is ready for delivery`;
        break;
      case "order_delivered":
        title = "Order Delivered";
        message = `Your order #${order.orderNumber} has been delivered`;
        break;
      default:
        title = "Order Update";
        message = `Update on your order #${order.orderNumber}`;
    }

    await axios.post(`http://notification-service:5051/api/notification/`, {
      userId: order.user,
      orderId: order._id,
      title,
      message,
      type: "order",
      metadata: {
        orderId: order._id,
        status: type,
      },
    });
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

