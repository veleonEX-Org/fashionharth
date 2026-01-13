import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/userController.js";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize(["admin", "staff"]));

userRouter.get("/", getAllUsers);
userRouter.put("/:id/role", updateUserRole);
userRouter.put("/:id/status", updateUserStatus);
