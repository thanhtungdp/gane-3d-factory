import { create } from "zustand";
import type { PlanetId, QualityTier } from "@/shared/types";
import { readSoundOn, writeSoundOn } from "@/lib/audioPrefs";

export type SceneMode = "intro" | "landing" | "launch" | "planet" | "finale" | "flight";

export type FlightTarget = PlanetId | "venus";

export interface FlightState {
  from: PlanetId | null;
  to: FlightTarget;
  startedAt: number;
  duration: number;
}

export interface LitLayers {
  atmosphere: number;
  rotation: number;
  surface: number;
  signal: number;
  satellites: number;
}

export const DIM_LAYERS: LitLayers = {
  atmosphere: 0.1,
  rotation: 0.1,
  surface: 0.1,
  signal: 0.1,
  satellites: 0.1,
};

interface SceneState {
  mode: SceneMode;
  planet: PlanetId | null;
  brandName: string;
  logoUrl: string | null;
  palette: string[];
  lit: LitLayers;
  quality: QualityTier;
  soundOn: boolean;
  reducedMotion: boolean;
  flight: FlightState | null;
  startFlight: (plan: { from: PlanetId | null; to: FlightTarget; duration?: number }) => void;
  endFlight: () => void;
  setMode: (mode: SceneMode) => void;
  setPlanet: (planet: PlanetId | null) => void;
  setBrand: (brandName: string, logoUrl: string | null, palette: string[]) => void;
  setLit: (lit: Partial<LitLayers>) => void;
  resetLit: () => void;
  setQuality: (quality: QualityTier) => void;
  setSoundOn: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
}

const DEFAULT_PALETTE = ["#21409a", "#faa634", "#ef4123"];

export const useScene = create<SceneState>((set) => ({
  mode: "landing",
  planet: null,
  brandName: "",
  logoUrl: null,
  palette: DEFAULT_PALETTE,
  lit: DIM_LAYERS,
  quality: "high",
  soundOn: readSoundOn(),
  reducedMotion: false,
  flight: null,
  startFlight: ({ from, to, duration = 2900 }) =>
    set({
      flight: { from, to, startedAt: Date.now(), duration },
      mode: "flight",
      planet: to === "venus" ? null : to,
    }),
  endFlight: () => set({ flight: null }),
  setMode: (mode) => set({ mode }),
  setPlanet: (planet) => set({ planet }),
  setBrand: (brandName, logoUrl, palette) =>
    set({ brandName, logoUrl, palette: palette.length ? palette : DEFAULT_PALETTE }),
  setLit: (lit) => set((s) => ({ lit: { ...s.lit, ...lit } })),
  resetLit: () => set({ lit: DIM_LAYERS }),
  setQuality: (quality) => set({ quality }),
  setSoundOn: (soundOn) => {
    writeSoundOn(soundOn);
    set({ soundOn });
  },
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
