// Mirrors of the backend's response/request DTOs (safezone-backend, com.safezone.*).

export type RoleType = "SHE_OFFICER" | "SITE_SUPERVISOR" | "GENERAL_WORKER" | "CONTRACTOR" | "MANAGEMENT";

export const ALL_ROLES: RoleType[] = ["SHE_OFFICER", "SITE_SUPERVISOR", "GENERAL_WORKER", "CONTRACTOR", "MANAGEMENT"];

export const ROLE_LABELS: Record<RoleType, string> = {
  SHE_OFFICER: "SHE Officer",
  SITE_SUPERVISOR: "Site Supervisor",
  GENERAL_WORKER: "General Worker",
  CONTRACTOR: "Contractor",
  MANAGEMENT: "Management",
};

export interface UserResponse {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  roles: RoleType[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponse;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  version: number;
}

export interface SiteResponse {
  id: string;
  organizationId: string;
  name: string;
  version: number;
}

export interface IndustryModuleResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export type FormFieldType = "text" | "textarea" | "number" | "select" | "datetime";

export interface FormFieldSchema {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface ReportTypeDefinitionResponse {
  id: string;
  code: string;
  name: string;
  formSchema: { fields: FormFieldSchema[] };
}

export interface RoleResponsibilityResponse {
  id: string;
  description: string;
}

export interface RoleRequiredReportResponse {
  id: string;
  reportTypeCode: string;
  reportTypeName: string;
  frequencyLabel: string;
}

export type ReportStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "CLOSED";

export interface ReportResponse {
  id: string;
  organizationId: string;
  siteId: string;
  industryModuleCode: string;
  reportTypeCode: string;
  status: ReportStatus;
  data: Record<string, unknown>;
  submittedBy: string | null;
  clientCreatedAt: string | null;
  serverReceivedAt: string;
  version: number;
}

export interface UpsertReportRequest {
  organizationId: string;
  siteId: string;
  industryModuleCode: string;
  reportTypeCode: string;
  data: Record<string, unknown>;
  clientCreatedAt?: string;
}

export type ComplianceFrequency = "WEEKLY" | "MONTHLY" | "AS_NEEDED";
export type ComplianceState = "OK" | "DUE_SOON" | "OVERDUE";

export interface ComplianceStatusResponse {
  id: string;
  categoryCode: string;
  reportTypeCode: string;
  frequency: ComplianceFrequency;
  lastCompletedAt: string | null;
  state: ComplianceState;
}

export type SheFileCategory =
  | "LEGAL_APPOINTMENT"
  | "POLICY_PROCEDURE"
  | "TRAINING_CERTIFICATE"
  | "EQUIPMENT_CERTIFICATE"
  | "PERMIT_LICENSE";

export type SheFileStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED";

export const SHE_FILE_CATEGORY_LABELS: Record<SheFileCategory, string> = {
  LEGAL_APPOINTMENT: "Legal Appointment",
  POLICY_PROCEDURE: "Policies & Procedures",
  TRAINING_CERTIFICATE: "Training & Certificates",
  EQUIPMENT_CERTIFICATE: "Equipment & Inspection Certs",
  PERMIT_LICENSE: "Permits & Licenses",
};

export interface SheFileResponse {
  id: string;
  organizationId: string;
  siteId: string | null;
  category: SheFileCategory;
  title: string;
  ownerUserId: string | null;
  expiryDate: string | null;
  status: SheFileStatus;
}

export interface RegisterSheFileRequest {
  organizationId: string;
  siteId: string | null;
  category: SheFileCategory;
  title: string;
  ownerUserId: string | null;
  storageKey: string;
  expiryDate: string | null;
}

export interface ApiErrorBody {
  message: string;
  status: number;
  timestamp: string;
}
