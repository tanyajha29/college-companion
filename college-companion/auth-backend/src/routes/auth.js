import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

const router = Router();
const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

// REGISTER  -------------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "Student", department = null } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }
    if (!["Admin", "Staff", "Student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check existing
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, ROUNDS);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, department) VALUES (?,?,?,?,?)",
      [name, email, hashed, role, department]
    );

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: result.insertId, name, email, role, department }
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// LOGIN  ---------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ME (optional) ---------------------------
router.get("/me", async (req, res) => {
  // Typically you'd require verifyToken here; keeping open for simplicity
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.JWT_SECRET); // {id, role}
    const [rows] = await pool.query("SELECT id, name, email, role, department FROM users WHERE id = ?", [payload.id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
