import db from "../../db/pool.js";

// Utility function to map DB string representation to readable strings
export const mapDayOfWeek = (day) => {
    const mapping = {
        '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday',
        '5': 'Friday', '6': 'Saturday', '7': 'Sunday'
    };
    return mapping[String(day)] || String(day);
};

export const getTimetableList = async () => {
    const query = `
    SELECT 
      cs.sessionid AS timetable_id,
      cs.dayofweek::text AS day_raw,
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
    ORDER BY cs.dayofweek, cs.starttime
  `;
    const result = await db.query(query);
    return result.rows.map(row => ({
        ...row,
        day: mapDayOfWeek(row.day_raw),
        starttime: row.starttime.slice(0, 5),
        endtime: row.endtime.slice(0, 5),
    }));
};

export const resolveDivisionId = async (courseId, divisionName) => {
    const res = await db.query(
        `SELECT d.divisionid
     FROM division d
     JOIN course c ON c.departmentid = d.departmentid
     WHERE c.courseid = $1 AND d.divisionname = $2
     LIMIT 1`,
        [courseId, divisionName]
    );
    return res.rows[0]?.divisionid;
};

export const createTimetableSession = async (data) => {
    const { courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno } = data;
    const result = await db.query(
        `INSERT INTO class_session (courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno]
    );
    return result.rows[0];
};

export const updateTimetableSession = async (id, data) => {
    const { courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno } = data;
    const result = await db.query(
        `UPDATE class_session
     SET courseid=$1, facultyid=$2, divisionid=$3, dayofweek=$4, starttime=$5, endtime=$6, roomno=$7
     WHERE sessionid=$8
     RETURNING *`,
        [courseid, facultyid, divisionid, dayofweek, starttime, endtime, roomno, id]
    );
    return result.rows[0];
};

export const deleteTimetableSession = async (id) => {
    const result = await db.query("DELETE FROM class_session WHERE sessionid=$1 RETURNING *", [id]);
    return result.rows[0];
};
