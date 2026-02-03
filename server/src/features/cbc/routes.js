import express from "express";
import authMiddleware from "../../shared/middleware/auth.js";
import db from "../../db/pool.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.get("/electives", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT courseid, coursecode, coursename, departmentid
       FROM course
       ORDER BY coursename`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch electives error:", err);
    res.status(500).json({ message: "Failed to fetch electives." });
  }
});

router.post("/select", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    const studentRes = await db.query("SELECT studentid FROM student WHERE userid = $1", [req.user.userId]);
    if (studentRes.rows.length === 0) return res.status(404).json({ message: "Student not found" });
    const studentId = studentRes.rows[0].studentid;

    const clashQuery = `
      SELECT 1
      FROM class_session cs_new
      JOIN student_course sc ON sc.studentid = $1
      JOIN class_session cs_existing ON cs_existing.courseid = sc.courseid
      WHERE cs_new.courseid = $2
        AND cs_new.dayofweek = cs_existing.dayofweek
        AND cs_new.starttime < cs_existing.endtime
        AND cs_new.endtime > cs_existing.starttime
      LIMIT 1;
    `;
    const clashRes = await db.query(clashQuery, [studentId, courseId]);
    if (clashRes.rows.length > 0) {
      return res.status(409).json({ message: "Timetable clash detected for selected elective." });
    }

    await db.query(
      "INSERT INTO student_course (studentid, courseid) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [studentId, courseId]
    );

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "cbc_elective_selected",
      entityType: "course",
      entityId: String(courseId),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("CBCS select error:", err);
    res.status(500).json({ message: "Failed to select elective." });
  }
});

export default router;
