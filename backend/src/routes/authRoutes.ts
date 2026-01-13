import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  refresh,
  register,
  resetPasswordController,
  verifyEmailController,
  logout,
  oauthGoogle,
  updateProfileController,
  resendVerificationEmailController,
  changePasswordController,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);
authRouter.put("/me", authenticate, updateProfileController);
authRouter.post("/refresh", refresh);
authRouter.post("/verify-email", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationEmailController);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPasswordController);
authRouter.post("/logout", authenticate, logout);
authRouter.post("/change-password", authenticate, changePasswordController);
authRouter.post("/oauth/google", oauthGoogle);

