import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// ============ PUBLIC ROUTES ============
// GET /api/categories - Get all categories
router.get("/categories", categoryController.getCategories);

// GET /api/measurement-fields - Get all measurement fields
router.get("/measurement-fields", categoryController.getMeasurementFields);

// All other routes require authentication
router.use(authenticate);

// ============ CATEGORIES ============
// GET /api/categories/:id - Get single category
router.get("/categories/:id", categoryController.getCategory);

// POST /api/categories - Create new category (admin only)
router.post("/categories", requireRole(["admin"]), categoryController.createCategory);

// PUT /api/categories/:id - Update category (admin only)
router.put("/categories/:id", requireRole(["admin"]), categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category (admin only)
router.delete("/categories/:id", requireRole(["admin"]), categoryController.deleteCategory);

// ============ MEASUREMENT FIELDS ============
// GET /api/measurement-fields/:id - Get single measurement field
router.get("/measurement-fields/:id", categoryController.getMeasurementField);

// POST /api/measurement-fields - Create new measurement field (admin only)
router.post("/measurement-fields", requireRole(["admin"]), categoryController.createMeasurementField);

// PUT /api/measurement-fields/:id - Update measurement field (admin only)
router.put("/measurement-fields/:id", requireRole(["admin"]), categoryController.updateMeasurementField);

// DELETE /api/measurement-fields/:id - Delete measurement field (admin only)
router.delete("/measurement-fields/:id", requireRole(["admin"]), categoryController.deleteMeasurementField);

export default router;
