const Query = require("../models/Query");

// GET /api/analytics/summary (admin only)
const getAnalyticsSummary = async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();

    const byLanguage = await Query.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$language", "en"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const byCategory = await Query.aggregate([
      { $unwind: "$categories" },
      {
        $group: {
          _id: { $ifNull: ["$categories", "Uncategorized"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const byLocation = await Query.aggregate([
      {
        $match: {
          location: { $nin: [null, ""] }
        }
      },
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalQueries,
      byLanguage,
      byCategory,
      byLocation
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAnalyticsSummary };
