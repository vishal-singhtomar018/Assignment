const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
require("dotenv").config();


//signup handle

exports.signup = async (req, res) => {
  try {
    const { name, email, otp, dob } = req.body;

    if (!name || !email || !otp || !dob) {
      req.flash("all field are required");
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }


    const newUser = await user.create({
      name,
      email,
      dob: new Date(dob), 
    });

    // ✅ Generate JWT token and set cookie
    const payload = {
      email: newUser.email,
      id: newUser._id,
      name: newUser.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      message: "Signup successful.",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during signup",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOTP || recentOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await OTP.deleteMany({ email });

    const payload = {
      email: existingUser.email,
      id: existingUser._id,
      name: existingUser.name, 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const userData = existingUser.toObject();
    delete userData.password;
    userData.token = token;

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        name: existingUser.name,
      },
    });
  } catch (error) {
    console.error("Login OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
// Send OTP For Email Verification

exports.sendotp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    const checkUserPresent = await user.findOne({ email });

    // 🔁 Purpose-based behavior
    if (purpose === "signup" && checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: `User is already registered. Please log in.`,
      });
    } else if (purpose === "login" && !checkUserPresent) {
      return res.status(404).json({
        success: false,
        message: `User not found. Please sign up first.`,
      });
    }

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let existingOTP = await OTP.findOne({ otp });
    while (existingOTP) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOTP = await OTP.findOne({ otp });
    }

    const otpBody = await OTP.create({ email, otp });
    console.log("OTP Body", otpBody);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Your OTP for ${purpose === "signup" ? "Signup" : "Login"}`,
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
    } catch (err) {
      console.error("Failed to send email:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
