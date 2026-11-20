/**
 * Orchestrator crawl: URL → robots → fetch HTML → parse → logo → palette → pre-scan.
 * Trả ScanResult fallback (source "fallback") khi website chặn/lỗi để UI vẫn cho nhập tay.
 * Không log/cache nội dung trang; cache chỉ lưu brand kit đã trích xuất.
 */
import type {
  BrandColor,
  BrandLogo,
  BrandProfile,
  PreScan,
  ScanRequest,
  ScanResult,
  SocialLink,
} from "../../src/shared/types";
import type { AppConfig } from "../config";
import { mapLimit } from "../lib/async";
import { CrawlError, isFallbackCrawlError } from "./types";
import { safeFetch, decodeText, type FetchLike } from "./fetch";
import { checkRobots } from "./robots";
import { validatePublicUrl } from "./ssrf";
import {
  domainRoot,
  nameFromDomain,
  parsePage,
  resolveBrandName,
  resolveDescription,
  resolveTagline,
  type ParsedPage,
} from "./parse";
import { detectIndustry } from "./industry";
import { buildPalette, FALLBACK_PALETTE, type PaletteResult } from "./palette";
import { LOGO_PRIORITY, resolveLogos, type LogoCandidate, type LogoResolveResult } from "./logo";
import { createMonogramLogo } from "./monogram";
import { buildPreScan, neutralPreScan } from "./prescan";
import { scanCacheKey, type ScanCache } from "./cache";
import type { AssetStore } from "../storage/assets";
import type { Logger } from "../lib/log";
import { processToPng } from "../lib/images";
import { shortId } from "../lib/ids";

export interface CrawlDeps {
  config: AppConfig;
  cache: ScanCache;
  assetStore: AssetStore;
  logger: Logger;
  fetchImpl?: FetchLike;
  now?: () => number;
}

function newScanId(): string {
  return shortId("sc_");
}

function pushWarning(warnings: string[], warning: string): void {
  if (!warnings.includes(warning)) warnings.push(warning);
}

function hostWithoutWww(hostname: string): string {
  return hostname.replace(/^www\./i, "");
}

interface IconIdea {
  url: string;
  minSize: number;
}

async function fetchManifestIcons(manifestUrl: string, deps: CrawlDeps): Promise<IconIdea[]> {
  try {
    const res = await safeFetch(manifestUrl, {
      fetchImpl: deps.fetchImpl,
      timeoutMs: Math.min(deps.config.crawl.timeoutMs, 5_000),
      maxBytes: 512 * 1024,
      userAgent: deps.config.crawl.userAgent,
      maxRedirects: 2,
    });
    if (res.status < 200 || res.status >= 300) return [];
    const json = JSON.parse(res.body.toString("utf8")) as {
      icons?: { src?: unknown; sizes?: unknown; type?: unknown }[];
    };
    const manifestBase = res.finalUrl;
    const icons: IconIdea[] = [];
    for (const icon of json.icons ?? []) {
      if (typeof icon.src !== "string" || !icon.src.trim()) continue;
      let abs: URL;
      try {
        abs = new URL(icon.src, manifestBase);
      } catch {
        continue;
      }
      if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
      const sizes = typeof icon.sizes === "string" ? icon.sizes : "";
      let minSize = 0;
      for (const token of sizes.split(/\s+/)) {
        const m = /^(\d+)x(\d+)$/i.exec(token);
        if (m) minSize = Math.max(minSize, Math.min(Number(m[1]), Number(m[2])));
      }
      icons.push({ url: abs.href, minSize });
    }
    return icons.sort((a, b) => b.minSize - a.minSize).slice(0, 6);
  } catch {
    return [];
  }
}

