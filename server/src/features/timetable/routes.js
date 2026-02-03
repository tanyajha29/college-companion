import express from "express";
import pool from "../../db/pool.js";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.get("/", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cs.sessionid AS timetable_id,
        CASE
          WHEN cs.dayofweek::text = '1' THEN 'Monday'
          WHEN cs.dayofweek::text = '2' THEN 'Tuesday'
          WHEN cs.dayofweek::text = '3' THEN 'Wednesday'
          WHEN cs.dayofweek::text = '4' THEN 'Thursday'
          WHEN cs.dayofweek::text = '5' THEN 'Friday'
          WHEN cs.dayofweek::text = '6' THEN 'Saturday'
          WHEN cs.dayofweek::text = '7' THEN 'Sunday'
          ELSE cs.dayofweek::text
        END AS day,
        cs.starttime,
        cs.endtime,
        c.coursename AS subject,
        cs.roomno,
        cs.facultyid,
        d.divisionname AS division,
        cs.courseid
      FROM class_session cs
      JOIN course c ON cs.courseid = c.courseid
      JOIN division d ON cs.divisionid = d.divisionid
      ORDER BY 
        CASE
          WHEN cs.dayofweek::text = '1' THEN 1
          WHEN cs.dayofweek::text = '2' THEN 2
          WHEN cs.dayofweek::text = '3' THEN 3
          WHEN cs.dayofweek::text = '4' THEN 4
          WHEN cs.dayofweek::text = '5' THEN 5
          WHEN cs.dayofweek::text = '6' THEN 6
          WHEN cs.dayofweek::text = '7' THEN 7
          WHEN cs.dayofweek::text = 'Monday' THEN 1
          WHEN cs.dayofweek::text = 'Tuesday' THEN 2
          WHEN cs.dayofweek::text = 'Wednesday' THEN 3
          WHEN cs.dayofweek::text = 'Thursday' THEN 4
          WHEN cs.dayofweek::text = 'Friday' THEN 5
          WHEN cs.dayofweek::text = 'Saturday' THEN 6
          WHEN cs.dayofweek::text = 'Sunday' THEN 7
          ELSE 8
        END,
        cs.starttime
    `);
    const rows = result.rows.map((row) => ({
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

const resolveDivisionId = async (courseId, divisionName) => {
  const res = await pool.query(
    `SELECT d.divisionid
     FROM division d
     JOIN course c ON c.departmentid = d.departmentid
     WHERE c.courseid = $1 AND d.divisionname = $2
     LIMIT 1`,
    [courseId, divisionName]
  );
  return res.rows[0]?.divisionid;
};

const normalizeDayOfWeek = (day) => {
  const map = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };
  if (typeof day === "number") return day;
  if (typeof day === "string" && map[day]) return map[day];
  return day;
};

router.post("/", authMiddleware, authorizeRoles("admin", "staff", "faculty"), async (req, res) => {
  const { courseid, facultyid, div, dayofweek, starttime, endtime, roomno } = req.body;
  if (!courseid || !facultyid || !div || !dayofweek || !starttime || !endtime || !roomno) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const divisionid = await resolveDivisionId(courseid, div);
    if (!divisionid) return res.status(400).json({ error: "Invalid division for course" });
    const normalizedDay = normalizeDayOfWeek(dayofweek);
    const result = await pool.query(
      `INSERT INTO class_session (courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [courseid, facultyid, divisionid, normalizedDay, starttime, endtime, roomno]
    );

    await logAudit({
      actorUserId: req.user?.userId,
      actorRole: req.user?.role,
      action: "timetable_created",
      entityType: "class_session",
      entityId: String(result.rows[0].sessionid),
      metadata: { courseid, div, dayofweek, starttime, endtime },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /timetable error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authMiddleware, authorizeRoles("admin", "staff", "faculty"), async (req, res) => {
  const { id } = req.params;
  const { courseid, facultyid, div, dayofweek, starttime, endtime, roomno } = req.body;
  if (!courseid || !facultyid || !div || !dayofweek || !starttime || !endtime || !roomno) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const divisionid = await resolveDivisionId(courseid, div);
    if (!divisionid) return res.status(400).json({ error: "Invalid division for course" });
    const normalizedDay = normalizeDayOfWeek(dayofweek);
    const result = await pool.query(
      `UPDATE class_session
       SET courseid=$1, facultyid=$2, divisionid=$3, dayofweek=$4, starttime=$5, endtime=$6, roomno=$7
       WHERE sessionid=$8
       RETURNING *`,
      [courseid, facultyid, divisionid, normalizedDay, starttime, endtime, roomno, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    await logAudit({
      actorUserId: req.user?.userId,
      actorRole: req.user?.role,
      action: "timetable_updated",
      entityType: "class_session",
      entityId: String(id),
      metadata: { courseid, div, dayofweek, starttime, endtime },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(`PUT /timetable/${id} error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, authorizeRoles("admin", "staff", "faculty"), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM class_session WHERE sessionid=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    await logAudit({
      actorUserId: req.user?.userId,
      actorRole: req.user?.role,
      action: "timetable_deleted",
      entityType: "class_session",
      entityId: String(id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(`DELETE /timetable/${id} error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
