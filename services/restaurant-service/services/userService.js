const axios = require("axios");
const url = require("url");

const user_service_url = process.env.USER_SERVICE_URL || "http://user-service:5001";

// ✅ Allow only http/https, block internal protocols (prevent SSRF)
const isValidServiceUrl = (serviceUrl) => {
  try {
    const parsed = new url.URL(serviceUrl);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
};

const getUserData = async (userID, token) => {
  if (!isValidServiceUrl(user_service_url)) {
    throw new Error("Invalid USER_SERVICE_URL configuration.");
  }

  try {
    const response = await axios.get(`${user_service_url}/api/users/get-user/${userID}`, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      timeout: 5000, // prevent hanging requests
    });
    return response.data;
  } catch (err) {
    console.error("getUserData error:", err.message);
    throw new Error("Failed to fetch user data from user-service.");
  }
};

module.exports = { getUserData };
