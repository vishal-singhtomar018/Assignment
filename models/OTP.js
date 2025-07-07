const mongoose = require("mongoose");
const mailSender = require("../util/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60, // 5 minutes
  },
});

OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      await mailSender(
        this.email,
        "OTP Verification",
        `<h2>Hello 👋</h2><p>Your OTP is: <strong>${this.otp}</strong></p><p>It will expire in 5 minutes.</p>`
      );
    } catch (error) {
      console.error("❌ Failed to send OTP email:", error.message);
      throw error;
    }
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
