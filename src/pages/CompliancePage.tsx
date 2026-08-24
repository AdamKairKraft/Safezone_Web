import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { listComplianceStatus } from "@/api/compliance";
import { Panel } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { ProgressBar } from "@/components/ProgressBar";
import { humanize } from "@/lib/format";
import { COMPLIANCE_STATE_LABEL, COMPLIANCE_STATE_VARIANT } from "@/lib/statusPills";
import type { ComplianceFrequency, ComplianceStatusResponse } from "@/types/api";

const STATE_ORDER = { OVERDUE: 0, DUE_SOON: 1, OK: 2 } as const;

/** Mirrors ComplianceRequirement.deriveState() on the backend, for display only. */
function nextDueLabel(item: ComplianceStatusResponse): string {
  if (item.frequency === "AS_NEEDED") return "As needed";
  if (!item.lastCompletedAt) return "Never completed";
  const intervalDays = item.frequency === "WEEKLY" ? 7 : 30;
  const nextDue = new Date(item.lastCompletedAt).getTime() + intervalDays * 86_400_000;
  const daysRemaining = Math.ceil((nextDue - Date.now()) / 86_400_000);
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} overdue`;
  if (daysRemaining === 0) return "Due today";
  return `Due in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
}

function frequencyLabel(frequency: ComplianceFrequency): string {
  return frequency === "AS_NEEDED" ? "As needed" : humanize(frequency);
}

export function CompliancePage() {
  const { siteId } = useSession();
  const complianceQuery = useQuery({
    queryKey: ["compliance", siteId],
    queryFn: () => listComplianceStatus(siteId!),
    enabled: !!siteId,
  });
  const items = complianceQuery.data ?? [];

  const sorted = [...items].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);

  const byCategory = new Map<string, ComplianceStatusResponse[]>();
  for (const item of items) {
    byCategory.set(item.categoryCode, [...(byCategory.get(item.categoryCode) ?? []), item]);
  }

  return (
    <div>
      <div className="mb-3.5">
        <h2 className="text-[19px] font-semibold">Compliance Tracker</h2>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Panel title="Upcoming & overdue">
          {sorted.length === 0 ? (
            <p className="py-2 text-xs text-sub">No compliance requirements for this site yet.</p>
          ) : (
            sorted.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2.5 border-b border-grey-bg py-2.25 last:border-none">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold">{humanize(item.reportTypeCode)}</div>
                    <div className="text-[10.5px] text-sub">{humanize(item.categoryCode)} · {frequencyLabel(item.frequency)}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Pill variant={COMPLIANCE_STATE_VARIANT[item.state]}>{COMPLIANCE_STATE_LABEL[item.state]}</Pill>
                  <div className="mt-0.5 text-[10px] text-sub">{nextDueLabel(item)}</div>
                </div>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Compliance by category">
          {byCategory.size === 0 ? (
            <p className="py-2 text-xs text-sub">No compliance requirements for this site yet.</p>
          ) : (
            [...byCategory.entries()].map(([category, categoryItems]) => {
              const percent = Math.round((categoryItems.filter((i) => i.state === "OK").length / categoryItems.length) * 100);
              return (
                <ProgressBar
                  key={category}
                  label={humanize(category)}
                  percent={percent}
                  color={percent >= 90 ? "bg-green" : percent >= 75 ? "bg-blue" : "bg-amber"}
                />
              );
            })
          )}
        </Panel>
      </div>
    </div>
  );
}
