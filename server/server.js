require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const queryRoutes = require("./routes/queryRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Middlewares
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);

// DB connect
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Sahaayata API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
