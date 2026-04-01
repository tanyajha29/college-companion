import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestLogger } from "./shared/middleware/requestLogger.js";
import { notFound, errorHandler } from "./shared/middleware/errorHandlers.js";

import authRoutes from "./features/auth/routes.js";
import adminRoutes from "./features/admin/routes.js";
import staffRoutes from "./features/staff/routes.js";
import studentRoutes from "./features/student/routes.js";
import profileRoutes from "./features/profile/routes.js";
import attendanceRoutes from "./features/attendance/routes.js";
import internshipRoutes from "./features/internships/routes.js";
import timetableRoutes from "./features/timetable/routes.js";
import reminderRoutes from "./features/reminders/routes.js";
import documentsRoutes from "./features/documents/routes.js";
import paymentsRoutes from "./features/payments/routes.js";
import notificationsRoutes from "./features/notifications/routes.js";
import cbcRoutes from "./features/cbc/routes.js";
import aiRoutes from "./features/ai/routes.js";
import dashboardRoutes from "./features/dashboard/routes.js";

const app = express();


// 🔐 Helmet (safe default)
app.use(helmet());


// 🔥 FIXED CORS CONFIG (IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "http://15.207.59.143:5173",
  "https://d3w2hxz0opjfl8.cloudfront.net"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));


// 🛠️ IMPORTANT: Preflight requests handle
app.options("*", cors());


// 📦 Body parser
app.use(express.json({ limit: "2mb" }));


// 🧾 Logger
app.use(requestLogger);


// 🏠 Health check
app.get("/", (_req, res) => {
  res.send("🚀 College Companion Backend is running...");
});


// 🔗 Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/cbc", cbcRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);


// ❌ Not found
app.use(notFound);


// ⚠️ Error handler
app.use(errorHandler);


export default app;