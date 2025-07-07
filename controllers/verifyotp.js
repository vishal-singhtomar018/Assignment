const OTP = require("../models/OTP");
const User = require("../models/user");

exports.verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // 1. Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // 3. Log in the user - you can use sessions or JWT
    req.session.userId = user._id; 

    // 4. Delete OTP after successful login
    await OTP.deleteMany({ email });

    req.flash("success","logged in ");

  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification.",
    });
  }
};
