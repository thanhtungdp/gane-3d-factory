import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import clsx from "clsx";
import { IconStar } from "./Icons";

type Variant = "primary" | "silver" | "ghost" | "plain";
type Size = "md" | "sm" | "xs";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "ghost",
  size = "md",
  block,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "silver" && "btn-silver",
        variant === "ghost" && "btn-ghost",
        size === "sm" && "btn-sm",
        size === "xs" && "btn-xs",
        block && "btn-block",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  prefix,
  suffix,
  className,
  wrapClassName,
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={wrapClassName}>
      {label ? (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={clsx("field", error && "border-[#ef4123]/60", className)}>
        {prefix ? <span className="text-muted shrink-0">{prefix}</span> : null}
        <input id={inputId} aria-invalid={Boolean(error)} {...rest} />
        {suffix ? <span className="shrink-0">{suffix}</span> : null}
      </div>
      {error ? <p className="error-text">{error}</p> : hint ? <p className="small mt-2">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  columns,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  columns?: 2 | 3;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label}>
      {label ? <span className="label">{label}</span> : null}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0,1fr))` }}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              id={`${id}-${o.value}`}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={clsx(
                "min-h-11 rounded-xl border px-2 py-2.5 text-center text-[12.5px] font-medium transition",
                selected
                  ? "border-amber/60 bg-amber/15 text-silver"
                  : "border-white/10 bg-white/[.03] text-muted hover:bg-white/[.06]",
              )}
            >
              {o.label}
              {o.hint ? <span className="mt-0.5 block text-[10px] opacity-70">{o.hint}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CheckRow({
  checked,
  onChange,
  children,
  required,
  testId,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  required?: boolean;
  testId?: string;
}) {
  return (
    <label className="check" data-testid={testId}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
      />
      <span>{children}</span>
    </label>
  );
}

export function StarRating({
  value,
  size = 16,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const width = (clamped / 5) * 100;
  return (
    <span className={clsx("inline-flex items-center gap-2", className)} aria-label={`${clamped}/5 sao`}>
      <span className="relative inline-flex" aria-hidden>
        <span className="inline-flex gap-0.5 text-white/15">
          {[0, 1, 2, 3, 4].map((i) => (
            <IconStar key={i} size={size} />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex gap-0.5 overflow-hidden text-amber"
          style={{ width: `${width}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <IconStar key={i} size={size} className="shrink-0" />
          ))}
        </span>
      </span>
      {showValue ? <span className="mono-num text-[12px] text-muted">{clamped.toFixed(1)}/5</span> : null}
    </span>
  );
}

export function ScoreBar({
  value,
  color = "#faa634",
  height = 6,
  className,
}: {
  value: number;
  color?: string;
  height?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div
      className={clsx("w-full overflow-hidden rounded-full bg-white/10", className)}
      style={{ height }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={value}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }}
      />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <span className="pill mono-num">{children}</span>;
}
