import axios from 'axios';

const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Dedicated isolated client for token refresh — has no interceptors to prevent infinite loops
export const refreshClient = axios.create({
  baseURL: `${apiBase}/api/v1`,
  withCredentials: true, // Sends the HttpOnly refreshToken cookie
  timeout: 10000,
});
