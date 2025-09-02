import express from "express";
import pool from "../db.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all timetable entries for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM timetable WHERE user_id = $1 ORDER BY day, time",
      [req.user.user_id]  // coming from JWT
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Create new timetable entry
router.post("/", authMiddleware, async (req, res) => {
  const { day, time, subject, location } = req.body;
  try {
    
    const result = await pool.query(
      `INSERT INTO timetable (user_id, day, time, subject, location)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.user_id, day, time, subject, location]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update entry (only owner can update)
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { day, time, subject, location } = req.body;

  try {
    const result = await pool.query(
      `UPDATE timetable 
       SET day=$1, time=$2, subject=$3, location=$4 
       WHERE timetable_id=$5 AND user_id=$6 
       RETURNING *`,
      [day, time, subject, location, id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete entry (only owner, unless admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM timetable WHERE timetable_id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
