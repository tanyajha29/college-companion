import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js"; // moved protected routes into separate file
import adminRoutes from "./routes/admin.js"
import staffRoutes from "./routes/staff.js";
import profileRoutes from "./routes/profile.js"
import cors from "cors";
import reminderRoutes from "./routes/reminders.js"
import timetableRoutes from "./routes/timetable.js"
import attendanceRoutes from "./routes/attendance.js"
import { Pool } from 'pg';
import path from "path";
import { fileURLToPath } from "url";

import intershipRoutes from "./routes/internship.js";
// After (Correctly imports the CommonJS module)
import uploadRoutes from "./routes/upload.js"; // Import the upload routes


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Is attendanceRoutes defined?", attendanceRoutes ? 'Yes, it is an object.' : 'No, it is UNDEFINED.');
dotenv.config();

const app = express();
// ✅ Enable CORS before routes
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use((req, res, next) => {
    console.log(`[INCOMING REQUEST]: ${req.method} ${req.originalUrl}`);
    next();
});
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'college-companion',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Optional: Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to PostgreSQL:', err.stack);
    }
    console.log('✅ PostgreSQL connected for data access.');
    release(); 
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 College Companion Backend is running...");
});

// Routes
app.use("/api/internships", intershipRoutes(pool)); // internship routes
app.use("/api/auth", authRoutes);        // auth routes (login, register)
app.use("/api/protected", protectedRoutes); // protected routes
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/profile",profileRoutes)
app.use("/api/timetable",timetableRoutes)
app.use("/api/reminders",reminderRoutes)
app.use("/api/attendance",attendanceRoutes )
app.use("/api/upload", uploadRoutes); // file upload routes
// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
