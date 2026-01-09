import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload, UserRole } from "../types/auth";

export function signAccessToken(userId: number, role: UserRole): string {
  const payload: JwtPayload = { sub: userId, role, type: "access" };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

export function signRefreshToken(userId: number, role: UserRole): string {
  const payload: JwtPayload = { sub: userId, role, type: "refresh" };
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}




