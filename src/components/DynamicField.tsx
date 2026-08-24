import type { FormFieldSchema } from "@/types/api";

export function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FormFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const baseClass = "rounded-md border border-gray-300 px-2.5 py-2 text-xs outline-blue";

  return (
    <div className={`flex flex-col gap-1.5 ${field.type === "textarea" ? "col-span-full" : ""}`}>
      <label className="text-[10.5px] font-semibold tracking-wide text-gray-700">
        {field.label.toUpperCase()}
        {field.required && <span className="text-red"> *</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          className={`${baseClass} h-14 resize-y`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select className={baseClass} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>
            Select…
          </option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <input
          type="number"
          className={baseClass}
          value={(value as number | string) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      ) : field.type === "datetime" ? (
        <input
          type="datetime-local"
          className={baseClass}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input type="text" className={baseClass} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
