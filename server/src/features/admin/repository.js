import db from "../../db/pool.js";

export const getSystemStats = async () => {
    const usersCountQuery = await db.query(`
    SELECT role, COUNT(*) as count 
    FROM "USER" 
    GROUP BY role
  `);

    const paymentsQuery = await db.query(`
    SELECT SUM(amount) as total_revenue, COUNT(*) as total_transactions 
    FROM payments 
    WHERE status = 'successful'
  `);

    const recentLogsQuery = await db.query(`
    SELECT * 
    FROM audit_log 
    ORDER BY created_at DESC 
    LIMIT 10
  `);

    return {
        users: usersCountQuery.rows,
        payments: paymentsQuery.rows[0],
        recentLogs: recentLogsQuery.rows,
    };
};
