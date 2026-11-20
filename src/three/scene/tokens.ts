/** Cấu hình visual cho scene 3D: palette hành tinh, camera, vị trí theo mode, tier. */
import type { PlanetId, QualityTier } from "@/shared/types";
import type { LitLayers, SceneMode } from "@/state/scene";
import { PLANET_META } from "@/shared/planets";

export interface PlanetVisual {
  seed: number;
  /** [base, highlight, shadow] dạng hex sRGB. */
  palette: [string, string, string];
  glow: string;
}

export const PLANET_SEED: Record<PlanetId, number> = {
  S: 1.37,
  A: 2.71,
  O: 4.03,
  K: 5.17,
  IM: 7.31,
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb
    .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Trộn 2 hex; t = 0 → a, t = 1 → b. */
export function mixHex(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const k = clamp01(t);
  return toHex([ca[0] + (cb[0] - ca[0]) * k, ca[1] + (cb[1] - ca[1]) * k, ca[2] + (cb[2] - ca[2]) * k]);
}

/** Hex sRGB → vec3 0..1. Shader của ta ghi thẳng giá trị sRGB ra màn hình. */
export function hexToRgb(hex: string): [number, number, number] {
  const [r, g, b] = parseHex(hex);
  return [r / 255, g / 255, b / 255];
}

/**
 * Mỗi hành tinh có seed + palette riêng, pha màu brand một chút nhưng vẫn giữ
 * bản sắc trạm (màu PLANET_META). Palette brand có thể thiếu → dùng default.
 */
export function planetVisual(planet: PlanetId, brandPalette: string[] = []): PlanetVisual {
  const meta = PLANET_META[planet];
  const primary = brandPalette[0] ?? "#21409a";
  const accent = brandPalette[1] ?? "#faa634";
  const base = mixHex(meta.color, primary, 0.24);
  const highlight = mixHex(meta.glow, accent, 0.16);
  const shadow = mixHex(meta.color, "#030718", 0.56);
  return {
    seed: PLANET_SEED[planet],
    palette: [base, highlight, shadow],
    glow: meta.glow,
  };
}

/** Hành tinh xám ở màn launch (chưa thắp sáng). */
export function grayPlanetVisual(): PlanetVisual {
  return { seed: 9.13, palette: ["#9aa3b4", "#dde3ec", "#454d60"], glow: "#d5dfef" };
}

export interface ModeCameraConfig {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/** Thời gian dolly chậm của intro — khớp site.timing.introMs (10s). */
export const INTRO_DOLLY_SECONDS = 10;

export const CAMERA_MODES: Record<SceneMode, ModeCameraConfig> = {
  // intro: như landing nhưng CameraRig đẩy chậm vào gần trong INTRO_DOLLY_SECONDS
  intro: { pos: [0, 0.55, 10.2], target: [-0.15, 0.55, 0], fov: 46 },
  landing: { pos: [0, 0.5, 10], target: [0, 0.15, 0], fov: 46 },
  launch: { pos: [0, 0.4, 8.6], target: [0, 0.2, -4], fov: 54 },
  planet: { pos: [0, 0.35, 7.2], target: [0, 1.32, 0], fov: 50 },
  finale: { pos: [0, 0.5, 11.8], target: [0, 1.3, 0], fov: 46 },
  // flight: camera rộng, hơi dolly về đích; giá trị chi tiết do scene/flight.ts tính mỗi frame
  flight: { pos: [0, 1.5, 13.8], target: [0, 1.15, -0.5], fov: 58 },
};

export interface ModeTransform {
  pos: [number, number, number];
  scale: number;
  rot: [number, number, number];
}

export const PLANET_MODES: Record<SceneMode, ModeTransform> = {
  // intro: hành tinh lớn bên trái, hơi lệch trên; lit do IntroScreen tăng dần
  intro: { pos: [-1.05, 1.25, -1.8], scale: 1.8, rot: [0.2, 0, 0.05] },
  landing: { pos: [0, -8, -12], scale: 1.2, rot: [0.2, 0, 0] },
  launch: { pos: [-1.85, -2.15, -8], scale: 1.95, rot: [0.14, 0, -0.1] },
  planet: { pos: [0, 2.13, 0], scale: 1.45, rot: [0.18, 0, 0.06] },
  finale: { pos: [0, -0.6, 0], scale: 2.6, rot: [0.24, 0, 0] },
  flight: { pos: [0, 0.9, -15], scale: 0.85, rot: [0.18, 0, 0.06] },
};

export const SHIP_MODES: Record<SceneMode, ModeTransform> = {
  // intro: cùng tạo hình landing nhưng kéo vào trong khung (landing cũ ở mép phải)
  intro: { pos: [0.95, -1.35, 2.7], scale: 0.5, rot: [0.12, -0.62, -0.18] },
  landing: { pos: [1.9, -1.1, 1.9], scale: 0.55, rot: [0.12, -0.62, -0.2] },
  launch: { pos: [0.35, -1.5, 2.6], scale: 0.42, rot: [Math.PI / 2 - 0.3, 0.16, 0.04] },
  planet: { pos: [0.62, 1.02, 2.8], scale: 0.32, rot: [0.16, -0.9, 0.14] },
  finale: { pos: [2.2, 1.2, 2.6], scale: 0.3, rot: [-0.08, -0.7, 0.1] },
  flight: { pos: [-4.4, -3.6, 6.4], scale: 0.82, rot: [0, 0.4, 0.18] },
};

export interface StarModeConfig {
  pos: [number, number, number];
  scale: number;
  intensity: number;
}

export const STAR_MODES: Record<SceneMode, StarModeConfig> = {
  // intro: sao 4 cánh ở góc trên-phải, sáng vừa (0.75) để không tranh hành tinh
  intro: { pos: [2.35, 2.25, -8.5], scale: 0.9, intensity: 0.75 },
  landing: { pos: [-2.2, 1.5, -7], scale: 0.8, intensity: 0.55 },
  launch: { pos: [-3.3, 7.6, -12], scale: 1.5, intensity: 1.1 },
  planet: { pos: [2.5, 2.6, -14], scale: 1.15, intensity: 0.3 },
  finale: { pos: [0, 3.2, -4.5], scale: 2.8, intensity: 1.15 },
  flight: { pos: [3.4, 3.0, -16], scale: 1.05, intensity: 0.28 },
};

// Re-export choreography chuyến bay để Lead/component import từ một chỗ.
export {
  flightCameraAt,
  flightPhaseAt,
  flightPlanetAt,
  flightPoseAt,
  flightProgress,
  flightStarAt,
  isVenusFlight,
} from "./flight";
export type { FlightCameraPose, FlightPhase, FlightPlanetPose, FlightPose, FlightStarPose } from "./flight";

export interface Tier3DConfig {
  stars: number;
  planetDetail: number;
  satellites: number;
  antialias: boolean;
  dpr: number;
  starField: boolean;
}

export const TIER_3D: Record<QualityTier, Tier3DConfig> = {
  high: { stars: 1500, planetDetail: 4, satellites: 3, antialias: true, dpr: 1.5, starField: true },
  mid: { stars: 650, planetDetail: 3, satellites: 2, antialias: false, dpr: 1.25, starField: true },
  low: { stars: 0, planetDetail: 2, satellites: 0, antialias: false, dpr: 1, starField: false },
};

/** Trung bình các lớp sáng — dùng cho poster/fallback và độ sáng tổng của hành tinh. */
export function averageLit(lit: LitLayers): number {
  return (lit.atmosphere + lit.rotation + lit.surface + lit.signal + lit.satellites) / 5;
}

/** Damping hệ số theo dt, ổn định ở mọi fps. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** Damping vector 3 thành phần. */
export function damp3(
  current: [number, number, number],
  target: [number, number, number],
  lambda: number,
  dt: number,
): [number, number, number] {
  return [
    damp(current[0], target[0], lambda, dt),
    damp(current[1], target[1], lambda, dt),
    damp(current[2], target[2], lambda, dt),
  ];
}
