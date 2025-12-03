/**
 * API Configuration
 * 
 * Uses environment variable VITE_API_BASE_URL if set,
 * otherwise defaults to localhost:3000 for local API development
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

// Auth token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("auth_token");
  }
  return authToken;
}

// Callback for auth expiration - set by auth-context
let onAuthExpired: (() => void) | null = null;

export function setAuthExpiredCallback(callback: () => void) {
  onAuthExpired = callback;
}

// Helper function for API calls
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      credentials: "include",
      ...options,
    });
  } catch (error) {
    // Network error - throw a user-friendly message
    throw new Error("Network error. Please check your connection and try again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      // Clear auth token
      setAuthToken(null);
      // Trigger auth expiration callback
      if (onAuthExpired) {
        onAuthExpired();
      }
      throw new Error("Your session has expired. Please log in again.");
    }
    
    throw new Error(errorData.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

