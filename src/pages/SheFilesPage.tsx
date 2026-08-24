import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/auth/useSession";
import { listSheFilesByOrganization, registerSheFile } from "@/api/sheFiles";
import { StatCard } from "@/components/Card";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Tabs } from "@/components/Tabs";
import { Modal } from "@/components/Modal";
import { formatDateLong } from "@/lib/format";
import { SHE_FILE_STATUS_LABEL, SHE_FILE_STATUS_VARIANT } from "@/lib/statusPills";
import { SHE_FILE_CATEGORY_LABELS, type SheFileCategory } from "@/types/api";

const CATEGORIES = Object.keys(SHE_FILE_CATEGORY_LABELS) as SheFileCategory[];

export function SheFilesPage() {
  const { user, siteId } = useSession();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | SheFileCategory>("ALL");
  const [showUpload, setShowUpload] = useState(searchParams.get("upload") === "1");

  const filesQuery = useQuery({
    queryKey: ["she-files", user?.organizationId],
    queryFn: () => listSheFilesByOrganization(user!.organizationId),
    enabled: !!user,
  });
  const files = useMemo(() => filesQuery.data ?? [], [filesQuery.data]);

  const filtered = useMemo(
    () => (categoryFilter === "ALL" ? files : files.filter((f) => f.category === categoryFilter)),
    [files, categoryFilter],
  );

  const counts = {
    valid: files.filter((f) => f.status === "VALID").length,
    expiringSoon: files.filter((f) => f.status === "EXPIRING_SOON").length,
    expired: files.filter((f) => f.status === "EXPIRED").length,
  };

  function closeUpload() {
    setShowUpload(false);
    searchParams.delete("upload");
    setSearchParams(searchParams, { replace: true });
  }

  const uploadMutation = useMutation({
    mutationFn: (input: { title: string; category: SheFileCategory; expiryDate: string; fileName: string }) =>
      registerSheFile(crypto.randomUUID(), {
        organizationId: user!.organizationId,
        siteId: siteId ?? null,
        category: input.category,
        title: input.title,
        ownerUserId: user!.id,
        storageKey: `web-upload/${crypto.randomUUID()}/${input.fileName}`,
        expiryDate: input.expiryDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["she-files"] });
      closeUpload();
    },
  });

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[19px] font-semibold">SHE Files</h2>
        <Button onClick={() => setShowUpload(true)}>Upload file</Button>
      </div>
      <div className="mb-3.5 rounded-md bg-[#fef9c3] px-3 py-2.5 text-[11.5px] text-[#713f12]">
        The compliance register: legal appointments, policies, training certs, equipment certs and permits, with
        expiry tracking. (Uploads record file metadata only — the backend doesn't yet expose a binary storage
        endpoint, so no file content is actually stored.)
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Valid" value={counts.valid} valueClassName="text-green" />
        <StatCard label="Expiring soon" value={counts.expiringSoon} valueClassName="text-amber" />
        <StatCard label="Expired" value={counts.expired} valueClassName="text-red" />
      </div>

      <Tabs
        options={[{ value: "ALL", label: "All" }, ...CATEGORIES.map((c) => ({ value: c, label: SHE_FILE_CATEGORY_LABELS[c] }))]}
        value={categoryFilter}
        onChange={setCategoryFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-left text-[10.5px] font-semibold tracking-wide text-sub">
              <th className="pb-2">File</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Expiry date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sub">
                  No files in this category.
                </td>
              </tr>
            )}
            {filtered.map((file) => (
              <tr key={file.id} className="border-b border-grey-bg last:border-none">
                <td className="py-2.5">{file.title}</td>
                <td className="py-2.5">{SHE_FILE_CATEGORY_LABELS[file.category]}</td>
                <td className="py-2.5">{formatDateLong(file.expiryDate)}</td>
                <td className="py-2.5">
                  <Pill variant={SHE_FILE_STATUS_VARIANT[file.status]}>{SHE_FILE_STATUS_LABEL[file.status]}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUpload && (
        <Modal title="Upload SHE file" onClose={closeUpload}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              uploadMutation.mutate({
                title: String(form.get("title")),
                category: form.get("category") as SheFileCategory,
                expiryDate: String(form.get("expiryDate") ?? ""),
                fileName: (form.get("file") as File)?.name || "untitled",
              });
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-gray-700">TITLE</label>
              <input name="title" required className="rounded-md border border-gray-300 px-2.5 py-2 text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-gray-700">CATEGORY</label>
              <select name="category" required className="rounded-md border border-gray-300 px-2.5 py-2 text-xs">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {SHE_FILE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-gray-700">EXPIRY DATE (optional)</label>
              <input type="date" name="expiryDate" className="rounded-md border border-gray-300 px-2.5 py-2 text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold text-gray-700">FILE</label>
              <input type="file" name="file" required className="text-xs" />
            </div>
            <Button type="submit" disabled={uploadMutation.isPending} className="mt-1 w-full">
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
