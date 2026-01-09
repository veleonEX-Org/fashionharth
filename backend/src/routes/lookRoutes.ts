import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  toggleFavorite,
  getFavorites,
  saveLook,
  getSavedLooks,
} from "../controllers/lookController.js";

export const lookRouter = Router();

lookRouter.use(authenticate);

lookRouter.post("/favorites", toggleFavorite);
lookRouter.get("/favorites", getFavorites);
lookRouter.post("/saved", saveLook);
lookRouter.get("/saved", getSavedLooks);
