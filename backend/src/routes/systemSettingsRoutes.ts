import { Router } from "express";
import { getAllSystemSettings, getSystemSetting, updateSystemSetting } from "../services/systemSettingsService.js";
import { logger } from "../utils/logger.js";

export const systemSettingsRouter = Router();

// Get all settings
systemSettingsRouter.get("/", async (req, res, next) => {
  try {
    const settings = await getAllSystemSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Get single setting
systemSettingsRouter.get("/:key", async (req, res, next) => {
  try {
    const setting = await getSystemSetting(req.params.key);
    if (!setting) {
      res.status(404).json({ error: "Setting not found" });
      return;
    }
    res.json(setting);
  } catch (error) {
    next(error);
  }
});

// Update setting
systemSettingsRouter.put("/:key", async (req, res, next) => {
  try {
    const { value, description } = req.body;
    if (value === undefined) {
      res.status(400).json({ error: "Value is required" });
      return;
    }

    const updated = await updateSystemSetting(req.params.key, { value, description });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});
