/** Fallback monogram SVG → PNG (dùng khi website không có logo dùng được). */
import type { BrandColor, BrandLogo } from "../../src/shared/types";
import { processToPng } from "../lib/images";
import type { AssetStore } from "../storage/assets";

function xmlEscape(text: string): string {
  return text.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}

export function stripDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function monogramInitials(name: string): string {
  const clean = stripDiacritics(name).replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
  const words = clean.split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return "SK";
  if (words.length === 1) {
    const word = words[0]!;
    const letters = [...word].filter((ch) => /[a-z0-9]/i.test(ch));
    return (letters.slice(0, 2).join("") || "SK").toUpperCase();
  }
  const significant = words.filter((w) => !/^(va|and|và|of|cua|của|the)$/i.test(w));
  const list = significant.length >= 2 ? significant : words;
  return list
    .slice(0, 2)
    .map((w) => [...w].find((ch) => /[a-z0-9]/i.test(ch)) ?? "")
    .join("")
    .toUpperCase() || "SK";
}

export function buildMonogramSvg(input: { name: string; palette: BrandColor[] }): string {
  const initials = monogramInitials(input.name).slice(0, 2);
  const primary = input.palette.find((c) => c.role === "primary")?.hex ?? "#ef4123";
  const accent = input.palette.find((c) => c.role === "accent")?.hex ?? "#f59e6b";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${primary}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="#050a24"/>
  <rect x="18" y="18" width="476" height="476" rx="100" fill="url(#g)"/>
  <path d="M256 74 L282 204 L412 230 L282 256 L256 386 L230 256 L100 230 L230 204 Z" fill="#ffffff" opacity="0.16"/>
  <text x="256" y="272" font-family="DejaVu Sans, Arial, sans-serif" font-size="196" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${xmlEscape(initials)}</text>
</svg>`;
}

export async function createMonogramLogo(input: {
  name: string;
  palette: BrandColor[];
  assetStore: AssetStore;
}): Promise<{ logo: BrandLogo | null; warning?: string }> {
  try {
    const svg = buildMonogramSvg({ name: input.name, palette: input.palette });
    const processed = await processToPng(Buffer.from(svg, "utf8"), { targetSize: 512, allowUpscale: true });
    const asset = await input.assetStore.savePng(processed.png);
    return {
      logo: {
        id: asset.id,
        url: asset.url,
        width: processed.width,
        height: processed.height,
        source: "monogram",
        quality: "low",
        isMonogram: true,
      },
    };
  } catch {
    return { logo: null, warning: "Không tạo được monogram — báo cáo vẫn dùng chữ tên thương hiệu." };
  }
}
