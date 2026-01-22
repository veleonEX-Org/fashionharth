import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayload, UserRole } from "../types/auth.js";

export function signAccessToken(userId: number, role: UserRole): string {
  const payload: JwtPayload = { sub: userId, role, type: "access" };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as any,
  });
}

export function signRefreshToken(userId: number, role: UserRole): string {
  const payload: JwtPayload = { sub: userId, role, type: "refresh" };
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as any,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as unknown as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as unknown as JwtPayload;
}




