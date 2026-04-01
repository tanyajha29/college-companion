import db from "../../db/pool.js";

export const getReminders = async (userRole, department, division) => {
    if (userRole === "admin" || userRole === "faculty" || userRole === "staff") {
        const result = await db.query("SELECT * FROM reminders ORDER BY date DESC;");
        return result.rows;
    } else {
        const queryText = `
      SELECT * FROM reminders
      WHERE 
          department = 'ALL' OR
          (department = $1 AND division = 'ALL') OR
          (department = $1 AND division = $2)
      ORDER BY date DESC;
    `;
        const result = await db.query(queryText, [department, division]);
        return result.rows;
    }
};

export const createReminder = async (data) => {
    const { title, date, note, department, division, creatorUserId } = data;
    const queryText = `
    INSERT INTO reminders (title, date, note, department, division, userid) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *;
  `;
    const queryParams = [title, date, note || null, department, division, creatorUserId];
    const result = await db.query(queryText, queryParams);
    return result.rows[0];
};

export const deleteReminder = async (id) => {
    const result = await db.query("DELETE FROM reminders WHERE id = $1 RETURNING *;", [id]);
    return result.rowCount > 0 ? result.rows[0] : null;
};
