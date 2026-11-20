/**
 * Poster 2.5D (SVG + CSS) cho hành tinh — dùng ở map, report, share, low tier.
 *
 * File này TUYỆT ĐỐI không import three/R3F để initial bundle không kéo three.
 * Cùng dữ liệu `lit 0..1` với scene 3D; `lit` là tổng độ sáng của hành tinh.
 */
import { useId, useMemo } from "react";
import clsx from "clsx";
import type { PlanetId } from "@/shared/types";
import { PLANET_META } from "@/shared/planets";

/* ── Tiện ích màu / random ───────────────────────────────────────────── */

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`;
}

/** Trộn 2 màu hex; t = 0 → a, t = 1 → b. */
function mixHex(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const k = clamp01(t);
  return toHex([ca[0] + (cb[0] - ca[0]) * k, ca[1] + (cb[1] - ca[1]) * k, ca[2] + (cb[2] - ca[2]) * k]);
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha).toFixed(3)})`;
}

function seedFromPlanet(planet: PlanetId): number {
  return planet.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100000, 7);
}

/** mulberry32 — random tất định để SVG giống nhau mỗi render. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── StarMark ─────────────────────────────────────────────────────────── */

/** Ngôi sao 4 cánh cam–đỏ (mark Sao Kim), thuần SVG. */
export function StarMark({ size = 24, className }: { size?: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`mark-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd08a" />
          <stop offset="38%" stopColor="var(--color-amber, #faa634)" />
          <stop offset="76%" stopColor="var(--color-hot, #ef4123)" />
          <stop offset="100%" stopColor="#b71f10" />
        </linearGradient>
      </defs>
      <path
        d="M50 2 C53 39 61 47 98 50 C61 53 53 61 50 98 C47 61 39 53 2 50 C39 47 47 39 50 2 Z"
        fill={`url(#mark-${uid})`}
      />
    </svg>
  );
}

/* ── PlanetPoster ─────────────────────────────────────────────────────── */

export interface PlanetPosterProps {
  planet: PlanetId;
  /** Độ sáng tổng 0..1 — map/report dùng chung thang với scene 3D. */
  lit?: number;
  /** Cạnh poster (px). Mặc định 220. */
  size?: number;
  className?: string;
  showLogo?: boolean;
  brandName?: string;
  logoUrl?: string | null;
  /** true (mặc định): có nền navy + tinh vân. false: trong suốt để nhúng full-bleed. */
  background?: boolean;
}

/**
 * Poster hành tinh thủ công bằng SVG: nền navy, atmosphere glow, dải bề mặt,
 * city dots theo lit, ring/vệ tinh/fog/signal tuỳ trạm, logo optional.
 * Mỗi hành tinh có seed riêng → bố cục sao/dải/dots khác nhau.
 */
export function PlanetPoster({
  planet,
  lit: litProp = 0.6,
  size = 220,
  className,
  showLogo = false,
  brandName,
  logoUrl,
  background = true,
}: PlanetPosterProps) {
  const meta = PLANET_META[planet];
  const lit = clamp01(litProp);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const seed = seedFromPlanet(planet);

  const palette = useMemo(() => {
    const base = meta.color;
    const light = mixHex(base, "#ffffff", 0.34);
    const deep = mixHex(base, "#030718", 0.58);
    const abyss = mixHex(base, "#030718", 0.82);
    return { base, light, deep, abyss, glow: meta.glow };
  }, [meta.color, meta.glow]);

  /** Sao nền — tất định theo planet. */
  const stars = useMemo(() => {
    const rand = mulberry32(seed * 977 + 13);
    return Array.from({ length: 54 }, () => ({
      x: rand() * 400,
      y: rand() * 400,
      r: 0.35 + rand() * 1.15,
      o: 0.14 + rand() * 0.6,
      warm: rand() > 0.72,
    }));
  }, [seed]);

  /** City dots nằm trong đĩa hành tinh (r < 108). */
  const cities = useMemo(() => {
    const rand = mulberry32(seed * 313 + 5);
    const count = planet === "K" ? 46 : 26;
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 100;
      return { x: 200 + Math.cos(angle) * radius, y: 178 + Math.sin(angle) * radius * 0.96, r: 0.7 + rand() * 1.5 };
    });
  }, [planet, seed]);

  const ringVisible = planet === "A" || planet === "O";
  const satelliteCount = planet === "IM" ? 2 : planet === "K" ? 1 : 0;
  const brightness = 0.32 + lit * 0.68;

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={clsx("planet-poster", className)}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: size, height: "auto", maxWidth: "100%", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="26%" cy="14%" r="108%">
          <stop offset="0%" stopColor="var(--color-navy-800, #071236)" />
          <stop offset="52%" stopColor="var(--color-navy-900, #050a24)" />
          <stop offset="100%" stopColor="var(--color-void, #030718)" />
        </radialGradient>

        <radialGradient id={`atmo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="58%" stopColor={palette.glow} stopOpacity={0.05 + lit * 0.2} />
          <stop offset="80%" stopColor={palette.base} stopOpacity={0.12 + lit * 0.3} />
          <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`disk-${uid}`} cx="32%" cy="26%" r="82%">
          <stop offset="0%" stopColor={mixHex(palette.light, "#ffffff", 0.35)} />
          <stop offset="34%" stopColor={palette.light} />
          <stop offset="72%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.abyss} />
        </radialGradient>

        <radialGradient id={`night-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="42%" stopColor="#00000a" stopOpacity="0" />
          <stop offset="100%" stopColor="#00000a" stopOpacity="0.62" />
        </radialGradient>

        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.glow} stopOpacity={0.5 + lit * 0.35} />
          <stop offset="55%" stopColor={palette.base} stopOpacity={0.16 + lit * 0.16} />
          <stop offset="100%" stopColor={palette.base} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={mixHex(palette.glow, "#ffffff", 0.4)} stopOpacity={0.75 * brightness} />
          <stop offset="55%" stopColor={palette.glow} stopOpacity={0.4 * brightness} />
          <stop offset="100%" stopColor={palette.base} stopOpacity={0.12 * brightness} />
        </linearGradient>

        <linearGradient id={`ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={mixHex(palette.glow, "#ffffff", 0.3)} stopOpacity={0.55 * brightness} />
          <stop offset="60%" stopColor={palette.base} stopOpacity={0.24 * brightness} />
          <stop offset="100%" stopColor={palette.glow} stopOpacity={0.1 * brightness} />
        </linearGradient>

        <filter id={`soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`tiny-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>

        <clipPath id={`clip-${uid}`}>
          <circle cx="200" cy="178" r="112" />
        </clipPath>
      </defs>

      {/* nền + tinh vân — tắt khi poster được nhúng full-bleed để không lộ khối chữ nhật */}
      {background ? (
        <>
          <rect width="400" height="400" fill={`url(#bg-${uid})`} />
          <ellipse cx="316" cy="86" rx="150" ry="104" fill={withAlpha(palette.base, 0.22)} filter={`url(#soft-${uid})`} />
          <ellipse cx="74" cy="318" rx="140" ry="92" fill={withAlpha(palette.glow, 0.1)} filter={`url(#soft-${uid})`} />
        </>
      ) : null}

      {/* sao nền */}
      <g>
        {stars.map((star, i) => (
          <circle
            key={`s${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={star.warm ? "rgba(255, 236, 205, 1)" : "rgba(214, 226, 255, 1)"}
            opacity={star.o}
          />
        ))}
      </g>

      {/* atmosphere halo */}
      <circle cx="200" cy="178" r="166" fill={`url(#atmo-${uid})`} />
      <circle cx="200" cy="178" r="132" fill={`url(#halo-${uid})`} opacity={0.32 + lit * 0.4} />

      {/* ring phía sau hành tinh */}
      {ringVisible ? (
        <g transform="rotate(-17 200 178)">
          <ellipse cx="200" cy="178" rx="158" ry="46" fill="none" stroke={`url(#ring-${uid})`} strokeWidth="7" opacity={0.34 + lit * 0.5} />
          <ellipse cx="200" cy="178" rx="132" ry="38" fill="none" stroke={withAlpha(palette.glow, 0.22 * brightness)} strokeWidth="1.6" />
        </g>
      ) : null}

      {/* đĩa hành tinh */}
      <circle cx="200" cy="178" r="112" fill={`url(#disk-${uid})`} opacity={0.5 + lit * 0.5} stroke={`url(#rim-${uid})`} strokeWidth="1.4" />

      <g clipPath={`url(#clip-${uid})`}>
        {/* dải bề mặt — O/S/A/IM có hướng dải khác nhau */}
        <g opacity={0.24 + lit * 0.5}>
          <ellipse cx="188" cy="140" rx="120" ry="17" fill={mixHex(palette.light, "#ffffff", 0.4)} opacity="0.55" transform="rotate(-9 188 140)" />
          <ellipse cx="212" cy="170" rx="128" ry="13" fill={mixHex(palette.deep, "#ffffff", 0.18)} opacity="0.75" transform="rotate(-9 212 170)" />
          <ellipse cx="186" cy="198" rx="118" ry="11" fill={mixHex(palette.light, "#000000", 0.1)} opacity="0.5" transform="rotate(-9 186 198)" />
          <ellipse cx="214" cy="224" rx="104" ry="9" fill={mixHex(palette.deep, "#ffffff", 0.28)} opacity="0.55" transform="rotate(-9 214 224)" />
        </g>

        {/* thành phố / tín hiệu */}
        <g opacity={0.12 + lit * 0.72}>
          {cities.map((city, i) => (
            <circle
              key={`c${i}`}
              cx={city.x}
              cy={city.y}
              r={city.r}
              fill={planet === "K" ? "var(--color-amber, #faa634)" : palette.glow}
              opacity={0.55 + (i % 5) * 0.08}
            />
          ))}
        </g>

        {/* sương S */}
        {planet === "S" ? (
          <g opacity={0.8 - lit * 0.35} filter={`url(#soft-${uid})`}>
            <path d="M60 128 C118 100 176 138 236 112 C292 90 330 118 350 106" stroke="rgba(236, 247, 255, 0.72)" strokeWidth="15" fill="none" strokeLinecap="round" />
            <path d="M52 190 C120 168 170 204 236 178 C296 154 330 182 356 172" stroke="rgba(214, 238, 250, 0.5)" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M70 244 C132 228 180 252 240 236 C290 222 322 240 346 232" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>
        ) : null}

        {/* vân bề mặt O rõ hơn */}
        {planet === "O" ? (
          <ellipse cx="200" cy="178" rx="112" ry="112" fill="none" stroke={`url(#rim-${uid})`} strokeWidth="9" opacity={0.16 + lit * 0.4} />
        ) : null}

        {/* vùng tối (lit thấp → tối hơn) */}
        <rect x="88" y="66" width="224" height="224" fill="#030718" opacity={0.62 * (1 - lit)} />
        <circle cx="236" cy="212" r="112" fill={`url(#night-${uid})`} opacity={0.55 + 0.25 * (1 - lit)} />
      </g>

      {/* viền sáng khí quyển */}
      <circle cx="200" cy="178" r="112" fill="none" stroke={`url(#rim-${uid})`} strokeWidth="1.8" opacity={0.4 + lit * 0.6} />
      <circle cx="200" cy="178" r="124" fill="none" stroke={withAlpha(palette.glow, 0.18 * brightness)} strokeWidth="7" filter={`url(#tiny-${uid})`} />

      {/* ring phía trước (nửa dưới) */}
      {ringVisible ? (
        <g transform="rotate(-17 200 178)">
          <path d="M42 178 A158 46 0 0 0 358 178" fill="none" stroke={`url(#ring-${uid})`} strokeWidth="7" opacity={0.3 + lit * 0.4} />
        </g>
      ) : null}

      {/* tín hiệu K — sóng phát ra từ hành tinh */}
      {planet === "K" ? (
        <g opacity={0.18 + lit * 0.7} fill="none" stroke="var(--color-amber, #faa634)" strokeLinecap="round">
          <path d="M300 108 A118 118 0 0 1 330 152" strokeWidth="2.4" opacity="0.9" />
          <path d="M312 90 A146 146 0 0 1 352 144" strokeWidth="1.8" opacity="0.55" />
          <path d="M322 74 A172 172 0 0 1 370 138" strokeWidth="1.3" opacity="0.3" />
        </g>
      ) : null}

      {/* vệ tinh IM / K */}
      {satelliteCount > 0 ? (
        <g opacity={0.2 + lit * 0.8}>
          {planet === "IM" ? (
            <>
              <ellipse cx="200" cy="178" rx="158" ry="70" fill="none" stroke={withAlpha(palette.glow, 0.28)} strokeWidth="1" strokeDasharray="3 7" transform="rotate(21 200 178)" />
              <circle cx="318" cy="126" r="6" fill={palette.glow} stroke={palette.base} strokeWidth="1.4" />
              <circle cx="94" cy="238" r="4.4" fill={mixHex(palette.glow, "#ffffff", 0.3)} />
            </>
          ) : (
            <circle cx="330" cy="216" r="4" fill={palette.glow}>
              <animate attributeName="opacity" values="0.35;1;0.35" dur="2.6s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ) : null}

      {/* logo optional — chip kính ở đáy poster */}
      {showLogo && (logoUrl || brandName) ? (
        <g>
          <rect x="82" y="330" width="236" height="50" rx="16" fill="rgba(3, 7, 24, 0.62)" stroke="rgba(255, 255, 255, 0.16)" />
          <rect x="82" y="330" width="236" height="50" rx="16" fill={`url(#halo-${uid})`} opacity="0.08" />
          {logoUrl ? (
            <image href={logoUrl} x="103" y="341" width="194" height="28" preserveAspectRatio="xMidYMid meet" />
          ) : (
            <text
              x="200"
              y="361"
              textAnchor="middle"
              fill="var(--color-silver, #f4f6fb)"
              fontSize={brandName && brandName.length > 20 ? 16 : 19}
              fontWeight={600}
              letterSpacing="0.4"
            >
              {brandName ? (brandName.length > 28 ? `${brandName.slice(0, 27)}…` : brandName) : ""}
            </text>
          )}
        </g>
      ) : null}
    </svg>
  );
}

/* ── PlanetBackdrop — fallback CSS khi tier low / WebGL không khả dụng ──── */

export type PosterMode = "intro" | "landing" | "launch" | "planet" | "finale" | "flight";

export interface PlanetBackdropProps {
  planet: PlanetId;
  lit?: number;
  brandName?: string;
  logoUrl?: string | null;
  className?: string;
  mode?: PosterMode;
  /** Chỉ dùng cho mode "flight": đích "venus" → hiện sao 4 cánh thay hành tinh. */
  flightTo?: PlanetId | "venus" | null;
}

/**
 * Nền 2.5D full-bleed cho SceneCanvas khi tier `low` (không dựng WebGL).
 * Không import three; giữ nguyên nội dung: hành tinh + brand + sao 4 cánh ở finale.
 */
export function PlanetBackdrop({
  planet,
  lit = 0.6,
  brandName,
  logoUrl,
  className,
  mode = "planet",
  flightTo = null,
}: PlanetBackdropProps) {
  const meta = PLANET_META[planet];
  const stars = useMemo(() => {
    const rand = mulberry32(seedFromPlanet(planet) * 131 + 29);
    return Array.from({ length: 46 }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.6 + rand() * 1.4,
      o: 0.12 + rand() * 0.55,
    }));
  }, [planet]);

  const isFinale = mode === "finale";
  const isFlight = mode === "flight";
  const isVenusFlight = isFlight && flightTo === "venus";
  const showStar = isFinale || isVenusFlight;

  return (
    <div
      className={clsx("three-backdrop", className)}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(120% 90% at 50% 0%, var(--color-navy-800, #071236) 0%, var(--color-navy-900, #050a24) 52%, var(--color-void, #030718) 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background: `radial-gradient(40% 34% at 74% 22%, ${withAlpha(meta.color, 0.4)}, transparent 70%),
            radial-gradient(34% 30% at 22% 72%, ${withAlpha(meta.glow, 0.18)}, transparent 72%),
            radial-gradient(44% 32% at 40% 8%, rgba(122, 140, 255, 0.12), transparent 70%)`,
          filter: "blur(26px)",
        }}
      />
      <div style={{ position: "absolute", inset: 0 }}>
        {stars.map((star, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.r,
              height: star.r,
              borderRadius: "50%",
              background: i % 7 === 0 ? "rgba(255, 236, 205, 1)" : "rgba(220, 230, 255, 1)",
              opacity: star.o,
            }}
          />
        ))}
      </div>
      {showStar ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isVenusFlight ? "36%" : "30%",
            width: isVenusFlight ? "min(62vw, 340px)" : "min(42vw, 280px)",
            transform: "translate(-50%, -50%)",
            opacity: isVenusFlight ? 0.5 + lit * 0.5 : 0.55 + lit * 0.45,
            filter: `drop-shadow(0 0 ${isVenusFlight ? 34 : 24}px ${withAlpha(meta.glow, 0.55)})`,
          }}
        >
          <StarMark size={isVenusFlight ? 260 : 220} />
        </div>
      ) : null}
      {isVenusFlight ? null : (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isFinale ? "60%" : isFlight ? "40%" : mode === "intro" ? "36%" : "32%",
            width: isFinale ? "min(88vw, 560px)" : isFlight ? "min(90vw, 620px)" : "min(96vw, 640px)",
            transform: "translate(-50%, -50%)",
            filter:
              mode === "launch"
                ? "saturate(0.32) brightness(0.82)"
                : mode === "planet" || isFlight || mode === "intro"
                  ? "saturate(1.05)"
                  : undefined,
            opacity: mode === "launch" ? 0.9 : 1,
          }}
        >
          <PlanetPoster planet={planet} lit={lit} size={640} background={false} />
        </div>
      )}
      {brandName ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "max(6vh, 34px)",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(3,7,24,0.55)",
            color: "var(--color-silver, #f4f6fb)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            maxWidth: "82vw",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {logoUrl ? <img src={logoUrl} alt="" style={{ height: 18, maxWidth: 120, objectFit: "contain" }} /> : null}
          <span>{brandName}</span>
        </div>
      ) : null}
    </div>
  );
}
