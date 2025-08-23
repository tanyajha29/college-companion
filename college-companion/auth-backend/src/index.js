import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"], // your React dev URL(s)
  credentials: true
}));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Auth
app.use("/api/auth", authRoutes);

// 404
app.use("*", (_req, res) => res.status(404).json({ message: "Not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
