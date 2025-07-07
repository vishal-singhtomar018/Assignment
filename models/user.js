// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  dob: {
    type: Date,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, 
  },
  provider: {
    type: String,
    default: "local",
  },
});

module.exports = mongoose.model("User", userSchema);
