import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
} from "../controllers/userController.js";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize(["admin"]));

userRouter.get("/", getAllUsers);
userRouter.put("/:id/role", updateUserRole);
