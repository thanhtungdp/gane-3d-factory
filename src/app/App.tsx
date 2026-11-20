import { lazy, Suspense, useEffect, useState } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { loadLastRun, isResumable, type RunSnapshot } from "@/lib/storage";
import { clearIntroParam, markIntroSeen, readIntroPreference } from "@/lib/intro";
import { ApiError, createSession, scanBrand } from "@/lib/api";
import { demoScan } from "@/lib/demo";
import { normalizeWebsite } from "@/lib/urls";
import { setAnalyticsSession, track } from "@/lib/analytics";
import { buildLocalReport } from "@/lib/report";
import { PLANET_ORDER } from "@/shared/planets";
import { CONSENT_VERSION, type PlanetId, type ScanRequest } from "@/shared/types";
import { ErrorBoundary } from "./ErrorBoundary";
import { AudioDirector } from "./AudioDirector";
import { usePersistence } from "./usePersistence";
import { Starfield2D } from "@/ui/Starfield2D";
import { SoundToggle } from "@/ui/SoundToggle";
import { PrivacySheet } from "@/ui/PrivacySheet";
import { LandingScreen } from "@/screens/LandingScreen";
import { IntroScreen } from "@/screens/IntroScreen";
import { ScanningScreen } from "@/screens/ScanningScreen";
import { ConfirmScreen } from "@/screens/ConfirmScreen";
import { LaunchScreen } from "@/screens/LaunchScreen";
import { MapScreen } from "@/screens/MapScreen";
import { PlanetHostScreen } from "@/screens/PlanetHostScreen";
import { FinaleScreen } from "@/screens/FinaleScreen";
import { ReportScreen } from "@/screens/ReportScreen";
import { PublicReportScreen } from "@/screens/PublicReportScreen";
import { LeaderboardScreen } from "@/screens/LeaderboardScreen";
import { FlightScreen, type FlightPlan } from "@/screens/FlightScreen";
import { ManualSheet } from "@/screens/ManualSheet";

const SceneCanvas = lazy(() => import("@/three/SceneCanvas"));

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isDemoMode(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("demo") === "1";
  } catch {
    return false;
  }
}

function detectTier(): void {
  const scene = useScene.getState();
  let tier: "low" | "mid" | "high" = "high";
  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("quality");
    if (forced === "low" || forced === "mid" || forced === "high") tier = forced;
    else {
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      if (nav.connection?.saveData) tier = "low";
      else if ((nav.deviceMemory ?? 8) <= 3) tier = "low";
      else if ((nav.hardwareConcurrency ?? 8) <= 4) tier = "mid";
    }
  } catch {
    tier = "mid";
  }
  scene.setQuality(tier);
  document.documentElement.classList.toggle("tier-low", tier === "low");
  scene.setReducedMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
}

export function App() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const reportMatch = path.match(/^\/r\/([A-Za-z0-9_-]+)\/?$/);
  const isLeaderboard = path.startsWith("/bang-xep-hang");

  return (
    <ErrorBoundary>
      {reportMatch ? (
        <PublicReportScreen id={reportMatch[1]!} />
      ) : isLeaderboard ? (
        <LeaderboardScreen />
      ) : (
        <GameApp />
      )}
    </ErrorBoundary>
  );
}

