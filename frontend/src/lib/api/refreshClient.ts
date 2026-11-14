import axios from 'axios';

// Dedicated isolated client for token refresh — has no interceptors to prevent infinite loops
export const refreshClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Sends the HttpOnly refreshToken cookie
  timeout: 10000,
});
