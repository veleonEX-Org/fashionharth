import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/auth.js";

// Ensures the authenticated user has at least one of the allowed roles.
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({ message: "You are not allowed to access this resource." });
      return;
    }

    next();
  };
}




