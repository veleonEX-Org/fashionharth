import { rateLimit } from "express-rate-limit";
import { logger } from "../utils/logger.js";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // Set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 100, // Limit each IP to 100 login/register attempts per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts, please try again after an hour",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
});
