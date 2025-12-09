const express = require("express");
const router = express.Router();
const { registerAdmin, login } = require("../controllers/authController");

// For safety, you can later disable this route after creating 1 admin
router.post("/register-admin", registerAdmin);
router.post("/login", login);

module.exports = router;
