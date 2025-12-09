// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Optional: express-async-errors helps with async route errors being caught by the error handler
require("express-async-errors");

const queryRoutes = require("./routes/queryRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

/**
 * Basic config & trust proxy
 * If you deploy behind a proxy (Vercel, Render, etc.) enable trust proxy:
 */
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", true);
}

/**
 * Allowed origins
 * - Provide CLIENT_ORIGIN as a single URL or a comma-separated list of allowed origins
 *   Example:
 *     CLIENT_ORIGIN=https://your-frontend.vercel.app
 *     or
 *     CLIENT_ORIGIN=https://app.example.com,https://staging.example.com
 */
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const ALLOWED_ORIGINS = rawOrigins.split(",").map((s) => s.trim());

/**
 * CORS options
 * - Allows requests with no origin (server-to-server, Postman).
 * - Allows only origins listed in CLIENT_ORIGIN.
 * - Exposes headers if needed (e.g. for Authorization).
 */
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, server-to-server)
    if (!origin) return callback(null, true);

    // allow if origin is in allowed list
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);

    // otherwise block
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,        // set to true if you use cookies or credentials
  maxAge: 86400            // cache preflight for 1 day (in seconds)
};

// Basic security headers
app.use(helmet());

// Request logging (dev-friendly)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("common")); // lighter logging in prod
}

// Rate limiter — prevents basic abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // max requests per windowMs per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS + preflight handling
app.use(cors(corsOptions));
// Explicitly respond to preflight requests
app.options("*", cors(corsOptions));

/**
 * Body parser
 * Accept JSON payloads. Increase limit if you expect large bodies (e.g. file uploads).
 */
app.use(express.json({ limit: "1mb" }));

/**
 * Connect to DB (async)
 */
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    // do not exit here; allow app-level error handler (or optionally exit)
  });

/**
 * Health check
 */
app.get("/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV || "development" }));

/**
 * Mount API routes
 * - Keep routes minimal & focused; protect admin endpoints with auth middleware
 */
app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/analytics", analyticsRoutes);

/**
 * Serve frontend (optional)
 * If you build the client with Vite into /client/dist and want to serve it from Express:
 *  - Run `npm run build` inside client so dist exists
 *  - Set USE_STATIC to "true" in production if you want Express to serve the static frontend
 */
if (process.env.USE_STATIC === "true") {
  const path = require("path");
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

/**
 * Global Not Found handler
 */
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);

  // If the error is a CORS error thrown by our origin check:
  if (err && err.message && err.message.includes("Not allowed by CORS")) {
    return res.status(403).json({ message: "CORS error: origin not allowed" });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Server error",
    // expose stack in non-prod only
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
});

/**
 * Start server
 */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT} (env: ${process.env.NODE_ENV || "development"})`);
});

/**
 * Graceful shutdown
 */
const shutDown = () => {
  console.log("Received kill signal, shutting down gracefully");
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    console.error("Forcing shut down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
