import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

export const taskRouter = Router();

taskRouter.use(authenticate);

// Admin can do everything, Staff can see their tasks and mark as complete
taskRouter.get("/", getTasks);
taskRouter.post("/", authorize(["admin"]), createTask);
taskRouter.put("/:id", updateTask); // Staff might need to mark as complete
taskRouter.delete("/:id", authorize(["admin"]), deleteTask);
