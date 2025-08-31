import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ GET profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT payload
    const result = await pool.query("SELECT * FROM users WHERE user_id=$1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]); // send user profile
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, dept_id, contact_no } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET username=$1, email=$2, dept_id=$3, contact_no=$4
       WHERE user_id=$5
       RETURNING *`,
      [name, email, dept_id, contact_no, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
