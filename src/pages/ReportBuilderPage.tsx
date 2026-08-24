import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { useSiteIndustryModuleCode } from "@/lib/useSiteIndustryModule";
import { listReportTypes } from "@/api/industryModules";
import { getReport, saveDraft, submitReport } from "@/api/reports";
import { Tabs } from "@/components/Tabs";
import { Button } from "@/components/Button";
import { DynamicField } from "@/components/DynamicField";

export function ReportBuilderPage() {
  const { id: existingId } = useParams<{ id: string }>();
  const isEditing = !!existingId;
  const { user, siteId } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const moduleCode = useSiteIndustryModuleCode();
  const reportTypesQuery = useQuery({
    queryKey: ["report-types", moduleCode],
    queryFn: () => listReportTypes(moduleCode!),
    enabled: !!moduleCode,
  });
  const reportTypes = useMemo(() => reportTypesQuery.data ?? [], [reportTypesQuery.data]);

  const existingReportQuery = useQuery({
    queryKey: ["report", existingId],
    queryFn: () => getReport(existingId!),
    enabled: isEditing,
  });

  const [reportId] = useState(() => existingId ?? crypto.randomUUID());
  const [typeCode, setTypeCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!typeCode && reportTypes.length > 0) {
      setTypeCode(existingReportQuery.data?.reportTypeCode ?? reportTypes[0].code);
    }
  }, [typeCode, reportTypes, existingReportQuery.data]);

  useEffect(() => {
    if (existingReportQuery.data) {
      setFormData(existingReportQuery.data.data ?? {});
    }
  }, [existingReportQuery.data]);

  const activeType = reportTypes.find((rt) => rt.code === typeCode);
  const fields = useMemo(() => activeType?.formSchema.fields ?? [], [activeType]);

  const missingRequiredCount = useMemo(
    () =>
      fields.filter((field) => {
        const value = formData[field.name];
        return field.required && (value === undefined || value === null || value === "");
      }).length,
    [fields, formData],
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      saveDraft(reportId, {
        organizationId: user!.organizationId,
        siteId: siteId!,
        industryModuleCode: moduleCode!,
        reportTypeCode: typeCode!,
        data: formData,
        clientCreatedAt: new Date().toISOString(),
      }),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitReport(reportId),
  });

  async function handleSaveDraft() {
    setError(null);
    setStatus("saving");
    try {
      await saveMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch {
      setError("Couldn't save draft. Check your connection and try again.");
    } finally {
      setStatus("idle");
    }
  }

  async function handleSubmit() {
    setError(null);
    setStatus("submitting");
    try {
      await saveMutation.mutateAsync();
      await submitMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      await queryClient.invalidateQueries({ queryKey: ["compliance"] });
      navigate("/reports");
    } catch {
      setError("Couldn't submit this report. Check your connection and try again.");
      setStatus("idle");
    }
  }

  if (!moduleCode || reportTypes.length === 0) {
    return <p className="text-xs text-sub">Loading report types…</p>;
  }

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[19px] font-semibold">{isEditing ? "Edit report" : "New report"}</h2>
        <div className="text-[11.5px] text-sub">Fields update to match the report type</div>
      </div>

      <Tabs
        options={reportTypes.map((rt) => ({ value: rt.code, label: rt.name }))}
        value={typeCode ?? reportTypes[0].code}
        onChange={(value) => {
          setTypeCode(value);
          setFormData({});
        }}
      />

      {activeType && (
        <>
          <h4 className="mt-4 text-[13px] font-semibold">{activeType.name}</h4>
          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {fields.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={(value) => setFormData((prev) => ({ ...prev, [field.name]: value }))}
              />
            ))}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-md bg-red-bg px-2.5 py-2 text-[11.5px] text-red">{error}</div>}

      <div className="mt-4.5 flex items-center justify-between border-t border-border pt-3.5">
        <div className="text-[11px] text-sub">
          {missingRequiredCount > 0 ? `${missingRequiredCount} field${missingRequiredCount > 1 ? "s" : ""} required` : "Ready to submit"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={status !== "idle"}>
            {status === "saving" ? "Saving…" : "Save draft"}
          </Button>
          <Button onClick={handleSubmit} disabled={status !== "idle" || missingRequiredCount > 0}>
            {status === "submitting" ? "Submitting…" : "Submit for review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
