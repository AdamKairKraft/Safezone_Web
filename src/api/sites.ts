import { apiClient } from "./client";
import type { SiteResponse } from "@/types/api";

export async function listSitesByOrganization(organizationId: string): Promise<SiteResponse[]> {
  const { data } = await apiClient.get<SiteResponse[]>("/api/sites", { params: { organizationId } });
  return data;
}
