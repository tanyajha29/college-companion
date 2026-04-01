import * as service from "./service.js";

export const getReminders = async (req, res, next) => {
    try {
        const userRole = req.user.role;
        const { department, division } = req.query;

        const reminders = await service.fetchReminders(userRole, department, division);
        res.json({ success: true, data: reminders });
    } catch (err) {
        next(err);
    }
};

export const createReminder = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            creatorUserId: req.user.userId,
        };

        const reqDetails = {
            role: req.user.role,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };

        const reminder = await service.addReminder(data, reqDetails);
        res.status(201).json({ success: true, data: reminder });
    } catch (err) {
        if (err.message === "Missing required fields.") {
            return res.status(400).json({ success: false, error: err.message });
        }
        next(err);
    }
};

export const deleteReminder = async (req, res, next) => {
    try {
        const { id } = req.params;

        const reqDetails = {
            userId: req.user.userId,
            role: req.user.role,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };

        await service.removeReminder(id, reqDetails);
        res.status(200).json({ success: true, message: "Deleted successfully." });
    } catch (err) {
        if (err.message === "Not found.") {
            return res.status(404).json({ success: false, error: err.message });
        }
        next(err);
    }
};
