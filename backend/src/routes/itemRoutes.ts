import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createItemController,
  getItemsController,
  getItemByIdController,
  updateItemController,
  deleteItemController,
  getPublicItemsController,
} from "../controllers/itemController.js";

export const itemRouter = Router();

// Public routes
itemRouter.get("/public", getPublicItemsController);

// All other item routes require authentication
itemRouter.use(authenticate);

itemRouter.post("/", createItemController);
itemRouter.get("/", getItemsController);
itemRouter.get("/:id", getItemByIdController);
itemRouter.put("/:id", updateItemController);
itemRouter.delete("/:id", deleteItemController);




