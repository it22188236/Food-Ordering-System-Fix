const axios = require("axios");
const url = require("url");

// Whitelist allowed base URL (prevents SSRF)
const DEFAULT_USER_SERVICE_URL = "http://user-service:5001";
const user_service_url = process.env.USER_SERVICE_URL || DEFAULT_USER_SERVICE_URL;

// Validate the URL (must be http/https and internal service)
const parsedUrl = url.parse(user_service_url);
if (!/^https?:$/.test(parsedUrl.protocol)) {
  throw new Error("Invalid USER_SERVICE_URL protocol. Only HTTP/HTTPS allowed.");
}
if (!parsedUrl.hostname.includes("user-service")) {
  throw new Error("Invalid USER_SERVICE_URL hostname. Must point to user-service.");
}

const getUserData = async (userID, token) => {
  const headers = { Authorization: `${token}` };

  try {
    const response = await axios.get(
      `${user_service_url}/api/users/get-user/${userID}`,
      { headers }
    );
    return response.data;
  } catch (err) {
    console.error("User service call failed:", err.message);
  }

  // Retry fallback to internal service
  const maxRetries = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `${DEFAULT_USER_SERVICE_URL}/api/users/get-user/${userID}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      if (i === maxRetries - 1) throw error; // Last attempt, throw
      console.log(`Retrying getUserData... attempt ${i + 1}`);
      await delay(2000); // Wait 2 seconds
    }
  }
};

module.exports = { getUserData };
