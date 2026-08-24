import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { listReportsBySite } from "@/api/reports";
import { listComplianceStatus } from "@/api/compliance";
import { listRequiredReports, listResponsibilities, listRolesForModule } from "@/api/roles";
import { Panel } from "@/components/Card";
import { Tabs } from "@/components/Tabs";
import { Pill } from "@/components/Pill";
import { ROLE_LABELS, type RoleType } from "@/types/api";
import { COMPLIANCE_STATE_LABEL, COMPLIANCE_STATE_VARIANT } from "@/lib/statusPills";

/**
 * Sites/organizations have no formal industry-module assignment in the backend - each
 * report just carries its own industryModuleCode. We infer "this site's module" from its
 * most common report type, which is accurate for every seeded site but is a best-effort
 * read, not a real foreign key - documented backend gap, not silently invented data.
 */
function inferIndustryModuleCode(reports: { industryModuleCode: string }[]): string | null {
  if (reports.length === 0) return null;
  const counts = new Map<string, number>();
  for (const report of reports) {
    counts.set(report.industryModuleCode, (counts.get(report.industryModuleCode) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function RolesPage() {
  const { siteId } = useSession();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  const reportsQuery = useQuery({
    queryKey: ["reports", siteId],
    queryFn: () => listReportsBySite(siteId!),
    enabled: !!siteId,
  });
  const industryModuleCode = inferIndustryModuleCode(reportsQuery.data ?? []);

  const rolesQuery = useQuery({
    queryKey: ["module-roles", industryModuleCode],
    queryFn: () => listRolesForModule(industryModuleCode!),
    enabled: !!industryModuleCode,
  });
  const roles = rolesQuery.data ?? [];
  const activeRole = selectedRole && roles.includes(selectedRole) ? selectedRole : (roles[0] ?? null);

  const responsibilitiesQuery = useQuery({
    queryKey: ["role-responsibilities", industryModuleCode, activeRole],
    queryFn: () => listResponsibilities(industryModuleCode!, activeRole!),
    enabled: !!industryModuleCode && !!activeRole,
  });
  const requiredReportsQuery = useQuery({
    queryKey: ["role-required-reports", industryModuleCode, activeRole],
    queryFn: () => listRequiredReports(industryModuleCode!, activeRole!),
    enabled: !!industryModuleCode && !!activeRole,
  });
  const complianceQuery = useQuery({
    queryKey: ["compliance", siteId],
    queryFn: () => listComplianceStatus(siteId!),
    enabled: !!siteId,
  });

  const complianceByReportType = new Map((complianceQuery.data ?? []).map((c) => [c.reportTypeCode, c]));

  return (
    <div>
      <div className="mb-3.5">
        <h2 className="text-[19px] font-semibold">Roles & Responsibilities</h2>
        <p className="mt-1 text-xs text-sub">What each role is responsible for, and what they need to report.</p>
      </div>

      {!industryModuleCode ? (
        <div className="rounded-md bg-[#fef9c3] px-3 py-2.5 text-[11.5px] text-[#713f12]">
          This site doesn't have any reports yet, so we can't tell which industry module it belongs to. Submit a
          report to populate this view.
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-md bg-[#fef9c3] px-3 py-2.5 text-[11.5px] text-[#713f12]">
          No roles & responsibilities catalog exists for this site's industry module yet.
        </div>
      ) : (
        <>
          <Tabs
            options={roles.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
            value={activeRole!}
            onChange={setSelectedRole}
          />
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <Panel title="Responsibilities">
              {(responsibilitiesQuery.data ?? []).map((item) => (
                <div key={item.id} className="flex items-start gap-2 py-1.5 text-[12.5px]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm border border-gray-300" />
                  {item.description}
                </div>
              ))}
            </Panel>
            <Panel title="Required reporting">
              {(requiredReportsQuery.data ?? []).map((item) => {
                const compliance = complianceByReportType.get(item.reportTypeCode);
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2.5 border-b border-grey-bg py-2 last:border-none">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">{item.reportTypeName}</div>
                      <div className="text-[10.5px] text-sub">{item.frequencyLabel}</div>
                    </div>
                    {compliance ? (
                      <Pill variant={COMPLIANCE_STATE_VARIANT[compliance.state]}>
                        {COMPLIANCE_STATE_LABEL[compliance.state]}
                      </Pill>
                    ) : (
                      <Pill variant="grey">Not tracked here</Pill>
                    )}
                  </div>
                );
              })}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
