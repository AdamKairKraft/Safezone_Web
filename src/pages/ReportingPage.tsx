import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { listReportsBySite } from "@/api/reports";
import { listUsersByOrganization } from "@/api/users";
import { listReportTypes } from "@/api/industryModules";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Tabs, SubTabs } from "@/components/Tabs";
import { formatDate, humanize, reportSummary } from "@/lib/format";
import { REPORT_STATUS_VARIANT } from "@/lib/statusPills";
import type { ReportStatus } from "@/types/api";

function typeBadge(code: string): string {
  return code
    .split("_")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ReportingPage() {
  const { user, siteId } = useSession();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");

  const reportsQuery = useQuery({
    queryKey: ["reports", siteId],
    queryFn: () => listReportsBySite(siteId!),
    enabled: !!siteId,
  });
  const usersQuery = useQuery({
    queryKey: ["users", user?.organizationId],
    queryFn: () => listUsersByOrganization(user!.organizationId),
    enabled: !!user,
  });

  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const usersById = new Map((usersQuery.data ?? []).map((u) => [u.id, u.fullName]));

  const moduleCode = reports[0]?.industryModuleCode ?? null;
  const reportTypesQuery = useQuery({
    queryKey: ["report-types", moduleCode],
    queryFn: () => listReportTypes(moduleCode!),
    enabled: !!moduleCode,
  });
  const reportTypes = reportTypesQuery.data ?? [];

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) => (typeFilter === "ALL" || r.reportTypeCode === typeFilter) && (statusFilter === "ALL" || r.status === statusFilter),
      ),
    [reports, typeFilter, statusFilter],
  );

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[19px] font-semibold">Reporting</h2>
        <Link to="/reports/new">
          <Button>+ New report</Button>
        </Link>
      </div>

      <Tabs
        options={[{ value: "ALL", label: "All" }, ...reportTypes.map((rt) => ({ value: rt.code, label: rt.name }))]}
        value={typeFilter}
        onChange={setTypeFilter}
      />
      <SubTabs
        options={[
          { value: "ALL", label: "All" },
          { value: "DRAFT", label: "Draft" },
          { value: "SUBMITTED", label: "Submitted" },
          { value: "UNDER_REVIEW", label: "Under Review" },
          { value: "CLOSED", label: "Closed" },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-left text-[10.5px] font-semibold tracking-wide text-sub">
              <th className="w-9 pb-2"></th>
              <th className="pb-2">Title / Reference</th>
              <th className="pb-2">Submitted by</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sub">
                  No reports match these filters.
                </td>
              </tr>
            )}
            {filtered.map((report) => (
              <tr key={report.id} className="border-b border-grey-bg last:border-none">
                <td className="py-2.5">
                  <span className="flex h-5 w-6.5 items-center justify-center rounded bg-grey-bg text-[10px] font-bold text-slate-600">
                    {typeBadge(report.reportTypeCode)}
                  </span>
                </td>
                <td className="py-2.5">
                  <Link to={`/reports/${report.id}/edit`} className="font-semibold hover:underline">
                    {reportSummary(report.reportTypeCode, report.data)}
                  </Link>
                  <div className="text-[10.5px] text-sub">{humanize(report.reportTypeCode)}</div>
                </td>
                <td className="py-2.5">{report.submittedBy ? (usersById.get(report.submittedBy) ?? "—") : "—"}</td>
                <td className="py-2.5">{formatDate(report.serverReceivedAt)}</td>
                <td className="py-2.5">
                  <Pill variant={REPORT_STATUS_VARIANT[report.status]}>{humanize(report.status)}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
