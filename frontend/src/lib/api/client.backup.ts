/**
 * API Client Configuration
 * Enhanced Axios instance with authentication, error handling, and request/response logging
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios'
import authService from './auth'

const isDev = process.env.NODE_ENV === 'development'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// Type guards
type ErrorWithMessage = { message: string };
type ErrorWithResponse = { response?: { data?: any } };

const isErrorWithMessage = (e: unknown): e is ErrorWithMessage => 
  e !== null && typeof e === 'object' && 'message' in e;

const isAxiosError = (e: unknown): e is AxiosError => 
  e !== null && typeof e === 'object' && 'isAxiosError' in e && e.isAxiosError === true;

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies if using httpOnly tokens
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Safely get token from localStorage
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
    
    // Add authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (isDev) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error: unknown) => {
    let errorMessage = 'An unknown error occurred';
    
    if (isErrorWithMessage(error)) {
      errorMessage = error.message;
    } else if (isAxiosError(error)) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (isDev) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    return response
  },
  async (error: unknown) => {
    // If not in development, just reject with the error
    if (!isDev) return Promise.reject(error);
    
    // Safely extract error information
    const errorInfo = {
      status: undefined as number | undefined,
      url: undefined as string | undefined,
      message: 'An unknown error occurred',
      response: undefined as any
    };

        // Type guard to check if error is an object with a message property
    const isErrorObject = (e: unknown): e is { message: string } => {
      return e !== null && typeof e === 'object' && 'message' in e;
    };

    // Type guard to check if error is AxiosError
    const isAxiosError = (e: unknown): e is AxiosError<unknown> => {
      return e !== null && 
             typeof e === 'object' && 
             'isAxiosError' in e && 
             e.isAxiosError === true;
    };
    
    // Type guard to check if config has _retry property
    const hasRetry = (config: unknown): config is { _retry?: boolean } => {
      return config !== null && typeof config === 'object';
    };

    // Handle different types of errors
    if (isAxiosError(error)) {
      // Handle Axios errors
      errorInfo.status = error.response?.status;
      errorInfo.url = error.config?.url || '';
      errorInfo.message = error.message || 'Unknown Axios error';
      errorInfo.response = error.response?.data;

      // Log the error
      console.error('API Error:', errorInfo);

      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout. Please check your internet connection.');
        return Promise.reject(new Error('Request timeout. Please check your internet connection.'));
      }

      // Handle no response from server
      if (!error.response) {
        console.error('No response from server. Please try again later.');
        return Promise.reject(new Error('No response from server. Please try again later.'));
      }

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        const originalRequest = error.config || {} as InternalAxiosRequestConfig;
        
        // Skip token refresh for login/signup endpoints to avoid infinite loops
        if (originalRequest.url?.includes('/auth/')) {
          return Promise.reject(error);
        }
      
        // If we've already tried to refresh the token, log out
        if (hasRetry(originalRequest) && originalRequest._retry) {
        // Clear auth data and trigger logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.startsWith('/login')) {
            window.dispatchEvent(new Event('auth:logout'));
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?returnUrl=${returnUrl}`;
          }
        }
        return Promise.reject(error);
      }
      
      // Mark that we're attempting to refresh the token
      if (hasRetry(originalRequest)) {
        originalRequest._retry = true;
      }
      
      try {
        // Try to refresh the token
        const response = await authService.refreshToken();
        if (!response || !response.data || !response.data.access_token) {
          throw new Error('Failed to refresh token: Invalid response from server');
        }
        const { access_token } = response.data;
        
        // Store the new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
        }
        
        // Update the Authorization header
        const updatedRequest = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${access_token}`
          },
          _retry: true
        };
        
        // Retry the original request
        return apiClient(updatedRequest);
      } catch (refreshError) {
        // If refresh token fails, log out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.startsWith('/login')) {
            window.dispatchEvent(new Event('auth:logout'));
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For non-401 errors, return a structured error object
    if (isAxiosError(error)) {
      return Promise.reject({
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // For non-Axios errors, return a generic error
    return Promise.reject(new Error('An unexpected error occurred'));
  }
)

export default apiClient
