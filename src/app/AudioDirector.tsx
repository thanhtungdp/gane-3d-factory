import { useEffect } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { disposeAudio, setAmbience, setSoundEnabled } from "@/lib/audio";
import type { PlanetId } from "@/shared/types";

function ambienceFor(introOpen: boolean, screen: string, planet: PlanetId | null): PlanetId | null {
  if (introOpen) return "O";
  if (screen === "launch") return "K";
  if (screen === "finale" || screen === "report") return "IM";
  if (screen === "planet") return planet ?? "S";
  return "S";
}

/**
 * Nhạc nền mặc định bật. Audio module chờ gesture đầu tiên để mở khoá;
 * AudioDirector chỉ đổi hợp âm nền theo màn hình/trạm.
 */
export function AudioDirector({ introOpen }: { introOpen: boolean }) {
  const soundOn = useScene((s) => s.soundOn);
  const mode = useScene((s) => s.mode);
  const screen = useRun((s) => s.screen);
  const planet = useRun((s) => s.currentPlanet);
  const target = mode === "flight" ? null : ambienceFor(introOpen, screen, planet);

  useEffect(() => {
    if (!soundOn) {
      setSoundEnabled(false);
      return;
    }
    setAmbience(target);
  }, [soundOn, target]);

  useEffect(() => {
    const onPageHide = (event: PageTransitionEvent) => {
      if (!event.persisted) disposeAudio();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  return null;
}
