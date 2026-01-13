import jwt from "jsonwebtoken";
import { env } from "../config/env";
export function signAccessToken(userId, role) {
    const payload = { sub: userId, role, type: "access" };
    return jwt.sign(payload, env.jwt.accessSecret, {
        expiresIn: env.jwt.accessExpiresIn,
    });
}
export function signRefreshToken(userId, role) {
    const payload = { sub: userId, role, type: "refresh" };
    return jwt.sign(payload, env.jwt.refreshSecret, {
        expiresIn: env.jwt.refreshExpiresIn,
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.jwt.accessSecret);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.jwt.refreshSecret);
}
