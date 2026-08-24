export type PillVariant = "green" | "amber" | "red" | "blue" | "grey";

const VARIANT_CLASSES: Record<PillVariant, string> = {
  green: "bg-green-bg text-green",
  amber: "bg-amber-bg text-amber",
  red: "bg-red-bg text-red",
  blue: "bg-blue-bg text-blue-dark",
  grey: "bg-grey-bg2 text-slate-600",
};

export function Pill({ variant, children }: { variant: PillVariant; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  );
}
