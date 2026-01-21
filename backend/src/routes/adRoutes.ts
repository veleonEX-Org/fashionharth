
import { Router } from "express";
import * as adController from "../controllers/adController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// Public route to get active ads
router.get("/", adController.getAds);

// Admin only routes
router.post("/", authenticate, requireRole(["admin"]), adController.createAd);
router.put("/:id", authenticate, requireRole(["admin"]), adController.updateAd);
router.delete("/:id", authenticate, requireRole(["admin"]), adController.deleteAd);

export default router;
