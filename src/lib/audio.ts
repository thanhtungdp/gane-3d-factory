/**
 * Âm thanh synth WebAudio cho Hành trình Sao Kim — KHÔNG dùng file audio.
 *
 * Nguyên tắc:
 * - Mặc định BẬT theo yêu cầu sản phẩm, nhưng AudioContext chỉ chạy sau gesture.
 *   `AudioDirector` gọi `setSoundEnabled(true)` ở gesture đầu tiên; trước đó
 *   `playSfx`/`setAmbience` chỉ ghi nhớ trạng thái, không ném lỗi, không tạo tiếng.
 * - iOS: AudioContext chỉ chạy sau gesture → `enableAudio()` được gọi trong tap;
 *   nếu resume thất bại, một listener gesture one-shot sẽ unlock sau.
 * - Tab ẩn: dừng pad + suspend context; hiện lại: khôi phục nếu đang bật.
 * - Pad hợp âm riêng cho từng trạm, SFX tổng hợp, master gain thấp để không chói.
 */
import type { PlanetId } from "@/shared/types";

export type SfxName =
  | "tap"
  | "correct"
  | "wrong"
  | "scan"
  | "launch"
  | "ignite"
  | "badge"
  | "warp"
  | "landing"
  | "type"
  | "answer";

const MASTER_VOLUME = 0.26;
const PAD_LEVEL = 0.11;

/** Hợp âm nền từng trạm (Hz). S: Am add9 · A: Fmaj7 · O: Cmaj9 · K: Dm · IM: Gsus2 */
const PAD_CHORDS: Record<PlanetId, number[]> = {
  S: [110.0, 164.81, 261.63, 493.88], // A2 E3 C4 B4
  A: [87.31, 130.81, 220.0, 329.63], // F2 C3 A3 E4
  O: [130.81, 196.0, 329.63, 392.0, 587.33], // C3 G3 E4 G4 D5
  K: [73.42, 110.0, 146.83, 220.0], // D2 A2 D3 A3
  IM: [98.0, 146.83, 196.0, 220.0, 293.66], // G2 D3 G3 A3 D4
};

interface AudioGraph {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  pad: GainNode;
  noise: AudioBuffer;
}

interface PadVoice {
  planet: PlanetId;
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
  timer: ReturnType<typeof setInterval> | null;
}

let graph: AudioGraph | null = null;
let enabled = true;
let unlocked = false;
let ambiencePlanet: PlanetId | null = null;
let padVoice: PadVoice | null = null;
let disposeRequested = false;

/* ── Hạ tầng ──────────────────────────────────────────────────────────── */

function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * 1.6);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    // lọc nhẹ cho đỡ "hiss" chói
    last = last * 0.86 + white * 0.14;
    data[i] = last * 2.2;
  }
  return buffer;
}

function ensureGraph(): AudioGraph | null {
  if (graph) return graph;
  if (disposeRequested) return null;
  const Ctor = audioContextCtor();
  if (!Ctor) return null;
  try {
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = enabled ? MASTER_VOLUME : 0.0001;
    master.connect(ctx.destination);
    const sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    sfx.connect(master);
    const pad = ctx.createGain();
    pad.gain.value = PAD_LEVEL;
    pad.connect(master);
    graph = { ctx, master, sfx, pad, noise: createNoiseBuffer(ctx) };
    return graph;
  } catch {
    return null;
  }
}

function setMaster(value: number, ramp = 0.18): void {
  const g = graph;
  if (!g) return;
  const t = g.ctx.currentTime;
  try {
    g.master.gain.cancelScheduledValues(t);
    g.master.gain.setValueAtTime(Math.max(0.0001, g.master.gain.value), t);
    g.master.gain.linearRampToValueAtTime(Math.max(0.0001, value), t + ramp);
  } catch {
    /* noop */
  }
}

async function resumeGraph(): Promise<boolean> {
  const g = ensureGraph();
  if (!g) return false;
  try {
    if (g.ctx.state !== "running") await g.ctx.resume();
    return g.ctx.state === "running";
  } catch {
    return false;
  }
}

