import * as repository from "./repository.js";

export const fetchDashboardStats = async () => {
    const stats = await repository.getSystemStats();

    // Format the users count into a more consumable object
    const formattedUsers = stats.users.reduce((acc, curr) => {
        acc[curr.role] = parseInt(curr.count, 10);
        return acc;
    }, { admin: 0, faculty: 0, staff: 0, student: 0 });

    return {
        users: formattedUsers,
        totalUsers: Object.values(formattedUsers).reduce((a, b) => a + b, 0),
        revenue: {
            totalAmount: parseInt(stats.payments.total_revenue || 0, 10),
            totalTransactions: parseInt(stats.payments.total_transactions || 0, 10),
        },
        recentLogs: stats.recentLogs,
    };
};
