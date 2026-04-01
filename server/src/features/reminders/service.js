import * as repository from "./repository.js";
import { logAudit } from "../audit/auditService.js";

export const fetchReminders = async (userRole, department, division) => {
    return await repository.getReminders(userRole, department, division);
};

export const addReminder = async (data, reqDetails) => {
    if (!data.title || !data.date || !data.department || !data.division) {
        throw new Error("Missing required fields.");
    }

    const reminder = await repository.createReminder(data);

    await logAudit({
        actorUserId: data.creatorUserId,
        actorRole: reqDetails.role,
        action: "reminder_created",
        entityType: "reminder",
        entityId: String(reminder.id || reminder.reminderid),
        metadata: { title: data.title, date: data.date, department: data.department, division: data.division },
        ipAddress: reqDetails.ip,
        userAgent: reqDetails.userAgent,
    });

    return reminder;
};

export const removeReminder = async (id, reqDetails) => {
    const deletedReminder = await repository.deleteReminder(id);

    if (!deletedReminder) {
        throw new Error("Not found.");
    }

    await logAudit({
        actorUserId: reqDetails.userId,
        actorRole: reqDetails.role,
        action: "reminder_deleted",
        entityType: "reminder",
        entityId: String(id),
        ipAddress: reqDetails.ip,
        userAgent: reqDetails.userAgent,
    });

    return deletedReminder;
};