/* ── Mở khoá iOS bằng gesture ─────────────────────────────────────────── */

let unlockHandlers: (() => void) | null = null;

function onUserGesture(): void {
  void unlock();
}

function bindUnlock(): void {
  if (unlockHandlers || typeof window === "undefined") return;
  unlockHandlers = onUserGesture;
  window.addEventListener("pointerdown", onUserGesture, { passive: true });
  window.addEventListener("keydown", onUserGesture);
}

function unbindUnlock(): void {
  if (!unlockHandlers || typeof window === "undefined") return;
  window.removeEventListener("pointerdown", unlockHandlers);
  window.removeEventListener("keydown", unlockHandlers);
  unlockHandlers = null;
}

async function unlock(): Promise<boolean> {
  const ok = await resumeGraph();
  if (!ok) return false;
  unlocked = true;
  unbindUnlock();
  setMaster(enabled ? MASTER_VOLUME : 0.0001);
  if (enabled && ambiencePlanet) startPad(ambiencePlanet);
  return true;
}

/* ── API công khai ───────────────────────────────────────────────────── */

/** Tạo AudioContext (không tự phát tiếng). Gọi trong hoặc ngoài gesture đều an toàn. */
export function initAudio(): AudioContext | null {
  return ensureGraph()?.ctx ?? null;
}

/**
 * Bật audio sau một gesture của người dùng (SoundToggle). Trả `true` nếu context
 * đã chạy; nếu iOS chặn, trả `false` và sẽ tự unlock ở gesture kế tiếp.
 */
export async function enableAudio(): Promise<boolean> {
  disposeRequested = false;
  enabled = true;
  const ok = await resumeGraph();
  if (!ok) {
    bindUnlock();
    return false;
  }
  unlocked = true;
  unbindUnlock();
  setMaster(MASTER_VOLUME);
  if (ambiencePlanet) startPad(ambiencePlanet);
  return true;
}

/** Bật/tắt tiếng. Gọi trước `initAudio` cũng an toàn (chỉ ghi nhớ trạng thái). */
export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (!on) {
    setMaster(0.0001, 0.12);
    stopPad(0.4);
    return;
  }
  setMaster(MASTER_VOLUME);
  if (graph?.ctx.state !== "running") {
    void enableAudio();
    return;
  }
  unlocked = true;
  if (ambiencePlanet) startPad(ambiencePlanet);
}

/** Có đang bật và context đã unlock để phát tiếng hay không. */
export function isAudioEnabled(): boolean {
  return enabled && graph?.ctx.state === "running";
}

function now(graph: AudioGraph): number {
  return graph.ctx.currentTime + 0.005;
}

interface ToneOptions {
  type?: OscillatorType;
  from: number;
  to?: number;
  start: number;
  duration: number;
  peak: number;
  attack?: number;
  detune?: number;
  dest?: AudioNode;
  filter?: { type: BiquadFilterType; freq: number; to?: number; q?: number };
}

function tone(ctx: AudioContext, base: AudioNode, opts: ToneOptions): void {
  const osc = ctx.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(Math.max(20, opts.from), opts.start);
  if (opts.to && opts.to !== opts.from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), opts.start + opts.duration);
  }
  if (opts.detune) osc.detune.value = opts.detune;

  const gain = ctx.createGain();
  const attack = opts.attack ?? 0.006;
  gain.gain.setValueAtTime(0.0001, opts.start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.peak), opts.start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.duration);

  let dest: AudioNode = opts.dest ?? base;
  if (opts.filter) {
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filter.type;
    filter.frequency.setValueAtTime(opts.filter.freq, opts.start);
    if (opts.filter.to) {
      filter.frequency.exponentialRampToValueAtTime(opts.filter.to, opts.start + opts.duration);
    }
    filter.Q.value = opts.filter.q ?? 1;
    filter.connect(dest);
    dest = filter;
  }
  osc.connect(gain);
  gain.connect(dest);
  osc.start(opts.start);
  osc.stop(opts.start + opts.duration + 0.05);
}

