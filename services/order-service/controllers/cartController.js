const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const {
  getRestaurantData,
  getMenuItemData,
} = require("../services/restaurantService");
const { getUserData } = require("../services/userService");

const addToCart = async (req, res) => {
  try {
    const userID = req.user.id;
    const token = req.headers.authorization;

    const restaurantID = req.params.restaurantID;

    const menuItemID = req.params.menuItemID;

    const { quantity } = req.body;

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "❗Invalid quantity." });
    }

    const restaurant = await getRestaurantData(restaurantID);
    console.log(restaurant);

    const menuItem = await getMenuItemData(restaurantID, menuItemID);
    console.log(menuItem);

    const user = await getUserData(req.user.id, token);
    console.log(user);

    let cart = await Cart.findOne({ customer: userID });

    if (!cart) {
      cart = new Cart({
        customer: userID,
        restaurant: restaurantID,
        items: [{ menu: menuItemID, menuName: menuItem.data.name, quantity }],
      });
    } else {
      if (cart.restaurant.toString() !== restaurantID) {
        return res.status(400).json({
          message: "❗You can only order from one restaurant at a time.",
        });
      }

      const existItem = cart.items.find(
        (item) => item.menu.toString() === menuItemID
      );

      if (existItem) {
        existItem.quantity += quantity;
      } else {
        cart.items.push({ menu: menuItemID, menuName: menuItem.data.name, quantity });
      }
    }

    let total = 0;
    for (const item of cart.items) {
      if (menuItem) {
        total += item.quantity * menuItem.data.price;
      }
    }

    cart.totalPrice = total;
    await cart.save();
    res.status(201).json({ message: "✅Item added to cart." });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "❌Internal server error", error: error });
    }
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });

    const token = req.headers.authorization;
    const user = await getUserData(req.user.id, token);
    if (!cart) {
      return res.status(404).json({ message: "❗Cart is empty" });
    }

    if (req.user.id !== cart.customer.toString() && req.user.id !== user.id) {
      return res.status(403).json({ message: "🚫Access denied." });
    }

    res.status(200).json({ message: "✅Cart data found.", data: cart });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "❌Internal Server Error" });
  }
};

const deleteCart = async (req, res) => {
  try {
    const token = req.headers.authorization || req.headers.Authorization;
    const user = await getUserData(req.user.id, token);

    const cartID = req.params.cartID;

    const cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) {
      return res.status(400).json({ message: "❗Cart is empty." });
    }

    // if (req.user.id !== user.data.id || req.user.id !== cart.customer.toString()) {
    //   return res.status(403).json({ message: "🚫Access denied." });
    // }

    const deleteCart = await Cart.findByIdAndDelete(cartID);
    
    

    if (!deleteCart) {
      return res.status(400).json({ message: "❌Cart deletion failed." });
    }

    res.status(200).json({ message: "✅Cart deleted." });
  } catch (error) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "❌Internal Server Error" });
  }
};

const updateCart = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = await getUserData(req.user.id, token);

    const menuItemID = req.params.menuItemID;

    const cart = await Cart.findOne({ customer: req.user.id });

    const menuItem = await getMenuItemData(cart.restaurant, menuItemID);
    if (!menuItem) {
      return res.status(404).json({ message: "❗No menu item found." });
    }

    if (!cart) {
      return res.status(400).json({ message: "❗Cart is empty" });
    }

    if (req.user.id !== user.id || req.user.id !== cart.customer.toString()) {
      return res.status(403).json({ message: "🚫Access denied." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.menu.toString() === menuItemID
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "❌Menu item not found in cart." });
    }

    cart.items.splice(itemIndex, 1);

    let total = 0;
    for (const item of cart.items) {
      if (menuItem) {
        total += item.quantity * menuItem.data.price;
      }
    }

    cart.totalPrice = total;
    await cart.save();
  } catch (error) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({ message: "❌Internal Server Error" });
  }
};

module.exports = { addToCart, getCart, updateCart, deleteCart };
