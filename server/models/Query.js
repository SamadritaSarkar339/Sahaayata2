const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    situation: {
      type: String,
      required: true,
      trim: true
    },
    aiAnswer: {
      type: String,
      required: true
    },
    categories: [
      {
        type: String,
        trim: true
      }
    ],
    language: {
      type: String, // "en", "hi", "bn", etc.
      default: "en"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Query", querySchema);
