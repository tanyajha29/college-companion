import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js"; // moved protected routes into separate file
import adminRoutes from "./routes/admin.js"
import staffRoutes from "./routes/staff.js";

dotenv.config();

const app = express();
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("🚀 College Companion Backend is running...");
});

// Routes
app.use("/api/auth", authRoutes);        // auth routes (login, register)
app.use("/api/protected", protectedRoutes); // protected routes
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
