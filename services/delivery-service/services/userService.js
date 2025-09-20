const axios = require("axios");

const user_service_url = process.env.USER_SERVICE_URL;

const getUserData = async (userID,token) => {
  try {
    const response = await axios.get(`${user_service_url}/api/users/get-user/${userID}`,{
      headers:{
        Authorization:token
      }
    });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getUserData };
