import { apiClient } from "./client";
import type { RoleRequiredReportResponse, RoleResponsibilityResponse, RoleType } from "@/types/api";

export async function listRolesForModule(industryModuleCode: string): Promise<RoleType[]> {
  const { data } = await apiClient.get<RoleType[]>(`/api/industry-modules/${industryModuleCode}/roles`);
  return data;
}

export async function listResponsibilities(
  industryModuleCode: string,
  role: RoleType,
): Promise<RoleResponsibilityResponse[]> {
  const { data } = await apiClient.get<RoleResponsibilityResponse[]>(
    `/api/industry-modules/${industryModuleCode}/roles/${role}/responsibilities`,
  );
  return data;
}

export async function listRequiredReports(
  industryModuleCode: string,
  role: RoleType,
): Promise<RoleRequiredReportResponse[]> {
  const { data } = await apiClient.get<RoleRequiredReportResponse[]>(
    `/api/industry-modules/${industryModuleCode}/roles/${role}/required-reports`,
  );
  return data;
}
