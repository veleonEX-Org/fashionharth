import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getMyTransactions,
  getMyTasks,
} from "../controllers/userController.js";

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me/transactions", getMyTransactions);
userRouter.get("/me/tasks", getMyTasks);

userRouter.use(authorize(["admin", "staff"]));

userRouter.get("/", getAllUsers);
userRouter.put("/:id/role", updateUserRole);
userRouter.put("/:id/status", updateUserStatus);
