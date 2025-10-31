import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

/**
 * API CLIENT
 *
 * Axios instance configured for Marketing Engine API.
 * Base URL points to backend on port 3001.
 * Includes auth headers, error handling, and request/response interceptors.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

/**
 * CENTRALIZED ERROR HANDLING
 */
export const handleApiError = (error: AxiosError) => {
  if (!error.response) {
    toast.error('NETWORK ERROR', {
      description: 'Unable to connect to server. Please check your connection.',
    });
    return;
  }

  const status = error.response.status;
  const message = (error.response.data as any)?.message || error.message;

  switch (status) {
    case 401:
      toast.error('AUTHENTICATION FAILED', {
        description: 'Session expired. Please log in again.',
      });
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      break;

    case 403:
      toast.error('ACCESS DENIED', {
        description: 'Insufficient permissions for this operation.',
      });
      break;

    case 404:
      toast.error('NOT FOUND', {
        description: message || 'The requested resource was not found.',
      });
      break;

    case 429:
      toast.error('RATE LIMIT EXCEEDED', {
        description: 'Too many requests. Please try again later.',
      });
      break;

    case 500:
    case 502:
    case 503:
      toast.error('SERVER ERROR', {
        description: 'An internal server error occurred. Please try again.',
      });
      break;

    default:
      toast.error('OPERATION FAILED', {
        description: message || 'An unexpected error occurred.',
      });
  }
};

/**
 * API RESPONSE TYPES
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default apiClient;
