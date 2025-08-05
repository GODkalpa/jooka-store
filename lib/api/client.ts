// API client utilities for authenticated requests
import { getAuth } from 'firebase/auth';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get the current user's auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Make authenticated API request
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request error:', error);
    throw new ApiError('Network error', 0);
  }
}

// Convenience methods
export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),
    
  post: <T = any>(url: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T = any>(url: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T = any>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};