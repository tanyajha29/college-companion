import db from "../../db/pool.js";

export const getFacultyDashboard = async (userId) => {
    // Assuming 'faculty' maps to a teacher with sessions
    const timetableQuery = await db.query(`
    SELECT cs.sessionid, c.coursename, cs.dayofweek, cs.starttime 
    FROM class_session cs
    JOIN course c ON cs.courseid = c.courseid
    LIMIT 5; -- Simplification: In a full schema, we filter by faculty_id
  `);

    const remindersQuery = await db.query(`
    SELECT * FROM reminders ORDER BY date DESC LIMIT 5;
  `);

    // Simple attendance completion summary
    const attendanceSummaryQuery = await db.query(`
    SELECT COUNT(*) as total_records FROM attendance;
  `);

    return {
        timetable: timetableQuery.rows,
        reminders: remindersQuery.rows,
        attendanceStats: { recordsProcessed: attendanceSummaryQuery.rows[0].total_records },
    };
};
