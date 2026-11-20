/** Trạng thái intro lần mở đầu — localStorage là đủ, không phải dữ liệu cá nhân. */

const KEY = "saokim:intro:v1";
let memorySeen = false;

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export interface IntroPreference {
  open: boolean;
  forced: boolean;
}

function param(search: string | undefined, name: string): string | null {
  if (!search) return null;
  try {
    return new URLSearchParams(search).get(name);
  } catch {
    return null;
  }
}

export function hasSeenIntro(): boolean {
  if (memorySeen) return true;
  try {
    const value = storage()?.getItem(KEY);
    if (value === "1") {
      memorySeen = true;
      return true;
    }
    return false;
  } catch {
    return memorySeen;
  }
}

export function markIntroSeen(): void {
  memorySeen = true;
  try {
    storage()?.setItem(KEY, "1");
  } catch {
    /* private mode: chỉ nhớ trong phiên */
  }
}

/** `?intro=0` bỏ qua; `?intro=1` ép xem lại; còn lại theo lần đầu. */
export function readIntroPreference(search = typeof window === "undefined" ? "" : window.location.search): IntroPreference {
  const value = param(search, "intro");
  if (value === "0") return { open: false, forced: false };
  if (value === "1") return { open: true, forced: true };
  return { open: !hasSeenIntro(), forced: false };
}

/** Xoá `intro` khỏi URL sau khi đã xem, tránh reload lại vì tham số ép. */
export function clearIntroParam(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("intro")) return;
    url.searchParams.delete("intro");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* no-op */
  }
}
