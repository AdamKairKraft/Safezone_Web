export function ProgressBar({ label, percent, color = "bg-green" }: { label: string; percent: number; color?: string }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex justify-between text-[11.5px]">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-grey-bg2">
        <div className={`h-full rounded ${color}`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
    </div>
  );
}
