const express = require("express");
const passport = require("passport");

const {
  signup,
  login,
  logout,
  googleCallback,
} = require("../controllers/authController");

const loginLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// Email and password authentication
router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);

// Google OAuth authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth-failed",
    session: false,
  }),
  googleCallback,
);

module.exports = router;
