export function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-3.5 flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            option.value === value ? "bg-blue font-semibold text-white" : "bg-grey-bg text-slate-600 hover:bg-grey-bg2"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SubTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-3 flex gap-4 border-b border-border">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`-mb-px border-b-2 pb-2 text-xs ${
            option.value === value ? "border-blue font-semibold text-blue" : "border-transparent text-sub"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
