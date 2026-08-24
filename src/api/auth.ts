import { apiClient } from "./client";
import type { AuthResponse } from "@/types/api";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", { email, password });
  return data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/refresh", { refreshToken });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post("/api/auth/logout", { refreshToken });
}
