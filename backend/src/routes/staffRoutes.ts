import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

export const staffRouter = Router();

staffRouter.get(
  "/overview",
  authenticate,
  requireRole(["staff", "admin"]),
  (_req, res) => {
    // Replace this with real staff metrics or operational data.
    res.json({
      assignedTickets: 0,
      pendingTasks: 0,
      message: "Staff overview placeholder."
    });
  }
);






