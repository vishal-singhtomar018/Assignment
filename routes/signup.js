const express = require("express");
const router = express.Router();
const { login, signup, sendotp} = require("../controllers/auth.js");
const { verifyotp } = require("../controllers/verifyotp.js");
const { validateUser,validateLogin } = require('../middleware');


// render signup form
router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.get("/", (req, res) => {
  res.render("users/login", {
    success: req.flash("success"),
    error: req.flash("error")
  });
});
// handle form submission
router.post('/signup',validateUser,signup);
router.post('/login',validateLogin, login);
router.post('/sendotp', sendotp);
router.post('/verifyotp',verifyotp);


router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.logout(() => {
    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  });
});

module.exports = router;
