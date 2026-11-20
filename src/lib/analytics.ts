import { sendEvents } from "./api";
import type { PlanetId } from "@/shared/types";

interface Queued {
  name: string;
  sessionId?: string;
  planet?: PlanetId;
  props?: Record<string, string | number | boolean | null>;
}

let queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function setAnalyticsSession(sessionId: string | null): void {
  sessionIdRef = sessionId;
}

let sessionIdRef: string | null = null;

export function track(
  name: string,
  props?: Queued["props"],
  planet?: PlanetId,
  sessionId?: string,
): void {
  const event: Queued = {
    name,
    sessionId: sessionId ?? sessionIdRef ?? undefined,
    planet,
    props,
  };
  queue.push(event);
  if (queue.length >= 12) void flush();
  else schedule();
}

function schedule(): void {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, 4000);
}

export async function flush(): Promise<void> {
  if (!queue.length) return;
  const batch = queue.slice(0, 30);
  queue = queue.slice(batch.length);
  try {
    await sendEvents(batch.map((e) => ({ ...e, ts: new Date().toISOString() })));
  } catch {
    // best-effort: không chặn trải nghiệm vì analytics
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush();
  });
}
