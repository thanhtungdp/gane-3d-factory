/**
 * Palette thương hiệu: gom màu từ pixel logo + theme-color + CSS (inline & same-origin),
 * gộp theo OKLab, khử trùng, đảm bảo tương phản trên nền navy.
 */
import sharp from "sharp";
import type { BrandColor } from "../../src/shared/types";
import { clamp, round1 } from "../../src/shared/scoring";

export const NAVY_BACKGROUND = "#050a24";

export interface PaletteInput {
  logoPng?: Buffer | null;
  themeColor?: string;
  cssTexts?: string[];
  inlineCss?: string;
}

export interface PaletteResult {
  palette: BrandColor[];
  colorConsistency: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Oklab {
  L: number;
  a: number;
  b: number;
}

interface ColorCandidate {
  rgb: Rgb;
  hex: string;
  weight: number;
  sources: Set<BrandColor["source"]>;
  count: number;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) =>
    Math.round(clamp01(n / 255) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToRgb(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return {
      r: Number.parseInt(value[0]! + value[0]!, 16),
      g: Number.parseInt(value[1]! + value[1]!, 16),
      b: Number.parseInt(value[2]! + value[2]!, 16),
    };
  }
  if (/^[0-9a-f]{6}$/i.test(value)) {
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
    };
  }
  return null;
}

export function srgbToOklab({ r, g, b }: Rgb): Oklab {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToRgb({ L, a, b }: Oklab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return { r: Math.round(clamp01(r) * 255), g: Math.round(clamp01(g) * 255), b: Math.round(clamp01(bl) * 255) };
}

function oklabDistance(a: Oklab, b: Oklab): number {
  return Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
}

function chromaOf(lab: Oklab): number {
  return Math.hypot(lab.a, lab.b);
}

export function relativeLuminance(rgb: Rgb): number {
  const r = srgbToLinear(rgb.r / 255);
  const g = srgbToLinear(rgb.g / 255);
  const b = srgbToLinear(rgb.b / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return 1;
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Kéo sáng/tăng độ tương phản trong OKLab cho tới khi đủ tương phản trên nền. */
export function ensureContrast(hex: string, backgroundHex: string, minRatio: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  let lab = srgbToOklab(rgb);
  let best = hex;
  for (let i = 0; i < 48; i += 1) {
    const candidate = rgbToHex(oklabToRgb(lab));
    if (contrastRatio(candidate, backgroundHex) >= minRatio) return candidate;
    best = candidate;
    lab = { L: Math.min(0.98, lab.L + 0.02), a: lab.a * 0.97, b: lab.b * 0.97 };
  }
  return best;
}

export function parseCssColor(raw: string): { rgb: Rgb; alpha: number } | null {
  const value = raw.trim().toLowerCase();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 6) {
      const rgb = hexToRgb(hex);
      return rgb ? { rgb, alpha: 1 } : null;
    }
    if (hex.length === 4) {
      const rgb = hexToRgb(hex.slice(0, 3));
      const alpha = Number.parseInt(hex[3]! + hex[3]!, 16) / 255;
      return rgb ? { rgb, alpha } : null;
    }
    if (hex.length === 8) {
      const rgb = hexToRgb(hex.slice(0, 6));
      const alpha = Number.parseInt(hex.slice(6, 8), 16) / 255;
      return rgb ? { rgb, alpha } : null;
    }
    return null;
  }
  const fn = /^(rgba?|hsla?)\(([^)]+)\)$/.exec(value);
  if (!fn) return null;
  const parts = fn[2]!.split(/[\s,/]+/).filter(Boolean);
  if (fn[1]!.startsWith("rgb")) {
    if (parts.length < 3) return null;
    const channel = (p: string): number => {
      if (p.endsWith("%")) return Math.round((Number.parseFloat(p) / 100) * 255);
      return Math.round(Number.parseFloat(p));
    };
    const rgb = { r: channel(parts[0]!), g: channel(parts[1]!), b: channel(parts[2]!) };
    if ([rgb.r, rgb.g, rgb.b].some((n) => !Number.isFinite(n))) return null;
    let alpha = 1;
    if (parts[3] !== undefined) {
      alpha = parts[3].endsWith("%") ? Number.parseFloat(parts[3]) / 100 : Number.parseFloat(parts[3]);
    }
    return { rgb, alpha: Number.isFinite(alpha) ? alpha : 1 };
  }
  if (parts.length < 3) return null;
  const h = ((Number.parseFloat(parts[0]!) % 360) + 360) % 360;
  const s = clamp01(Number.parseFloat(parts[1]!) / 100);
  const l = clamp01(Number.parseFloat(parts[2]!) / 100);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  const alpha = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;
  return {
    rgb: {
      r: Math.round((rp + m) * 255),
      g: Math.round((gp + m) * 255),
      b: Math.round((bp + m) * 255),
    },
    alpha: Number.isFinite(alpha) ? alpha : 1,
  };
}

