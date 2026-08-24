import { apiClient } from "./client";
import type { ComplianceStatusResponse } from "@/types/api";

export async function listComplianceStatus(siteId: string): Promise<ComplianceStatusResponse[]> {
  const { data } = await apiClient.get<ComplianceStatusResponse[]>("/api/compliance/status", { params: { siteId } });
  return data;
}
