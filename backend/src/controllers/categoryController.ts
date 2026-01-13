import type { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/categoryService.js";
import { z } from "zod";

// ============ CATEGORIES ============

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await categoryService.getCategoryById(id);
    
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    
    res.json(category);
  } catch (err) {
    next(err);
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
});

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const data = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(id, data);
    
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await categoryService.deleteCategory(id);
    
    if (!success) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// ============ MEASUREMENT FIELDS ============

export async function getMeasurementFields(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const fields = await categoryService.getAllMeasurementFields();
    res.json(fields);
  } catch (err) {
    next(err);
  }
}

export async function getMeasurementField(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const field = await categoryService.getMeasurementFieldById(id);
    
    if (!field) {
      res.status(404).json({ error: "Measurement field not found" });
      return;
    }
    
    res.json(field);
  } catch (err) {
    next(err);
  }
}

const createMeasurementFieldSchema = z.object({
  fieldName: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
  unit: z.string().max(20).optional(),
  displayOrder: z.number().int().optional(),
});

export async function createMeasurementField(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createMeasurementFieldSchema.parse(req.body);
    const field = await categoryService.createMeasurementField(data);
    res.status(201).json(field);
  } catch (err) {
    next(err);
  }
}

const updateMeasurementFieldSchema = z.object({
  fieldName: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(100).optional(),
  unit: z.string().max(20).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function updateMeasurementField(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const data = updateMeasurementFieldSchema.parse(req.body);
    const field = await categoryService.updateMeasurementField(id, data);
    
    if (!field) {
      res.status(404).json({ error: "Measurement field not found" });
      return;
    }
    
    res.json(field);
  } catch (err) {
    next(err);
  }
}

export async function deleteMeasurementField(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await categoryService.deleteMeasurementField(id);
    
    if (!success) {
      res.status(404).json({ error: "Measurement field not found" });
      return;
    }
    
    res.json({ message: "Measurement field deleted successfully" });
  } catch (err) {
    next(err);
  }
}
