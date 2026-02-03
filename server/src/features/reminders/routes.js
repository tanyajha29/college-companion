import express from "express";
import authMiddleware from "../../shared/middleware/auth.js";
import db from "../../db/pool.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const userRole = req.user.role;
  const { department, division } = req.query;

  try {
    let queryText = "";
    let queryParams = [];

    if (userRole === "admin" || userRole === "faculty" || userRole === "staff") {
      queryText = "SELECT * FROM reminders ORDER BY date DESC;";
    } else {
      queryText = `
        SELECT * FROM reminders
        WHERE 
            department = 'ALL' OR
            (department = $1 AND division = 'ALL') OR
            (department = $1 AND division = $2)
        ORDER BY date DESC;
      `;
      queryParams = [department, division];
    }

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reminders:", err);
    res.status(500).json({ message: "Server error while fetching reminders." });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, date, note, department, division } = req.body;
  const creatorUserId = req.user.userId;

  if (req.user.role !== "faculty" && req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
  }

  if (!title || !date || !department || !division) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const queryText = `
      INSERT INTO reminders (title, date, note, department, division, userid) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
    const queryParams = [title, date, note || null, department, division, creatorUserId];

    const result = await db.query(queryText, queryParams);

    await logAudit({
      actorUserId: creatorUserId,
      actorRole: req.user.role,
      action: "reminder_created",
      entityType: "reminder",
      entityId: String(result.rows[0].id || result.rows[0].reminderid),
      metadata: { title, date, department, division },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving reminder:", err);
    res.status(500).json({ message: "Server error while saving reminder." });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "faculty" && req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
  }

  try {
    const result = await db.query("DELETE FROM reminders WHERE id = $1 RETURNING *;", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found." });

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "reminder_deleted",
      entityType: "reminder",
      entityId: String(id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
