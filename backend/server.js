import "dotenv/config";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import recruitmentRoutes from "./routes/recruitmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

connectDB();

const app = express();

// "localhost" and "127.0.0.1" are different origins as far as CORS is concerned, so allow
// both dev hosts in addition to whatever CLIENT_URL is set to.
const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "inseed-hrms-api" }));

// Throttle auth endpoints to blunt credential-stuffing / brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later" },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Inseed HRMS API running on port ${PORT}`));
