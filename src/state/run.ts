import { create } from "zustand";
import type {
  BrandProfile,
  DecisionRecord,
  PlanetId,
  PlanetResult,
  PreScan,
  ProfileAnswers,
  Report,
  ScanResult,
} from "@/shared/types";
import { litLayersFromResults } from "@/shared/scoring";
import { useScene } from "./scene";
import type { RunSnapshot } from "@/lib/storage";
import { RUN_VERSION } from "@/lib/storage";

export type Screen =
  | "landing"
  | "scanning"
  | "confirm"
  | "launch"
  | "map"
  | "planet"
  | "finale"
  | "report";

interface RunState {
  screen: Screen;
  scan: ScanResult | null;
  brand: BrandProfile | null;
  preScan: PreScan | null;
  answers: ProfileAnswers;
  sessionId: string | null;
  currentPlanet: PlanetId | null;
  results: Partial<Record<PlanetId, PlanetResult>>;
  decisions: Partial<Record<PlanetId, DecisionRecord[]>>;
  report: Report | null;
  leadUnlocked: boolean;
  startedAt: string;
  setScreen: (screen: Screen) => void;
  applyScan: (scan: ScanResult) => void;
  updateBrand: (patch: Partial<BrandProfile>) => void;
  setAnswers: (patch: Partial<ProfileAnswers>) => void;
  setSessionId: (id: string | null) => void;
  openPlanet: (planet: PlanetId) => void;
  recordDecision: (planet: PlanetId, record: DecisionRecord) => void;
  completePlanet: (result: PlanetResult) => void;
  setReport: (report: Report) => void;
  unlockLead: () => void;
  hydrate: (snapshot: RunSnapshot) => void;
  reset: () => void;
}

const DEFAULT_ANSWERS: ProfileAnswers = { companySize: "6-20", role: "founder" };

export const useRun = create<RunState>((set, get) => ({
  screen: "landing",
  scan: null,
  brand: null,
  preScan: null,
  answers: DEFAULT_ANSWERS,
  sessionId: null,
  currentPlanet: null,
  results: {},
  decisions: {},
  report: null,
  leadUnlocked: false,
  startedAt: new Date().toISOString(),

  setScreen: (screen) => set({ screen }),

  applyScan: (scan) => {
    set({
      scan,
      brand: scan.brand,
      preScan: scan.preScan,
      screen: "confirm",
      currentPlanet: null,
      results: {},
      decisions: {},
      report: null,
      leadUnlocked: false,
      startedAt: new Date().toISOString(),
    });
    useScene.getState().resetLit();
    useScene.getState().setBrand(
      scan.brand.name,
      scan.brand.logo?.url ?? null,
      scan.brand.palette.map((c) => c.hex),
    );
    useScene.getState().setMode("landing");
  },

  updateBrand: (patch) => set((s) => ({ brand: s.brand ? { ...s.brand, ...patch } : s.brand })),

  setAnswers: (patch) => set((s) => ({ answers: { ...s.answers, ...patch } })),

  setSessionId: (sessionId) => set({ sessionId }),

  openPlanet: (planet) => {
    set({ screen: "planet", currentPlanet: planet });
    useScene.getState().setPlanet(planet);
    useScene.getState().setMode("planet");
  },

  recordDecision: (planet, record) =>
    set((s) => {
      const existing = s.decisions[planet] ?? [];
      const without = existing.filter((d) => d.decisionId !== record.decisionId);
      return { decisions: { ...s.decisions, [planet]: [...without, record] } };
    }),

  completePlanet: (result) => {
    const results = { ...get().results, [result.planet]: result };
    set({ results });
    useScene.getState().setLit(litLayersFromResults(results));
  },

  setReport: (report) => set({ report }),

  unlockLead: () => set({ leadUnlocked: true }),

  hydrate: (snap) => {
    set({
      scan: snap.scan,
      brand: snap.brand,
      preScan: snap.preScan,
      answers: snap.answers,
      sessionId: snap.sessionId,
      currentPlanet: snap.currentPlanet,
      results: snap.results,
      decisions: snap.decisions,
      report: snap.report,
      leadUnlocked: snap.leadUnlocked,
      startedAt: snap.startedAt,
      screen: snap.report
        ? "report"
        : snap.currentPlanet && !snap.results[snap.currentPlanet]
          ? "planet"
          : snap.scan
            ? "map"
            : "landing",
    });
    if (snap.brand) {
      useScene.getState().setBrand(
        snap.brand.name,
        snap.brand.logo?.url ?? null,
        snap.brand.palette.map((c) => c.hex),
      );
    }
    useScene.getState().setLit(litLayersFromResults(snap.results));
    useScene.getState().setPlanet(snap.currentPlanet);
  },

  reset: () => {
    set({
      screen: "landing",
      scan: null,
      brand: null,
      preScan: null,
      answers: DEFAULT_ANSWERS,
      sessionId: null,
      currentPlanet: null,
      results: {},
      decisions: {},
      report: null,
      leadUnlocked: false,
      startedAt: new Date().toISOString(),
    });
    useScene.getState().resetLit();
    useScene.getState().setPlanet(null);
    useScene.getState().setMode("landing");
  },
}));

export function snapshotOf(state = useRun.getState()): RunSnapshot {
  return {
    version: RUN_VERSION,
    savedAt: new Date().toISOString(),
    domain: state.brand?.domain ?? "manual",
    scan: state.scan,
    brand: state.brand,
    preScan: state.preScan,
    answers: state.answers,
    sessionId: state.sessionId,
    currentPlanet: state.currentPlanet,
    results: state.results,
    decisions: state.decisions,
    report: state.report,
    leadUnlocked: state.leadUnlocked,
    startedAt: state.startedAt,
  };
}

export function completedCount(results: Partial<Record<PlanetId, PlanetResult>>): number {
  return Object.keys(results).length;
}
