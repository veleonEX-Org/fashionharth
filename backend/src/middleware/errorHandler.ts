import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

// Backend error response structure.
interface ErrorResponse {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

// Centralized error handler to avoid leaking stack traces in production.
// Call next(err) from controllers/services to hit this middleware.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error("Error handler caught:", err);

  if (res.headersSent) {
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    const response: ErrorResponse = {
      message: "Validation failed. Please check your input.",
      errors,
    };

    res.status(400).json(response);
    return;
  }

  // Handle custom errors with statusCode
  const error = err as any;
  const status = error.statusCode ?? 500;
  const message = error.message ?? "Internal server error.";

  // For 400 errors, check if there are validation errors
  if (status === 400 && error.errors && Array.isArray(error.errors)) {
    const response: ErrorResponse = {
      message,
      errors: error.errors,
    };
    res.status(status).json(response);
    return;
  }

  // Standard error response
  const response: ErrorResponse = {
    message:
      status === 500 && process.env.NODE_ENV === "production"
        ? "An internal server error occurred. Please try again later."
        : message,
  };

  res.status(status).json(response);
}

