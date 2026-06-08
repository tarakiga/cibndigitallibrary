/**
 * API Client Configuration
 * Enhanced Axios instance with authentication, error handling, and request/response logging
 */

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import authService from "./auth";

const isDev = process.env.NODE_ENV === "development";
const ENV_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

const resolveApiBaseUrl = (): string => {
  // Prefer the build-time env var in all environments.
  if (ENV_API_BASE_URL) return ENV_API_BASE_URL;

  // In the browser, fall back to the current origin (works behind a proxy).
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }

  // Server-side with no env var: only fall back to localhost in development.
  // In production the env var is required — never hardcode a URL into a
  // prod-critical path.
  if (isDev) {
    return "http://localhost:8000/api/v1";
  }

  throw new Error(
    "NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_BASE_URL) must be set in production."
  );
};

const API_BASE_URL = resolveApiBaseUrl();

const navigateTo = (url: string) => {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "test") return;
  if (typeof window.location?.assign === "function") {
    window.location.assign(url);
  } else {
    window.location.href = url;
  }
};

// Type guards
type ErrorWithMessage = { message: string };

const isErrorWithMessage = (e: unknown): e is ErrorWithMessage =>
  e !== null && typeof e === "object" && "message" in e;

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies if using httpOnly tokens
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Safely get token from localStorage
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try {
        token = localStorage.getItem("access_token");
      } catch {
        // localStorage unavailable (e.g. SSR, private browsing)
      }
    }

    // Add authorization header if token exists
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (isDev) {
      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: unknown) => {
    let errorMessage = "An unknown error occurred";

    if (isErrorWithMessage(error)) {
      errorMessage = error.message;
    } else if (axios.isAxiosError(error)) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (isDev) {
      console.log("API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error: unknown) => {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const { response, config } = error;

      // Handle 401 Unauthorized (token expired)
      if (response?.status === 401 && config && typeof window !== "undefined") {
        const originalRequest = config as RetryConfig;

        // Skip token refresh for auth endpoints. Critically, /auth/refresh must be
        // excluded — refreshing on a 401 from refresh itself causes an infinite loop
        // (e.g. when a stored token is invalid after a SECRET_KEY rotation).
        const url = config.url || '';
        if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/cibn-login') || url.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        // Skip token refresh if no token is stored
        const currentToken = localStorage.getItem("access_token");
        if (!currentToken) {
          return Promise.reject(error);
        }

        // Skip token refresh for test/demo tokens
        if (currentToken.startsWith('test-token') || currentToken.startsWith('demo-')) {
          console.log('Skipping token refresh for test/demo token');
          return Promise.reject(error);
        }

        // If we've already tried to refresh the token, log out
        if (originalRequest._retry) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          // Only redirect if not already on login page
          window.dispatchEvent(new Event("auth:logout"));
          navigateTo("/");
          return Promise.reject(error);
        }

        // Mark that we're attempting to refresh the token
        (originalRequest as any)._retry = true;

        try {
          // Try to refresh the token
          const access_token = await authService.refreshToken();

          if (!access_token) {
            throw new Error(
              "Failed to refresh token: No access token received"
            );
          }

          // The token is already stored by authService.refreshToken()

          // Update the Authorization header
          const updatedRequest = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${access_token}`,
            },
          };

          // Retry the original request
          return apiClient(updatedRequest);
        } catch (refreshError) {
          // If refresh token fails, log out
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          window.dispatchEvent(new Event("auth:logout"));
          navigateTo("/");
          return Promise.reject(refreshError);
        }
      }

      // For non-401 errors, return a structured error object
      return Promise.reject({
        status: response?.status,
        message: error.message,
        data: response?.data,
      });
    }

    // For non-Axios errors, return a generic error
    return Promise.reject(
      isErrorWithMessage(error)
        ? error
        : new Error("An unexpected error occurred")
    );
  }
);

export default apiClient;
