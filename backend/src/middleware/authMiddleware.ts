import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { JwtPayload, UserRole } from "../types/auth.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: UserRole;
    };
  }
}

// Validates JWT access token and attaches user info to the request object.
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn(`[AUTH] Missing Authorization header for ${req.method} ${req.url}`);
  } else if (!authHeader.startsWith("Bearer ")) {
    console.warn(`[AUTH] Invalid Authorization header format for ${req.method} ${req.url}: ${authHeader.substring(0, 15)}...`);
  }

  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Missing or invalid authorization header." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token) as JwtPayload;
    if (payload.type !== "access") {
      res.status(401).json({ message: "Invalid token type." });
      return;
    }
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err: any) {
    console.error(`[AUTH] Token verification failed for ${req.method} ${req.url}:`, err.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Authorizes the request based on the user's role.
export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
      return;
    }

    next();
  };
}




