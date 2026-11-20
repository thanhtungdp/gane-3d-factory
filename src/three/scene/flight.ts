/**
 * Chuyến bay giữa các trạm — hàm thuần (không three, không DOM) để test được.
 *
 * Một chuyến mặc định 2.9s chia 3 pha theo tỉ lệ:
 *   takeoff 0.7s (0 → 0.25) · cruise 1.4s (0.25 → 0.75) · landing 0.7s (0.75 → 1)
 * `flight.duration` của store được dùng làm mốc thời gian thật; pha vẫn theo tỉ lệ.
 *
 * Điểm cuối trùng với tư thế tàu/hành tinh của mode "planet" để khi Lead đổi mode
 * không bị nhảy hình.
 */
import type { FlightState, FlightTarget } from "@/state/scene";

export type FlightPhase = "takeoff" | "cruise" | "landing";

export type Vec3 = [number, number, number];

export const FLIGHT_DEFAULT_DURATION = 2900;
export const FLIGHT_PHASE = { takeoff: 0.25, cruise: 0.75 } as const;

/** Điểm cất cánh (gần camera, dưới-trái) → control → điểm hạ cánh cạnh hành tinh. */
const SHIP_TAKEOFF: Vec3 = [-1.4, -1.9, 4.6];
const SHIP_CONTROL_A: Vec3 = [-2.0, 2.6, 3.6];
const SHIP_CONTROL_B: Vec3 = [0.9, 1.5, 4.6];
const SHIP_LAND_PLANET: Vec3 = [0.62, 1.02, 2.8]; // = SHIP_MODES.planet
const SHIP_LAND_VENUS: Vec3 = [1.9, 2.55, 1.0];
const SHIP_CONTROL_VENUS_B: Vec3 = [1.9, 2.65, 3.4];

const PLANET_START: Vec3 = [0, 0.9, -15];
const PLANET_END: Vec3 = [0, 2.13, 0]; // = PLANET_MODES.planet
const PLANET_START_SCALE = 0.85;
const PLANET_END_SCALE = 1.45; // = PLANET_MODES.planet.scale

const STAR_VENUS_START: Vec3 = [0, 2.3, -16];
const STAR_VENUS_END: Vec3 = [0, 2.5, -3.6];
const STAR_VENUS_START_SCALE = 0.35;
const STAR_VENUS_END_SCALE = 3.1;
const STAR_VENUS_START_INTENSITY = 0.22;
const STAR_VENUS_END_INTENSITY = 1.75;

/** Camera flight rộng; hé dolly về phía đích khi hạ cánh. */
const CAM_START = { pos: [0, 1.5, 13.8] as Vec3, target: [0, 1.15, -0.5] as Vec3, fov: 58 };
const CAM_END = { pos: [0, 1.4, 12.6] as Vec3, target: [0, 1.25, 0.2] as Vec3, fov: 55 };

export const SHIP_FLIGHT_SCALE = { start: 0.82, end: 0.32 } as const;

export interface FlightPose {
  /** Vị trí thân tàu trong world space. */
  position: Vec3;
  /** Vector đơn vị theo hướng bay (dùng cho nghiêng thân). */
  tangent: Vec3;
  yaw: number;
  pitch: number;
  bank: number;
  scale: number;
  /** 0..1.7 — cường độ thruster. */
  thrust: number;
  /** 0..1.4 — độ đậm vệt đuôi. */
  trail: number;
  progress: number;
  phase: FlightPhase;
}

export interface FlightPlanetPose {
  pos: Vec3;
  scale: number;
  visible: boolean;
}

export interface FlightStarPose {
  pos: Vec3;
  scale: number;
  intensity: number;
}

export interface FlightCameraPose {
  pos: Vec3;
  target: Vec3;
  fov: number;
}

/* ── Tiện ích ─────────────────────────────────────────────────────────── */

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t: number): number {
  const p = clamp01(t);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function cubic(a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3 {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    a[0] * u3 + 3 * b[0] * u2 * t + 3 * c[0] * u * t2 + d[0] * t3,
    a[1] * u3 + 3 * b[1] * u2 * t + 3 * c[1] * u * t2 + d[1] * t3,
    a[2] * u3 + 3 * b[2] * u2 * t + 3 * c[2] * u * t2 + d[2] * t3,
  ];
}

function cubicTangent(a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3 {
  const u = 1 - t;
  return [
    3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]),
    3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]),
    3 * u * u * (b[2] - a[2]) + 6 * u * t * (c[2] - b[2]) + 3 * t * t * (d[2] - c[2]),
  ];
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

/* ── API chính ────────────────────────────────────────────────────────── */

/** Tiến trình 0..1 của flight hiện tại; `null` → coi như đã hạ cánh. */
export function flightProgress(flight: FlightState | null, now = Date.now()): number {
  if (!flight) return 1;
  const duration = Math.max(300, flight.duration || FLIGHT_DEFAULT_DURATION);
  return clamp01((now - flight.startedAt) / duration);
}

export function flightPhaseAt(progress: number): FlightPhase {
  const p = clamp01(progress);
  if (p < FLIGHT_PHASE.takeoff) return "takeoff";
  if (p < FLIGHT_PHASE.cruise) return "cruise";
  return "landing";
}

function shipEnd(venus: boolean): Vec3 {
  return venus ? SHIP_LAND_VENUS : SHIP_LAND_PLANET;
}

