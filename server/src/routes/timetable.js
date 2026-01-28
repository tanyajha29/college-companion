import express from "express";
import pool from "../db.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// GET: Fetch all timetable sessions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          cs.sessionid AS timetable_id,
          TRIM(cs.dayofweek) AS day,
          cs.starttime,
          cs.endtime,
          c.coursename AS subject,
          cs.roomno,
          cs.facultyid,
          cs.div AS division, -- ✅ FIX: Renaming the 'div' column to 'division' for the frontend
          cs.courseid
        FROM class_session cs
        JOIN course c ON cs.courseid = c.courseid
        ORDER BY 
          CASE TRIM(cs.dayofweek)
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
            ELSE 8
          END,
          cs.starttime
      `);
    const rows = result.rows.map(row => ({
      ...row,
      starttime: row.starttime.slice(0, 5),
      endtime: row.endtime.slice(0, 5),
    }));
    res.json(rows);
  } catch (err) {
    console.error("GET /timetable error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Create class session (This code is already correct)
router.post("/", authMiddleware, authorizeRoles("admin", "staff","faculty"), async (req, res) => {
  const { courseid, facultyid, div, dayofweek, starttime, endtime, roomno } = req.body;
  if (!courseid || !facultyid || !div || !dayofweek || !starttime || !endtime || !roomno) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO class_session (courseid, facultyid, div, dayofweek, starttime, endtime, roomno)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [courseid, facultyid, div, dayofweek, starttime, endtime, roomno]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /timetable error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: Update class session (This code is already correct)
router.put("/:id", authMiddleware, authorizeRoles("admin", "staff","faculty"), async (req, res) => {
  const { id } = req.params;
  const { courseid, facultyid, div, dayofweek, starttime, endtime, roomno } = req.body;
  if (!courseid || !facultyid || !div || !dayofweek || !starttime || !endtime || !roomno) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `UPDATE class_session
       SET courseid=$1, facultyid=$2, div=$3, dayofweek=$4, starttime=$5, endtime=$6, roomno=$7
       WHERE sessionid=$8
       RETURNING *`,
      [courseid, facultyid, div, dayofweek, starttime, endtime, roomno, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`PUT /timetable/${id} error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE: Delete class session (This code is already correct)
router.delete("/:id", authMiddleware, authorizeRoles("admin", "staff","faculty"), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM class_session WHERE sessionid=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(`DELETE /timetable/${id} error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

