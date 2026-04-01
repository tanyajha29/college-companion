import express from "express";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import * as controller from "./controller.js";

const router = express.Router();

router.get("/", authMiddleware, controller.getReminders);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "faculty", "staff"),
  controller.createReminder
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "faculty", "staff"),
  controller.deleteReminder
);

export default router;
