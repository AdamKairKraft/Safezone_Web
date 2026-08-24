import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { listReportsBySite } from "@/api/reports";
import { listIndustryModules } from "@/api/industryModules";

/**
 * Best-effort "which industry module is this site in" - inferred from its most common
 * existing report type, falling back to the first module in the catalog if the site has
 * no reports yet (so report creation still works for a brand-new site). See RolesPage for
 * the same heuristic and why: sites have no formal industry-module foreign key in the
 * backend today.
 */
export function useSiteIndustryModuleCode(): string | null {
  const { siteId } = useSession();

  const reportsQuery = useQuery({
    queryKey: ["reports", siteId],
    queryFn: () => listReportsBySite(siteId!),
    enabled: !!siteId,
  });
  const modulesQuery = useQuery({
    queryKey: ["industry-modules"],
    queryFn: listIndustryModules,
  });

  const reports = reportsQuery.data ?? [];
  if (reports.length > 0) {
    const counts = new Map<string, number>();
    for (const report of reports) {
      counts.set(report.industryModuleCode, (counts.get(report.industryModuleCode) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  return modulesQuery.data?.[0]?.code ?? null;
}
