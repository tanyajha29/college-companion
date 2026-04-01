import db from "../../db/pool.js";

export const getStudentDashboard = async (userId) => {
    // Get student ID
    const studentRes = await db.query("SELECT studentid FROM student WHERE userid = $1", [userId]);
    if (studentRes.rows.length === 0) return null;
    const studentId = studentRes.rows[0].studentid;

    // Simple attendance completion summary
    const attendanceQuery = await db.query(`
    SELECT 
      COUNT(a.sessionid) AS total_classes,
      SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) AS classes_attended
    FROM attendance a
    WHERE a.studentid = $1;
  `, [studentId]);

    const paymentsQuery = await db.query(`
    SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5;
  `, [userId]);

    return {
        studentId,
        attendance: attendanceQuery.rows[0],
        recentPayments: paymentsQuery.rows,
    };
};
