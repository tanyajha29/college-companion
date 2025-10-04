import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ GET profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT payload
    const result = await pool.query('SELECT * FROM "USER" WHERE userid=$1', [userId]);

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
    const userId = req.user.userid;
    const { username, email, contact_no } = req.body;

    const result = await pool.query(
      `UPDATE "USER" 
       SET username=$1, email=$2, contact_no=$3
       WHERE userid=$4
       RETURNING *`,
      [username, email, contact_no, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
