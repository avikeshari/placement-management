const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const validateEnvironment = require("./config/env");
const createProductionAdmin = require("./scripts/createProductionAdmin");
const seedDemoData = require("./scripts/seedDemoUsers");
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const { runInterviewReminders } = require("./utils/interviewReminders");
const authRoutes = require("./routes/authRoutes");

const app = express();

const environment = validateEnvironment();
const API_VERSION = process.env.API_VERSION || "production-auth-routing-v2";

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  environment.frontendUrl
].filter(Boolean).map((origin) => origin.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Placement API is healthy",
    apiVersion: API_VERSION,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/interviews", require("./routes/interviewRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/academic", require("./routes/academicRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/drives", require("./routes/driveRoutes"));
app.use("/api/benchmark", require("./routes/benchmarkRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));
app.use("/api/saved-searches", require("./routes/savedSearchRoutes"));
app.use("/api/company-follows", require("./routes/companyFollowRoutes"));
app.use("/api/candidate-search", require("./routes/candidateSearchRoutes"));
app.use("/api/career-events", require("./routes/careerEventRoutes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
app.use("/api/saved-candidates", require("./routes/savedCandidateRoutes"));

app.get("/api/deployment-info", (req, res) => {
  res.json({
    success: true,
    apiVersion: API_VERSION,
    authRouterMounted: true,
    endpoints: [
      "POST /api/auth/login",
      "POST /api/auth/register"
    ]
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Placement Management API is running",
    health: "/api/health",
    auth: "/api/auth"
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = environment.port;

const startServer = async () => {
  try {
    await connectDB();

    // Automatically create/check the permanent production admin
    // and ensure the demo account/profile data exists.
    await createProductionAdmin();
    await seedDemoData();

    setInterval(() => runInterviewReminders().catch((error) => console.error("Interview reminder job failed:", error.message)), 15 * 60 * 1000);
    runInterviewReminders().catch((error) => console.error("Initial interview reminder check failed:", error.message));

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${environment.nodeEnv}`);
      console.log("Mounted API routes: /api/health, /api/auth, /api/profile, /api/jobs, /api/applications, /api/interviews, /api/messages, /api/academic, /api/admin, /api/drives, /api/benchmark, /api/notifications, /api/saved-jobs, /api/saved-searches, /api/company-follows, /api/candidate-search, /api/career-events, /api/audit-logs, /api/saved-candidates");
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );
    process.exit(1);
  }
};

startServer();
