import { useEffect } from "react";
import { useRun, snapshotOf } from "@/state/run";
import { saveRun } from "@/lib/storage";

/**
 * Autosave tiến trình vào IndexedDB (debounce) — Lead quản lý, không phụ thuộc server.
 */
export function usePersistence() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let last = useRun.getState();

    const unsub = useRun.subscribe((state) => {
      const changed =
        state.scan !== last.scan ||
        state.brand !== last.brand ||
        state.preScan !== last.preScan ||
        state.answers !== last.answers ||
        state.sessionId !== last.sessionId ||
        state.currentPlanet !== last.currentPlanet ||
        state.results !== last.results ||
        state.decisions !== last.decisions ||
        state.report !== last.report ||
        state.leadUnlocked !== last.leadUnlocked ||
        state.screen !== last.screen;
      last = state;
      if (!changed || (!state.brand && !state.report)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void saveRun(snapshotOf());
      }, 500);
    });

    const onHide = () => {
      const state = useRun.getState();
      if (state.brand || state.report) void saveRun(snapshotOf());
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsub();
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
