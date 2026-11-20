/** Tiện ích màu + monogram cho UI game. Không phụ thuộc asset ngoài brand. */
import type { BrandProfile } from "@/shared/types";

export const FALLBACK_PRIMARY = "#21409a";

export function normalizeHex(input?: string | null): string | null {
  if (!input) return null;
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    const [r, g, b] = raw.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

export function primaryColor(brand: BrandProfile): string {
  const primary = brand.palette.find((c) => c.role === "primary") ?? brand.palette[0];
  return normalizeHex(primary?.hex) ?? FALLBACK_PRIMARY;
}

export function accentColor(brand: BrandProfile): string {
  const accent =
    brand.palette.find((c) => c.role === "accent") ??
    brand.palette.find((c) => c.role !== "primary" && c.role !== "neutral");
  return normalizeHex(accent?.hex) ?? "#faa634";
}

/** Chữ cái đầu của tối đa 2 từ, dùng khi không có logo hoặc logo lỗi. */
export function monogramOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "SK";
  const letters = words.slice(0, 2).map((w) => Array.from(w)[0] ?? "");
  return letters.join("").toUpperCase() || "SK";
}

function channels(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return [
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

/** Trộn hex với target theo tỉ lệ t (0..1). */
export function mixHex(hex: string, target: string, t: number): string {
  const a = channels(hex);
  const b = channels(target);
  if (!a || !b) return normalizeHex(hex) ?? FALLBACK_PRIMARY;
  const k = Math.max(0, Math.min(1, t));
  return toHex(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return toHex(gray, gray, gray);
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return toHex(hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255);
}

/** Xoay hue để tạo màu khác rõ rệt; màu xám được xử lý bằng độ sáng. */
export function hueShift(hex: string, degrees: number): string {
  const c = channels(hex);
  if (!c) return normalizeHex(hex) ?? FALLBACK_PRIMARY;
  const [h, s, l] = rgbToHsl(c[0], c[1], c[2]);
  if (s < 0.08) {
    const nextL = Math.max(0.16, Math.min(0.84, l + (degrees >= 0 ? 0.16 : -0.16)));
    return hslToHex(h, 0.32, nextL);
  }
  return hslToHex((h + degrees / 360 + 1) % 1, Math.max(0.38, s), l);
}

/** Hai biến thể khác màu chính, dùng làm phương án nhiễu trong test ghi nhớ màu. */
export function colorVariants(hex: string): [string, string] {
  const base = normalizeHex(hex) ?? FALLBACK_PRIMARY;
  const first = hueShift(base, 132);
  const shifted = hueShift(base, -96);
  const second = shifted === first ? mixHex(base, "#000000", 0.42) : shifted;
  if (first === base) {
    return [mixHex(base, "#ffffff", 0.42), mixHex(base, "#000000", 0.38)];
  }
  return [first, second];
}

/** Màu chữ tương phản trên nền hex (dùng cho monogram). */
export function inkOn(hex: string): string {
  const c = channels(hex);
  if (!c) return "#f4f6fb";
  const [r, g, b] = c;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#06102e" : "#f4f6fb";
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}
