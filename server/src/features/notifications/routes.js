import express from "express";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import { emitNotification } from "./socket.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.post("/broadcast", authMiddleware, authorizeRoles("admin", "staff", "faculty"), async (req, res) => {
  const { title, message, room } = req.body;
  if (!title || !message) return res.status(400).json({ message: "title and message are required" });

  emitNotification({
    room,
    event: "notification",
    payload: { title, message, createdAt: new Date().toISOString() },
  });

  await logAudit({
    actorUserId: req.user.userId,
    actorRole: req.user.role,
    action: "notification_broadcast",
    entityType: "notification",
    metadata: { title, room },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.json({ success: true });
});

export default router;
