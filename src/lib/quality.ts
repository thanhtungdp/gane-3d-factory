/**
 * Quality tier cho lớp 3D — mobile-first.
 *
 * - Detect tier từ WebGL2, deviceMemory, hardwareConcurrency, saveData, reduced-motion
 *   và query `?quality=low|mid|high`. Kết quả được ghi vào `useScene.setQuality`.
 * - Theo dõi fps theo cửa sổ 3 giây; < 40 fps thì tự hạ 1 bậc (high → mid → low).
 *   KHÔNG tự nâng bậc.
 * - `low` = không render WebGL: `SceneCanvas` fallback poster/CSS 2.5D.
 * - `useQualityWatch()` là hook duy nhất SceneCanvas cần gọi.
 */
import { useEffect, useState } from "react";
import type { QualityTier } from "@/shared/types";
import { useScene } from "@/state/scene";

export interface QualityInfo {
  tier: QualityTier;
  forced: boolean;
  webgl2: boolean;
  deviceMemory: number | null;
  cores: number | null;
  saveData: boolean;
  reducedMotion: boolean;
  reason: string;
}

const RANK: Record<QualityTier, number> = { low: 0, mid: 1, high: 2 };
const FPS_WINDOW_MS = 3000;
const FPS_FLOOR = 40;
const WARMUP_MS = 1500;

/** `true` nếu trình duyệt tạo được context WebGL2 (three r187 bắt buộc WebGL2). */
const webgl2Support: { value: boolean | null } = { value: null };

export function supportsWebGL2(): boolean {
  if (webgl2Support.value !== null) return webgl2Support.value;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { alpha: true });
    webgl2Support.value = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2Support.value = false;
  }
  return webgl2Support.value;
}

function readQueryTier(): QualityTier | null {
  if (typeof window === "undefined") return null;
  try {
    const value = new URLSearchParams(window.location.search).get("quality");
    return value === "low" || value === "mid" || value === "high" ? value : null;
  } catch {
    return null;
  }
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  } catch {
    return false;
  }
}

function readDeviceMemory(): number | null {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return typeof nav.deviceMemory === "number" ? nav.deviceMemory : null;
}

function readCores(): number | null {
  return typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null;
}

