import { useId } from "react";
import type { PlanetId } from "@/shared/types";
import { PLANET_META, PLANET_ORDER } from "@/shared/planets";

const SIZE = 240;
const CENTER = SIZE / 2;
const MAX_R = 92;

function point(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: CENTER + Math.cos(a) * radius, y: CENTER + Math.sin(a) * radius };
}

export function RadarChart({
  values,
  labels,
  size = 260,
  color = "#faa634",
  animated = true,
}: {
  values: Partial<Record<PlanetId, number>>;
  labels?: Partial<Record<PlanetId, string>>;
  size?: number;
  color?: string;
  animated?: boolean;
}) {
  const uid = useId().replace(/[:]/g, "");
  const axes = PLANET_ORDER;
  const points = axes.map((id, i) => {
    const v = Math.max(0, Math.min(10, values[id] ?? 0));
    const angle = -90 + i * (360 / axes.length);
    return point(angle, (v / 10) * MAX_R);
  });
  const polygon = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const rings = [2, 4, 6, 8, 10];

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ maxWidth: size, height: "auto", overflow: "visible" }}
      role="img"
      aria-label={`Biểu đồ 5 trục: ${axes.map((id) => `${id} ${values[id]?.toFixed(1) ?? "0"}/10`).join(", ")}`}
      className={animated ? "fade-up" : undefined}
    >
      <defs>
        <radialGradient id={`radarFill-${uid}`} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="70%" stopColor={color} stopOpacity="0.13" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </radialGradient>
        <filter id={`radarGlow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {rings.map((r) => (
        <circle
          key={r}
          cx={CENTER}
          cy={CENTER}
          r={(r / 10) * MAX_R}
          fill="none"
          stroke="rgba(255,255,255,.10)"
          strokeWidth={r === 10 ? 1.2 : 0.7}
          strokeDasharray={r === 10 ? "" : "2 4"}
        />
      ))}

      {axes.map((id, i) => {
        const angle = -90 + i * (360 / axes.length);
        const end = point(angle, MAX_R);
        const labelPos = point(angle, MAX_R + 24);
        return (
          <g key={id}>
            <line
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,.10)"
              strokeWidth={0.8}
            />
            <text
              x={labelPos.x}
              y={labelPos.y - 5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={PLANET_META[id].color}
            >
              {id}
            </text>
            <text x={labelPos.x} y={labelPos.y + 8} textAnchor="middle" fontSize="7.5" fill="#8e9bb8">
              {labels?.[id] ?? PLANET_META[id].stepVi.split(" ").slice(0, 2).join(" ")}
            </text>
          </g>
        );
      })}

      <polygon
        points={polygon}
        fill={`url(#radarFill-${uid})`}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        filter={`url(#radarGlow-${uid})`}
        style={{ transition: "all .7s cubic-bezier(.22,1,.36,1)" }}
      />
      {points.map((p, i) => (
        <g key={axes[i]}>
          <circle cx={p.x} cy={p.y} r="3.4" fill={color} stroke="#050a24" strokeWidth="1.5" />
          <text
            x={p.x - (p.x - CENTER) * 0.18}
            y={p.y - (p.y - CENTER) * 0.18}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill="#f4f6fb"
            style={{ paintOrder: "stroke", stroke: "#050a24", strokeWidth: 2.5 }}
          >
            {(values[axes[i]!] ?? 0).toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}
