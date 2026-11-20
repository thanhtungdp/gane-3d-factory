/** Ghi nhớ lựa chọn âm thanh; mặc định bật cho lần đầu. */

const KEY = "saokim:sound:v1";

export function readSoundOn(): boolean {
  try {
    if (typeof window === "undefined") return true;
    const value = window.localStorage.getItem(KEY);
    if (value === "0") return false;
    if (value === "1") return true;
  } catch {
    /* private mode */
  }
  return true;
}

export function writeSoundOn(on: boolean): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
}
