const axios = require("axios");

const user_service_url = process.env.USER_SERVICE_URL || "http://user-service:5001";

const getUserData = async (userID, token) => {
  try {
    const response = await axios.get(`${user_service_url}/api/users/get-user/${userID}`, {
      headers: {
        Authorization: `Bearer ${token}`,   // ✅ Fixed format
      },
    });
    return response.data;
  } catch (err) {
    console.error("Primary request failed:", err.message);
  }

  // Retry logic
  const maxRetries = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`http://user-service:5001/api/users/get-user/${userID}`, {
        headers: {
          Authorization: `Bearer ${token}`,   // ✅ Fixed format
        },
      });
      return response.data;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retrying getUserData... attempt ${i + 1}`);
      await delay(2000);
    }
  }
};

module.exports = { getUserData };
