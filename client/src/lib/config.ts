// Environment configuration for API endpoint
// Uses VITE_API_URL from environment variables if available
// Falls back to relative path for development

declare const __DEV__: boolean;

export const getApiBaseUrl = (): string => {
  // In production on Netlify, this will be set to the Railway backend URL
  const apiUrl = (import.meta as any).env?.VITE_API_URL;
  if (apiUrl) {
    return apiUrl;
  }
  
  // Default to relative path (works in dev with Vite proxy, in prod with API proxy)
  return '/api';
};

export const API_BASE = getApiBaseUrl();
