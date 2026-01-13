import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { getAdminStats } from "../controllers/adminController";
export const adminRouter = Router();
adminRouter.get("/stats", authenticate, requireRole(["admin"]), getAdminStats);
