import express from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../lib/s3.js";
import { env } from "../../config/env.js";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import db from "../../db/pool.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.post("/presign", authMiddleware, async (req, res) => {
  const { fileName, contentType, label } = req.body;

  // Validate request payload
  if (!fileName || !contentType) {
    return res.status(400).json({ message: "fileName and contentType are required." });
  }

  // Validate required AWS env vars
  const missingEnv = [];
  if (!env.s3.bucket) missingEnv.push("S3_BUCKET_NAME / AWS_S3_BUCKET");
  if (!env.s3.region) missingEnv.push("AWS_REGION");
  if (missingEnv.length) {
    console.error("Presign error: missing env vars ->", missingEnv.join(", "));
    return res
      .status(500)
      .json({ message: `S3 configuration missing: ${missingEnv.join(", ")}` });
  }
  if (!env.s3.accessKeyId || !env.s3.secretAccessKey) {
    console.warn("Presign warning: using IAM role/default credentials (no AWS_ACCESS_KEY_ID/SECRET set)");
  }

  try {
    const safeName = String(fileName).replace(/\s+/g, "_");
    const key = `documents/${req.user.userId}/${Date.now()}-${safeName}`;
    const command = new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const fileUrl = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`;

    return res.json({ uploadUrl, fileUrl, key });
  } catch (err) {
    console.error("Presign generation error:", err);
    return res.status(500).json({ message: "Failed to generate upload URL." });
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
