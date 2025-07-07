const express = require("express");
const router = express.Router();
const { getDashboard , createNote, deleteNote } = require("../controllers/notecontroller");
const {isAuthenticated } = require("../middleware");



router.get("/dashboard",isAuthenticated, getDashboard);
router.post("/createnote", isAuthenticated, createNote);
router.post("/notes/delete/:id", isAuthenticated, deleteNote);

module.exports = router;
