import axios from "axios";
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
    console.log(`[HTTP] Attaching token to ${config.url}`);
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  } else {
    console.warn(`[HTTP] No token found for ${config.url}`);
  }
  return config;
});

// Handle automatic refresh on 401 responses.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
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