interface NoiseOptions {
  start: number;
  duration: number;
  peak: number;
  type: BiquadFilterType;
  freq: number;
  to?: number;
  q?: number;
  playbackRate?: number;
}

function noiseBurst(graph: AudioGraph, opts: NoiseOptions): void {
  const { ctx } = graph;
  const src = ctx.createBufferSource();
  src.buffer = graph.noise;
  src.loop = true;
  src.playbackRate.value = opts.playbackRate ?? 1;
  const filter = ctx.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(Math.max(40, opts.freq), opts.start);
  if (opts.to) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), opts.start + opts.duration);
  }
  filter.Q.value = opts.q ?? 0.9;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, opts.start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.peak), opts.start + Math.min(0.03, opts.duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(graph.sfx);
  src.start(opts.start);
  src.stop(opts.start + opts.duration + 0.05);
}

function playTap(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, { type: "sine", from: 940, to: 620, start: t, duration: 0.09, peak: 0.1 });
  tone(graph.ctx, graph.sfx, { type: "triangle", from: 1880, start: t, duration: 0.04, peak: 0.035 });
}

function playCorrect(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, { type: "triangle", from: 659.25, start: t, duration: 0.16, peak: 0.11 });
  tone(graph.ctx, graph.sfx, { type: "triangle", from: 987.77, start: t + 0.09, duration: 0.24, peak: 0.1 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 1318.51, start: t + 0.18, duration: 0.3, peak: 0.055 });
}

function playWrong(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, {
    type: "triangle",
    from: 233.08,
    to: 174.61,
    start: t,
    duration: 0.28,
    peak: 0.12,
    filter: { type: "lowpass", freq: 760, to: 420 },
  });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 116.54, to: 92.5, start: t + 0.02, duration: 0.3, peak: 0.1 });
}

function playScan(graph: AudioGraph, t: number): void {
  noiseBurst(graph, { start: t, duration: 0.55, peak: 0.07, type: "bandpass", freq: 520, to: 2800, q: 2.4 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 520, to: 880, start: t + 0.02, duration: 0.42, peak: 0.05 });
}

function playLaunch(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, { type: "sawtooth", from: 82, to: 520, start: t, duration: 0.85, peak: 0.09, filter: { type: "lowpass", freq: 380, to: 2200 } });
  noiseBurst(graph, { start: t, duration: 0.95, peak: 0.1, type: "highpass", freq: 520, to: 2600, q: 0.7 });
  tone(graph.ctx, graph.sfx, { type: "triangle", from: 55, to: 110, start: t, duration: 1.1, peak: 0.14 });
}

function playIgnite(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, { type: "sine", from: 150, to: 38, start: t, duration: 0.7, peak: 0.24 });
  noiseBurst(graph, { start: t, duration: 0.6, peak: 0.16, type: "lowpass", freq: 900, to: 180, q: 0.8 });
}

function playWarp(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, {
    type: "sawtooth",
    from: 110,
    to: 880,
    start: t,
    duration: 0.75,
    peak: 0.075,
    filter: { type: "lowpass", freq: 480, to: 3200 },
  });
  noiseBurst(graph, { start: t, duration: 0.7, peak: 0.09, type: "highpass", freq: 620, to: 3400, q: 0.7 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 320, to: 1560, start: t + 0.1, duration: 0.55, peak: 0.045 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 2093, start: t + 0.42, duration: 0.45, peak: 0.03 });
}

function playLanding(graph: AudioGraph, t: number): void {
  tone(graph.ctx, graph.sfx, { type: "sine", from: 190, to: 62, start: t, duration: 0.75, peak: 0.22 });
  noiseBurst(graph, { start: t, duration: 0.6, peak: 0.13, type: "lowpass", freq: 1200, to: 170, q: 0.8 });
  tone(graph.ctx, graph.sfx, { type: "triangle", from: 523.25, start: t + 0.26, duration: 0.4, peak: 0.055 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 783.99, start: t + 0.38, duration: 0.42, peak: 0.04 });
}

