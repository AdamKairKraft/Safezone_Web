import { apiClient } from "./client";
import type { UserResponse } from "@/types/api";

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>("/api/users/me");
  return data;
}

export async function getUser(id: string): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`/api/users/${id}`);
  return data;
}

export async function listUsersByOrganization(organizationId: string): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>("/api/users", { params: { organizationId } });
  return data;
}
