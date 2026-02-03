import express from "express";
import pool from "../../db/pool.js";
import authMiddleware from "../../shared/middleware/auth.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

router.get("/", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM internship ORDER BY applicationdeadline DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database Error fetching internships:", err);
    res.status(500).json({ message: "Server error fetching data." });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { companyname, jobtitle, description, stipend, applicationdeadline, status, nextinterviewdate } = req.body;

  if (!companyname || !jobtitle || !applicationdeadline) {
    return res.status(400).json({ message: "Missing mandatory fields." });
  }

  const query = `
    INSERT INTO internship (companyname, jobtitle, description, stipend, applicationdeadline, status, nextinterviewdate)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [companyname, jobtitle, description, stipend, applicationdeadline, status, nextinterviewdate];

  try {
    const result = await pool.query(query, values);

    await logAudit({
      actorUserId: req.user?.userId,
      actorRole: req.user?.role,
      action: "internship_created",
      entityType: "internship",
      entityId: String(result.rows[0].internshipid),
      metadata: { companyname, jobtitle },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error inserting internship:", err);
    res.status(500).json({ message: "Failed to create application." });
  }
});

export default router;
