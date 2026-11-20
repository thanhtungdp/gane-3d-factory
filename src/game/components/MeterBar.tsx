export interface MeterBarProps {
  value: number;
  max?: number;
  label: string;
  className?: string;
}

/** Thanh "Độ nhất quán" 0–10 cho trạm Vận Hành. */
export function MeterBar({ value, max = 10, label, className = "" }: MeterBarProps) {
  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const low = pct < 35;
  return (
    <div className={className}>
      <div className="row-between mb-1">
        <span className="eyebrow">{label}</span>
        <span className={`mono-num text-[13px] font-semibold ${low ? "text-hot" : "text-[#a9fff2]"}`}>
          {value.toFixed(1)}/{safeMax}
        </span>
      </div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-white/10"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={Number(value.toFixed(1))}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${low ? "bg-hot" : "bg-[#4fd1c5]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
