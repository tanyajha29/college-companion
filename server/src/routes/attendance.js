import express from 'express';
import db from '../db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// ===================================================================
// FIXED ENDPOINT FOR DEPARTMENTS
// ===================================================================

// ✅ CORRECTED: Changed the query to use your 'deptname' column.
router.get('/departments', authenticateToken, async (req, res) => {
    try {
        console.log("✅ The /departments endpoint was reached.");
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

// ... (The rest of your file remains the same)

router.get('/sessions', authenticateToken, async (req, res) => {
    const { departmentId } = req.query;

    if (!departmentId) {
        return res.json([]);
    }

    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden.' });
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
            JOIN division d ON cs.div = d.divisionname
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

router.get('/session-roster/:sessionId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden.' });
    }

    const { sessionId } = req.params;
    try {
        const query = `
            SELECT DISTINCT s.studentid, s.rollnumber, u.username
            FROM student s
            JOIN "USER" u ON s.userid = u.userid
            WHERE s.divisionid = (
                SELECT d.divisionid
                FROM division d
                WHERE d.divisionname = (SELECT cs.div FROM class_session cs WHERE cs.sessionid = $1)
                AND d.departmentid = (
                    SELECT c.departmentid FROM course c
                    JOIN class_session cs ON c.courseid = cs.courseid
                    WHERE cs.sessionid = $1
                )
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

router.post('/mark', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden.' });
    }
    const { sessionId, date, records } = req.body;
    if (!sessionId || !date || !records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: "Session ID, date, and a non-empty array of records are required." });
    }
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        for (const record of records) {
            const query = `
                INSERT INTO attendance (sessionid, studentid, date, status)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (sessionid, studentid, date) DO UPDATE SET status = EXCLUDED.status;
            `;
            await client.query(query, [sessionId, record.studentid, date, record.status]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: "Attendance marked successfully." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error marking attendance:", err);
        res.status(500).json({ message: "Failed to mark attendance." });
    } finally {
        client.release();
    }
});

router.get('/my-summary', authenticateToken, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'This endpoint is for students only.' });
    }
    try {
        const thresholdRes = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'attendance_threshold'");
        if (thresholdRes.rows.length === 0) {
            return res.status(500).json({ message: "Attendance threshold not configured." });
        }
        const threshold = parseFloat(thresholdRes.rows[0].setting_value);
        const studentRes = await db.query('SELECT studentid FROM student WHERE userid = $1', [req.user.userId]);
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ message: "Student not found." });
        }
        const studentId = studentRes.rows[0].studentid;

        const summaryQuery = `
            SELECT
                c.coursename,
                COUNT(a.id) AS total_classes,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS classes_attended
            FROM attendance a
            JOIN class_session cs ON a.sessionid = cs.sessionid
            JOIN course c ON cs.courseid = c.courseid
            WHERE a.studentid = $1
            GROUP BY c.coursename;
        `;
        const summaryResult = await db.query(summaryQuery, [studentId]);

        const finalSummary = summaryResult.rows.map(row => {
            const percentage = row.total_classes > 0 ? (row.classes_attended / row.total_classes) * 100 : 0;
            return {
                subject_name: row.coursename,
                total_classes: Number(row.total_classes),
                classes_attended: Number(row.classes_attended),
                percentage: percentage.toFixed(2),
                isBelowThreshold: percentage < threshold
            };
        });

        res.json(finalSummary);
    } catch (err) {
        console.error("Error fetching student summary:", err);
        res.status(500).json({ message: "Failed to fetch summary." });
    }
});

export default router;