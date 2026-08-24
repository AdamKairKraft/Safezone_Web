export function humanize(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateLong(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const SUMMARY_FIELDS = ["topic", "description", "controlPoint", "findings", "treatmentGiven", "aircraftId"];

/** Best-effort human summary of a report's freeform `data` JSON for list/dashboard display. */
export function reportSummary(reportTypeCode: string, data: Record<string, unknown>): string {
  for (const field of SUMMARY_FIELDS) {
    const value = data[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return humanize(reportTypeCode);
}

export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
