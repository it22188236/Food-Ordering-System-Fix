const axios = require("axios");

const restaurant = process.env.RESTAURANT_SERVICE_URL;

const getRestaurantData = async (restaurantID) => {
  try {
    const response = await axios.get(
      `${restaurant}/api/restaurant/get-restaurant/${restaurantID}`
    );
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const getMenuItemData = async (restaurantID, menuItemID) => {
  try {
    const response = await axios.get(
      `${restaurant}/api/menu/get-menu/${restaurantID}/${menuItemID}`
    );
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getRestaurantData, getMenuItemData };
