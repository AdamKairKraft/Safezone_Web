import { apiClient } from "./client";
import type { IndustryModuleResponse, ReportTypeDefinitionResponse } from "@/types/api";

export async function listIndustryModules(): Promise<IndustryModuleResponse[]> {
  const { data } = await apiClient.get<IndustryModuleResponse[]>("/api/industry-modules");
  return data;
}

export async function listReportTypes(industryModuleCode: string): Promise<ReportTypeDefinitionResponse[]> {
  const { data } = await apiClient.get<ReportTypeDefinitionResponse[]>(
    `/api/industry-modules/${industryModuleCode}/report-types`,
  );
  return data;
}
