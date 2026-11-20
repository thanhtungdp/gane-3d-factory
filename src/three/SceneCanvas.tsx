/**
 * SceneCanvas — nơi DUY NHẤT của src/three import three/R3F.
 *
 * - fixed full-screen, pointer-events: none; Lead mount trong `.scene-layer`.
 * - Đọc toàn bộ trạng thái từ `useScene` (mode, planet, brand, palette, lit, quality).
 * - Tier `low` (hoặc không có WebGL2): không dựng canvas, trả poster/CSS 2.5D.
 * - Dọn dẹp: R3F tự dispose geometry/material khi unmount; texture tự tạo
 *   (decal, nebula, glow) được dispose trong effect cleanup ở component con.
 */
import { Canvas } from "@react-three/fiber";
import { useScene } from "@/state/scene";
import { useQualityWatch } from "@/lib/quality";
import { averageLit, TIER_3D } from "./scene/tokens";
import { CameraRig } from "./scene/CameraRig";
import { PlanetBody } from "./scene/Planet";
import { Ship } from "./scene/Ship";
import { SpaceBackdrop } from "./scene/SpaceBackdrop";
import { Star4 } from "./scene/Star4";
import { PlanetBackdrop } from "./Poster";

export interface SceneCanvasProps {
  className?: string;
}

const FILL = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
  background: "transparent",
} as const;

export default function SceneCanvas({ className }: SceneCanvasProps) {
  const quality = useQualityWatch();
  const mode = useScene((s) => s.mode);
  const planet = useScene((s) => s.planet);
  const brandName = useScene((s) => s.brandName);
  const logoUrl = useScene((s) => s.logoUrl);
  const lit = useScene((s) => s.lit);
  const flight = useScene((s) => s.flight);

  // Tier low: không tạo WebGL context. Chunk three vẫn được lazy-load bởi Lead,
  // nhưng ưu tiên dùng `PlanetBackdrop` trực tiếp ở map/report để khỏi tải three.
  if (quality.low) {
    return (
      <div className={className} style={FILL} aria-hidden data-scene="fallback">
        <PlanetBackdrop
          planet={planet ?? "S"}
          lit={Math.max(0.38, Math.min(1, averageLit(lit) * 1.15))}
          brandName={mode === "flight" ? undefined : brandName || undefined}
          logoUrl={logoUrl}
          mode={mode}
          flightTo={mode === "flight" ? (flight?.to ?? null) : null}
        />
      </div>
    );
  }

  const config = TIER_3D[quality.tier];
  const reduced = quality.reducedMotion;

  return (
    <div className={className} style={FILL} aria-hidden data-scene="canvas">
      <Canvas
        dpr={[1, config.dpr]}
        gl={{
          antialias: config.antialias,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 50, near: 0.1, far: 140, position: [0, 1.2, 9] }}
        frameloop="always"
        flat
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
        }}
      >
        <SpaceBackdrop tier={quality.tier} reduced={reduced} />
        <PlanetBody tier={quality.tier} reduced={reduced} />
        <Star4 reduced={reduced} />
        <Ship reduced={reduced} />
        <CameraRig reduced={reduced} />
      </Canvas>
      {/* scrim nhẹ để text trắng phía trên luôn đọc được trên hành tinh sáng.
          Launch có nền trời tối sẵn nên scrim nhẹ hơn để sao 4 cánh vẫn rực. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            mode === "launch"
              ? "linear-gradient(180deg, rgba(3,7,24,0.34) 0%, rgba(3,7,24,0.16) 22%, rgba(3,7,24,0.04) 44%, rgba(3,7,24,0) 62%), radial-gradient(130% 90% at 50% 118%, rgba(3,7,24,0.42) 0%, rgba(3,7,24,0) 62%)"
              : "linear-gradient(180deg, rgba(3,7,24,0.72) 0%, rgba(3,7,24,0.44) 20%, rgba(3,7,24,0.12) 42%, rgba(3,7,24,0) 60%), radial-gradient(130% 90% at 50% 118%, rgba(3,7,24,0.5) 0%, rgba(3,7,24,0) 62%)",
        }}
      />
    </div>
  );
}

export { SceneCanvas };
