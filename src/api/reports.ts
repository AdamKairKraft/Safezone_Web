import { apiClient, newIdempotencyKey } from "./client";
import type { ReportResponse, UpsertReportRequest } from "@/types/api";

export async function listReportsBySite(siteId: string): Promise<ReportResponse[]> {
  const { data } = await apiClient.get<ReportResponse[]>("/api/reports", { params: { siteId } });
  return data;
}

export async function getReport(id: string): Promise<ReportResponse> {
  const { data } = await apiClient.get<ReportResponse>(`/api/reports/${id}`);
  return data;
}

/** PUT is naturally idempotent (client-generated id), so no Idempotency-Key is needed here. */
export async function saveDraft(id: string, request: UpsertReportRequest): Promise<ReportResponse> {
  const { data } = await apiClient.put<ReportResponse>(`/api/reports/${id}`, request);
  return data;
}

export async function submitReport(id: string): Promise<ReportResponse> {
  const { data } = await apiClient.post<ReportResponse>(
    `/api/reports/${id}/submit`,
    {},
    { headers: { "Idempotency-Key": newIdempotencyKey() } },
  );
  return data;
}
