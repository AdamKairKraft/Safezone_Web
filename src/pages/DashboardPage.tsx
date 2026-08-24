import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { listReportsBySite } from "@/api/reports";
import { listComplianceStatus } from "@/api/compliance";
import { listSheFilesByOrganization } from "@/api/sheFiles";
import { StatCard, Panel } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { formatDate, humanize, reportSummary } from "@/lib/format";
import { COMPLIANCE_STATE_LABEL, COMPLIANCE_STATE_VARIANT, REPORT_STATUS_VARIANT, SHE_FILE_STATUS_VARIANT } from "@/lib/statusPills";

export function DashboardPage() {
  const { user, siteId } = useSession();

  const reportsQuery = useQuery({
    queryKey: ["reports", siteId],
    queryFn: () => listReportsBySite(siteId!),
    enabled: !!siteId,
  });
  const complianceQuery = useQuery({
    queryKey: ["compliance", siteId],
    queryFn: () => listComplianceStatus(siteId!),
    enabled: !!siteId,
  });
  const sheFilesQuery = useQuery({
    queryKey: ["she-files", user?.organizationId],
    queryFn: () => listSheFilesByOrganization(user!.organizationId),
    enabled: !!user,
  });

  const reports = reportsQuery.data ?? [];
  const compliance = complianceQuery.data ?? [];
  const sheFiles = sheFilesQuery.data ?? [];

  const openReports = reports.filter((r) => r.status !== "CLOSED");
  const reportTypeCount = new Set(reports.map((r) => r.reportTypeCode)).size;
  const overdue = compliance.filter((c) => c.state === "OVERDUE");
  const dueSoon = compliance.filter((c) => c.state === "DUE_SOON");
  const complianceScore = compliance.length === 0 ? null : Math.round((compliance.filter((c) => c.state === "OK").length / compliance.length) * 100);

  const expiringFiles = sheFiles.filter((f) => f.status === "EXPIRING_SOON" || f.status === "EXPIRED");

  const byCategory = new Map<string, typeof compliance>();
  for (const item of compliance) {
    byCategory.set(item.categoryCode, [...(byCategory.get(item.categoryCode) ?? []), item]);
  }
  const categoryBars = [...byCategory.entries()].map(([category, items]) => ({
    category,
    percent: Math.round((items.filter((i) => i.state === "OK").length / items.length) * 100),
  }));

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.serverReceivedAt).getTime() - new Date(a.serverReceivedAt).getTime())
    .slice(0, 5);

  if (!user) return null;

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-2.5">
        <h2 className="text-[19px] font-semibold">Dashboard</h2>
        <div className="text-[11.5px] text-sub">
          {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
      <p className="mb-0.5 text-[15px] font-bold">Good day, {user.fullName.split(" ")[0]}</p>
      <p className="mb-4 text-xs text-sub">Here's what's outstanding across your site right now.</p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open reports" value={openReports.length} sub={`${reportTypeCount} report types`} />
        <StatCard label="Overdue actions" value={overdue.length} sub="needs attention" valueClassName="text-red" />
        <StatCard label="Due soon" value={dueSoon.length} sub="across compliance" />
        <StatCard
          label="Compliance score"
          value={complianceScore === null ? "—" : `${complianceScore}%`}
          sub="this site"
          valueClassName="text-green"
        />
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Outstanding items" right={`${overdue.length + dueSoon.length + expiringFiles.length} open`}>
          {overdue.length + dueSoon.length + expiringFiles.length === 0 ? (
            <p className="py-2 text-xs text-sub">Nothing outstanding right now.</p>
          ) : (
            <div>
              {[...overdue, ...dueSoon].map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 border-b border-grey-bg py-2 last:border-none">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold">{humanize(item.reportTypeCode)}</div>
                    <div className="text-[11px] text-sub">{humanize(item.categoryCode)}</div>
                  </div>
                  <Pill variant={COMPLIANCE_STATE_VARIANT[item.state]}>{COMPLIANCE_STATE_LABEL[item.state]}</Pill>
                </div>
              ))}
              {expiringFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2.5 border-b border-grey-bg py-2 last:border-none">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold">{file.title}</div>
                    <div className="text-[11px] text-sub">SHE File · expires {formatDate(file.expiryDate)}</div>
                  </div>
                  <Pill variant={SHE_FILE_STATUS_VARIANT[file.status]}>{file.status === "EXPIRED" ? "Expired" : "Expiring soon"}</Pill>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Compliance status" right={complianceScore === null ? undefined : `${complianceScore}%`}>
          {categoryBars.length === 0 ? (
            <p className="py-2 text-xs text-sub">No compliance requirements for this site.</p>
          ) : (
            categoryBars.map((bar) => (
              <ProgressBar
                key={bar.category}
                label={humanize(bar.category)}
                percent={bar.percent}
                color={bar.percent >= 90 ? "bg-green" : bar.percent >= 75 ? "bg-blue" : "bg-amber"}
              />
            ))
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent reports">
          {recentReports.length === 0 ? (
            <p className="py-2 text-xs text-sub">No reports yet for this site.</p>
          ) : (
            recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-2.5 border-b border-grey-bg py-1.75 text-xs last:border-none">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{reportSummary(report.reportTypeCode, report.data)}</span>{" "}
                  <span className="text-[11px] text-sub">{formatDate(report.serverReceivedAt)}</span>
                </span>
                <Pill variant={REPORT_STATUS_VARIANT[report.status]}>{humanize(report.status)}</Pill>
              </div>
            ))
          )}
        </Panel>
        <Panel title="Quick actions">
          <div className="flex flex-col gap-2">
            <Link to="/reports/new">
              <Button className="w-full">+ New report</Button>
            </Link>
            <Link to="/she-files?upload=1">
              <Button variant="outline" className="w-full">
                Upload SHE file
              </Button>
            </Link>
            <Link to="/compliance">
              <Button variant="outline" className="w-full">
                View compliance tracker
              </Button>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
