// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// External Dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");
require("./passport");
require('dotenv').config(); // Add this at the top of your file

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // <- App password from .env
  },
});


// Internal Modules
const User = require("./models/user.js");
const signupRoutes = require("./routes/signup.js");
const noteRoutes = require("./routes/noteRoutes.js");
const googleAuthRoutes = require("./routes/googleAuthRoutes.js");

const app = express();
const dburl = process.env.ATLASDB_URL;

// -------------------- MIDDLEWARE CONFIGURATION -------------------- //

// Set view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie & Method override
app.use(cookieParser("secretcode"));
app.use(methodOverride("_method"));

// Layouts
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "./layouts/boilerplate");

// -------------------- SESSION CONFIGURATION -------------------- //

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret:process.env.SECRET
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", (err) => {
    console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions = session({
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
});

app.use(sessionOptions);
app.use(flash());

// -------------------- GLOBAL MIDDLEWARE -------------------- //

// Flash messages & current user
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.messages = req.flash(); 
    next();
});

// -------------------- PASSPORT AUTH -------------------- //
app.use(passport.initialize());
app.use(passport.session());

// -------------------- ROUTES -------------------- //

app.use("/api/v1", signupRoutes);       // API Signup route
app.use("/", signupRoutes);             // Form Signup route
app.use("/", noteRoutes);               // Notes routes
app.use(googleAuthRoutes);              // Google OAuth

// -------------------- DATABASE CONNECTION -------------------- //

async function main() {
    await mongoose.connect(dburl);
}

main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

// -------------------- ERROR HANDLING -------------------- //

app.use((err, req, res, next) => {
    const { statuscode = 500, message = "Something went wrong" } = err;
    res.status(statuscode).render("err.ejs", { message });
});

// -------------------- SERVER START -------------------- //

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is listening on port 3000");
});
