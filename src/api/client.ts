import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/authStore";
import type { AuthResponse } from "@/types/api";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Concurrent requests that all 401 at once share a single in-flight refresh instead of
// each independently spending (and rotating) a refresh token.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });
    useAuthStore.getState().setSession(data);
    return data.accessToken;
  } catch {
    useAuthStore.getState().clear();
    return null;
  }
}

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = originalRequest?.url?.startsWith("/api/auth/");
    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
