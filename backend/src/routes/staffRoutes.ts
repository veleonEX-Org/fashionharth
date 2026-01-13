import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getTasks } from "../services/taskService.js";

export const staffRouter = Router();

staffRouter.get(
  "/overview",
  authenticate,
  requireRole(["staff", "admin"]),
  async (req, res, next) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      // Count tasks assigned to this user that are not completed
      const ongoingTasks = await getTasks(req.user.id, "ongoing");
      const allTasks = await getTasks(req.user.id);
      
      res.json({
        totalAssignments: allTasks.length,
        ongoingAssignments: ongoingTasks.length,
        message: "Staff overview data loaded."
      });
    } catch (error) {
       next(error);
    }
  }
);






