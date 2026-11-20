import { useEffect } from "react";
import { useRun } from "@/state/run";
import { BrandMark, LogoImage } from "@/ui/Brand";
import { Button, ScoreBar, StarRating } from "@/ui/Controls";
import { IconArrowRight, IconCheck, IconLock, IconMap, IconRocket } from "@/ui/Icons";
import { PlanetOrb } from "@/ui/PlanetOrb";
import { StarGem } from "@/ui/StarGem";
import { PLANET_META, PLANET_ORDER } from "@/shared/planets";
import { partialOverall } from "@/shared/scoring";
import type { PlanetId } from "@/shared/types";
import { prettyDomain } from "@/lib/urls";
import { track } from "@/lib/analytics";
import { MapOrbit } from "./MapOrbit";

export function MapScreen({
  onOpenPlanet,
  onFinale,
}: {
  onOpenPlanet: (planet: PlanetId) => void;
  onFinale: () => void;
}) {
  const brand = useRun((s) => s.brand);
  const results = useRun((s) => s.results);
  const answers = useRun((s) => s.answers);
  const done = PLANET_ORDER.filter((p) => results[p]).length;
  const available = PLANET_ORDER.find((p) => !results[p]) ?? null;
  const overall = partialOverall(results);
  const allDone = done === PLANET_ORDER.length;

  useEffect(() => {
    track("map_view", { done, overall });
  }, [done, overall]);

  if (!brand) return null;

  return (
    <div className="screen map-screen">
      <div className="content map-content pb-28">
        <header className="flex items-center justify-between gap-2 pr-14">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoImage brand={brand} size={34} />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-silver">{brand.name}</div>
              <div className="text-[10.5px] text-muted">{prettyDomain(brand.domain)}</div>
            </div>
          </div>
          <span className="pill pill--amber shrink-0">
            <IconMap size={11} /> Bản đồ
          </span>
        </header>

        <div className="glass panel mt-4" data-testid="health-card">
          <div className="row-between">
            <div>
              <div className="eyebrow">Sức khoẻ thương hiệu</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="mono-num text-[34px] font-bold leading-none text-silver">
                  {overall.toFixed(1)}
                </span>
                <span className="text-[13px] text-muted">/10</span>
              </div>
            </div>
            <div className="text-right">
              <StarRating value={overall / 2} size={15} />
              <div className="small mt-1.5">
                {done}/5 trạm · {answers.companySize} người
              </div>
            </div>
          </div>
          <ScoreBar value={overall} className="mt-3" />
          <p className="small mt-2">
            {done === 0
              ? "Điểm sẽ sáng dần sau mỗi trạm. Không có điểm tuyệt đối — chỉ có chỗ cần quyết."
              : done < 5
                ? "Cập nhật sau mỗi trạm. Hai vùng tối nhất sẽ thành trọng tâm báo cáo."
                : "Hành trình đã đủ 5 lớp sáng. Sao Kim đang chờ."}
          </p>
        </div>

        <div className="map-grid">
          <div className="map-list-column">
        <div className="mt-5 flex items-center justify-between">
          <h1 className="h2">5 trạm thắp sáng</h1>
          <span className="small">~90–120 giây/trạm</span>
        </div>

        <div className="relative mt-4">
          <div className="pointer-events-none absolute bottom-10 left-[38px] top-10 w-px bg-gradient-to-b from-amber/50 via-white/15 to-transparent" />
          <div className="space-y-2.5">
            {PLANET_ORDER.map((id, index) => {
              const meta = PLANET_META[id];
              const result = results[id];
              const isAvailable = available === id;
              const locked = !result && !isAvailable;
              const isLast = index === PLANET_ORDER.length - 1;

              return (
                <div key={id} className="relative">
                  <button
                    className={`glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      locked ? "opacity-45" : ""
                    } ${isAvailable ? "border-amber/45 shadow-[0_0_30px_-12px_rgba(250,166,52,.7)]" : ""}`}
                    onClick={() => {
                      if (result) return;
                      if (locked) return;
                      onOpenPlanet(id);
                    }}
                    disabled={locked || Boolean(result)}
                    aria-label={
                      result
                        ? `${meta.world} đã hoàn thành, ${result.score.toFixed(1)} trên 10`
                        : locked
                          ? `${meta.world} chưa mở`
                          : `Vào ${meta.world}`
                    }
                    data-testid={`planet-node-${id}`}
                  >
                    <div className="relative w-[64px] shrink-0">
                      <PlanetOrb
                        planet={id}
                        lit={result ? Math.max(0.35, result.score / 10) : isAvailable ? 0.28 : 0.12}
                        size={50}
                        logoUrl={brand.logo?.url}
                        showLogo={Boolean(result) && Boolean(brand.logo)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-[0.16em] text-muted">{meta.letter}</span>
                        <span className="truncate text-[13.5px] font-semibold text-silver">{meta.world}</span>
                      </div>
                      <div className="truncate text-[11px] text-muted">
                        {meta.stepName} · {meta.stepVi}
                      </div>
                      <div className="mt-0.5 truncate text-[10.5px] text-white/35">{meta.mapHint}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      {result ? (
                        <div>
                          <div className="mono-num text-[15px] font-bold text-[#a9fff2]">
                            {result.score.toFixed(1)}
                            <span className="text-[9px] font-normal text-muted">/10</span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-end gap-1 text-[9.5px] text-[#4fd1c5]">
                            <IconCheck size={11} /> xong
                          </div>
                        </div>
                      ) : locked ? (
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[.03] text-muted">
                          <IconLock size={13} />
                        </span>
                      ) : (
                        <span className="pill pill--amber">Vào</span>
                      )}
                    </div>
                  </button>
                  {isLast && isAvailable ? (
                    <p className="mt-1 pl-[76px] text-[10px] text-amber/80">Trạm cuối trước khi vào Sao Kim</p>
                  ) : null}
                </div>
              );
            })}

            <div className="relative pt-2">
              <button
                className={`glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                  allDone ? "border-amber/50 shadow-[0_0_40px_-10px_rgba(250,166,52,.75)]" : "opacity-60"
                }`}
                onClick={() => {
                  if (allDone) onFinale();
                }}
                disabled={!allDone}
                aria-label={allDone ? "Đến Sao Kim" : "Sao Kim chưa mở"}
                data-testid="planet-node-finale"
              >
                <div className="grid w-[64px] shrink-0 place-items-center">
                  <StarGem size={54} glow={allDone} opacity={allDone ? 1 : 0.45} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold text-silver">Sao Kim</div>
                  <div className="text-[11px] text-muted">Đích đến · Bản đồ thương hiệu</div>
                  <div className="mt-0.5 text-[10.5px] text-white/35">
                    {allDone ? "Đủ 5 lớp sáng — bước vào" : "Cần 5 lớp sáng để mở"}
                  </div>
                </div>
                <div className="shrink-0">
                  {allDone ? <span className="pill pill--amber">Vào</span> : <IconLock size={14} className="text-muted" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="map-desktop-cta">
          {allDone ? (
            <Button variant="primary" block onClick={onFinale}>
              <IconRocket size={18} /> Bay tới Sao Kim
            </Button>
          ) : available ? (
            <Button variant="primary" block onClick={() => onOpenPlanet(available)}>
              {done === 0 ? "Cất cánh tới trạm S" : `Cất cánh tới ${PLANET_META[available].world}`}{" "}
              <IconArrowRight size={18} className="arrow" />
            </Button>
          ) : null}
        </div>
          </div>

          <MapOrbit
            results={results}
            available={available}
            allDone={allDone}
            onOpenPlanet={onOpenPlanet}
            onFinale={onFinale}
          />
        </div>

        <div className="map-saved-note mt-6 flex items-center justify-center gap-2 text-[10.5px] text-muted">
          <span className="dot text-[#4fd1c5]" /> Tiến trình được lưu tự động trên thiết bị
        </div>
      </div>

      <div className="map-mobile-cta fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-gradient-to-t from-[#030718] via-[#030718]/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <div className="mx-auto w-full max-w-[560px]">
          {allDone ? (
            <Button variant="primary" block onClick={onFinale} data-testid="finale-button">
              <IconRocket size={18} /> Đến Sao Kim
            </Button>
          ) : available ? (
            <Button variant="primary" block onClick={() => onOpenPlanet(available)} data-testid="next-planet-button">
              {done === 0 ? "Bắt đầu trạm S" : `Tiếp tục: ${PLANET_META[available].world}`}{" "}
              <IconArrowRight size={18} className="arrow" />
            </Button>
          ) : null}
          <div className="mt-2 flex items-center justify-center gap-2">
            <BrandMark height={14} className="opacity-35" />
            <span className="text-[9.5px] text-white/25">Hành trình Sao Kim</span>
          </div>
        </div>
      </div>
    </div>
  );
}
