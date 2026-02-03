import express from "express";
import db from "../../db/pool.js";
import authMiddleware from "../../shared/middleware/auth.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.get("/departments", authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT departmentid, deptname AS departmentname
      FROM department
      ORDER BY deptname;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Failed to fetch departments." });
  }
});

router.get("/sessions", authMiddleware, async (req, res) => {
  const { departmentId } = req.query;

  if (!departmentId) {
    return res.json([]);
  }

  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden." });
  }
  try {
    const query = `
      SELECT DISTINCT
          cs.sessionid,
          c.coursename AS subject_name,
          d.divisionname,
          cs.dayofweek AS day_of_week,
          cs.starttime AS start_time
      FROM class_session cs
      JOIN course c ON cs.courseid = c.courseid
      JOIN division d ON cs.divisionid = d.divisionid
      WHERE d.departmentid = $1
      ORDER BY c.coursename, d.divisionname;
    `;
    const result = await db.query(query, [departmentId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ message: "Failed to fetch class sessions." });
  }
});

router.get("/session-roster/:sessionId", authMiddleware, async (req, res) => {
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden." });
  }

  const { sessionId } = req.params;
  try {
    const query = `
      SELECT DISTINCT s.studentid, s.rollnumber, u.username
      FROM student s
      JOIN "USER" u ON s.userid = u.userid
      WHERE s.divisionid = (
          SELECT cs.divisionid FROM class_session cs WHERE cs.sessionid = $1
      )
      ORDER BY s.rollnumber;
    `;
    const result = await db.query(query, [sessionId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching session roster:", err);
    res.status(500).json({ message: "Failed to fetch student roster." });
  }
});

router.post("/mark", authMiddleware, async (req, res) => {
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden." });
  }
  const { sessionId, date, records } = req.body;
  if (!sessionId || !date || !records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "Session ID, date, and a non-empty array of records are required." });
  }
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const record of records) {
      const normalizedStatus =
        record.status === "Present" ? "P" : record.status === "Absent" ? "A" : record.status;
      const query = `
        INSERT INTO attendance (sessionid, studentid, date, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (sessionid, studentid, date) DO UPDATE SET status = EXCLUDED.status;
      `;
      await client.query(query, [sessionId, record.studentid, date, normalizedStatus]);
    }
    await client.query("COMMIT");

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "attendance_marked",
      entityType: "class_session",
      entityId: String(sessionId),
      metadata: { count: records.length, date },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Failed to mark attendance." });
  } finally {
    client.release();
  }
});

router.get("/my-summary", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "This endpoint is for students only." });
  }
  try {
    const thresholdRes = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'attendance_threshold'"
    );
    if (thresholdRes.rows.length === 0) {
      return res.status(500).json({ message: "Attendance threshold not configured." });
    }
    const threshold = parseFloat(thresholdRes.rows[0].setting_value);
    const studentRes = await db.query("SELECT studentid FROM student WHERE userid = $1", [req.user.userId]);
    if (studentRes.rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }
    const studentId = studentRes.rows[0].studentid;

    const summaryQuery = `
      SELECT
          c.coursename,
          COUNT(a.sessionid) AS total_classes,
          SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) AS classes_attended
      FROM attendance a
      JOIN class_session cs ON a.sessionid = cs.sessionid
      JOIN course c ON cs.courseid = c.courseid
      WHERE a.studentid = $1
      GROUP BY c.coursename;
    `;
    const summaryResult = await db.query(summaryQuery, [studentId]);

    const finalSummary = summaryResult.rows.map((row) => {
      const total = Number(row.total_classes);
      const attended = Number(row.classes_attended);
      const percentage = total > 0 ? (attended / total) * 100 : 0;
      return {
        subject_name: row.coursename,
        total_classes: total,
        classes_attended: attended,
        percentage: percentage.toFixed(2),
        isBelowThreshold: percentage < threshold,
      };
    });

    res.json(finalSummary);
  } catch (err) {
    console.error("Error fetching student summary:", err);
    res.status(500).json({ message: "Failed to fetch summary." });
  }
});

// Predictive Attendance: flag students likely to fall below 75%
router.get("/predict-risk", authMiddleware, async (req, res) => {
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden." });
  }
  try {
    const threshold = 0.75;
    const recentWindow = 6;

    const query = `
      WITH recent AS (
        SELECT
          a.studentid,
          COUNT(*) FILTER (WHERE a.status = 'P') AS recent_present,
          COUNT(*) AS recent_total
        FROM attendance a
        WHERE a.date >= (CURRENT_DATE - INTERVAL '30 days')
        GROUP BY a.studentid
      ),
      overall AS (
        SELECT
          a.studentid,
          COUNT(*) FILTER (WHERE a.status = 'P') AS overall_present,
          COUNT(*) AS overall_total
        FROM attendance a
        GROUP BY a.studentid
      )
      SELECT
        s.studentid,
        u.username,
        u.email,
        COALESCE(r.recent_present, 0) AS recent_present,
        COALESCE(r.recent_total, 0) AS recent_total,
        COALESCE(o.overall_present, 0) AS overall_present,
        COALESCE(o.overall_total, 0) AS overall_total
      FROM student s
      JOIN "USER" u ON s.userid = u.userid
      LEFT JOIN recent r ON r.studentid = s.studentid
      LEFT JOIN overall o ON o.studentid = s.studentid;
    `;

    const result = await db.query(query);
    const rows = result.rows.map((row) => {
      const recentRate = row.recent_total > 0 ? row.recent_present / row.recent_total : 1;
      const overallRate = row.overall_total > 0 ? row.overall_present / row.overall_total : 1;
      const trendingDown = recentRate + 0.05 < overallRate;
      const predictedBelow = recentRate < threshold && row.recent_total >= recentWindow;

      return {
        studentid: row.studentid,
        username: row.username,
        email: row.email,
        recentRate: Number((recentRate * 100).toFixed(2)),
        overallRate: Number((overallRate * 100).toFixed(2)),
        trendingDown,
        predictedBelow75: predictedBelow,
      };
    });

    res.json(rows.filter((r) => r.trendingDown || r.predictedBelow75));
  } catch (err) {
    console.error("Error predicting attendance risk:", err);
    res.status(500).json({ message: "Failed to predict attendance risk." });
  }
});

export default router;
