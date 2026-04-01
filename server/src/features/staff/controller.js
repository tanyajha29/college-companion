import * as service from "./service.js";

export const getDashboardInfo = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const stats = await service.fetchDashboardStats(userId);
        res.json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
};
