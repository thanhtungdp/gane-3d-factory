import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { PLANET_CONTENT } from "@/game/content";
import { kimPlanetLine } from "@/game/content/kim";
import { KimCompanion, KimSpeech } from "@/game/components/KimCompanion";
import { PLANET_META, nextPlanet, PLANET_ORDER } from "@/shared/planets";
import { isRealityCheck, scorePlanet, starsFor } from "@/shared/scoring";
import type { DecisionRecord, PlanetId, PlanetResult } from "@/shared/types";
import type { PlanetGameComplete } from "@/shared/game";
import { Button, ScoreBar, StarRating } from "@/ui/Controls";
import { Sheet } from "@/ui/Sheet";
import { PlanetOrb } from "@/ui/PlanetOrb";
import { IconArrowLeft, IconArrowRight, IconCheck, IconRocket, IconSparkle } from "@/ui/Icons";
import { saveProgress } from "@/lib/api";
import { track } from "@/lib/analytics";
import { HAPTIC, haptic } from "@/lib/haptics";
import { useIsConsole, useIsDesktop } from "@/lib/useViewport";
import { IconChevronRight } from "@/ui/Icons";

const PlanetGame = lazy(() =>
  import("@/game/PlanetGame").then((m) => ({ default: m.PlanetGame })),
);

class GameBoundary extends Component<{ children: ReactNode; onSkip: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="p-4 text-center">
        <p className="body">Trạm này gặp lỗi hiển thị trên thiết bị của bạn.</p>
        <Button variant="ghost" className="mt-3" onClick={this.props.onSkip}>
          Đi tiếp
        </Button>
      </div>
    );
  }
}

function fill(text: string, brand: string): string {
  return text.replaceAll("{brand}", brand);
}

