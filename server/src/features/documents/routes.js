import express from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../lib/s3.js";
import { env } from "../../config/env.js";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import db from "../../db/pool.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.post("/presign", authMiddleware, async (req, res) => {
  try {
    const { fileName, contentType, label } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).json({ message: "fileName and contentType are required." });
    }

    const key = `documents/${req.user.userId}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    res.json({ uploadUrl, key, label });
  } catch (err) {
    console.error("Presign error:", err);
    res.status(500).json({ message: "Failed to generate upload URL." });
  }
});

router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const { key, fileName, mimeType, label } = req.body;
    if (!key || !fileName) {
      return res.status(400).json({ message: "key and fileName are required." });
    }

    const result = await db.query(
      `INSERT INTO documents (user_id, s3_key, file_name, mime_type, label, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user.userId, key, fileName, mimeType || null, label || null]
    );

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "document_uploaded",
      entityType: "document",
      entityId: String(result.rows[0].id),
      metadata: { key, fileName, label },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Confirm upload error:", err);
    res.status(500).json({ message: "Failed to confirm upload." });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC", [
      req.user.userId,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ message: "Failed to fetch documents." });
  }
});

router.put("/:id/verify", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `UPDATE documents
       SET status = 'verified', verified_by = $1, verified_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.userId, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Document not found" });

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "document_verified",
      entityType: "document",
      entityId: String(id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Verify document error:", err);
    res.status(500).json({ message: "Failed to verify document." });
  }
});

export default router;
