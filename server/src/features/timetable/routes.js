import express from "express";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import * as controller from "./controller.js";

const router = express.Router();

router.get("/", authMiddleware, controller.getTimetables);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "staff", "faculty"),
  controller.createTimetable
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff", "faculty"),
  controller.updateTimetable
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff", "faculty"),
  controller.deleteTimetable
);

export default router;