function GameApp() {
  usePersistence();
  const screen = useRun((s) => s.screen);
  const quality = useScene((s) => s.quality);
  const mode = useScene((s) => s.mode);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [resume, setResume] = useState<RunSnapshot | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<ScanRequest | null>(null);
  const [demo] = useState(isDemoMode);
  const [flight, setFlight] = useState<{ plan: FlightPlan; next: () => void } | null>(null);
  const [introPref] = useState(() => readIntroPreference());
  const [introOpen, setIntroOpen] = useState(introPref.open);
  const [introReplay, setIntroReplay] = useState(false);

  const show3D = introOpen || Boolean(flight) || screen === "launch" || screen === "planet" || screen === "finale";

  useEffect(() => {
    detectTier();
    if (import.meta.env.DEV) {
      const seedAll = async () => {
        const st = useRun.getState();
        if (!st.brand || !st.preScan) return;
        const [{ PLANET_CONTENT }, { scorePlanet }] = await Promise.all([
          import("@/game/content"),
          import("@/shared/scoring"),
        ]);
        const modes = { S: "best", A: "best", O: "mixed", K: "best", IM: "mixed" } as const;
        const results = PLANET_ORDER.map((id, idx) => {
          const content = PLANET_CONTENT[id];
          const mode = modes[id];
          const records = content.decisions.map((d, i) => {
            const sorted = [...d.options].sort((a, b) => b.points - a.points);
            const option =
              mode === "best"
                ? sorted[0]!
                : i % 3 === 0
                  ? sorted[0]!
                  : i % 3 === 1
                    ? sorted[1] ?? sorted[0]!
                    : sorted[2] ?? sorted[0]!;
            return {
              decisionId: d.id,
              optionId: option.id,
              kind: d.kind,
              points: option.points,
              ms: 1200 + idx * 100,
            };
          });
          return scorePlanet(id, records, content, st.preScan!, {
            meter: 6.4,
            timeBonus: 0.6,
            crisisFast: true,
          });
        });
        for (const r of results) useRun.getState().completePlanet(r);

        let report = null;
        try {
          let sessionId = st.sessionId;
          if (!sessionId && st.scan) {
            const { createSession } = await import("@/lib/api");
            const created = await createSession({
              scanId: st.scan.scanId,
              brand: st.brand,
              answers: st.answers,
              preScan: st.preScan,
              consent: { accepted: true, version: CONSENT_VERSION },
            });
            sessionId = created.sessionId;
            useRun.getState().setSessionId(sessionId);
            setAnalyticsSession(sessionId);
          }
          if (sessionId) {
            const { createReport } = await import("@/lib/api");
            const created = await createReport({ sessionId, results, durationMs: 8 * 60 * 1000 });
            report = created.report;
          }
        } catch {
          report = null;
        }
        if (!report) {
          report = buildLocalReport({
            brand: st.brand,
            preScan: st.preScan,
            answers: st.answers,
            results,
            durationMs: 8 * 60 * 1000,
          });
        }
        useRun.getState().setReport(report);
        useRun.getState().setScreen("report");
        useScene.getState().setMode("landing");
      };
      (window as unknown as Record<string, unknown>).__SAOKIM__ = {
        run: useRun,
        scene: useScene,
        seedAll,
      };
    }
    let alive = true;
    void loadLastRun().then((snap) => {
      if (!alive) return;
      if (snap && isResumable(snap)) {
        setResume(snap);
        // Người đã có tiến trình không bị chặn bởi intro, trừ khi họ ép ?intro=1.
        if (!introPref.forced) setIntroOpen(false);
      }
    });
    return () => {
      alive = false;
      setAnalyticsSession(null);
    };
  }, [introPref.forced]);

  useEffect(() => {
    const scene = useScene.getState();
    if (introOpen) {
      scene.setMode("intro");
      return;
    }
    if (flight) {
      scene.setMode("flight");
      return;
    }
    if (screen === "launch") scene.setMode("launch");
    else if (screen === "planet") scene.setMode("planet");
    else if (screen === "finale") scene.setMode("finale");
    else scene.setMode("landing");
  }, [screen, flight, introOpen]);

  useEffect(() => {
    if (screen === "landing" && !introOpen) track("landing_view", { demo });
  }, [screen, demo, introOpen]);

  const applyScan = useRun((s) => s.applyScan);
  const setScreen = useRun((s) => s.setScreen);
  const setSessionId = useRun((s) => s.setSessionId);
  const openPlanet = useRun((s) => s.openPlanet);

  async function startScan(input: ScanRequest, source: "url" | "manual" | "demo") {
    setScanError(null);
    setLastInput(input);
    setScreen("scanning");
    track("scan_start", { mode: source });
    try {
      let result;
      if (source === "demo") {
        await delay(900);
        result = demoScan();
      } else {
        const minWait = source === "manual" ? 1400 : 2800;
        const [res] = await Promise.all([scanBrand(input), delay(minWait)]);
        result = res;
      }
      applyScan(result);
      track("scan_success", { source: result.source, cached: result.cached });
      void import("@/three/SceneCanvas");
      void import("@/game/PlanetGame");
      window.scrollTo({ top: 0 });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Chúng tôi chưa đọc được website này. Bạn thử lại hoặc nhập tên doanh nghiệp.";
      setScanError(message);
      track("scan_fail", { mode: source, code: err instanceof ApiError ? err.code : "UNKNOWN" });
    }
  }

  function handleUrl(raw: string) {
    const normalized = normalizeWebsite(raw);
    if (!normalized) {
      setScanError("Website chưa đúng định dạng. Ví dụ: saokim.vn");
      return;
    }
    void startScan({ url: normalized }, "url");
  }

  function handleManual(payload: { name: string; website?: string; industry?: string; logoDataUrl?: string }) {
    setManualOpen(false);
    void startScan({ manual: payload }, "manual");
  }

  function handleDemo() {
    void startScan({ manual: { name: "Cà phê Nắng Mai" } }, "demo");
  }

  function handleRetry() {
    if (lastInput) void startScan(lastInput, lastInput.manual ? "manual" : "url");
    else setScreen("landing");
  }

  function handleBegin() {
    const st = useRun.getState();
    setResume(null);
    setScreen("launch");
    useScene.getState().setMode("launch");
    track("confirm_submit", {
      industry: st.brand?.industry ?? "",
      hasLogo: Boolean(st.brand?.logo),
    });
    if (!st.sessionId && st.scan && st.brand && st.preScan) {
      void createSession({
        scanId: st.scan.scanId,
        brand: st.brand,
        answers: st.answers,
        preScan: st.preScan,
        consent: { accepted: true, version: CONSENT_VERSION },
      })
        .then(({ sessionId }) => {
          setSessionId(sessionId);
          setAnalyticsSession(sessionId);
        })
        .catch(() => {
          // offline vẫn chơi; báo cáo sẽ dùng local fallback
        });
    }
  }

  function handleResume() {
    if (!resume) return;
    useRun.getState().hydrate(resume);
    setAnalyticsSession(resume.sessionId);
    track("resume_run", { domain: resume.domain });
    setResume(null);
  }

  function startFlight(plan: FlightPlan, next: () => void) {
    if (flight) return;
    setFlight({ plan, next });
  }

  function finishFlight() {
    if (!flight) return;
    const next = flight.next;
    setFlight(null);
    next();
  }

  function handleOpenPlanet(planet: PlanetId) {
    if (!planet) return;
    startFlight({ from: useRun.getState().currentPlanet, to: planet }, () => {
      openPlanet(planet);
      track("planet_enter", { planet });
    });
  }

  function handleTakeoff(target: PlanetId | "venus") {
    const from = useRun.getState().currentPlanet;
    startFlight({ from, to: target }, () => {
      if (target === "venus") {
        setScreen("finale");
        useScene.getState().setMode("finale");
        track("finale_enter");
      } else {
        openPlanet(target);
        track("planet_enter", { planet: target });
      }
    });
  }

  function handleFinale() {
    const from = useRun.getState().currentPlanet;
    startFlight({ from, to: "venus" }, () => {
      setScreen("finale");
      useScene.getState().setMode("finale");
      track("finale_view");
    });
  }

  function finishIntro(_reason: "cta" | "skip") {
    markIntroSeen();
    clearIntroParam();
    setIntroOpen(false);
    setIntroReplay(false);
  }

  function replayIntro() {
    setIntroReplay(true);
    setIntroOpen(true);
    track("intro_replay");
  }

  const content = (() => {
    if (introOpen) {
      return <IntroScreen key={`intro-${introReplay ? "replay" : "first"}`} replay={introReplay} onFinish={finishIntro} />;
    }
    if (flight) {
      return (
        <FlightScreen
          key={`flight-${flight.plan.to}`}
          plan={flight.plan}
          onLanded={finishFlight}
          onSkip={finishFlight}
        />
      );
    }
    switch (screen) {
      case "landing":
        return (
          <LandingScreen
            key="landing"
            demo={demo}
            resume={resume}
            onStart={handleUrl}
            onDemo={handleDemo}
            onResume={handleResume}
            onDiscardResume={() => setResume(null)}
            onOpenManual={() => setManualOpen(true)}
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onReplayIntro={replayIntro}
            scanError={scanError}
          />
        );
      case "scanning":
        return (
          <ScanningScreen
            key="scanning"
            error={scanError}
            demo={demo}
            onRetry={handleRetry}
            onOpenManual={() => setManualOpen(true)}
            onBack={() => setScreen("landing")}
          />
        );
      case "confirm":
        return (
          <ConfirmScreen
            key="confirm"
            onBegin={handleBegin}
            onBack={() => setScreen("landing")}
            onOpenManual={() => setManualOpen(true)}
          />
        );
      case "launch":
        return <LaunchScreen key="launch" onDone={() => setScreen("map")} />;
      case "map":
        return (
          <MapScreen
            key="map"
            onOpenPlanet={handleOpenPlanet}
            onFinale={handleFinale}
          />
        );
      case "planet":
        return <PlanetHostScreen key="planet" onTakeoff={handleTakeoff} />;
      case "finale":
        return <FinaleScreen key="finale" />;
      case "report":
        return <ReportScreen key="report" />;
      default:
        return null;
    }
  })();

  return (
    <div className={`app-shell ${quality === "low" ? "tier-low" : ""} ${mode !== "landing" ? "app-scanlines" : ""}`}>
      <AudioDirector introOpen={introOpen} />
      {!show3D ? (
        <>
          <div className="nebula" aria-hidden />
          <Starfield2D density={quality === "low" ? 0.5 : 1} />
          <div className="vignette" aria-hidden />
        </>
      ) : null}

      {show3D ? (
        <div className="scene-layer" aria-hidden>
          <Suspense
            fallback={
              <>
                <div className="nebula" aria-hidden />
                <Starfield2D density={0.8} />
              </>
            }
          >
            <SceneCanvas />
          </Suspense>
        </div>
      ) : null}

      <Suspense fallback={null}>{content}</Suspense>
      {screen !== "report" && !introOpen ? <SoundToggle /> : null}
      <PrivacySheet open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <ManualSheet
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSubmit={handleManual}
        onOpenPrivacy={() => setPrivacyOpen(true)}
      />
    </div>
  );
}

export default GameApp;
