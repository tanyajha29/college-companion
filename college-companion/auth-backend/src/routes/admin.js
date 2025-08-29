import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, roleCheck(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin! 🎉" });
});

export default router;
