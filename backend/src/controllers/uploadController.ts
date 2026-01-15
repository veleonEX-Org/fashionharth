import { Request, Response, NextFunction } from "express";
import { uploadImage as uploadToStorage } from "../services/storageService.js";
import { logger } from "../utils/logger.js";

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const folder = (req.body.folder as string) || "fashion";
    const imageUrl = await uploadToStorage(req.file.buffer, folder, undefined, req.file.mimetype);

    res.json({ imageUrl });
  } catch (error) {
    logger.error("Error in uploadImage controller:", error);
    next(error);
  }
}
