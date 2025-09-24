const express = require("express");
const passport = require("passport");
const jwt = require('jsonwebtoken')

const {
  registerUser,
  loginUser,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

const ensureAuthenticated = require("../middlewares/ensureAuthorization.js");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // successRedirect: "http://localhost:5173/login-success",
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`http://localhost:5173/login-success?token=${token}`);
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/http://localhost:5173/login",
  }),
  (req, res) => {
    // return user as JSON
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`http://localhost:5173/login-success?token=${token}`);
  }
);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);


router.get("/me", ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
