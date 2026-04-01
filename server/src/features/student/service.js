import * as repository from "./repository.js";

export const fetchDashboardStats = async (userId) => {
    const stats = await repository.getStudentDashboard(userId);
    if (!stats) throw new Error("Student profile not found.");

    const total = Number(stats.attendance.total_classes) || 0;
    const attended = Number(stats.attendance.classes_attended) || 0;
    const percentage = total > 0 ? (attended / total) * 100 : 0;

    return {
        attendance: {
            totalClasses: total,
            classesAttended: attended,
            percentage: percentage.toFixed(2),
            isRisk: percentage < 75 && total > 5, // Simple risk flag logic
        },
        recentPayments: stats.recentPayments,
    };
};