function shipControlB(venus: boolean): Vec3 {
  return venus ? SHIP_CONTROL_VENUS_B : SHIP_CONTROL_B;
}

/**
 * Tư thế tàu tại tiến trình `t` (0..1). Hàm thuần, không phụ thuộc store/three.
 * `reduced` tắt sway + bank để chuyển động tối giản.
 */
export function flightPoseAt(
  t: number,
  options: { venus?: boolean; reduced?: boolean } = {},
): FlightPose {
  const p = clamp01(t);
  const venus = Boolean(options.venus);
  const reduced = Boolean(options.reduced);
  const eased = easeInOutCubic(p);
  const end = shipEnd(venus);
  const controlB = shipControlB(venus);

  const base = cubic(SHIP_TAKEOFF, SHIP_CONTROL_A, controlB, end, eased);
  const position: Vec3 = [base[0], base[1], base[2]];
  if (!reduced) {
    // sway nhẹ, tắt dần khi hạ cánh
    const envelope = Math.sin(Math.PI * p);
    position[0] += Math.sin(p * 9.2) * 0.07 * envelope;
    position[1] += Math.sin(p * 7.4 + 1.2) * 0.05 * envelope;
  }

  const tangent = normalize(cubicTangent(SHIP_TAKEOFF, SHIP_CONTROL_A, controlB, end, eased));
  const yaw = Math.atan2(-tangent[0], -tangent[2]);
  const pitch = Math.asin(Math.max(-1, Math.min(1, tangent[1])));

  let bank = 0;
  if (!reduced) {
    const before = normalize(
      cubicTangent(SHIP_TAKEOFF, SHIP_CONTROL_A, controlB, end, clamp01(eased - 0.03)),
    );
    const after = normalize(
      cubicTangent(SHIP_TAKEOFF, SHIP_CONTROL_A, controlB, end, clamp01(eased + 0.03)),
    );
    const cross = before[0] * after[2] - before[2] * after[0];
    bank = Math.max(-0.55, Math.min(0.55, -cross * 9));
  }

  const phase = flightPhaseAt(p);
  let thrust: number;
  let trail: number;
  if (phase === "takeoff") {
    const k = clamp01(p / FLIGHT_PHASE.takeoff);
    thrust = lerp(1.35, 1.65, k);
    trail = lerp(0.9, 1.35, k);
  } else if (phase === "cruise") {
    const k = (p - FLIGHT_PHASE.takeoff) / (FLIGHT_PHASE.cruise - FLIGHT_PHASE.takeoff);
    thrust = lerp(1.5, 1.2, smoothstep(0, 1, k)) * (reduced ? 0.8 : 1);
    trail = lerp(1.25, 1.05, k);
  } else {
    const k = clamp01((p - FLIGHT_PHASE.cruise) / (1 - FLIGHT_PHASE.cruise));
    thrust = lerp(1.05, 0.32, smoothstep(0, 1, k));
    trail = lerp(0.95, 0.4, smoothstep(0, 1, k));
  }

  const scale = lerp(
    SHIP_FLIGHT_SCALE.start,
    SHIP_FLIGHT_SCALE.end,
    smoothstep(0.08, 0.96, p),
  );

  return { position, tangent, yaw, pitch, bank, scale, thrust, trail, progress: p, phase };
}

/** Tư thế hành tinh đích: xuất hiện xa/nhỏ rồi lớn dần khi hạ cánh. */
export function flightPlanetAt(t: number, venus = false): FlightPlanetPose {
  if (venus) return { pos: [0, 0.6, -22], scale: 0.001, visible: false };
  const p = clamp01(t);
  const arrive = smoothstep(0.22, 1, p);
  const approach = easeInOutCubic(arrive);
  return {
    pos: lerp3(PLANET_START, PLANET_END, approach),
    scale: lerp(PLANET_START_SCALE, PLANET_END_SCALE, approach),
    visible: true,
  };
}

/** Sao 4 cánh: với đích venus thì lớn dần; chuyến tới trạm chỉ là sao nền xa. */
export function flightStarAt(t: number, venus = false): FlightStarPose {
  const p = clamp01(t);
  if (!venus) {
    // chuyến tới trạm: sao chỉ là điểm sáng nền xa, không tranh hành tinh đích
    return {
      pos: [3.4, 3.0, -16],
      scale: 1.05,
      intensity: 0.28,
    };
  }
  const approach = easeInOutCubic(smoothstep(0.18, 1, p));
  return {
    pos: lerp3(STAR_VENUS_START, STAR_VENUS_END, approach),
    scale: lerp(STAR_VENUS_START_SCALE, STAR_VENUS_END_SCALE, approach),
    intensity: lerp(STAR_VENUS_START_INTENSITY, STAR_VENUS_END_INTENSITY, smoothstep(0.1, 1, p)),
  };
}

export function flightCameraAt(t: number): FlightCameraPose {
  const p = easeInOutCubic(clamp01(t));
  return {
    pos: lerp3(CAM_START.pos, CAM_END.pos, p),
    target: lerp3(CAM_START.target, CAM_END.target, p),
    fov: lerp(CAM_START.fov, CAM_END.fov, p),
  };
}

/** Đích venus? (scene.planet = null khi bay tới Sao Kim). */
export function isVenusFlight(to: FlightTarget | null | undefined): boolean {
  return to === "venus";
}
