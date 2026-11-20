import { PLANET_META, PLANET_ORDER } from "@/shared/planets";
import type { PlanetId, PlanetResult } from "@/shared/types";
import { PlanetOrb } from "@/ui/PlanetOrb";
import { StarGem } from "@/ui/StarGem";
import { IconCheck, IconLock, IconRocket } from "@/ui/Icons";

const POSITIONS: Record<PlanetId, { left: string; top: string }> = {
  S: { left: "11%", top: "70%" },
  A: { left: "27%", top: "39%" },
  O: { left: "43%", top: "66%" },
  K: { left: "59%", top: "34%" },
  IM: { left: "75%", top: "60%" },
};

/**
 * Sân khấu quỹ đạo desktop. Chỉ render ở ≥1200px; mobile giữ danh sách dọc.
 * Mọi thao tác vẫn gọi cùng callback với list.
 */
export function MapOrbit({
  results,
  available,
  allDone,
  onOpenPlanet,
  onFinale,
}: {
  results: Partial<Record<PlanetId, PlanetResult>>;
  available: PlanetId | null;
  allDone: boolean;
  onOpenPlanet: (planet: PlanetId) => void;
  onFinale: () => void;
}) {
  return (
    <div className="map-orbit" data-testid="map-orbit">
      <div className="map-orbit__glow" aria-hidden />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="map-orbit__path" aria-hidden>
        <path
          d="M 11 70 C 18 30, 22 30, 27 39 S 38 78, 43 66 S 56 26, 59 34 S 72 70, 75 60 S 84 28, 89 22"
          fill="none"
          stroke="rgba(255,255,255,.16)"
          strokeWidth="0.45"
          strokeDasharray="1.3 1.8"
        />
      </svg>

      {PLANET_ORDER.map((id, index) => {
        const meta = PLANET_META[id];
        const result = results[id];
        const locked = !result && available !== id;
        const isAvailable = available === id;
        return (
          <button
            key={id}
            type="button"
            className={`map-orbit__node ${locked ? "is-locked" : ""} ${isAvailable ? "is-available" : ""} ${
              result ? "is-done" : ""
            }`}
            style={POSITIONS[id]}
            disabled={locked || Boolean(result)}
            onClick={() => onOpenPlanet(id)}
            aria-label={
              result
                ? `${meta.world}, đã hoàn thành, ${result.score.toFixed(1)} trên 10`
                : locked
                  ? `${meta.world}, chưa mở`
                  : `Bay tới ${meta.world}`
            }
            data-testid={`orbit-node-${id}`}
          >
            <span className="map-orbit__orb">
              <PlanetOrb
                planet={id}
                lit={result ? Math.max(0.4, result.score / 10) : isAvailable ? 0.3 : 0.12}
                size={92}
              />
              {isAvailable ? (
                <span className="map-orbit__rocket">
                  <IconRocket size={14} />
                </span>
              ) : null}
            </span>
            <span className="map-orbit__label">
              <b style={{ color: meta.color }}>{id}</b> {meta.world}
            </span>
            <span className="map-orbit__sub">
              {result ? (
                <>
                  <IconCheck size={11} /> {result.score.toFixed(1)}/10
                </>
              ) : locked ? (
                <>
                  <IconLock size={10} /> Chưa mở
                </>
              ) : (
                `Trạm ${index + 1} · ~90 giây`
              )}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        className={`map-orbit__node map-orbit__node--venus ${allDone ? "is-available" : "is-locked"}`}
        style={{ left: "88%", top: "18%" }}
        disabled={!allDone}
        onClick={onFinale}
        aria-label={allDone ? "Bay tới Sao Kim" : "Sao Kim chưa mở"}
        data-testid="orbit-node-finale"
      >
        <span className="map-orbit__orb">
          <StarGem size={90} glow={allDone} opacity={allDone ? 1 : 0.5} />
        </span>
        <span className="map-orbit__label">Sao Kim</span>
        <span className="map-orbit__sub">{allDone ? "Đích đến · Mở" : "Cần 5 lớp sáng"}</span>
      </button>

      <div className="map-orbit__hint">
        <span className="dot text-amber" /> Chạm một hành tinh để cất cánh
      </div>
    </div>
  );
}
