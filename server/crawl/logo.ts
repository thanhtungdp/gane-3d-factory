/**
 * Chọn logo theo priority thật của trang: header/nav → schema.org → apple-touch-icon →
 * manifest → og:image → favicon lớn nhất → Google s2 → DuckDuckGo.
 * Tải tối đa 6 ứng viên, chấm điểm, chọn ảnh ≥128px tốt nhất, rasterize SVG, lưu PNG.
 */
import type { BrandLogo } from "../../src/shared/types";
import { mapLimit } from "../lib/async";
import { ImageProcessError, processToPng, readImageMeta } from "../lib/images";
import type { AssetStore } from "../storage/assets";
import { safeFetch, type FetchLike } from "./fetch";

export interface LogoCandidate {
  kind: "url" | "svg";
  url?: string;
  svg?: string;
  source: string;
  /** Priority thô theo nguồn (cao hơn = ưu tiên hơn). */
  priority: number;
  alt?: string;
  widthHint?: number;
  heightHint?: number;
}

export interface LogoResolveOptions {
  fetchImpl?: FetchLike;
  userAgent: string;
  timeoutMs: number;
  maxImageBytes: number;
  maxCandidates?: number;
  assetStore: AssetStore;
}

export interface LogoResolveResult {
  best: BrandLogo | null;
  alternatives: BrandLogo[];
  /** PNG của logo tốt nhất — dùng cho palette pixel. */
  bestPng: Buffer | null;
  warnings: string[];
}

export const LOGO_PRIORITY = {
  header: 100,
  schema: 90,
  appleTouch: 85,
  manifest: 80,
  ogImage: 70,
  favicon: 65,
  google: 40,
  duckduckgo: 30,
} as const;

interface FetchedLogo {
  candidate: LogoCandidate;
  png: Buffer;
  /** Kích thước PNG sau chuẩn hoá (để hiển thị). */
  width: number;
  height: number;
  /** Cạnh nhỏ nhất của ảnh gốc — dùng để chấm điểm/chất lượng, không bị upscale đánh lừa. */
  sourceMin: number;
  score: number;
  effectiveMin: number;
}

function qualityFor(minDim: number, fromVector: boolean): BrandLogo["quality"] {
  if (fromVector) return "high";
  if (minDim >= 256) return "high";
  if (minDim >= 128) return "medium";
  if (minDim > 0) return "low";
  return "none";
}

function scoreCandidate(params: {
  priority: number;
  width: number;
  height: number;
  vector: boolean;
  widthHint?: number;
  heightHint?: number;
}): { score: number; effectiveMin: number } {
  const width = params.width || params.widthHint || 0;
  const height = params.height || params.heightHint || 0;
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);
  const effectiveMin = params.vector ? 512 : minDim;
  let score = params.priority + (Math.min(effectiveMin, 512) / 512) * 60;
  if (!params.vector) {
    const aspect = minDim > 0 ? maxDim / Math.max(1, minDim) : 10;
    if (aspect > 4) score -= 30;
    else if (aspect > 2.5) score -= 12;
    if (minDim < 64) score -= 30;
    else if (minDim < 128) score -= 14;
  }
  return { score, effectiveMin };
}

function dedupeCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
  const seen = new Set<string>();
  const out: LogoCandidate[] = [];
  for (const candidate of candidates) {
    const key = candidate.kind === "svg" ? `svg:${candidate.svg?.slice(0, 100)}` : `url:${candidate.url}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(candidate);
  }
  return out;
}

function isIcoUrl(url: string): boolean {
  return /\.ico(?:[?#]|$)/i.test(url);
}

async function loadCandidate(
  candidate: LogoCandidate,
  options: LogoResolveOptions,
): Promise<FetchedLogo | null> {
  try {
    if (candidate.kind === "svg") {
      if (!candidate.svg) return null;
      const processed = await processToPng(Buffer.from(candidate.svg, "utf8"), {
        targetSize: 512,
        allowUpscale: true,
      });
      const { score, effectiveMin } = scoreCandidate({
        priority: candidate.priority,
        width: processed.width,
        height: processed.height,
        vector: true,
      });
      return {
        candidate,
        png: processed.png,
        width: processed.width,
        height: processed.height,
        sourceMin: 512,
        score,
        effectiveMin,
      };
    }

    if (!candidate.url || isIcoUrl(candidate.url)) return null;
    const res = await safeFetch(candidate.url, {
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      maxBytes: options.maxImageBytes,
      userAgent: options.userAgent,
      maxRedirects: 2,
    });
    if (res.status < 200 || res.status >= 300) return null;
    const looksSvg = res.contentType.includes("svg") || /^\s*<svg/i.test(res.body.subarray(0, 256).toString("utf8"));
    if (res.contentType && !res.contentType.startsWith("image/") && !looksSvg && res.contentType !== "application/octet-stream") {
      return null;
    }
    const original = looksSvg ? null : await readImageMeta(res.body);
    const processed = await processToPng(res.body, { targetSize: 512, allowUpscale: true });
    const vector = looksSvg || processed.format === "svg";
    const sourceWidth = original?.width || candidate.widthHint || processed.width;
    const sourceHeight = original?.height || candidate.heightHint || processed.height;
    const sourceMin = Math.min(sourceWidth, sourceHeight);
    const { score, effectiveMin } = scoreCandidate({
      priority: candidate.priority,
      width: sourceWidth,
      height: sourceHeight,
      vector,
      widthHint: candidate.widthHint,
      heightHint: candidate.heightHint,
    });
    return {
      candidate,
      png: processed.png,
      width: processed.width,
      height: processed.height,
      sourceMin: vector ? 512 : sourceMin,
      score,
      effectiveMin,
    };
  } catch (err) {
    if (err instanceof ImageProcessError) return null;
    return null;
  }
}

function toBrandLogo(fetched: FetchedLogo, asset: { id: string; url: string }, quality: BrandLogo["quality"]): BrandLogo {
  return {
    id: asset.id,
    url: asset.url,
    width: fetched.width,
    height: fetched.height,
    source: fetched.candidate.source,
    quality,
  };
}

export async function resolveLogos(
  candidates: LogoCandidate[],
  options: LogoResolveOptions,
): Promise<LogoResolveResult> {
  const warnings: string[] = [];
  const unique = dedupeCandidates(candidates);
  const maxCandidates = options.maxCandidates ?? 6;
  const limited = unique.slice(0, maxCandidates);
  if (unique.length === 0) {
    return { best: null, alternatives: [], bestPng: null, warnings: ["Không tìm thấy ứng viên logo trên website."] };
  }

  const fetched = (await mapLimit(limited, 3, (candidate) => loadCandidate(candidate, options))).filter(
    (item): item is FetchedLogo => item !== null,
  );
  if (fetched.length === 0) {
    return { best: null, alternatives: [], bestPng: null, warnings: ["Không tải được logo từ website."] };
  }

  fetched.sort((a, b) => b.score - a.score);
  const preferred = fetched.find((f) => f.effectiveMin >= 128) ?? fetched[0]!;
  if (preferred.effectiveMin < 128) {
    warnings.push("Logo tìm thấy nhỏ hơn 128px — chất lượng hiển thị có thể chưa nét.");
  }
  if (fetched.length < limited.length && fetched.length <= 1) {
    warnings.push("Một số ảnh logo không đọc được định dạng.");
  }

  const bestAsset = await options.assetStore.savePng(preferred.png);
  const best = toBrandLogo(
    preferred,
    bestAsset,
    qualityFor(preferred.sourceMin, preferred.effectiveMin >= 512 && preferred.sourceMin >= 512),
  );

  const alternatives: BrandLogo[] = [];
  for (const item of fetched) {
    if (alternatives.length >= 2) break;
    if (item === preferred) continue;
    try {
      const asset = await options.assetStore.savePng(item.png);
      if (asset.id === bestAsset.id) continue;
      alternatives.push(toBrandLogo(item, asset, qualityFor(item.sourceMin, item.effectiveMin >= 512)));
    } catch {
      /* bỏ qua ứng viên phụ lỗi */
    }
  }

  return { best, alternatives, bestPng: preferred.png, warnings };
}
