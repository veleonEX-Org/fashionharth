import { Router } from "express";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

export const keepAliveRouter = Router();

// Keep-alive endpoint
keepAliveRouter.get("/", async (req, res, next) => {
  try {
    // Simple update to show activity
    await pool.query(`
      INSERT INTO fashionheart (id, status, updated_at) 
      VALUES (1, 1, NOW()) 
      ON CONFLICT (id) DO UPDATE SET status = 1, updated_at = NOW();
    `);
    
    // Return a simple success message
    res.json({ status: "alive", message: "Keep-alive updated successfully" });
  } catch (error) {
    logger.error("Keep-alive endpoint failed", error);
    next(error);
  }
});
