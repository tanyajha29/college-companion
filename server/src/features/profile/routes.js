import express from "express";
import pool from "../../db/pool.js";
import authMiddleware from "../../shared/middleware/auth.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM "USER" WHERE userid=$1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, contact_no } = req.body;

    const result = await pool.query(
      `UPDATE "USER" 
       SET username=$1, email=$2, contact_no=$3
       WHERE userid=$4
       RETURNING *`,
      [username, email, contact_no, userId]
    );

    await logAudit({
      actorUserId: userId,
      actorRole: req.user.role,
      action: "profile_updated",
      entityType: "USER",
      entityId: String(userId),
      metadata: { username, email },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
