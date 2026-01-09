import type { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/adminService.js";

// Fetches real administrative statistics for the dashboard.
export async function getAdminStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}




