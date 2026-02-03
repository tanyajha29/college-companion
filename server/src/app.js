import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestLogger } from "./shared/middleware/requestLogger.js";
import { notFound, errorHandler } from "./shared/middleware/errorHandlers.js";

import authRoutes from "./features/auth/routes.js";
import adminRoutes from "./features/admin/routes.js";
import staffRoutes from "./features/staff/routes.js";
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

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = Array.isArray(env.clientOrigin) ? env.clientOrigin : [env.clientOrigin];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json({ limit: "2mb" }));
app.use(requestLogger);

app.get("/", (_req, res) => {
  res.send("🚀 College Companion Backend is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
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

app.use(notFound);
app.use(errorHandler);

export default app;
