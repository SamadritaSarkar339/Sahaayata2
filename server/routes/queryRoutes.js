const express = require("express");
const router = express.Router();
const {
  createQuery,
  getAllQueries
} = require("../controllers/queryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Query = require("../models/Query");

router.post("/", createQuery);
router.get("/", getAllQueries);

// DELETE /api/queries/:id  (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const q = await Query.findById(req.params.id);
    if (!q) return res.status(404).json({ message: "Query not found" });

    await q.deleteOne();
    res.json({ message: "Query deleted" });
  } catch (err) {
    console.error("Delete query error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
