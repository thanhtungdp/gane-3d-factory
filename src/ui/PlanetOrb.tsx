import clsx from "clsx";
import type { PlanetId } from "@/shared/types";
import { PLANET_META } from "@/shared/planets";

/**
 * Poster hành tinh 2.5D bằng CSS — dùng cho map/report/low-tier và làm fallback
 * nếu 3D không khả dụng. Cùng dữ liệu lit 0..1 với scene 3D.
 */
export function PlanetOrb({
  planet,
  lit = 1,
  size = 64,
  className,
  showLogo = false,
  logoUrl,
  label,
}: {
  planet: PlanetId;
  lit?: number;
  size?: number;
  className?: string;
  showLogo?: boolean;
  logoUrl?: string | null;
  label?: string;
}) {
  const meta = PLANET_META[planet];
  const l = Math.max(0.08, Math.min(1, lit));
  const color = meta.color;
  const glow = meta.glow;

  return (
    <div
      className={clsx("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <div
        className="absolute rounded-full"
        style={{
          inset: -size * 0.16,
          background: `radial-gradient(circle, ${color}${Math.round(l * 70)
            .toString(16)
            .padStart(2, "0")} 0%, transparent 68%)`,
          filter: "blur(4px)",
        }}
      />
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 32% 27%, #ffffff 0%, ${color} 18%, ${shade(color, -34)} 58%, ${shade(color, -72)} 100%)`,
          boxShadow: `inset -${size * 0.1}px -${size * 0.1}px ${size * 0.2}px rgba(0,0,0,.65), inset ${size * 0.05}px ${size * 0.05}px ${size * 0.08}px rgba(255,255,255,.28), 0 0 ${size * 0.35}px ${color}55`,
          opacity: 0.55 + l * 0.45,
        }}
      >
        {/* dải bề mặt */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background: `repeating-linear-gradient(112deg, transparent 0 ${size * 0.12}px, ${shade(color, 28)}66 ${size * 0.12}px ${size * 0.21}px)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 72% 76%, transparent 40%, rgba(0,0,10,.62) 100%)`,
            opacity: 0.9,
          }}
        />
        {/* city lights cho K */}
        {planet === "K" && l > 0.35 ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${glow} 0.8px, transparent 1.4px), radial-gradient(${glow} 0.7px, transparent 1.2px)`,
              backgroundSize: `${size * 0.18}px ${size * 0.18}px, ${size * 0.27}px ${size * 0.27}px`,
              backgroundPosition: `0 0, ${size * 0.08}px ${size * 0.11}px`,
              opacity: 0.24 + l * 0.55,
              mixBlendMode: "screen",
            }}
          />
        ) : null}
        {/* sương cho S */}
        {planet === "S" ? (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(140deg, rgba(255,255,255,.55), rgba(255,255,255,.05) 45%, transparent 70%)",
              filter: "blur(2px)",
              opacity: 0.85 - l * 0.25,
            }}
          />
        ) : null}
        {/* bề mặt O */}
        {planet === "O" ? (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(110deg, transparent 30%, ${color}88 50%, transparent 72%)`,
              opacity: l * 0.5,
              mixBlendMode: "screen",
            }}
          />
        ) : null}
        {showLogo && logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="absolute left-1/2 top-1/2 object-contain"
            style={{ width: size * 0.42, height: size * 0.42, transform: "translate(-50%,-50%)", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))" }}
          />
        ) : null}
      </div>

      {planet === "A" ? (
        <div
          className="absolute rounded-full border"
          style={{
            width: size * 1.35,
            height: size * 0.42,
            borderColor: `${color}77`,
            transform: "rotate(-18deg)",
            opacity: 0.3 + l * 0.5,
            boxShadow: `0 0 ${size * 0.2}px ${color}44`,
          }}
        />
      ) : null}

      {planet === "IM" && l > 0.3 ? (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              background: glow,
              transform: `translate(${size * 0.62}px, ${-size * 0.28}px)`,
              boxShadow: `0 0 8px ${glow}`,
              opacity: l,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: glow,
              transform: `translate(${-size * 0.58}px, ${size * 0.34}px)`,
              boxShadow: `0 0 6px ${glow}`,
              opacity: l * 0.8,
            }}
          />
        </>
      ) : null}
    </div>
  );
}

/** Làm tối/sáng một hex theo phần trăm. */
function shade(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + Math.round((amount / 100) * 255)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + Math.round((amount / 100) * 255)));
  const b = Math.min(255, Math.max(0, (n & 255) + Math.round((amount / 100) * 255)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
