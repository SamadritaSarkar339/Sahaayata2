// server/server.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("express-async-errors");
const connectDB = require("./config/db");

// import your existing routes
const queryRoutes = require("./routes/queryRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

/* ---------- Basic config ---------- */
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("common"));
}

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

/* ---------- Allowed origins (from env) ---------- */
/*
  CLIENT_ORIGIN may be a single origin or comma-separated list.
  Example:
    CLIENT_ORIGIN=https://your-frontend.vercel.app,http://localhost:5173
*/
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const ALLOWED_ORIGINS = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);

/* ---------- CORS preflight & header middleware (must run before auth) ---------- */
const allowedHeadersList = "Content-Type,Authorization,Accept,X-Requested-With";

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) {
    // server-to-server or CLI -> allow using first allowed origin if present
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0] || "*");
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    // echo allowed origin
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // mark blocked origin (we will return 403 for preflight below)
    res.setHeader("X-CORS-Blocked", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", allowedHeadersList);
  res.setHeader("Access-Control-Allow-Credentials", "true"); // set true if using cookies
  res.setHeader("Access-Control-Max-Age", String(60 * 60 * 24)); // 1 day
  next();
});

// Preflight handler: return early and BEFORE any auth checks
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).send("CORS origin denied");
  }
  return res.sendStatus(204);
});

/* ---------- Connect DB ---------- */
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err && err.message ? err.message : err);
  });

/* ---------- Mount routes (auth first, public routes) ---------- */
/* Important: any auth middleware must skip OPTIONS (see note) */
app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ---------- Optional static serving (if you want the server to serve client dist) ---------- */
if (process.env.USE_STATIC === "true") {
  const path = require("path");
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

/* ---------- 404 & error handlers ---------- */
app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && (err.stack || err.message) ? (err.stack || err.message) : err);

  if (err && err.message && err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS error: origin not allowed" });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

/* ---------- Graceful shutdown ---------- */
const shutdown = () => {
  console.log("Shutting down...");
  server.close(() => {
    console.log("Closed server");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forcing shutdown");
    process.exit(1);
  }, 10000);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
