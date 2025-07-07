const jwt = require('jsonwebtoken')
require('dotenv').config()

const { userSchema,loginSchema } = require('./schema.js');




exports.requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    res.locals.user = decoded; 

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.redirect('/login');
  }
};



exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("No token: redirecting to login");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Invalid token");
    return res.redirect("/login");
  }
};


exports.decodeJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "No token: please login");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("JWT decode error:", err);
    req.flash("error", "Invalid token, please login again");
    return res.redirect("/login");
  }
};


exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    return res.status(400).json({ success: false, message: msg });
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    return res.status(400).json({ success: false, message: msg });
  }
  next();
};