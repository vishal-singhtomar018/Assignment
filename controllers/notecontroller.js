const Note = require("../models/Note.js");
const mongoose=require("mongoose");


exports.getDashboard = async (req, res) => {
  try {
    if (!req.user) {
      req.flash('error', 'User not logged in');
      return res.redirect('/login');
    }

    const userId = new mongoose.Types.ObjectId(req.user._id || req.user.id);

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    console.log("Rendering dashboard for user:", req.user.email); // For debugging

    res.render("listings/dashboard", {
      user: req.user,
      notes,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    req.flash('error', 'Failed to load dashboard');
    res.status(500).render("err.ejs", { message: "Server Error: Unable to load dashboard." });
  }
};


exports.createNote = async (req, res) => {
  try {
    const { content } = req.body;
    await Note.create({ content, userId: req.user.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Create Note Error:", err);
    res.redirect("/dashboard");
  }
};


exports.deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Delete Note Error:", err);
    res.redirect("/dashboard");
  }
};
