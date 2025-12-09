const Query = require("../models/Query");
const { generateSchemeAdvice } = require("../services/aiService");

// POST /api/queries
const createQuery = async (req, res) => {
  try {
    const { name, email, location, situation, language } = req.body;

    if (!name || !situation) {
      return res.status(400).json({ message: "Name and situation are required." });
    }

    const lang = ["en", "hi", "bn"].includes(language) ? language : "en";

    const { answerText, categories } = await generateSchemeAdvice(
      situation,
      location,
      lang
    );

    const queryDoc = await Query.create({
      name,
      email,
      location,
      situation,
      aiAnswer: answerText,
      categories,
      language: lang
    });

    res.status(201).json(queryDoc);
  } catch (err) {
    console.error("Error creating query:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/queries
const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find()
      .sort({ createdAt: -1 })
      .select("-email -__v");

    res.json(queries);
  } catch (err) {
    console.error("Error fetching queries:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createQuery,
  getAllQueries
};
