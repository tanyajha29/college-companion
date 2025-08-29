import express from "express";
import { authMiddleware, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// ✅ Accessible by ANY logged-in user
router.get("/", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: `Welcome ${req.user.role} 🎉`,
    user: req.user,
  });
});

// ✅ Accessible ONLY by Admins
router.get("/admin", authMiddleware, authorizeRoles("Admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin Dashboard - only Admins can see this 🚀",
  });
});

// ✅ Accessible by Admin + Staff
router.get("/staff", authMiddleware, authorizeRoles("Admin", "Staff"), (req, res) => {
  res.json({
    success: true,
    message: "Staff Dashboard - Admins and Staff can see this 👩‍💻",
  });
});

export default router;
