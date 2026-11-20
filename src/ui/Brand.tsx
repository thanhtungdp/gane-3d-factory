import { useMemo, useState } from "react";
import clsx from "clsx";
import type { BrandProfile } from "@/shared/types";

export function BrandMark({ className, height = 26 }: { className?: string; height?: number }) {
  return (
    <img
      src="/brand/logo-saokim-white.svg"
      alt="Sao Kim Branding"
      height={height}
      style={{ height, width: "auto" }}
      className={clsx("select-none", className)}
      draggable={false}
    />
  );
}

export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !["công", "ty", "tnhh", "cp", "cổ", "phần", "thương", "mại", "dịch", "vụ"].includes(w.toLowerCase()));
  const pool = words.length ? words : name.trim().split(/\s+/);
  return pool
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Monogram({
  name,
  palette,
  size = 72,
  className,
}: {
  name: string;
  palette?: string[];
  size?: number;
  className?: string;
}) {
  const [a, b] = [palette?.[0] ?? "#21409a", palette?.[1] ?? "#faa634"];
  const text = useMemo(() => initialsOf(name) || "SK", [name]);
  return (
    <div
      className={clsx("grid place-items-center overflow-hidden", className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        background: `linear-gradient(140deg, ${a}, ${b})`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)",
      }}
      aria-hidden
    >
      <span
        style={{
          fontSize: Math.max(14, size * 0.34),
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#fff",
          textShadow: "0 1px 8px rgba(0,0,0,.35)",
        }}
      >
        {text}
      </span>
    </div>
  );
}

export function LogoImage({
  brand,
  size = 64,
  className,
  rounded = true,
  pad = false,
}: {
  brand: Pick<BrandProfile, "name" | "logo" | "palette">;
  size?: number;
  className?: string;
  rounded?: boolean;
  pad?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const palette = brand.palette.map((c) => c.hex);
  if (!brand.logo?.url || failed) {
    return <Monogram name={brand.name} palette={palette} size={size} className={className} />;
  }
  return (
    <div
      className={clsx("grid place-items-center overflow-hidden", className)}
      style={{
        width: size,
        height: size,
        borderRadius: rounded ? Math.round(size * 0.24) : 0,
        background: pad ? "linear-gradient(180deg,#ffffff,#eef1f7)" : "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.14)",
      }}
    >
      <img
        src={brand.logo.url}
        alt={`Logo ${brand.name}`}
        onError={() => setFailed(true)}
        style={{ maxWidth: "82%", maxHeight: "82%", objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}
