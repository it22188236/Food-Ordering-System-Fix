const axios = require("axios");

const order_service_url =
  process.env.ORDER_SERVICE_URL || "http://order-service:5021";

const getOrderData = async (orderID, token) => {
  try {
    const response = await fetch(
      `${order_service_url}/api/order/get-order/${orderID}`,
      {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
  }

  const maxRetries = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `http://order-service:5021/api/order/get-order/${orderID}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (i === maxRetries - 1) throw error; // Last attempt, throw
      console.log(`Retrying getUserData... attempt ${i + 1}`);
      await delay(2000); // Wait 2 seconds
    }
  }
};

module.exports = { getOrderData };
