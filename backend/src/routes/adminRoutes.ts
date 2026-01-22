import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAdminStats } from "../controllers/adminController.js";

export const adminRouter = Router();

adminRouter.get("/stats", authenticate, requireRole(["admin"]), getAdminStats);




