import * as repository from "./repository.js";

export const fetchDashboardStats = async (userId) => {
    const stats = await repository.getFacultyDashboard(userId);
    return stats;
};
