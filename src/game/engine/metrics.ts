/**
 * Các phép tính thuần cho mini-game — tách khỏi React để test được.
 * Mọi giá trị trả về đều đã clamp theo hợp đồng scoring (0..1, 0..10).
 */

export const SPOT_WINDOW_MS = 15_000;
export const CRISIS_WINDOW_MS = 30_000;
export const CRISIS_FAST_MS = 10_000;
export const IM_METER_START = 10;
export const IM_DECAY_PER_SECOND = 0.1;

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function clamp01(n: number): number {
  return clamp(n, 0, 1);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * O → timeBonus 0..1.
 * 0.7 cho tốc độ tìm đủ 2 mockup lệch trong cửa sổ 15 giây
 * + 0.3 nếu nhớ đúng màu chính ở test ghi nhớ.
 */
export function oTimeBonus(input: {
  foundBoth: boolean;
  foundMs: number;
  memoryCorrect: boolean;
}): number {
  const speed = input.foundBoth
    ? clamp01((SPOT_WINDOW_MS - input.foundMs) / SPOT_WINDOW_MS)
    : 0;
  return round2(clamp01(speed * 0.7 + (input.memoryCorrect ? 0.3 : 0)));
}

/** K → crisisFast khi phản hồi trong 10 giây đầu. */
export function isCrisisFast(elapsedMs: number): boolean {
  return elapsedMs < CRISIS_FAST_MS;
}

/** Chi phí "Độ nhất quán" theo điểm lựa chọn trong sự kiện IM. */
export function imChoiceCost(points: number): number {
  if (points >= 2) return 0;
  if (points === 1) return 0.8;
  return 2;
}

/** IM → trừ 0.1 mỗi giây sự kiện còn chưa được trả lời. */
export function imTimeDecay(seconds: number): number {
  return round2(Math.max(0, seconds) * IM_DECAY_PER_SECOND);
}

export function tickMeter(meter: number, seconds: number): number {
  return round2(clamp(meter - imTimeDecay(seconds), 0, IM_METER_START));
}

export function applyChoiceCost(meter: number, points: number): number {
  return round2(clamp(meter - imChoiceCost(points), 0, IM_METER_START));
}

/** Meter cuối trả cho host — 1 số lẻ, 0..10. */
export function finalMeter(meter: number): number {
  return round1(clamp(meter, 0, IM_METER_START));
}

export type DecisionTone = "best" | "partial" | "miss";

export function toneForPoints(points: number): DecisionTone {
  if (points >= 2) return "best";
  if (points === 1) return "partial";
  return "miss";
}

export const TONE_LABEL: Record<DecisionTone, string> = {
  best: "Khớp nhất",
  partial: "Một phần",
  miss: "Chưa khớp",
};