export function PlanetHostScreen({ onTakeoff }: { onTakeoff: (target: PlanetId | "venus") => void }) {
  const planet = useRun((s) => s.currentPlanet);
  const brand = useRun((s) => s.brand);
  const preScan = useRun((s) => s.preScan);
  const answers = useRun((s) => s.answers);
  const results = useRun((s) => s.results);
  const decisions = useRun((s) => s.decisions);
  const soundOn = useScene((s) => s.soundOn);
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [result, setResult] = useState<PlanetResult | null>(planet ? (results[planet] ?? null) : null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isDesktop = useIsDesktop();
  const isConsole = useIsConsole();
  const completedRef = useRef(false);

  useEffect(() => {
    if (!planet) return;
    const scene = useScene.getState();
    scene.setPlanet(planet);
    scene.setMode("planet");
    if (soundOn) {
      void import("@/lib/audio").then((a) => a.setAmbience(planet)).catch(() => undefined);
    }
    return () => {
      if (soundOn) {
        void import("@/lib/audio").then((a) => a.setAmbience(null)).catch(() => undefined);
      }
    };
  }, [planet, soundOn]);

  if (!planet || !brand || !preScan) {
    return (
      <div className="screen screen--center">
        <div className="content content--narrow glass panel text-center">
          <p className="body">Chưa chọn trạm nào.</p>
          <Button variant="ghost" className="mt-4" onClick={() => useRun.getState().setScreen("map")}>
            Về bản đồ
          </Button>
        </div>
      </div>
    );
  }

  const pid: PlanetId = planet;
  const meta = PLANET_META[pid];
  const content = PLANET_CONTENT[pid];
  const records = decisions[pid] ?? [];
  const decisionTotal = content.decisions.length;
  const answered = records.length;

  function persistProgress() {
    const st = useRun.getState();
    if (!st.sessionId) return;
    void saveProgress(st.sessionId, {
      currentPlanet: pid,
      completed: PLANET_ORDER.filter((p) => st.results[p]),
      results: st.results,
      decisions: st.decisions,
    }).catch(() => undefined);
  }

  function finish(payload: PlanetGameComplete) {
    if (completedRef.current || !preScan) return;
    completedRef.current = true;
    const fresh = useRun.getState().decisions[pid] ?? [];
    const scored = payload.skipped
      ? scorePlanet(pid, [], content, preScan, {})
      : scorePlanet(pid, fresh, content, preScan, {
          timeBonus: payload.timeBonus,
          crisisFast: payload.crisisFast,
          meter: payload.meter,
        });
    useRun.getState().completePlanet(scored);
    setResult(scored);
    setPhase("result");
    persistProgress();
    haptic(scored.score >= 6 ? HAPTIC.correct : HAPTIC.wrong);
    if (soundOn) {
      void import("@/lib/audio")
        .then((a) => a.playSfx(scored.score >= 6 ? "badge" : "wrong"))
        .catch(() => undefined);
    }
    track("planet_complete", {
      score: scored.score,
      skipped: Boolean(payload.skipped),
      answered: fresh.length,
    }, pid);
  }

  function skipPlanet() {
    setPauseOpen(false);
    finish({ skipped: true });
  }

  function onDecision(record: DecisionRecord) {
    useRun.getState().recordDecision(pid, record);
    persistProgress();
    const decision = content.decisions.find((d) => d.id === record.decisionId);
    const realityCheck = decision ? isRealityCheck(decision, record.points, preScan!) : false;
    track(
      "decision_select",
      {
        decisionId: record.decisionId,
        optionId: record.optionId,
        kind: record.kind,
        points: record.points,
        ms: record.ms,
        realityCheck,
      },
      pid,
    );
  }

  const next = nextPlanet(pid);
  const doneCount = PLANET_ORDER.filter((p) => results[p]).length;
  const allDone = doneCount === PLANET_ORDER.length;
  const badgeEarned = (result?.score ?? 0) >= 6;

  function continueJourney() {
    if (allDone || !next) {
      track("takeoff_next", { from: pid, to: "venus" });
      onTakeoff("venus");
    } else {
      track("takeoff_next", { from: pid, to: next });
      onTakeoff(next);
    }
  }

  return (
    <div className="screen screen--locked" style={{ paddingTop: 0, paddingBottom: 0 }} data-testid="planet-host">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-3 pt-[calc(env(safe-area-inset-top)+10px)]">
        <button
          className="icon-btn pointer-events-auto"
          onClick={() => setPauseOpen(true)}
          aria-label="Tạm dừng"
          data-testid="pause-button"
        >
          <IconArrowLeft size={18} />
        </button>
        <div className="rounded-2xl border border-white/10 bg-[#030718]/45 px-3 py-1.5 text-center backdrop-blur-md">
          <div className="text-[9px] font-bold tracking-[0.22em] text-white/40">
            {meta.letter} · {meta.stepName.toUpperCase()}
          </div>
          <div className="text-[12px] font-semibold text-silver">{meta.world}</div>
        </div>
        <div className="w-11" />
      </header>

      <div
        className="pointer-events-none absolute inset-x-0 top-[86px] z-20 px-6 text-center"
        aria-hidden
      >
        <p className="hidden text-[11px] tracking-wide text-white/40 min-[900px]:block">{meta.worldTag}</p>
      </div>

      <div
        className={`planet-panel ${phase === "playing" ? "is-playing" : phase === "result" ? "is-result" : "is-intro"} ${
          collapsed ? "is-collapsed" : ""
        }`}
        style={{
          background: "linear-gradient(180deg, rgba(10,18,50,.94), rgba(4,8,26,.99))",
        }}
      >
        {isConsole ? (
          <div className="planet-panel__bar">
            <span className="eyebrow">Bảng điều khiển</span>
            {isDesktop ? (
              <button
                type="button"
                className="planet-panel__collapse"
                onClick={() => setCollapsed(true)}
                aria-label="Thu gọn bảng điều khiển"
                data-testid="planet-console-collapse"
              >
                <IconChevronRight size={15} />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="planet-panel__grab" aria-hidden />
        )}

        {phase !== "playing" ? (
          <div className="flex items-center gap-3 px-4 pt-2">
            <PlanetOrb planet={pid} lit={phase === "result" ? Math.max(0.25, (result?.score ?? 0) / 10) : 0.25} size={34} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-silver">
                {phase === "intro" ? "Tín hiệu mới" : "Trạm hoàn tất"}
              </div>
              <div className="flex gap-1.5 pt-1" aria-label={`${answered}/${decisionTotal} quyết định`}>
                {Array.from({ length: decisionTotal }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{ background: i < answered ? meta.color : "rgba(255,255,255,.12)" }}
                  />
                ))}
              </div>
            </div>
            <span className="pill shrink-0">{phase === "result" ? `${(result?.score ?? 0).toFixed(1)}/10` : `${answered}/${decisionTotal}`}</span>
          </div>
        ) : null}

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
          phase === "playing" ? "px-0 pb-0" : "px-4 pb-[calc(env(safe-area-inset-bottom)+18px)]"
        }`}
      >
          {phase === "intro" ? (
            <div className="flex min-h-0 flex-1 flex-col" data-testid="planet-intro">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex items-start gap-3 pt-3">
                  <KimCompanion size={62} mood="happy" speaking className="shrink-0" />
                  <div className="min-w-0 space-y-2 pt-1">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-amber/90">KIM ĐANG NÓI</div>
                    {content.intro.map((line, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "text-[14px] font-medium leading-relaxed text-silver"
                            : "text-[12.5px] leading-relaxed text-silver-dim"
                        }
                      >
                        {fill(line, brand.name)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="shrink-0 pt-3">
                <Button variant="primary" block onClick={() => setPhase("playing")} data-testid="continue">
                  Bắt đầu trạm {meta.letter} <IconArrowRight size={18} className="arrow" />
                </Button>
              </div>
            </div>
          ) : phase === "playing" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1">
                <GameBoundary onSkip={skipPlanet}>
                  <Suspense
                    fallback={
                      <div className="grid place-items-center py-10 text-center">
                        <div className="pulse-soft">
                          <PlanetOrb planet={pid} lit={0.3} size={56} />
                        </div>
                        <p className="small mt-3">Đang nạp trạm {meta.letter}…</p>
                      </div>
                    }
                  >
                    <PlanetGame
                      planet={pid}
                      brand={brand}
                      preScan={preScan}
                      answers={answers}
                      onDecision={onDecision}
                      onComplete={finish}
                    />
                  </Suspense>
                </GameBoundary>
              </div>
            </div>
          ) : result ? (
            <div className="flex min-h-0 flex-1 flex-col" data-testid="badge">
              <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
              <div className="pt-3">
                <KimSpeech
                  text={kimPlanetLine(pid, result.score, brand.name).replace(/\s*Điểm trạm:.*$/i, "")}
                  mood={badgeEarned ? "happy" : "thinking"}
                  size={46}
                />
              </div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <div className="eyebrow">
                    <IconSparkle size={12} className="text-amber" /> Lớp sáng mới
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="mono-num text-[42px] font-bold leading-none text-silver">
                      {result.score.toFixed(1)}
                    </span>
                    <span className="text-[13px] text-muted">/10</span>
                  </div>
                  <div className="mt-1.5">
                    <StarRating value={starsFor(result.score)} size={14} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="pill pill--live">
                    <IconCheck size={11} /> {result.skipped ? "Đã bỏ qua" : "Hoàn thành"}
                  </div>
                  <div className="small mt-2">
                    {badgeEarned ? `Huy hiệu ${doneCount}/5` : `Chưa đủ 6/10 để nhận huy hiệu`}
                  </div>
                </div>
              </div>

              <div className="panel--flat mt-3 p-3">
                <ScoreBar value={result.score} color={meta.color} />
                <div className="mt-2 flex justify-between text-[10.5px] text-muted">
                  <span>Kiến thức {result.knowledge.toFixed(1)}/10</span>
                  <span>Tự soi {result.diagnosis.toFixed(1)}/10</span>
                  {typeof result.meter === "number" ? <span>Nhất quán {result.meter.toFixed(1)}/10</span> : null}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${
                    badgeEarned ? "border-amber/40 bg-amber/10 text-amber" : "border-white/10 bg-white/[.03] text-muted"
                  }`}
                >
                  <IconSparkle size={18} />
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold text-silver">
                    {badgeEarned ? content.badge.name : "Chưa có huy hiệu trạm này"}
                  </div>
                  <div className="text-[10.5px] text-muted">
                    {badgeEarned ? content.badge.blurb : "Bạn vẫn đi tiếp được — vùng này sẽ tối hơn trên bản đồ."}
                  </div>
                </div>
              </div>

              <div className="panel--flat mt-3 p-3">
                <div className="text-[9.5px] font-bold tracking-[0.18em] text-amber/90">BẠN CÓ BIẾT…</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                  {(() => {
                    const t = fill(content.insight, brand.name).replace(/^Bạn có biết…\s*/i, "");
                    return t.charAt(0).toUpperCase() + t.slice(1);
                  })()}
                </p>
              </div>


              </div>

              <div className="shrink-0 pt-3">
                <Button variant="primary" block onClick={continueJourney} data-testid="continue">
                  {allDone || !next ? (
                    <>
                      <IconRocket size={18} /> Đến Sao Kim
                    </>
                  ) : (
                    <>
                      Cất cánh đến {PLANET_META[next].world} <IconArrowRight size={18} className="arrow" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isDesktop && collapsed ? (
        <button
          type="button"
          className="planet-panel__reopen"
          onClick={() => setCollapsed(false)}
          data-testid="planet-console-reopen"
        >
          <IconChevronRight size={14} /> Bảng điều khiển
        </button>
      ) : null}

      <Sheet
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        eyebrow={meta.world}
        title="Tạm dừng hành trình"
        testId="pause-sheet"
      >
        <p className="body">
          Tiến trình được lưu tự động. Bạn có thể quay lại bản đồ và tiếp tục trạm này sau.
        </p>
        <div className="mt-5 grid gap-2">
          <Button variant="primary" block onClick={() => setPauseOpen(false)}>
            Tiếp tục chơi
          </Button>
          <Button
            variant="ghost"
            block
            onClick={() => {
              setPauseOpen(false);
              persistProgress();
              useRun.getState().setScreen("map");
              useScene.getState().setMode("landing");
            }}
          >
            Về bản đồ
          </Button>
          <Button variant="plain" block onClick={skipPlanet}>
            Bỏ qua trạm này
          </Button>
        </div>
        <p className="small mt-4">
          Bỏ qua sẽ để trạm ở mức 0/10 và làm yếu báo cáo. Chỉ dùng khi bạn thật sự bí.
        </p>
      </Sheet>
    </div>
  );
}
