import { useEffect, useRef, useState } from "react";
import { useRun } from "@/state/run";
import { useScene, type FlightTarget } from "@/state/scene";
import { PLANET_META, PLANET_ORDER } from "@/shared/planets";
import type { PlanetId } from "@/shared/types";
import { LogoImage } from "@/ui/Brand";
import { Button } from "@/ui/Controls";
import { IconArrowRight, IconRocket } from "@/ui/Icons";
import { track } from "@/lib/analytics";
import { haptic, HAPTIC } from "@/lib/haptics";

export interface FlightPlan {
  from: PlanetId | null;
  to: FlightTarget;
}

const VENUS_LABEL = "Sao Kim";

function labelFor(target: FlightTarget): string {
  return target === "venus" ? VENUS_LABEL : PLANET_META[target].world;
}

/**
 * Màn hình chuyến bay full-screen: 3D scene bên dưới tự animate tên lửa theo
 * useScene.flight; overlay này giữ nhịp takeoff → cruise → landing và chỉ
 * gọi onLanded khi đã hạ cánh.
 */
export function FlightScreen({
  plan,
  onLanded,
  onSkip,
}: {
  plan: FlightPlan;
  onLanded: () => void;
  onSkip: () => void;
}) {
  const quality = useScene((s) => s.quality);
  const soundOn = useScene((s) => s.soundOn);
  const reduced = useScene((s) => s.reducedMotion);
  const brand = useRun((s) => s.brand);
  const [phase, setPhase] = useState<"takeoff" | "cruise" | "landing">("takeoff");
  const doneRef = useRef(false);
  const duration = reduced ? 650 : 2900;

  useEffect(() => {
    const scene = useScene.getState();
    scene.startFlight({ from: plan.from, to: plan.to, duration });
    if (soundOn) {
      void import("@/lib/audio")
        .then((a) => {
          a.setAmbience(null);
          a.playSfx("launch");
          window.setTimeout(() => a.playSfx("warp"), 650);
          window.setTimeout(() => a.playSfx("landing"), Math.max(700, duration - 650));
        })
        .catch(() => undefined);
    }
    haptic(HAPTIC.launch);
    track("flight_start", { from: plan.from ?? "start", to: plan.to });

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      haptic([10, 40, 20]);
      useScene.getState().endFlight();
      track("flight_complete", { to: plan.to });
      onLanded();
    };
    const cruiseTimer = window.setTimeout(() => setPhase("cruise"), reduced ? 120 : 700);
    const landingTimer = window.setTimeout(() => setPhase("landing"), reduced ? 380 : 2100);
    const finishTimer = window.setTimeout(finish, duration);
    return () => {
      window.clearTimeout(cruiseTimer);
      window.clearTimeout(landingTimer);
      window.clearTimeout(finishTimer);
      useScene.getState().endFlight();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function skip() {
    if (doneRef.current) return;
    doneRef.current = true;
    track("flight_skip", { to: plan.to });
    useScene.getState().endFlight();
    onSkip();
  }

  const fromLabel = plan.from ? PLANET_META[plan.from].world : "Quỹ đạo khởi hành";
  const toLabel = labelFor(plan.to);
  const progress = phase === "takeoff" ? 18 : phase === "cruise" ? 56 : 88;

  return (
    <div className="flight-screen" data-testid="flight-screen" data-quality={quality}>
      <div className="flight-vignette" aria-hidden />
      <div className="flight-hud">
        <div className="eyebrow">
          <span className="dot text-amber" /> Chuyến bay {PLANET_ORDER.indexOf(plan.to as PlanetId) + 1 || 5}/5
        </div>
        <h1 className="flight-route" data-testid="flight-route">
          {fromLabel} <IconArrowRight size={18} /> {toLabel}
        </h1>
        <p className="flight-phase">
          {phase === "takeoff"
            ? "Cất cánh khỏi trạm…"
            : phase === "cruise"
              ? "Đang bay qua vùng tối…"
              : `Đang hạ cánh xuống ${toLabel}`}
        </p>
        <div className="flight-progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="flight-meta">
          <span className="mono-num">T+ {phase === "takeoff" ? "00:01" : phase === "cruise" ? "00:02" : "00:03"}</span>
          <span className="row gap-1.5">
            <span className={`dot ${phase === "landing" ? "text-[#4fd1c5]" : "text-amber"}`} />
            {phase === "landing" ? "Chạm bề mặt" : "Ổn định quỹ đạo"}
          </span>
        </div>
      </div>


      {quality === "low" ? (
        <div className={`flight-rocket ${reduced ? "is-reduced" : ""}`} aria-hidden style={{ animationDuration: `${duration}ms` }}>
          <div className="flight-rocket__body">
            {brand ? <LogoImage brand={brand} size={30} /> : <IconRocket size={26} />}
          </div>
          <div className="flight-rocket__flame" />
        </div>
      ) : null}

      <div className="flight-controls">
        <Button variant="ghost" onClick={skip} data-testid="flight-skip">
          Bỏ qua chuyến bay
        </Button>
      </div>
    </div>
  );
}
