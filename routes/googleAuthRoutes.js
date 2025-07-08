// routes/googleAuthRoutes.js
const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken')

// Start Google login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback after Google login
router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  async (req, res) => {
    const user = req.user;

    // ✅ Create JWT payload
    const payload = {
      email: user.email,
      id: user._id,
      name: user.name,
    };

    // ✅ Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // ✅ Set cookie like in OTP login
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
    res.redirect('/dashboard');
  }
);

module.exports = router;
