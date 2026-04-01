import * as service from "./service.js";

export const getDashboardInfo = async (req, res, next) => {
    try {
        const stats = await service.fetchDashboardStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
};