function readSaveData(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

/** Detect tier + lý do. Hàm thuần đọc môi trường, không ghi state. */
export function detectQuality(): QualityInfo {
  const forced = readQueryTier();
  const webgl2 = supportsWebGL2();
  const deviceMemory = readDeviceMemory();
  const cores = readCores();
  const saveData = readSaveData();
  const reducedMotion = prefersReducedMotion();

  if (forced) {
    return {
      tier: forced,
      forced: true,
      webgl2,
      deviceMemory,
      cores,
      saveData,
      reducedMotion,
      reason: `query:${forced}`,
    };
  }

  let tier: QualityTier = "high";
  let reason = "ok";

  if (!webgl2) {
    tier = "low";
    reason = "no-webgl2";
  } else if (saveData) {
    tier = "low";
    reason = "save-data";
  } else if (deviceMemory !== null && deviceMemory <= 2) {
    tier = "low";
    reason = "device-memory";
  } else if (cores !== null && cores <= 2) {
    tier = "low";
    reason = "low-cores";
  } else if ((deviceMemory !== null && deviceMemory <= 4) || (cores !== null && cores <= 4)) {
    tier = "mid";
    reason = "mid-device";
  }

  // Người dùng muốn ít chuyển động: vẫn cho 3D nhưng hạ hiệu ứng xuống mid.
  if (reducedMotion && RANK[tier] > RANK.mid) {
    tier = "mid";
    reason = "reduced-motion";
  }

  return { tier, forced: false, webgl2, deviceMemory, cores, saveData, reducedMotion, reason };
}

let initialized = false;

/**
 * Áp tier detect được vào store (idempotent). Chỉ hạ bậc so với tier hiện tại,
 * trừ khi `?quality=` ép rõ ràng — tránh đè lên quyết định của app shell.
 */
export function initQuality(): QualityInfo {
  const info = detectQuality();
  if (!initialized) {
    initialized = true;
    const current = useScene.getState().quality;
    const shouldApply = info.forced || RANK[info.tier] < RANK[current];
    if (shouldApply) useScene.getState().setQuality(info.tier);
  }
  return info;
}

/** Hạ 1 bậc: high → mid → low. Trả về tier mới, null nếu đã thấp nhất. */
export function downgradeQuality(): QualityTier | null {
  const scene = useScene.getState();
  const current = scene.quality;
  if (current === "low") return null;
  // Intro chỉ hạ tối đa xuống mid: giữ rocket 3D trong 10 giây mở màn.
  if (scene.mode === "intro" && current === "mid") return null;
  const next: QualityTier = current === "high" ? "mid" : "low";
  scene.setQuality(next);
  return next;
}

/* ── FPS watcher (singleton, nhiều SceneCanvas chỉ chạy 1 vòng) ─────────── */

let watcherRefs = 0;
let watcherRaf = 0;
let watcherWarmup = 0;
let watcherWindowStart = 0;
let watcherFrames = 0;
let watcherLast = 0;
let visibilityBound = false;

function resetWatcher(now: number): void {
  watcherWarmup = now + WARMUP_MS;
  watcherWindowStart = 0;
  watcherFrames = 0;
  watcherLast = now;
}

function watcherTick(now: number): void {
  watcherRaf = requestAnimationFrame(watcherTick);

  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    resetWatcher(now);
    return;
  }
  if (watcherLast === 0 || now < watcherLast) {
    resetWatcher(now);
    return;
  }

  watcherLast = now;
  if (now < watcherWarmup) return;

  if (watcherWindowStart === 0) {
    watcherWindowStart = now;
    watcherFrames = 0;
    return;
  }

  watcherFrames += 1;
  const elapsed = now - watcherWindowStart;
  if (elapsed < FPS_WINDOW_MS) return;

  const fps = (watcherFrames * 1000) / elapsed;
  watcherWindowStart = now;
  watcherFrames = 0;

  if (fps < FPS_FLOOR) {
    const next = downgradeQuality();
    if (next === null || next === "low") stopWatcher();
  }
}

function onWatcherVisibility(): void {
  if (document.visibilityState === "visible") resetWatcher(performance.now());
}

function startWatcher(): void {
  watcherRefs += 1;
  if (watcherRefs > 1) return;
  if (typeof window === "undefined" || typeof requestAnimationFrame !== "function") return;
  resetWatcher(performance.now());
  watcherRaf = requestAnimationFrame(watcherTick);
  if (!visibilityBound) {
    document.addEventListener("visibilitychange", onWatcherVisibility);
    visibilityBound = true;
  }
}

function stopWatcher(): void {
  watcherRefs = Math.max(0, watcherRefs - 1);
  if (watcherRefs > 0) return;
  if (watcherRaf) cancelAnimationFrame(watcherRaf);
  watcherRaf = 0;
  if (visibilityBound) {
    document.removeEventListener("visibilitychange", onWatcherVisibility);
    visibilityBound = false;
  }
}

export interface QualityWatch {
  tier: QualityTier;
  /** Tier thấp: SceneCanvas không dựng WebGL, trả poster/CSS 2.5D. */
  low: boolean;
  reducedMotion: boolean;
  info: QualityInfo;
}

/**
 * Hook cho SceneCanvas: detect tier 1 lần + theo dõi fps, trả tier reactive từ store,
 * và tự dọn RAF/listener khi unmount.
 */
export function useQualityWatch(): QualityWatch {
  const tier = useScene((s) => s.quality);
  const storeReduced = useScene((s) => s.reducedMotion);
  const [info] = useState<QualityInfo>(() => detectQuality());

  useEffect(() => {
    initQuality();
    if (useScene.getState().quality === "low") return;
    startWatcher();
    return () => stopWatcher();
  }, []);

  return {
    tier,
    low: tier === "low",
    reducedMotion: storeReduced || info.reducedMotion,
    info,
  };
}
