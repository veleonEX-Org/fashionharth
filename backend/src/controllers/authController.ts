import type { Request, Response, NextFunction } from "express";
import {
  getUserById,
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  updateUserProfile,
  resendVerificationEmail,
  changePassword,
} from "../services/authService.js";
import { loginWithGoogle } from "../services/oauthService.js";
import { env } from "../config/env.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const verificationToken = await registerUser(req.body);
    const verificationLink = `${env.appUrl}/verify-email?token=${verificationToken}`;
    res
      .status(201)
      .json({ 
        message: "Registration successful. Please verify your email.",
        verificationLink 
      });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);
    res.json({ user, tokens: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const user = await getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required." });
      return;
    }
    const tokens = await refreshTokens(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      res.status(400).json({ message: "Verification token is required." });
      return;
    }
    await verifyEmail(token);
    res.json({ message: "Email verified successfully." });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ message: "Email is required." });
      return;
    }
    await requestPasswordReset(email);
    res.json({
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resetPassword(req.body);
    res.json({ message: "Password reset successfully." });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user) {
      await logoutUser(req.user.id);
    }
    res.json({ message: "Logged out." });
  } catch (err) {
    next(err);
  }
}

export async function oauthGoogle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await loginWithGoogle(req.body);
    res.json({ user, tokens: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const updated = await updateUserProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function resendVerificationEmailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ message: "Email is required." });
      return;
    }
    const verificationToken = await resendVerificationEmail(email);
    const verificationLink = `${env.appUrl}/verify-email?token=${verificationToken}`;
    res.json({
      message: "Verification email has been resent. Please check your inbox.",
      verificationLink
    });
  } catch (err) {
    next(err);
  }
}



export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    await changePassword(req.user.id, req.body);
    res.json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}
