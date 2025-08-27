import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(express.json());

// root route
app.get("/", (req, res) => {
  res.send("🚀 College Companion Backend is running...");
});

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.role}`, user: req.user });
});

// routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