async function fetchCssTexts(parsed: ParsedPage, deps: CrawlDeps): Promise<{ texts: string[]; responsive: boolean }> {
  const sameOrigin = parsed.stylesheets.filter((href) => {
    try {
      return new URL(href).origin === new URL(parsed.finalUrl).origin;
    } catch {
      return false;
    }
  });
  const targets = sameOrigin.slice(0, deps.config.crawl.maxCssFiles);
  const results = await mapLimit(targets, 2, async (href) => {
    try {
      const res = await safeFetch(href, {
        fetchImpl: deps.fetchImpl,
        timeoutMs: Math.min(deps.config.crawl.timeoutMs, 5_000),
        maxBytes: deps.config.crawl.maxCssBytes,
        userAgent: deps.config.crawl.userAgent,
        maxRedirects: 2,
      });
      if (res.status < 200 || res.status >= 300) return "";
      return decodeText(res.body, res.charset);
    } catch {
      return "";
    }
  });
  const texts = results.filter((t): t is string => Boolean(t));
  const responsive = texts.some((css) => /@media[^{]*\(/i.test(css));
  return { texts, responsive };
}

function buildCandidateList(parsed: ParsedPage, manifestIcons: IconIdea[], hostname: string): LogoCandidate[] {
  const candidates: LogoCandidate[] = [];
  for (const logo of parsed.headerLogos) {
    if (logo.kind === "svg") {
      candidates.push({
        kind: "svg",
        svg: logo.svg,
        source: "header-svg",
        priority: LOGO_PRIORITY.header,
        alt: logo.alt,
      });
      continue;
    }
    if (!logo.url) continue;
    candidates.push({
      kind: "url",
      url: logo.url,
      source: "header",
      priority: logo.logoSig ? LOGO_PRIORITY.header : 60,
      alt: logo.alt,
      widthHint: logo.width,
      heightHint: logo.height,
    });
  }
  if (parsed.schema.logoUrl) {
    try {
      const url = new URL(parsed.schema.logoUrl, parsed.finalUrl).href;
      candidates.push({ kind: "url", url, source: "schema.org", priority: LOGO_PRIORITY.schema });
    } catch {
      /* bỏ qua URL hỏng */
    }
  }
  if (parsed.schema.sameAs.length > 0) {
    // sameAs không phải logo; giữ nguyên xử lý social ở parse
  }
  for (const icon of parsed.appleTouchIcons) {
    candidates.push({
      kind: "url",
      url: icon.url,
      source: "apple-touch-icon",
      priority: LOGO_PRIORITY.appleTouch,
      widthHint: icon.minSize || undefined,
      heightHint: icon.minSize || undefined,
    });
  }
  for (const icon of manifestIcons) {
    candidates.push({
      kind: "url",
      url: icon.url,
      source: "manifest",
      priority: LOGO_PRIORITY.manifest,
      widthHint: icon.minSize || undefined,
      heightHint: icon.minSize || undefined,
    });
  }
  if (parsed.ogImage) {
    candidates.push({ kind: "url", url: parsed.ogImage, source: "og:image", priority: LOGO_PRIORITY.ogImage });
  }
  for (const icon of parsed.icons.slice(0, 3)) {
    candidates.push({
      kind: "url",
      url: icon.url,
      source: "favicon",
      priority: LOGO_PRIORITY.favicon,
      widthHint: icon.minSize || undefined,
      heightHint: icon.minSize || undefined,
    });
  }
  const root = domainRoot(hostname);
  candidates.push({
    kind: "url",
    url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(root)}&sz=256`,
    source: "google",
    priority: LOGO_PRIORITY.google,
  });
  candidates.push({
    kind: "url",
    url: `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`,
    source: "duckduckgo",
    priority: LOGO_PRIORITY.duckduckgo,
  });
  return candidates;
}

/** Giữ 6 ứng viên đầu nhưng ưu tiên đa dạng nguồn (header tối đa 3). */
function selectCandidates(candidates: LogoCandidate[], max: number): LogoCandidate[] {
  const sorted = [...candidates].sort((a, b) => b.priority - a.priority);
  const selected: LogoCandidate[] = [];
  let headerCount = 0;
  for (const candidate of sorted) {
    if (selected.length >= max) break;
    if (candidate.source === "header" || candidate.source === "header-svg") {
      if (headerCount >= 3) continue;
      headerCount += 1;
    }
    selected.push(candidate);
  }
  return selected;
}

function buildBrandProfile(input: {
  name: string;
  domain?: string;
  tagline?: string;
  description?: string;
  industry?: string;
  socials: SocialLink[];
  logo: BrandLogo | null;
  logoAlternatives: BrandLogo[];
  palette: BrandColor[];
}): BrandProfile {
  return {
    name: input.name,
    domain: input.domain,
    tagline: input.tagline,
    description: input.description,
    industry: input.industry,
    socials: input.socials,
    logo: input.logo,
    logoAlternatives: input.logoAlternatives,
    palette: input.palette,
  };
}

async function monogramFor(name: string, palette: BrandColor[], assetStore: AssetStore): Promise<BrandLogo | null> {
  const { logo } = await createMonogramLogo({ name, palette, assetStore });
  return logo;
}

async function makeFallbackResult(input: {
  url?: URL;
  manualName?: string;
  manualIndustry?: string;
  warning: string;
  deps: CrawlDeps;
}): Promise<ScanResult> {
  const hostname = input.url?.hostname ?? "";
  const name = input.manualName?.trim() || (hostname ? nameFromDomain(hostname) : "Thương hiệu của bạn");
  const palette = FALLBACK_PALETTE.map((c) => ({ ...c }));
  const logo = await monogramFor(name, palette, input.deps.assetStore);
  const warning = input.warning;
  const preScan = neutralPreScan([warning]);
  const brand = buildBrandProfile({
    name,
    domain: hostname ? hostWithoutWww(hostname) : undefined,
    industry: input.manualIndustry,
    socials: [],
    logo,
    logoAlternatives: [],
    palette,
  });
  const warnings = [warning, "Bạn có thể nhập tay thông tin thương hiệu để tiếp tục."];
  const result: ScanResult = {
    scanId: newScanId(),
    source: "fallback",
    brand,
    preScan,
    warnings,
    cached: false,
    fetchedAt: new Date(input.deps.now?.() ?? Date.now()).toISOString(),
  };
  await input.deps.cache.saveById(result.scanId, result);
  return result;
}

function isHtmlResponse(contentType: string, body: Buffer): boolean {
  if (contentType.includes("html")) return true;
  const head = body.subarray(0, 512).toString("utf8").toLowerCase();
  return head.includes("<!doctype html") || head.includes("<html");
}

async function crawlWebsite(target: URL, deps: CrawlDeps): Promise<ScanResult> {
  const started = Date.now();
  const { config } = deps;
  const warnings: string[] = [];
  const hostname = target.hostname;

  const robots = await checkRobots(target.href, {
    fetchImpl: deps.fetchImpl,
    userAgent: config.crawl.userAgent,
    timeoutMs: Math.min(config.crawl.timeoutMs, 5_000),
  });
  if (!robots.allowed) {
    throw new CrawlError("ROBOTS_DISALLOWED", "Website không cho phép quét tự động (robots.txt).");
  }

  const page = await safeFetch(target.href, {
    fetchImpl: deps.fetchImpl,
    timeoutMs: config.crawl.timeoutMs,
    maxBytes: config.crawl.maxHtmlBytes,
    userAgent: config.crawl.userAgent,
    maxRedirects: config.crawl.maxRedirects,
  });
  if (page.status < 200 || page.status >= 300) {
    throw new CrawlError("HTTP_ERROR", `Website chặn truy cập (HTTP ${page.status}).`);
  }
  if (!isHtmlResponse(page.contentType, page.body)) {
    throw new CrawlError("PARSING_FAILED", "Trang chủ không phải nội dung HTML.");
  }

  const html = decodeText(page.body, page.charset);
  const parsed = parsePage(html, page.finalUrl);
  const finalHost = new URL(page.finalUrl).hostname;

  const [manifestIcons, cssResult] = await Promise.all([
    parsed.manifestUrl ? fetchManifestIcons(parsed.manifestUrl, deps) : Promise.resolve<IconIdea[]>([]),
    fetchCssTexts(parsed, deps),
  ]);

  const { name } = resolveBrandName(parsed);
  const description = resolveDescription(parsed);
  const tagline = resolveTagline(parsed);
  const hasSlogan = Boolean(parsed.sloganText || parsed.schema.slogan);
  const responsiveCss = parsed.hasResponsiveInlineCss || cssResult.responsive;

  const candidateList = buildCandidateList(parsed, manifestIcons, finalHost);
  const selected = selectCandidates(candidateList, config.crawl.maxLogoCandidates);
  const logoResult: LogoResolveResult = await resolveLogos(selected, {
    fetchImpl: deps.fetchImpl,
    userAgent: config.crawl.userAgent,
    timeoutMs: config.crawl.timeoutMs,
    maxImageBytes: config.crawl.maxImageBytes,
    maxCandidates: config.crawl.maxLogoCandidates,
    assetStore: deps.assetStore,
  });
  for (const warning of logoResult.warnings) pushWarning(warnings, warning);

  const paletteResult: PaletteResult = await buildPalette({
    logoPng: logoResult.bestPng,
    themeColor: parsed.themeColor,
    cssTexts: cssResult.texts,
    inlineCss: parsed.inlineStyles,
  });

  let logo = logoResult.best;
  if (!logo) {
    logo = await monogramFor(name, paletteResult.palette, deps.assetStore);
    if (logo) pushWarning(warnings, "Chưa có logo dùng được — đang hiển thị monogram từ tên thương hiệu.");
  }
  if (paletteResult.palette.every((c) => c.source === "fallback")) {
    pushWarning(warnings, "Chưa trích được màu thương hiệu — đang dùng bảng màu tạm.");
  }

  const industry =
    detectIndustry({
      name,
      title: parsed.title,
      description,
      tagline,
      headings: parsed.headings,
      bodyText: parsed.bodyText,
      metaKeywords: parsed.metaKeywords,
    })?.industry ?? undefined;

  const mobileFriendly = parsed.hasViewport;
  const preScan: PreScan = buildPreScan({
    source: "url",
    logo,
    palette: paletteResult.palette,
    colorConsistency: paletteResult.colorConsistency,
    hasSlogan,
    sloganText: parsed.sloganText ?? parsed.schema.slogan,
    socials: parsed.socials,
    mobileFriendly,
    hasViewport: parsed.hasViewport,
    hasResponsiveCss: responsiveCss,
    themeColorFound: Boolean(parsed.themeColor),
  });

  const brand = buildBrandProfile({
    name,
    domain: hostWithoutWww(finalHost),
    tagline,
    description,
    industry,
    socials: parsed.socials,
    logo,
    logoAlternatives: logoResult.alternatives,
    palette: paletteResult.palette,
  });

  const result: ScanResult = {
    scanId: newScanId(),
    source: "url",
    brand,
    preScan,
    warnings,
    cached: false,
    fetchedAt: new Date(deps.now?.() ?? Date.now()).toISOString(),
  };

  await deps.cache.set(scanCacheKey(target.href), result);
  await deps.cache.saveById(result.scanId, result);
  deps.logger.info("scan.done", {
    host: hostname,
    durationMs: Date.now() - started,
    source: "url",
    logoSource: logo?.source ?? "none",
    logoQuality: logo?.quality ?? "none",
    signals: preScan.signals.length,
    warnings: warnings.length,
  });
  return result;
}

function decodeDataUrl(dataUrl: string, maxBytes: number): Buffer | null {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl.trim());
  if (!m) return null;
  const mime = (m[1] ?? "").toLowerCase();
  if (mime && !mime.startsWith("image/")) return null;
  let buffer: Buffer;
  try {
    buffer = m[2] ? Buffer.from(m[3]!, "base64") : Buffer.from(decodeURIComponent(m[3]!), "utf8");
  } catch {
    return null;
  }
  if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) return null;
  return buffer;
}

async function logoFromDataUrl(
  dataUrl: string,
  deps: CrawlDeps,
): Promise<{ logo: BrandLogo; png: Buffer } | null> {
  const buffer = decodeDataUrl(dataUrl, deps.config.limits.logoFileBytes);
  if (!buffer) return null;
  try {
    const processed = await processToPng(buffer, { targetSize: 512, allowUpscale: true });
    const asset = await deps.assetStore.savePng(processed.png);
    const quality: BrandLogo["quality"] =
      Math.min(processed.width, processed.height) >= 256 ? "high" : Math.min(processed.width, processed.height) >= 128 ? "medium" : "low";
    return {
      logo: {
        id: asset.id,
        url: asset.url,
        width: processed.width,
        height: processed.height,
        source: "upload",
        quality,
      },
      png: processed.png,
    };
  } catch {
    return null;
  }
}

async function scanManual(request: ScanRequest, deps: CrawlDeps): Promise<ScanResult> {
  const manual = request.manual!;
  const { config } = deps;
  const warnings: string[] = [];
  let website: URL | null = null;
  if (manual.website) {
    try {
      website = validatePublicUrl(manual.website);
    } catch {
      pushWarning(warnings, "Địa chỉ website nhập tay chưa đúng — bỏ qua bước kiểm tra website.");
    }
  }

  let base: ScanResult | null = null;
  if (website) {
    try {
      base = await crawlWebsite(website, deps);
      for (const warning of base.warnings) pushWarning(warnings, warning);
    } catch (err) {
      if (err instanceof CrawlError && isFallbackCrawlError(err.code)) {
        pushWarning(warnings, `${err.message} Đang dùng thông tin nhập tay.`);
      } else if (!(err instanceof CrawlError)) {
        deps.logger.error("scan.manual.base_failed", { error: err instanceof Error ? err.name : "unknown" });
        pushWarning(warnings, "Không quét được website — đang dùng thông tin nhập tay.");
      } else {
        throw err;
      }
    }
  }

  let uploaded: { logo: BrandLogo; png: Buffer } | null = null;
  if (manual.logoDataUrl) {
    uploaded = await logoFromDataUrl(manual.logoDataUrl, deps);
    if (!uploaded) pushWarning(warnings, "Logo tải lên không đọc được — dùng logo/monogram khác.");
  }

  let palette: BrandColor[];
  let colorConsistency: number;
  if (uploaded) {
    const paletteResult = await buildPalette({ logoPng: uploaded.png });
    palette = paletteResult.palette;
    colorConsistency = paletteResult.colorConsistency;
  } else if (base) {
    palette = base.brand.palette;
    colorConsistency = base.preScan.colorConsistency;
  } else {
    palette = FALLBACK_PALETTE.map((c) => ({ ...c }));
    colorConsistency = 0;
  }

  const name = manual.name.trim();
  let logo = uploaded?.logo ?? base?.brand.logo ?? null;
  if (!logo) logo = await monogramFor(name, palette, deps.assetStore);

  const logoAlternatives: BrandLogo[] = [];
  if (base?.brand.logo) logoAlternatives.push(base.brand.logo);
  if (uploaded) logoAlternatives.push(...(base?.brand.logoAlternatives ?? []));
  else logoAlternatives.push(...(base?.brand.logoAlternatives ?? []));

  const socials = base?.brand.socials ?? [];
  const hasSlogan = Boolean(base?.preScan.hasSlogan);
  const preScan = base
    ? buildPreScan({
        source: "manual",
        logo,
        palette,
        colorConsistency,
        hasSlogan,
        sloganText: base.brand.tagline,
        socials,
        mobileFriendly: base.preScan.mobileFriendly,
        hasViewport: base.preScan.mobileFriendly,
        hasResponsiveCss: (base.preScan.criteria.mobile?.score ?? 0) >= 8,
        themeColorFound: base.brand.palette.some((c) => c.source === "theme"),
      })
    : buildPreScan({
        source: "manual",
        logo,
        palette,
        colorConsistency,
        hasSlogan: false,
        socials: [],
        mobileFriendly: false,
        hasViewport: false,
        hasResponsiveCss: false,
        themeColorFound: false,
      });

  const brand = buildBrandProfile({
    name,
    domain: website ? hostWithoutWww(website.hostname) : base?.brand.domain,
    tagline: base?.brand.tagline,
    description: base?.brand.description,
    industry: manual.industry?.trim() || base?.brand.industry,
    socials,
    logo,
    logoAlternatives: logoAlternatives.filter((item) => item.url !== logo?.url).slice(0, 3),
    palette,
  });

  if (!website) pushWarning(warnings, "Chưa có website được quét — hồ sơ dựa trên thông tin bạn nhập.");
  if (!manual.industry && !base?.brand.industry) {
    // không chặn — UI cho người dùng sửa ở bước xác nhận
  }

  const result: ScanResult = {
    scanId: newScanId(),
    source: "manual",
    brand,
    preScan,
    warnings,
    cached: false,
    fetchedAt: new Date(deps.now?.() ?? Date.now()).toISOString(),
  };
  await deps.cache.saveById(result.scanId, result);
  deps.logger.info("scan.done", {
    host: website?.hostname ?? null,
    source: "manual",
    logoSource: logo?.source ?? "none",
    warnings: warnings.length,
  });
  return result;
}

/** Entry point cho POST /api/scan. */
export async function scanBrand(request: ScanRequest, deps: CrawlDeps): Promise<ScanResult> {
  if (request.manual) return scanManual(request, deps);
  if (!request.url) {
    throw new CrawlError("INVALID_URL", "Cần địa chỉ website hoặc tên doanh nghiệp.");
  }

  let target: URL;
  try {
    target = validatePublicUrl(request.url);
  } catch (err) {
    if (err instanceof CrawlError) throw err;
    throw new CrawlError("INVALID_URL", "Địa chỉ website chưa đúng.");
  }

  const key = scanCacheKey(target.href);
  const cached = await deps.cache.get(key);
  if (cached) {
    const withNewId: ScanResult = { ...cached, scanId: newScanId(), cached: true };
    await deps.cache.saveById(withNewId.scanId, withNewId);
    deps.logger.info("scan.cached", { host: target.hostname });
    return withNewId;
  }

  const negative = await deps.cache.getNegative(key);
  if (negative) {
    deps.logger.info("scan.negative_cached", { host: target.hostname });
    return makeFallbackResult({ url: target, warning: negative.warning, deps });
  }

  try {
    return await crawlWebsite(target, deps);
  } catch (err) {
    if (err instanceof CrawlError) {
      if (!isFallbackCrawlError(err.code)) throw err;
      const warning = err.message;
      const result = await makeFallbackResult({ url: target, warning, deps });
      await deps.cache.setNegative(key, { code: err.code, message: err.message, warning });
      deps.logger.warn("scan.fallback", { host: target.hostname, code: err.code });
      return result;
    }
    deps.logger.error("scan.failed", {
      host: target.hostname,
      error: err instanceof Error ? err.name : "unknown",
    });
    const result = await makeFallbackResult({
      url: target,
      warning: "Không đọc được website lúc này — bạn có thể nhập tay thông tin.",
      deps,
    });
    return result;
  }
}
