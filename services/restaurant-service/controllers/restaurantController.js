const Restaurant = require("../models/restaurantModel");
const { getUserData } = require("../services/userService");

const createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, openingHours } = req.body;

    const phoneRegex =
      /^(\+94|0)(70|71|72|74|75|76|77|78|11|31|38|55|21|32|41|57|23|33|45|63|24|34|47|65|25|35)[0-9]{7}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "❗Phone number not valid. Please enter valid phone number.",
      });
    }

    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    // if(restaurantExist){
    //   return res.status(400).json({message:"Restaurant already registered."})
    // }

    const token = req.headers.authorization;
    const user = await getUserData(req.user.id, token);

    if (req.user.id !== user.id && req.user.role !== "restaurantAdmin") {
      return res.status(401).json({ message: "🚫You are unauthorized." });
    }

    if (req.user.role === "restaurantAdmin") {
      const newRestaurant = new Restaurant({
        name,
        address,
        phone,
        owner: req.user.id,
        openingHours,
      });

      const restaurantUser = await Restaurant.findOne({ owner: req.user.id });
      if (restaurantUser) {
        return res
          .status(400)
          .json({
            message: "You have create only one restaurant this moment.",
          });
      }

      await newRestaurant.save();

      if (!newRestaurant) {
        return res.status(400).json({
          message: "❌Error occurs in restaurant creation. Please try again.",
        });
      }

      res
        .status(201)
        .json({ message: `✅${name} restaurant/ hotel profile created.` });
    } else {
      return res
        .status(403)
        .json({ message: "🚫You are unauthorized for this action." });
    }

    //for find request user id;
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const id = req.params.id;

    const { name, address, phone, openingHours } = req.body;

    const findRestaurant = await Restaurant.findById(id);

    if (!findRestaurant) {
      return res.status(404).json({ message: "❗No record found." });
    }

    const phoneRegex =
      /^(\+94|0)(70|71|72|74|75|76|77|78|11|31|38|55|21|32|41|57|23|33|45|63|24|34|47|65|25|35)[0-9]{7}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "❗Phone number not valid. Please enter valid phone number.",
      });
    }

    const updateRestaurant = await Restaurant.findByIdAndUpdate(id, {
      name: name,
      address: address,
      phone: phone,
      openingHours: openingHours,
    });

    if (!updateRestaurant) {
      return res.status(400).json({ message: "❌Update failed." });
    }

    res.status(200).json({ message: "✅Update complete" });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurant = await Restaurant.find();

    if (!restaurant) {
      return res.status(404).json({ message: "❗Restaurant not found." });
    }

    res
      .status(200)
      .json({ message: "✅Restaurant data found.", data: restaurant });
  } catch (err) {
    console.error(err);
    // if (!res.headersSent) {
    //   return res
    //     .status(500)
    //     .json({ message: "❌Internal server error", error: err });
    // }
  }
};

const getRestaurantByUserID = async (req, res) => {
  try {
    // const id = req.params.restaurantID;

    const userID = req.user.id;

    const restaurant = await Restaurant.findOne({ owner: userID });

    if (!restaurant) {
      return res.status(404).json({ message: "❗No record found." });
    }

    res
      .status(200)
      .json({ message: "✅Restaurant data found.", data: restaurant });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const getRestaurantOrder = async (req, res) => {
  try {
    const restaurantID = req.params.id;

    if (req.user.role !== "restaurantAdmin") {
      return res.status(401).json({ message: "You are unauthorized." });
    }

    const orderData = await fetch(
      `http://order-service:5021/api/order/get-restaurant-order/${restaurantID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${req.headers.authorization}`,
        },
      }
    );

    if (!orderData) {
      return res.status(404).json({ message: "No order found." });
    }

    res
      .status(200)
      .json({ message: "Restaurant orders found.", data: orderData });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "❌Internal server error", error: error });
  }
};

const getRestaurantByID = async (req, res) => {
  try {
    const id = req.params.restaurantID;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No record found." });
    }

    res
      .status(200)
      .json({ message: "✅Restaurant data found.", data: restaurant });
  } catch (error) {
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: error });
    }
  }
};

const isRestaurantOpen = async (req, res) => {
  try {
    const id = req.params.restaurantID;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No record found." });
    }
    const now = new Date();
    const sriLankaTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      weekday: "long",
      hour: "2-digit",
      hour12: true,
    }).formatToParts(now);

    const currentDay = sriLankaTime.find(
      (part) => part.type === "weekday"
    ).value;
    const currentHour = parseInt(
      sriLankaTime.find((part) => part.type === "hour").value
    );

    const todayHours = restaurant.openingHours.get(currentDay);

    if (!todayHours) {
      return res
        .status(404)
        .json({ message: "Opening hours not set for today." });
    }

    const isOpen =
      currentHour >= todayHours.open && currentHour < todayHours.close;
    res.json({
      open: isOpen,
      message: isOpen ? "✅Restaurant is open!" : "❌Restaurant is closed.",
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

module.exports = {
  createRestaurant,
  updateRestaurant,
  getRestaurants,
  getRestaurantByID,
  isRestaurantOpen,
  getRestaurantByUserID,
  getRestaurantOrder,
};
