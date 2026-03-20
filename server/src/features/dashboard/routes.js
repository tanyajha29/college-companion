import express from "express";
import authMiddleware from "../../shared/middleware/auth.js";
import db from "../../db/pool.js";

const router = express.Router();

const asInt = (val) => Number(val?.count || 0);

router.get("/admin-summary", authMiddleware, async (req, res) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  try {
    const [
      usersRes,
      studentsRes,
      facultyRes,
      departmentsRes,
      pendingDocsRes,
      paymentsRes,
      remindersRes,
      internshipsRes,
      auditsRes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM "USER"'),
      db.query('SELECT COUNT(*) FROM "USER" WHERE "Role" = $1', ["Student"]),
      db.query('SELECT COUNT(*) FROM "USER" WHERE "Role" IN ($1,$2)', ["Faculty", "Staff"]),
      db.query("SELECT COUNT(*) FROM department"),
      db.query("SELECT COUNT(*) FROM documents WHERE status = 'pending'"),
      db.query("SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count FROM payments"),
      db.query("SELECT id, title, date, note FROM reminders ORDER BY date DESC LIMIT 5"),
      db.query("SELECT COUNT(*) FROM internship"),
      db.query("SELECT id, action, created_at FROM audit_log ORDER BY created_at DESC LIMIT 5"),
    ]);

    res.json({
      role: "admin",
      cards: {
        users: asInt(usersRes.rows[0]),
        students: asInt(studentsRes.rows[0]),
        faculty: asInt(facultyRes.rows[0]),
        departments: asInt(departmentsRes.rows[0]),
        pendingDocuments: asInt(pendingDocsRes.rows[0]),
        payments: {
          count: asInt(paymentsRes.rows[0]),
          total: Number(paymentsRes.rows[0].total || 0),
        },
        internships: asInt(internshipsRes.rows[0]),
      },
      reminders: remindersRes.rows,
      audit: auditsRes.rows,
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Failed to load admin summary" });
  }
});

router.get("/faculty-summary", authMiddleware, async (req, res) => {
  if (!["faculty", "staff"].includes(String(req.user?.role || "").toLowerCase())) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const facultyIdRes = await db.query("SELECT facultyid, departmentid FROM faculty WHERE userid = $1", [
      req.user.userId,
    ]);
    const facultyInfo = facultyIdRes.rows[0] || {};

    const [classesRes, remindersRes, atRiskRes] = await Promise.all([
      db.query(
        `SELECT cs.sessiondate, cs.topic, c.coursecode, d.divisionname
         FROM class_session cs
         JOIN course c ON cs.courseid = c.courseid
         JOIN division d ON cs.divisionid = d.divisionid
         WHERE cs.sessiondate >= CURRENT_DATE AND cs.facultyid = $1
         ORDER BY cs.sessiondate ASC
         LIMIT 5`,
        [facultyInfo.facultyid || 0]
      ),
      db.query(
        `SELECT title, date, note FROM reminders
         WHERE department = 'ALL' OR department::text = $1
         ORDER BY date DESC LIMIT 5`,
        [String(facultyInfo.departmentid || "")]
      ),
      db.query(
        `SELECT s.studentid, s.name, s.email, COALESCE(avg(CASE WHEN a.status='present' THEN 1 ELSE 0 END)*100,0) AS attendance
         FROM student s
         LEFT JOIN attendance a ON a.studentid = s.studentid
         GROUP BY s.studentid, s.name, s.email
         HAVING COALESCE(avg(CASE WHEN a.status='present' THEN 1 ELSE 0 END)*100,0) < 75
         ORDER BY attendance ASC
         LIMIT 5`
      ),
    ]);

    res.json({
      role: req.user.role,
      upcomingClasses: classesRes.rows,
      reminders: remindersRes.rows,
      atRiskStudents: atRiskRes.rows,
    });
  } catch (err) {
    console.error("Faculty summary error:", err);
    res.status(500).json({ message: "Failed to load faculty summary" });
  }
});

router.get("/student-summary", authMiddleware, async (req, res) => {
  if (String(req.user?.role || "").toLowerCase() !== "student") {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const studentRes = await db.query("SELECT studentid, divisionid FROM student WHERE userid = $1", [req.user.userId]);
    const student = studentRes.rows[0] || {};

    const [timetableRes, attendanceRes, remindersRes, docsRes, paymentsRes, internshipsRes] = await Promise.all([
      db.query(
        `SELECT cs.sessiondate, cs.starttime, cs.endtime, c.coursecode, d.divisionname, cs.roomno
         FROM class_session cs
         JOIN division d ON cs.divisionid = d.divisionid
         JOIN course c ON cs.courseid = c.courseid
         WHERE cs.sessiondate >= CURRENT_DATE AND cs.divisionid = $1
         ORDER BY cs.sessiondate, cs.starttime
         LIMIT 5`,
        [student.divisionid || 0]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status='present')::float / NULLIF(COUNT(*),0) * 100 AS attendance_pct,
           COUNT(*) AS total
         FROM attendance
         WHERE studentid = $1`,
        [student.studentid || 0]
      ),
      db.query(
        `SELECT title, date, note FROM reminders
         WHERE division = 'ALL' OR division::text = (
           SELECT divisionname FROM division WHERE divisionid = $1
         )
         ORDER BY date DESC LIMIT 5`,
        [student.divisionid || 0]
      ),
      db.query(
        `SELECT status, COUNT(*) FROM documents WHERE user_id = $1 GROUP BY status`,
        [req.user.userId]
      ),
      db.query(
        `SELECT status, COUNT(*) FROM payments WHERE user_id = $1 GROUP BY status`,
        [req.user.userId]
      ),
      db.query(
        `SELECT status, COUNT(*) FROM internship GROUP BY status`
      ),
    ]);

    const attendancePct = Number(attendanceRes.rows[0]?.attendance_pct || 0);
    res.json({
      role: "student",
      timetable: timetableRes.rows,
      attendance: {
        percentage: Math.round(attendancePct),
        totalSessions: Number(attendanceRes.rows[0]?.total || 0),
        atRisk: attendancePct < 75,
      },
      reminders: remindersRes.rows,
      documents: docsRes.rows,
      payments: paymentsRes.rows,
      internships: internshipsRes.rows,
    });
  } catch (err) {
    console.error("Student summary error:", err);
    res.status(500).json({ message: "Failed to load student summary" });
  }
});

export default router;
