import type { Request, Response, NextFunction } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getPublicItems,
} from "../services/itemService.js";

export async function createItemController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const item = await createItem(req.user.id, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function getItemsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await getItems(
      req.user.id,
      page,
      limit,
      status,
      search
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getItemByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid item ID." });
      return;
    }
    const item = await getItemById(id);
    if (!item) {
      res.status(404).json({ message: "Item not found." });
      return;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateItemController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid item ID." });
      return;
    }
    const item = await updateItem(id, req.user.id, req.user.role, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteItemController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid item ID." });
      return;
    }
    await deleteItem(id, req.user.id, req.user.role);
    res.json({ message: "Item deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function getPublicItemsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;
    const minPrice = req.query.minPrice
      ? parseFloat(req.query.minPrice as string)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? parseFloat(req.query.maxPrice as string)
      : undefined;
    const isTrending = req.query.isTrending === "true" ? true : undefined;
    const search = req.query.search as string | undefined;

    const result = await getPublicItems(
      page,
      limit,
      category,
      minPrice,
      maxPrice,
      isTrending,
      search
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}




