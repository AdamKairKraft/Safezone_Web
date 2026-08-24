export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border p-3.5 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  sub,
  valueClassName = "",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <Card>
      <div className="text-[11px] text-sub">{label}</div>
      <div className={`mt-1 text-[22px] font-bold ${valueClassName}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-sub">{sub}</div>}
    </Card>
  );
}

export function Panel({
  title,
  right,
  children,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h3 className="mb-2.5 flex items-center justify-between text-[13px] font-semibold">
        <span>{title}</span>
        {right && <span className="text-[11px] font-normal text-sub">{right}</span>}
      </h3>
      {children}
    </Card>
  );
}
