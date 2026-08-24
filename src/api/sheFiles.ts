import { apiClient } from "./client";
import type { RegisterSheFileRequest, SheFileResponse } from "@/types/api";

export async function listSheFilesByOrganization(organizationId: string): Promise<SheFileResponse[]> {
  const { data } = await apiClient.get<SheFileResponse[]>("/api/she-files", { params: { organizationId } });
  return data;
}

export async function registerSheFile(id: string, request: RegisterSheFileRequest): Promise<SheFileResponse> {
  const { data } = await apiClient.post<SheFileResponse>("/api/she-files", { id, ...request });
  return data;
}
