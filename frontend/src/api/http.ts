import axios from "axios";
import toast from "react-hot-toast";
import type { AuthTokens } from "../types/auth";
import {
  getStoredTokens,
  storeTokens,
  clearStoredTokens,
} from "../utils/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Axios instance used across the app for API calls.
export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach access token if present.
http.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  
  // Custom property to track if toast was shown
  (config as any)._startTime = Date.now();
  (config as any)._timeoutId = setTimeout(() => {
    toast("Waking up our fashion engine... Just a moment! 👗", {
      icon: "⌛",
      duration: 10000,
      id: "server-wake-up" // Use fixed ID to avoid multiple toasts
    });
  }, 3000); // Show after 3 seconds of waiting

  return config;
});

// Clear timeout on response
http.interceptors.response.use(
  (response) => {
    const timeoutId = (response.config as any)._timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
      toast.dismiss("server-wake-up");
    }
    return response;
  },
  async (error) => {
    const timeoutId = (error.config as any)._timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
      toast.dismiss("server-wake-up");
    }
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens: AuthTokens | null = getStoredTokens();
        if (!tokens?.refreshToken) {
          clearStoredTokens();
          return Promise.reject(error);
        }

        const res = await axios.post<AuthTokens>("/api/auth/refresh", {
          refreshToken: tokens.refreshToken,
        });

        storeTokens(res.data);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        }

        return http(originalRequest);
      } catch (refreshErr) {
        clearStoredTokens();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
