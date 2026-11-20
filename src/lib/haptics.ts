/** Haptic Android; iOS không có rung → UI tự phát hiệu ứng hình ảnh thay thế. */
export function haptic(pattern: number | number[] = 12): boolean {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      return navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
  return false;
}

export const HAPTIC = {
  tap: 8,
  correct: [10, 40, 16],
  wrong: [24, 60, 24],
  launch: [30, 40, 60],
};