const CSS_COLOR_RE = /#[0-9a-f]{3,8}(?![0-9a-f])|rgba?\([^)]*\)|hsla?\([^)]*\)/gi;

export function extractCssColors(css: string): Map<string, number> {
  const counts = new Map<string, number>();
  const matches = css.match(CSS_COLOR_RE) ?? [];
  for (const raw of matches) {
    const parsed = parseCssColor(raw);
    if (!parsed || parsed.alpha < 0.15) continue;
    const hex = rgbToHex(parsed.rgb);
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return counts;
}

async function logoColorCandidates(png: Buffer): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const { data, info } = await sharp(png)
      .resize(64, 64, { fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    for (let i = 0; i < data.length; i += channels) {
      const alpha = channels >= 4 ? (data[i + 3] ?? 255) : 255;
      if (alpha < 40) continue;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      // bỏ gần trắng/gần đen để palette tập trung vào màu nhận diện
      const lab = srgbToOklab({ r, g, b });
      if (lab.L > 0.96 || lab.L < 0.08) continue;
      const key = `${r >> 4},${g >> 4},${b >> 4}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  } catch {
    /* logo lỗi decode — palette vẫn lấy từ theme/CSS */
  }
  return counts;
}

function buildCandidates(
  logoCounts: Map<string, number>,
  themeColor: string | undefined,
  cssCounts: Map<string, number>,
): ColorCandidate[] {
  const candidates: ColorCandidate[] = [];

  const logoTotal = [...logoCounts.values()].reduce((a, b) => a + b, 0);
  if (logoTotal > 0) {
    for (const [key, count] of [...logoCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
      const [r, g, b] = key.split(",").map((n) => (Number(n) << 4) + 8);
      // bucket là trung bình thô; đủ tốt để xếp hạng và gộp OKLab sau đó
      candidates.push({
        rgb: { r: r ?? 0, g: g ?? 0, b: b ?? 0 },
        hex: rgbToHex({ r: r ?? 0, g: g ?? 0, b: b ?? 0 }),
        weight: (count / logoTotal) * 100,
        sources: new Set(["logo" as const]),
        count,
      });
    }
  }

  const theme = themeColor ? parseCssColor(themeColor) : null;
  if (theme && theme.alpha >= 0.5) {
    candidates.push({
      rgb: theme.rgb,
      hex: rgbToHex(theme.rgb),
      weight: 45,
      sources: new Set(["theme" as const]),
      count: 1,
    });
  }

  const cssTop = [...cssCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
  const cssTotal = cssTop.reduce((sum, [, count]) => sum + count, 0);
  if (cssTotal > 0) {
    for (const [hex, count] of cssTop) {
      const rgb = hexToRgb(hex);
      if (!rgb) continue;
      const lab = srgbToOklab(rgb);
      // Bỏ gần trắng/gần đen trong CSS: thường là nền/chữ, không phải màu nhận diện.
      if (lab.L > 0.94 || lab.L < 0.07) continue;
      candidates.push({
        rgb,
        hex,
        weight: (count / cssTotal) * 55,
        sources: new Set(["css" as const]),
        count,
      });
    }
  }
  return candidates;
}

function mergeCandidates(candidates: ColorCandidate[]): ColorCandidate[] {
  const sorted = [...candidates].sort((a, b) => b.weight - a.weight);
  const merged: { rgb: Rgb; lab: Oklab; weight: number; count: number; sources: Set<BrandColor["source"]> }[] = [];
  for (const candidate of sorted) {
    const lab = srgbToOklab(candidate.rgb);
    const existing = merged.find((m) => oklabDistance(m.lab, lab) < 0.035);
    if (existing) {
      const total = existing.weight + candidate.weight;
      const mix = (x: number, y: number) => (x * existing.weight + y * candidate.weight) / total;
      existing.lab = { L: mix(existing.lab.L, lab.L), a: mix(existing.lab.a, lab.a), b: mix(existing.lab.b, lab.b) };
      existing.rgb = oklabToRgb(existing.lab);
      existing.weight = total;
      existing.count += candidate.count;
      for (const source of candidate.sources) existing.sources.add(source);
    } else {
      merged.push({
        rgb: candidate.rgb,
        lab,
        weight: candidate.weight,
        count: candidate.count,
        sources: new Set(candidate.sources),
      });
    }
  }
  return merged
    .map((m) => ({
      rgb: m.rgb,
      hex: rgbToHex(m.rgb),
      weight: m.weight,
      count: m.count,
      sources: m.sources,
    }))
    .sort((a, b) => b.weight - a.weight);
}

function primarySource(sources: Set<BrandColor["source"]>): BrandColor["source"] {
  const order: BrandColor["source"][] = ["logo", "theme", "css", "manual", "fallback"];
  for (const source of order) if (sources.has(source)) return source;
  return "css";
}

function isNeutralish(lab: Oklab): boolean {
  return chromaOf(lab) < 0.045;
}

export interface FallbackPalette {
  palette: BrandColor[];
}

export const FALLBACK_PALETTE: BrandColor[] = [
  { hex: "#ef4123", role: "primary", source: "fallback" },
  { hex: "#f59e6b", role: "accent", source: "fallback" },
  { hex: "#efeaf5", role: "neutral", source: "fallback" },
];

/** Chọn tối đa 3 màu, khử trùng OKLab, đảm bảo đọc được trên nền navy. */
export async function buildPalette(input: PaletteInput): Promise<PaletteResult> {
  const logoCounts = input.logoPng ? await logoColorCandidates(input.logoPng) : new Map<string, number>();
  const cssCounts = new Map<string, number>();
  for (const css of input.cssTexts ?? []) {
    for (const [hex, count] of extractCssColors(css)) {
      cssCounts.set(hex, (cssCounts.get(hex) ?? 0) + count);
    }
  }
  if (input.inlineCss) {
    for (const [hex, count] of extractCssColors(input.inlineCss)) {
      cssCounts.set(hex, (cssCounts.get(hex) ?? 0) + count);
    }
  }

  const candidates = buildCandidates(logoCounts, input.themeColor, cssCounts);
  if (candidates.length === 0) {
    return { palette: FALLBACK_PALETTE.map((c) => ({ ...c })), colorConsistency: 0 };
  }
  const merged = mergeCandidates(candidates);
  if (merged.length === 0) {
    return { palette: FALLBACK_PALETTE.map((c) => ({ ...c })), colorConsistency: 0 };
  }

  const scored = merged.map((m) => {
    const lab = srgbToOklab(m.rgb);
    const chroma = chromaOf(lab);
    return { ...m, lab, chroma, score: m.weight * (1 + chroma * 1.6) + (m.sources.has("logo") ? 12 : 0) };
  });
  scored.sort((a, b) => b.score - a.score);

  const palette: BrandColor[] = [];
  // Ưu tiên màu có sắc (chroma) làm primary; tránh chọn màu gần trắng/gần đen.
  const primary =
    scored.find((c) => c.chroma >= 0.03 && c.lab.L >= 0.12 && c.lab.L <= 0.9) ??
    scored.find((c) => c.chroma >= 0.02) ??
    scored[0]!;
  const primaryHex = ensureContrast(primary.hex, NAVY_BACKGROUND, 3.2);
  palette.push({ hex: primaryHex, role: "primary", source: primarySource(primary.sources) });

  const primaryLab = srgbToOklab(hexToRgb(primaryHex) ?? primary.rgb);
  const accentCandidate =
    scored.slice(1).find((c) => oklabDistance(c.lab, primaryLab) > 0.07 && c.chroma >= 0.03) ??
    scored.slice(1).find((c) => oklabDistance(c.lab, primaryLab) > 0.05);
  if (accentCandidate) {
    palette.push({
      hex: ensureContrast(accentCandidate.hex, NAVY_BACKGROUND, 3),
      role: "accent",
      source: primarySource(accentCandidate.sources),
    });
  }

  const neutralCandidate =
    scored.find((c) => c.hex !== primary.hex && isNeutralish(c.lab)) ??
    scored.find((c) => c.hex !== primary.hex && c.chroma < 0.08);
  if (neutralCandidate) {
    palette.push({
      hex: ensureContrast(neutralCandidate.hex, NAVY_BACKGROUND, 4.5),
      role: "neutral",
      source: primarySource(neutralCandidate.sources),
    });
  } else {
    // không có màu trung tính thật: suy ra từ primary nhưng giữ nguồn trung thực
    const derivedLab = { L: 0.92, a: primaryLab.a * 0.12, b: primaryLab.b * 0.12 };
    palette.push({ hex: rgbToHex(oklabToRgb(derivedLab)), role: "neutral", source: primarySource(primary.sources) });
  }

  // đảm bảo có đủ 2 màu (schema yêu cầu tối thiểu 1, nhưng UI đẹp hơn với 2)
  if (palette.length < 2) {
    palette.push({ hex: FALLBACK_PALETTE[2]!.hex, role: "neutral", source: "fallback" });
  }

  const totalWeight = Math.max(1, merged.reduce((sum, m) => sum + m.weight, 0));
  const topShare = merged.slice(0, 3).reduce((sum, m) => sum + m.weight, 0) / totalWeight;
  const extraSpread = Math.max(0, merged.length - 8) * 0.15;
  const consistency = clamp(
    4 +
      topShare * 6 +
      (primary.sources.has("logo") ? 1.5 : 0) +
      (merged.some((m) => m.sources.has("theme")) ? 0.5 : 0) -
      extraSpread,
    0,
    10,
  );

  return {
    palette: palette.slice(0, 3),
    colorConsistency: round1(consistency),
  };
}
