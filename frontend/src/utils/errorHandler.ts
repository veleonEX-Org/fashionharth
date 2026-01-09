import type { AxiosError } from "axios";

/**
 * Backend error response structure.
 */
interface BackendErrorResponse {
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
  error?: string;
}

/**
 * Extracts a readable error message from an axios error.
 * Handles validation errors, network errors, and generic API errors.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "An unexpected error occurred.";
  }

  // Handle axios errors
  if (typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    // Network error (no response from server)
    if (!axiosError.response) {
      if (axiosError.code === "ECONNABORTED") {
        return "Request timed out. Please try again.";
      }
      if (axiosError.message.includes("Network Error")) {
        return "Network error. Please check your connection.";
      }
      return "Unable to connect to the server. Please try again later.";
    }

    const { status, data } = axiosError.response;

    // Handle validation errors (400 with errors array)
    if (status === 400 && data?.errors && Array.isArray(data.errors)) {
      const firstError = data.errors[0];
      if (firstError.field) {
        return `${firstError.field}: ${firstError.message}`;
      }
      return firstError.message;
    }

    // Handle error message from backend
    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    // Handle HTTP status codes
    switch (status) {
      case 401:
        return "Unauthorized. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 409:
        return "A conflict occurred. Please try again.";
      case 422:
        return "Invalid data provided. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return `Error ${status}: ${data?.message || "An error occurred"}`;
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}

/**
 * Extracts validation errors from an axios error response.
 * Returns an object with field names as keys and error messages as values.
 */
export function getValidationErrors(
  error: unknown
): Record<string, string> | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error
  ) {
    const axiosError = error as AxiosError<BackendErrorResponse>;
    const data = axiosError.response?.data;

    if (data?.errors && Array.isArray(data.errors)) {
      const errors: Record<string, string> = {};
      data.errors.forEach((err) => {
        if (err.field) {
          errors[err.field] = err.message;
        }
      });
      return Object.keys(errors).length > 0 ? errors : null;
    }
  }

  return null;
}




