/**
 * Preview route tạm cho lớp 3D/2.5D — Lead gắn vào router sau (ví dụ `/preview-3d`).
 * Không được import từ app shell (chỉ dev): file này import cả SceneCanvas lẫn Poster.
 * Cách dùng: trong một route dev: `const Preview = lazy(() => import("@/three/Preview"))`.
 */
import { useMemo } from "react";
import { PLANET_ORDER } from "@/shared/planets";
import type { PlanetId } from "@/shared/types";
import { useScene, type SceneMode } from "@/state/scene";
import { averageLit } from "./scene/tokens";
import SceneCanvas from "./SceneCanvas";
import { PlanetBackdrop, PlanetPoster, StarMark } from "./Poster";

const MODES: { value: SceneMode; label: string }[] = [
  { value: "intro", label: "Intro" },
  { value: "landing", label: "Landing" },
  { value: "launch", label: "Launch" },
  { value: "planet", label: "Planet" },
  { value: "flight", label: "Flight" },
  { value: "finale", label: "Finale" },
];

const TIERS = ["high", "mid", "low"] as const;

const buttonStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.06)",
  color: "#f4f6fb",
  fontSize: 12,
  cursor: "pointer",
} as const;

export default function ScenePreview() {
  const scene = useScene();
  const litAvg = useMemo(() => Math.max(0.12, Math.min(1, averageLit(scene.lit))), [scene.lit]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#030718", color: "#f4f6fb", overflow: "auto" }}>
      <SceneCanvas />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "max(12px, env(safe-area-inset-top)) 14px 90px",
          pointerEvents: "none",
        }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StarMark size={26} />
          <strong style={{ fontSize: 14, letterSpacing: "0.03em" }}>Preview 3D / 2.5D</strong>
        </header>

        <section style={{ display: "flex", flexWrap: "wrap", gap: 8, pointerEvents: "auto" }}>
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              style={{
                ...buttonStyle,
                borderColor: scene.mode === item.value ? "rgba(250,166,52,0.8)" : "rgba(255,255,255,0.22)",
                background: scene.mode === item.value ? "rgba(250,166,52,0.18)" : "rgba(255,255,255,0.06)",
              }}
              onClick={() => {
                scene.setMode(item.value);
                if (item.value === "launch") scene.setPlanet(null);
                else if (!scene.planet) scene.setPlanet("K");
              }}
            >
              {item.label}
            </button>
          ))}
        </section>

        <section style={{ display: "flex", flexWrap: "wrap", gap: 8, pointerEvents: "auto" }}>
          <button
            type="button"
            style={{ ...buttonStyle, borderColor: "rgba(79,209,197,0.55)" }}
            onClick={() => scene.startFlight({ from: scene.planet ?? "S", to: "K" })}
          >
            Flight → K
          </button>
          <button
            type="button"
            style={{ ...buttonStyle, borderColor: "rgba(239,65,35,0.6)" }}
            onClick={() => scene.startFlight({ from: scene.planet ?? "IM", to: "venus" })}
          >
            Flight → Venus
          </button>
          <button type="button" style={{ ...buttonStyle }} onClick={() => scene.endFlight()}>
            End flight
          </button>
        </section>

        <section style={{ display: "flex", flexWrap: "wrap", gap: 8, pointerEvents: "auto" }}>
          {PLANET_ORDER.map((planet) => (
            <button
              key={planet}
              type="button"
              style={{
                ...buttonStyle,
                borderColor: scene.planet === planet ? "rgba(122,140,255,0.85)" : "rgba(255,255,255,0.22)",
                background: scene.planet === planet ? "rgba(122,140,255,0.2)" : "rgba(255,255,255,0.06)",
              }}
              onClick={() => {
                scene.setPlanet(planet as PlanetId);
                if (scene.mode === "landing" || scene.mode === "launch") scene.setMode("planet");
              }}
            >
              {planet}
            </button>
          ))}
        </section>

        <section style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
          <span style={{ fontSize: 12, color: "#c9d2e6" }}>lit</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(((scene.lit.atmosphere - 0.1) / 0.9) * 100)}
            onChange={(event) => {
              const value = Number(event.target.value) / 100;
              const level = 0.1 + value * 0.9;
              scene.setLit({
                atmosphere: level,
                rotation: level,
                surface: level,
                signal: level,
                satellites: level,
              });
            }}
            style={{ width: 180, pointerEvents: "auto" }}
          />
          <button type="button" style={{ ...buttonStyle, pointerEvents: "auto" }} onClick={() => scene.resetLit()}>
            reset
          </button>
        </section>

        <section style={{ display: "flex", flexWrap: "wrap", gap: 8, pointerEvents: "auto" }}>
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              style={{
                ...buttonStyle,
                borderColor: scene.quality === tier ? "rgba(79,209,197,0.85)" : "rgba(255,255,255,0.22)",
                background: scene.quality === tier ? "rgba(79,209,197,0.18)" : "rgba(255,255,255,0.06)",
              }}
              onClick={() => scene.setQuality(tier)}
            >
              {tier}
            </button>
          ))}
          <button
            type="button"
            style={{ ...buttonStyle, pointerEvents: "auto" }}
            onClick={() => scene.setReducedMotion(!scene.reducedMotion)}
          >
            reduced-motion: {scene.reducedMotion ? "on" : "off"}
          </button>
        </section>

        <section style={{ display: "flex", gap: 10, flexWrap: "wrap", pointerEvents: "auto" }}>
          {PLANET_ORDER.map((planet) => (
            <div
              key={planet}
              style={{
                width: 96,
                padding: 6,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(3,7,24,0.6)",
              }}
            >
              <PlanetPoster planet={planet as PlanetId} lit={litAvg} size={84} />
              <div style={{ textAlign: "center", fontSize: 10, color: "#8e9bb8" }}>{planet}</div>
            </div>
          ))}
        </section>

        <section style={{ display: "flex", gap: 10, flexWrap: "wrap", pointerEvents: "auto" }}>
          <div style={{ width: 150, height: 200, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
            <PlanetPoster
              planet={(scene.planet ?? "K") as PlanetId}
              lit={litAvg}
              size={150}
              showLogo
              brandName={scene.brandName || "Thương hiệu của bạn"}
              logoUrl={scene.logoUrl}
            />
          </div>
          <div style={{ width: 150, height: 200, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
            <PlanetBackdrop
              planet={(scene.planet ?? "K") as PlanetId}
              lit={litAvg}
              brandName={scene.brandName || "Thương hiệu của bạn"}
              logoUrl={scene.logoUrl}
              mode={scene.mode}
              flightTo={scene.mode === "flight" ? (scene.flight?.to ?? null) : null}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export { ScenePreview };
