import * as service from "./service.js";

export const getTimetables = async (req, res, next) => {
    try {
        const data = await service.getTimetables();
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const createTimetable = async (req, res, next) => {
    try {
        const userContext = {
            userId: req.user.userId,
            role: req.user.role,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        const data = await service.createTimetable(req.body, userContext);
        res.status(201).json(data);
    } catch (err) {
        if (err.message === "Missing required fields" || err.message === "Invalid division for course") {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
};

export const updateTimetable = async (req, res, next) => {
    try {
        const userContext = {
            userId: req.user.userId,
            role: req.user.role,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        const data = await service.updateTimetable(req.params.id, req.body, userContext);
        res.json(data);
    } catch (err) {
        if (err.message === "Missing required fields" || err.message === "Invalid division for course") {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === "Session not found") {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
};

export const deleteTimetable = async (req, res, next) => {
    try {
        const userContext = {
            userId: req.user.userId,
            role: req.user.role,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        const data = await service.deleteTimetable(req.params.id, userContext);
        res.json(data);
    } catch (err) {
        if (err.message === "Session not found") {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
};
