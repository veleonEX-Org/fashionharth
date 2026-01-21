
import type { Request, Response } from "express";
import * as adService from "../services/adService.js";
import { logger } from "../utils/logger.js";

export async function createAd(req: Request, res: Response) {
  try {
    const ad = await adService.createAd(req.body);
    res.status(201).json(ad);
  } catch (error: any) {
    logger.error("Error creating ad:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function getAds(req: Request, res: Response) {
  try {
    const isAdmin = req.user?.role === "admin";
    const ads = await adService.getAds(isAdmin);
    res.json(ads);
  } catch (error: any) {
    logger.error("Error fetching ads:", error);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
}

export async function updateAd(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const ad = await adService.updateAd(id, req.body);
    res.json(ad);
  } catch (error: any) {
    logger.error("Error updating ad:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteAd(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    await adService.deleteAd(id);
    res.status(204).send();
  } catch (error: any) {
    logger.error("Error deleting ad:", error);
    res.status(400).json({ error: error.message });
  }
}
