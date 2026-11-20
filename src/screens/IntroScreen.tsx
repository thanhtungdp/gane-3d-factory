import { useEffect, useRef, useState } from "react";
import { Button } from "@/ui/Controls";
import { BrandMark } from "@/ui/Brand";
import { KimCompanion, type KimMood } from "@/game/components/KimCompanion";
import { useScene } from "@/state/scene";
import { track } from "@/lib/analytics";
import { site } from "@/config/site";
import {
  IconArrowRight,
  IconGrid,
  IconRefresh,
  IconRocket,
  IconScan,
  IconStar,
} from "@/ui/Icons";

const STEPS = [
  "Bắt đầu từ website của bạn.",
  "S — Nhìn lại tín hiệu thật trước khi tin vào cảm giác.",
  "A — Chọn một hướng, và dám bỏ những hướng còn lại.",
  "O · K · IM — Đồng bộ nhận diện, ra mắt, giữ lửa 12 tháng.",
  "Kết thúc: bản đồ thương hiệu của riêng bạn.",
] as const;

const LIT_STEPS = [
  { atmosphere: 0.1, rotation: 0.1, surface: 0.1, signal: 0.1, satellites: 0.1 },
  { atmosphere: 0.55, rotation: 0.2, surface: 0.15, signal: 0.12, satellites: 0.1 },
  { atmosphere: 0.7, rotation: 0.75, surface: 0.35, signal: 0.2, satellites: 0.15 },
  { atmosphere: 0.85, rotation: 0.85, surface: 0.8, signal: 0.75, satellites: 0.7 },
  { atmosphere: 1, rotation: 1, surface: 1, signal: 1, satellites: 1 },
] as const;

const STATIONS = [
  { letter: "S", label: "Quét", Icon: IconScan },
  { letter: "A", label: "Hướng", Icon: IconStar },
  { letter: "O", label: "Đồng bộ", Icon: IconGrid },
  { letter: "K", label: "Ra mắt", Icon: IconRocket },
  { letter: "IM", label: "Giữ lửa", Icon: IconRefresh },
] as const;

export function IntroScreen({
  replay = false,
  onFinish,
}: {
  replay?: boolean;
  onFinish: (reason: "cta" | "skip") => void;
}) {
  const reduced = useScene((s) => s.reducedMotion);
  const quality = useScene((s) => s.quality);
  const lowTier = quality === "low";
  const instant = reduced || lowTier;
  const [step, setStep] = useState(instant ? 4 : 0);
  const [ctaReady, setCtaReady] = useState(instant);
  const doneRef = useRef(false);
  const startedRef = useRef(Date.now());
  const trackedRef = useRef(false);

  useEffect(() => {
    if (instant) {
      setStep(4);
      setCtaReady(true);
    }
    const scene = useScene.getState();
    scene.setMode("intro");
    scene.setPlanet("O");
    scene.setLit(LIT_STEPS[0]);
    if (!trackedRef.current) {
      trackedRef.current = true;
      track("intro_view", { replay, reduced: instant });
    }

    const timers: number[] = [];
    if (!instant) {
      site.timing.introStepsMs.forEach((ms, index) => {
        timers.push(
          window.setTimeout(() => {
            setStep(index);
            useScene.getState().setLit(LIT_STEPS[index] ?? LIT_STEPS[LIT_STEPS.length - 1]!);
          }, ms),
        );
      });
      timers.push(window.setTimeout(() => setCtaReady(true), site.timing.introCtaMs));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      const current = useScene.getState();
      current.resetLit();
      current.setPlanet(null);
    };
  }, [instant, replay]);

  useEffect(() => {
    if (!instant) return;
    setStep(4);
    setCtaReady(true);
    useScene.getState().setLit(LIT_STEPS[4]);
  }, [instant]);

  function finish(reason: "cta" | "skip") {
    if (doneRef.current) return;
    doneRef.current = true;
    track(reason === "cta" ? "intro_complete" : "intro_skip", {
      replay,
      reduced: instant,
      step,
      ms: Date.now() - startedRef.current,
    });
    onFinish(reason);
  }

  const litCount = step <= 0 ? 0 : step === 1 ? 1 : step === 2 ? 2 : 5;
  const mood: KimMood = step >= 4 ? "happy" : "curious";

  return (
    <div className={`intro-screen ${replay ? "intro-screen--replay" : ""}`} data-testid="intro-screen">
      <div className="intro-scrim" aria-hidden="true" />
      {lowTier ? (
        <div className="intro-css-orbit" data-testid="intro-css-rocket" aria-hidden="true">
          <span>
            <IconRocket size={26} />
          </span>
        </div>
      ) : null}

      <header className="intro-header">
        <BrandMark height={22} />
        <button
          type="button"
          className="intro-skip"
          onClick={() => finish("skip")}
          data-testid="intro-skip"
        >
          Bỏ qua
        </button>
      </header>

      <main className="intro-main">
        <div className="intro-copy">
          <p className="eyebrow">HÀNH TRÌNH SAO KIM · 5 TRẠM</p>
          <h1 className="intro-title">
            Mỗi doanh nghiệp
            <br />
            là một hành tinh đang ngủ.
          </h1>
          <p className="intro-lead">
            Nhập website, KIM đọc tín hiệu công khai. Bạn đi qua 5 trạm để thắp sáng thương hiệu của mình.
          </p>
        </div>

        <div className="intro-caption" role="status" aria-live="polite" data-testid="intro-caption">
          <KimCompanion size={36} mood={mood} speaking={!ctaReady} className="shrink-0" />
          <p>{STEPS[step] ?? STEPS[STEPS.length - 1]}</p>
        </div>

        <ol className="intro-rail" aria-label="Năm trạm của hành trình">
          {STATIONS.map((station, index) => {
            const isLit = index < litCount;
            return (
              <li
                key={station.letter}
                className={`intro-rail__item ${isLit ? "is-lit" : ""} ${index === litCount - 1 ? "is-current" : ""}`}
                data-testid={`intro-step-${index}`}
                data-lit={isLit ? "true" : "false"}
                aria-current={index === litCount - 1 ? "step" : undefined}
              >
                <span className="intro-rail__icon" aria-hidden="true">
                  <station.Icon size={18} />
                </span>
                <b>{station.letter}</b>
                <span>{station.label}</span>
              </li>
            );
          })}
        </ol>
      </main>

      <footer className="intro-footer">
        {ctaReady ? (
          <div className="intro-cta" data-testid="intro-cta-wrap">
            <Button
              variant="primary"
              block
              onClick={() => finish("cta")}
              data-testid="intro-cta"
            >
              Bắt đầu hành trình <IconArrowRight size={18} className="arrow" />
            </Button>
            <p className="intro-micro">Bước tiếp theo: nhập website doanh nghiệp.</p>
          </div>
        ) : (
          <div className="intro-wait" aria-hidden="true">
            <span />
          </div>
        )}
      </footer>
    </div>
  );
}
