const axios = require("axios");

const order_service_url = process.env.ORDER_SERVICE_URL;

const getOrderData = async (orderID) => {
  try {
    const response = await axios.get(
      `${order_service_url}/api/orders/${orderID}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getOrderData };
