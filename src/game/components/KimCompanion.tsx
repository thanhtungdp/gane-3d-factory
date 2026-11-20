import { useEffect, useId, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "../engine/useReducedMotion";
import { playSfx } from "@/lib/audio";
import "../kim.css";

export type KimMood = "idle" | "happy" | "thinking" | "curious";

export interface KimCompanionProps {
  /** Cạnh của mặt KIM (px). Mặc định 36. */
  size?: number;
  mood?: KimMood;
  /** Đang nói → miệng mở/khép theo nhịp. */
  speaking?: boolean;
  className?: string;
}

/** Mặt hologram 3D-style bằng SVG + CSS 3D — không tạo WebGL canvas. */
export function KimCompanion({ size = 36, mood = "idle", speaking = false, className }: KimCompanionProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const style = { "--kim-size": `${size}px`, width: size, height: size } as CSSProperties;

  return (
    <span
      data-testid="kim-companion"
      data-mood={mood}
      data-speaking={speaking ? "true" : "false"}
      className={`kim-companion${className ? ` ${className}` : ""}`}
      style={style}
      aria-hidden="true"
    >
      <span className="kim-companion__halo" />
      <span className="kim-companion__ring" />
      <span className="kim-companion__face" data-testid="kim-face">
        <svg viewBox="0 0 64 64" className="kim-companion__svg" focusable="false">
          <defs>
            <radialGradient id={`kim-head-${uid}`} cx="34%" cy="26%" r="82%">
              <stop offset="0%" stopColor="#ffd88a" stopOpacity="0.96" />
              <stop offset="30%" stopColor="#f6a04a" stopOpacity="0.92" />
              <stop offset="58%" stopColor="#c06a3c" stopOpacity="0.9" />
              <stop offset="82%" stopColor="#2b4a9e" stopOpacity="0.93" />
              <stop offset="100%" stopColor="#061233" stopOpacity="0.96" />
            </radialGradient>
            <linearGradient id={`kim-rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd88a" />
              <stop offset="52%" stopColor="#faa634" />
              <stop offset="100%" stopColor="#5ee6f0" />
            </linearGradient>
            <radialGradient id={`kim-faceglow-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd88a" stopOpacity="0.38" />
              <stop offset="70%" stopColor="#5ee6f0" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#5ee6f0" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="32" cy="33" r="27" fill={`url(#kim-faceglow-${uid})`} className="kim-companion__aura" />
          <path
            d="M32 11C45.3 11 55 20.3 55 33C55 45.7 45.6 55 32 55C18.4 55 9 45.7 9 33C9 20.3 18.7 11 32 11Z"
            fill={`url(#kim-head-${uid})`}
            stroke={`url(#kim-rim-${uid})`}
            strokeWidth="1.5"
            className="kim-companion__head"
          />
          {/* vành mạch hologram */}
          <circle cx="32" cy="33" r="19.5" fill="none" stroke="rgba(94,230,240,0.34)" strokeWidth="0.7" strokeDasharray="2.4 4.2" className="kim-companion__circuit" />
          <circle cx="32" cy="33" r="15.6" fill="none" stroke="rgba(250,166,52,0.18)" strokeWidth="0.5" strokeDasharray="1 5" className="kim-companion__circuit kim-companion__circuit--slow" />

          {/* ăng-ten sao 4 cánh */}
          <path
            d="M32 1C32.8 4.9 34.2 6.3 38 7C34.2 7.7 32.8 9.1 32 13C31.2 9.1 29.8 7.7 26 7C29.8 6.3 31.2 4.9 32 1Z"
            className="kim-companion__antenna"
          />

          {/* lông mày */}
          <path d="M18.4 22.2Q23.6 19.9 28.7 21.9" className="kim-brow kim-brow--left" />
          <path d="M35.3 21.9Q40.4 19.9 45.6 22.2" className="kim-brow kim-brow--right" />

          {/* mắt trái */}
          <g className="kim-eye kim-eye--left">
            <ellipse cx="23.6" cy="30" rx="4.5" ry="5.3" className="kim-eye__white" />
            <g className="kim-eye__look">
              <ellipse cx="23.9" cy="30.6" rx="2.5" ry="3.2" className="kim-eye__iris" />
              <circle cx="23.9" cy="30.9" r="1.35" className="kim-eye__pupil" />
              <circle cx="22.7" cy="28.7" r="0.85" className="kim-eye__glint" />
            </g>
          </g>
          {/* mắt phải */}
          <g className="kim-eye kim-eye--right">
            <ellipse cx="40.4" cy="30" rx="4.5" ry="5.3" className="kim-eye__white" />
            <g className="kim-eye__look">
              <ellipse cx="40.1" cy="30.6" rx="2.5" ry="3.2" className="kim-eye__iris" />
              <circle cx="40.1" cy="30.9" r="1.35" className="kim-eye__pupil" />
              <circle cx="38.9" cy="28.7" r="0.85" className="kim-eye__glint" />
            </g>
          </g>

          {/* má ửng khi happy */}
          <ellipse cx="17.4" cy="38.6" rx="4.1" ry="2.3" className="kim-cheek kim-cheek--left" />
          <ellipse cx="46.6" cy="38.6" rx="4.1" ry="2.3" className="kim-cheek kim-cheek--right" />

          {/* miệng: path khép theo mood + ellipse mở khi speaking */}
          <g className="kim-mouth">
            <path
              d={
                mood === "happy"
                  ? "M23.2 42.4Q32 51.4 40.8 42.4"
                  : mood === "thinking"
                    ? "M27.4 45.6Q32 47.1 36.8 44.4"
                    : mood === "curious"
                      ? "M27 45Q32 47.6 37 45"
                      : "M26 44Q32 48 38 44"
              }
              className="kim-mouth__closed"
            />
            <ellipse cx="32" cy="45.2" rx="4.2" ry="2.2" className="kim-mouth__open" />
          </g>
        </svg>
      </span>
      <span className="kim-companion__scan" />
    </span>
  );
}

export interface KimSpeechProps {
  text: string;
  mood?: KimMood;
  /** Cạnh mặt KIM trong bubble (px). Mặc định 52. */
  size?: number;
  className?: string;
}

/**
 * Bubble + typewriter. Screen reader đọc nguyên câu MỘT lần qua live region;
 * phần chữ chạy từng ký tự là aria-hidden. Reduced-motion → hiện full ngay.
 */
export function KimSpeech({ text, mood = "idle", size = 52, className }: KimSpeechProps) {
  const reduced = usePrefersReducedMotion();
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    if (!text) {
      setVisibleChars(0);
      return;
    }
    if (reduced) {
      setVisibleChars(text.length);
      return;
    }
    setVisibleChars(0);
    let index = 0;
    const stepMs = Math.min(38, Math.max(16, Math.round(1400 / text.length)));
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleChars(index);
      if (index % 4 === 0) playSfx("type");
      if (index >= text.length) window.clearInterval(timer);
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [text, reduced]);

  const done = reduced || visibleChars >= text.length;
  const shown = done ? text : text.slice(0, visibleChars);
  const rootStyle = { "--kim-speech-size": `${size}px` } as CSSProperties;

  return (
    <div
      data-mood={mood}
      className={`kim-speech${className ? ` ${className}` : ""}`}
      style={rootStyle}
    >
      <KimCompanion size={size} mood={mood} speaking={!done} />
      <div className="kim-speech__bubble" data-testid="kim-speech">
        <span className="kim-speech__label">KIM</span>
        <p className="kim-speech__text">
          <span className="kim-sr-only" role="status" aria-live="polite" aria-atomic="true">
            {text}
          </span>
          <span aria-hidden="true">
            {shown}
            {done ? null : <span className="kim-speech__caret" />}
          </span>
        </p>
      </div>
    </div>
  );
}