function playBadge(graph: AudioGraph, t: number): void {
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    tone(graph.ctx, graph.sfx, {
      type: i === 2 ? "triangle" : "sine",
      from: freq,
      start: t + i * 0.1,
      duration: 0.34,
      peak: 0.085,
    });
    tone(graph.ctx, graph.sfx, { type: "sine", from: freq * 2.01, start: t + i * 0.1, duration: 0.22, peak: 0.028 });
  });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 1567.98, start: t + 0.32, duration: 0.5, peak: 0.045 });
}

function playType(graph: AudioGraph, t: number): void {
  // Tiếng gõ rất nhẹ, cao và ngắn — chỉ để tạo nhịp chữ, không chói.
  const freq = 1480 + Math.random() * 420;
  tone(graph.ctx, graph.sfx, { type: "sine", from: freq, start: t, duration: 0.035, peak: 0.016 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: freq * 1.48, start: t + 0.006, duration: 0.024, peak: 0.008 });
}

function playAnswer(graph: AudioGraph, t: number): void {
  // Chuông đôi mềm, không phán đúng/sai — quiz xong vẫn có phản hồi âm thanh.
  tone(graph.ctx, graph.sfx, { type: "sine", from: 523.25, start: t, duration: 0.22, peak: 0.055, attack: 0.012 });
  tone(graph.ctx, graph.sfx, { type: "sine", from: 783.99, start: t + 0.08, duration: 0.32, peak: 0.04, attack: 0.012 });
}

/** Phát SFX tổng hợp. Không ném lỗi khi audio chưa init/chưa bật. */
export function playSfx(name: SfxName): void {
  if (!enabled) return;
  const g = graph ?? ensureGraph();
  if (!g) return;
  if (g.ctx.state === "suspended") {
    void g.ctx.resume().catch(() => undefined);
    return;
  }
  if (g.ctx.state !== "running") return;
  const t = now(g);
  try {
    switch (name) {
      case "tap":
        playTap(g, t);
        break;
      case "correct":
        playCorrect(g, t);
        break;
      case "wrong":
        playWrong(g, t);
        break;
      case "scan":
        playScan(g, t);
        break;
      case "launch":
        playLaunch(g, t);
        break;
      case "ignite":
        playIgnite(g, t);
        break;
      case "badge":
        playBadge(g, t);
        break;
      case "warp":
        playWarp(g, t);
        break;
      case "landing":
        playLanding(g, t);
        break;
      case "type":
        playType(g, t);
        break;
      case "answer":
        playAnswer(g, t);
        break;
      default:
        break;
    }
  } catch {
    /* âm thanh là tuỳ chọn — không làm hỏng gameplay */
  }
}

/* ── Pad hợp âm từng trạm ─────────────────────────────────────────────── */

function startPad(planet: PlanetId): void {
  const g = ensureGraph();
  if (!g || !enabled) return;
  if (g.ctx.state !== "running") return;
  if (padVoice?.planet === planet) return;

  stopPad(0.9);

  const ctx = g.ctx;
  if (ctx.state !== "running") return;
  const t0 = ctx.currentTime;
  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0.0001, t0);
  voiceGain.gain.exponentialRampToValueAtTime(0.11, t0 + 3.4);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 980;
  filter.Q.value = 0.45;
  filter.connect(voiceGain);
  voiceGain.connect(g.pad);

  const sources: AudioScheduledSourceNode[] = [];
  const notes = PAD_CHORDS[planet];
  const perNote = 0.55 / notes.length;

  notes.forEach((freq, index) => {
    // Sine thuần, detune rất nhẹ: pad thiên hà êm, không có hài bậc cao gắt.
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = index % 2 === 0 ? -3 : 4;
    const gain = ctx.createGain();
    gain.gain.value = perNote;
    osc.connect(gain);
    gain.connect(filter);
    osc.start(t0);
    sources.push(osc);
  });

  // LFO mở/khép filter rất chậm để pad "thở"
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start(t0);
  sources.push(lfo);

  const melody = [notes[2]! * 2, notes[3]! * 2, notes[2]! * 2.5, notes[1]! * 3];
  let melodyIndex = 0;
  const timer = setInterval(() => {
    const live = graph;
    if (!live || !enabled || live.ctx.state !== "running" || padVoice?.planet !== planet) return;
    const note = melody[melodyIndex % melody.length] ?? 880;
    melodyIndex += 1;
    const at = now(live);
    tone(live.ctx, live.pad, { type: "sine", from: note, start: at, duration: 2.6, peak: 0.018, attack: 0.5 });
    tone(live.ctx, live.pad, { type: "sine", from: note * 2.003, start: at + 0.02, duration: 1.4, peak: 0.006, attack: 0.45 });
  }, 7200);

  padVoice = { planet, gain: voiceGain, sources, timer };
}

