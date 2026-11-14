import axios, { type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '../../auth/tokenStore';
import { refreshClient } from './refreshClient';

export const client = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15000,
});

// Attach in-memory access token to every outgoing request
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh token queue to prevent race conditions on parallel expired calls
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;
        tokenStore.set(newAccessToken);

        refreshQueue.forEach((item) => item.resolve(newAccessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshErr) {
        refreshQueue.forEach((item) => item.reject(refreshErr));
        refreshQueue = [];
        tokenStore.clear();
        // Redirect to login on failed refresh session
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
