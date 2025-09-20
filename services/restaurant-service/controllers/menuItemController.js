const MenuItem = require("../models/menuItemModel");
const Restaurant = require("../models/restaurantModel");

const createMenu = async (req, res) => {
  try {
    const id = req.params.restaurantID;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No restaurant found." });
    }

    const { name, description, price, category, availability } = req.body;

    //const image = req.file ? `/uploads/${req.file.filename}` : null;
    //const image = req.file ? req.file.path : null;
    const image = `/uploads/${req.file.filename}`
    //console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const menuItem = await MenuItem.findOne({ name: name });

    if (menuItem) {
      return res
        .status(400)
        .json({ message: "❗This menu item already added." });
    }

    if (
      req.user.id !== restaurant.owner.toString() ||
      req.user.role !== "restaurantAdmin"
    ) {
      return res
        .status(403)
        .json({ message: "🚫You are unauthorized for this action." });
    }

    const newMenuItem = new MenuItem({
      restaurantID: id,
      name,
      description,
      price,
      category,
      image:image,
      availability,
    });

    await newMenuItem.save();

    if (!newMenuItem) {
      return res.status(400).json({ message: "❌Menu item added failed." });
    }

    res.status(201).json({ message: "✅New menu item added." });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const getMenuItems = async (req, res) => {
  try {
    const id = req.params.restaurantID;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No restaurant found." });
    }

    const menuItem = await MenuItem.find({ restaurantID: id });

    if (!menuItem) {
      return res.status(404).json({ message: "❗No menu item found." });
    }

    res.status(200).json({ message: "✅Menu record found.", data: menuItem });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const getMenuItemByID = async (req, res) => {
  try {
    const restaurantID = req.params.restaurantID;

    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No restaurant record found." });
    }

    const menuItemID = req.params.menuItemID;

    const menuItem = await MenuItem.findById(menuItemID);

    if (!menuItem) {
      return res.status(404).json({ message: "❗No menu item found." });
    }

    res.status(200).json({ message: "✅Menu found.", data: menuItem });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const restaurantID = req.params.restaurantID;

    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No restaurant found." });
    }

    const menuItemID = req.params.menuItemID;

    const menuItem = await MenuItem.findById(menuItemID);

    if (!menuItem) {
      return res.status(404).json({ message: "❗No menu item found." });
    }

    const { name, description, price, category, availability } = req.body;

    //const image = `../public/uploads/${req.file.filename}`
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    //console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }


    if (
      req.user.id !== restaurant.owner.toString() ||
      req.user.role !== "restaurantAdmin"
    ) {
      return res
        .status(403)
        .json({ message: "🚫You are unauthorized for this action." });
    }

    const updateMenuItem = await MenuItem.findByIdAndUpdate(
      menuItemID,
      {
        name: name,
        description: description,
        price: price,
        category: category,
        image: image,
        availability: availability,
      },
      { new: true }
    );

    if (!updateMenuItem) {
      return res.status(400).json({ message: "❌Menu item update failed." });
    }

    res
      .status(200)
      .json({ message: "✅Menu item updated.", data: updateMenuItem });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const restaurantID = req.params.restaurantID;

    const restaurant = await Restaurant.findById(restaurantID);

    if (!restaurant) {
      return res.status(404).json({ message: "❗No restaurant found." });
    }

    const menuItemID = req.params.menuItemID;

    const menuItem = await MenuItem.findById(menuItemID);

    if (!menuItem) {
      return res.status(404).json({ message: "❗No menu item found." });
    }

    if (
      req.user.id !== restaurant.owner.toString() ||
      req.user.role !== "restaurantAdmin"
    ) {
      return res
        .status(403)
        .json({ message: "🚫You are unauthorized for this action." });
    }

    const deleteMenuItem = await MenuItem.findByIdAndDelete(menuItemID);

    if (!deleteMenuItem) {
      return res.status(400).json({ message: "❌Menu item delete failed." });
    }

    res.status(200).json({ message: "✅Menu item deleted." });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: err });
    }
  }
};

const getAllMenus = async (req, res) => {
  try {
    const menus = await MenuItem.find();

    if (!menus) {
      return res.status(404).json({ message: "No Menus found." });
    }

    res.status(200).json({ message: "Menus found.", data: menus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMenu,
  getMenuItems,
  getMenuItemByID,
  updateMenuItem,
  deleteMenuItem,
  getAllMenus,
};