function stopPad(fade = 1.2): void {
  const voice = padVoice;
  padVoice = null;
  if (voice?.timer) clearInterval(voice.timer);
  if (!voice || !graph) return;
  const ctx = graph.ctx;
  const t = ctx.currentTime;
  try {
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), t);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
  } catch {
    /* noop */
  }
  for (const source of voice.sources) {
    try {
      source.stop(t + fade + 0.05);
    } catch {
      /* noop */
    }
  }
  const gain = voice.gain;
  setTimeout(
    () => {
      try {
        gain.disconnect();
      } catch {
        /* noop */
      }
    },
    (fade + 0.2) * 1000,
  );
}

/** Đổi pad theo trạm; `null` để tắt pad. Gọi trước khi bật audio cũng an toàn. */
export function setAmbience(planet: PlanetId | null): void {
  ambiencePlanet = planet;
  if (!enabled) return;
  if (!planet) {
    stopPad();
    return;
  }
  if (graph?.ctx.state === "running") startPad(planet);
}

/** Dừng mọi âm thanh (pad + SFX đang phát) nhưng giữ trạng thái ambience. */
export function stopAll(): void {
  stopPad(0.35);
  const g = graph;
  if (!g) return;
  const t = g.ctx.currentTime;
  try {
    g.master.gain.cancelScheduledValues(t);
    g.master.gain.setValueAtTime(Math.max(0.0001, g.master.gain.value), t);
    g.master.gain.linearRampToValueAtTime(0.0001, t + 0.08);
    // khôi phục master cho SFX/pad kế tiếp
    g.master.gain.setValueAtTime(0.0001, t + 0.18);
    g.master.gain.linearRampToValueAtTime(enabled ? MASTER_VOLUME : 0.0001, t + 0.32);
  } catch {
    /* noop */
  }
}

/** Dọn hẳn AudioContext (dùng khi unmount toàn app / test). Có thể init lại sau đó. */
export function disposeAudio(): void {
  stopPad(0.05);
  unbindUnlock();
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("pagehide", onPageHide);
  }
  const g = graph;
  graph = null;
  padVoice = null;
  enabled = false;
  unlocked = false;
  ambiencePlanet = null;
  disposeRequested = true;
  if (g) {
    try {
      void g.ctx.close();
    } catch {
      /* noop */
    }
  }
}

/* ── Tự dừng khi tab ẩn ───────────────────────────────────────────────── */

function onVisibilityChange(): void {
  if (!graph) return;
  if (document.visibilityState === "hidden") {
    stopAll();
    void graph.ctx.suspend().catch(() => undefined);
    return;
  }
  if (!enabled) return;
  void graph.ctx
    .resume()
    .then(() => {
      if (enabled && ambiencePlanet) startPad(ambiencePlanet);
    })
    .catch(() => undefined);
}

function onPageHide(): void {
  stopAll();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", onVisibilityChange);
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", onPageHide);
}

/** `true` nếu context đã được unlock bởi gesture (iOS). */
export function isAudioUnlocked(): boolean {
  return unlocked;
}

/** Named object tiện cho chỗ import `audio.*`. */
const audioApi = {
  initAudio,
  enableAudio,
  setSoundEnabled,
  playSfx,
  setAmbience,
  stopAll,
  disposeAudio,
  isAudioEnabled,
  isAudioUnlocked,
};

export default audioApi;

if (typeof window !== "undefined") bindUnlock();
