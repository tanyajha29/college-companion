import express from "express";
import authMiddleware, { authorizeRoles } from "../../shared/middleware/auth.js";
import * as controller from "./controller.js";

const router = express.Router();

router.get(
    "/dashboard",
    authMiddleware,
    authorizeRoles("student"),
    controller.getDashboardInfo
);

export default router;
