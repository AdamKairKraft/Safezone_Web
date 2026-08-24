import type { PillVariant } from "@/components/Pill";
import type { ComplianceState, ReportStatus, SheFileStatus } from "@/types/api";

export const COMPLIANCE_STATE_VARIANT: Record<ComplianceState, PillVariant> = {
  OK: "green",
  DUE_SOON: "amber",
  OVERDUE: "red",
};

export const COMPLIANCE_STATE_LABEL: Record<ComplianceState, string> = {
  OK: "Up-to-date",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
};

export const REPORT_STATUS_VARIANT: Record<ReportStatus, PillVariant> = {
  DRAFT: "grey",
  SUBMITTED: "green",
  UNDER_REVIEW: "blue",
  CLOSED: "grey",
};

export const SHE_FILE_STATUS_VARIANT: Record<SheFileStatus, PillVariant> = {
  VALID: "green",
  EXPIRING_SOON: "amber",
  EXPIRED: "red",
};

export const SHE_FILE_STATUS_LABEL: Record<SheFileStatus, string> = {
  VALID: "Valid",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
};
