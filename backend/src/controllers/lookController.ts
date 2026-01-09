import { Request, Response, NextFunction } from "express";
import * as lookService from "../services/lookService.js";

export async function toggleFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { itemId, action } = req.body; // action: 'add' or 'remove'
    
    if (action === 'remove') {
      await lookService.removeFavorite(userId, itemId);
    } else {
      await lookService.addFavorite(userId, itemId);
    }
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function getFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const favorites = await lookService.getFavorites(req.user!.id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

export async function saveLook(req: Request, res: Response, next: NextFunction) {
  try {
    const look = await lookService.saveLook(req.user!.id, req.body);
    res.status(201).json(look);
  } catch (err) {
    next(err);
  }
}

export async function getSavedLooks(req: Request, res: Response, next: NextFunction) {
  try {
    const looks = await lookService.getSavedLooks(req.user!.id);
    res.json(looks);
  } catch (err) {
    next(err);
  }
}
