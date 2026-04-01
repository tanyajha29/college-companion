import * as repository from "./repository.js";
import { logAudit } from "../audit/auditService.js";

const normalizeDayOfWeek = (day) => {
    const map = {
        Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
    };
    if (typeof day === "number") return day;
    if (typeof day === "string" && map[day]) return map[day];
    return day;
};

export const getTimetables = async () => {
    return repository.getTimetableList();
};

export const createTimetable = async (data, userContext) => {
    const { courseid, facultyid, div, dayofweek, starttime, endtime, roomno } = data;

    const divisionid = await repository.resolveDivisionId(courseid, div);
    if (!divisionid) throw new Error("Invalid division for course");

    const normalizedDay = normalizeDayOfWeek(dayofweek);

    const result = await repository.createTimetableSession({
        courseid, facultyid, divisionid, dayofweek: normalizedDay, starttime, endtime, roomno
    });

    await logAudit({
        actorUserId: userContext.userId,
        actorRole: userContext.role,
        action: "timetable_created",
        entityType: "class_session",
        entityId: String(result.sessionid),
        metadata: { courseid, div, dayofweek, starttime, endtime },
        ipAddress: userContext.ip,
        userAgent: userContext.userAgent,
    });

    return result;
};

export const updateTimetable = async (id, data, userContext) => {
    const { courseid, facultyid, div, dayofweek, starttime, endtime, roomno } = data;

    const divisionid = await repository.resolveDivisionId(courseid, div);
    if (!divisionid) throw new Error("Invalid division for course");

    const normalizedDay = normalizeDayOfWeek(dayofweek);

    const result = await repository.updateTimetableSession(id, {
        courseid, facultyid, divisionid, dayofweek: normalizedDay, starttime, endtime, roomno
    });

    if (!result) throw new Error("Session not found");

    await logAudit({
        actorUserId: userContext.userId,
        actorRole: userContext.role,
        action: "timetable_updated",
        entityType: "class_session",
        entityId: String(id),
        metadata: { courseid, div, dayofweek, starttime, endtime },
        ipAddress: userContext.ip,
        userAgent: userContext.userAgent,
    });

    return result;
};

export const deleteTimetable = async (id, userContext) => {
    const result = await repository.deleteTimetableSession(id);
    if (!result) throw new Error("Session not found");

    await logAudit({
        actorUserId: userContext.userId,
        actorRole: userContext.role,
        action: "timetable_deleted",
        entityType: "class_session",
        entityId: String(id),
        ipAddress: userContext.ip,
        userAgent: userContext.userAgent,
    });

    return { success: true };
};
