const express = require("express");
const router = express.Router();
const { getAnalyticsSummary } = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All analytics routes are admin-only
router.get("/summary", protect, adminOnly, getAnalyticsSummary);

module.exports = router;
