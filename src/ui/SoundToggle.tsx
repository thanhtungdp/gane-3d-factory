import { useState } from "react";
import { useScene } from "@/state/scene";
import { IconVolume, IconVolumeOff } from "./Icons";
import { track } from "@/lib/analytics";

export function SoundToggle() {
  const soundOn = useScene((s) => s.soundOn);
  const setSoundOn = useScene((s) => s.setSoundOn);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const audio = await import("@/lib/audio");
      if (!soundOn) {
        await audio.enableAudio();
        audio.setSoundEnabled(true);
        setSoundOn(true);
        audio.playSfx("tap");
        track("audio_toggle", { enabled: true });
      } else {
        audio.setSoundEnabled(false);
        setSoundOn(false);
        track("audio_toggle", { enabled: false });
      }
    } catch {
      // audio là tùy chọn; không chặn trải nghiệm
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className="icon-btn sound-toggle"
      onClick={toggle}
      aria-label={soundOn ? "Tắt âm thanh" : "Bật âm thanh"}
      aria-pressed={soundOn}
      title={soundOn ? "Tắt âm thanh" : "Bật âm thanh"}
    >
      {soundOn ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
    </button>
  );
}
