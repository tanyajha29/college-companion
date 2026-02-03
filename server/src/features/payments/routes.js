import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import authMiddleware from "../../shared/middleware/auth.js";
import db from "../../db/pool.js";
import { env } from "../../config/env.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});

router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "amount is required" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `fee_${req.user.userId}_${Date.now()}`,
    });

    await db.query(
      `INSERT INTO payments (user_id, amount, currency, razorpay_order_id, status)
       VALUES ($1, $2, $3, $4, 'created')`,
      [req.user.userId, amount, currency, order.id]
    );

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.razorpay.keyId });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.razorpay.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const result = await db.query(
      `UPDATE payments
       SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'paid'
       WHERE razorpay_order_id = $3
       RETURNING *`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "fee_payment",
      entityType: "payment",
      entityId: String(result.rows[0].id),
      metadata: { razorpay_order_id, razorpay_payment_id },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true, payment: result.rows[0] });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

router.get("/receipt/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await db.query(
      "SELECT * FROM payments WHERE razorpay_order_id = $1 AND user_id = $2",
      [orderId, req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Receipt not found" });

    const payment = result.rows[0];
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${orderId}.pdf`);

    doc.fontSize(20).text("College Companion Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt ID: ${payment.id}`);
    doc.text(`Order ID: ${payment.razorpay_order_id}`);
    doc.text(`Payment ID: ${payment.razorpay_payment_id || "Pending"}`);
    doc.text(`Amount: ₹${payment.amount} ${payment.currency}`);
    doc.text(`Status: ${payment.status}`);
    doc.text(`Date: ${new Date(payment.created_at).toLocaleString()}`);
    doc.moveDown();
    doc.text("Thank you for your payment.", { align: "left" });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
});

export default router;
