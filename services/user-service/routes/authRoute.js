const express = require("express");
const passport = require("passport");

const {
  registerUser,
  loginUser,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // successRedirect: "http://localhost:5173/",
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
});

module.exports = router;
