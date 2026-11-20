/** Parse HTML bằng cheerio thành dữ liệu brand kit thô. Không lưu/cache nội dung trang. */
import * as cheerio from "cheerio";
import type { SocialLink } from "../../src/shared/types";

export interface SchemaOrgInfo {
  type?: string;
  name?: string;
  legalName?: string;
  description?: string;
  slogan?: string;
  logoUrl?: string;
  sameAs: string[];
}

export interface IconLink {
  url: string;
  rel: string;
  sizes: string;
  /** Cạnh nhỏ nhất parse từ `sizes`; 0 nếu không khai báo. */
  minSize: number;
  type?: string;
}

export interface HeaderLogoCandidate {
  kind: "img" | "svg";
  url?: string;
  svg?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Có dấu hiệu đây thực sự là logo (class/id/alt/ancestor) — dùng để chấm priority. */
  logoSig?: boolean;
}

export interface ParsedPage {
  pageUrl: string;
  finalUrl: string;
  title?: string;
  h1?: string;
  headings: string[];
  meta: Record<string, string>;
  schema: SchemaOrgInfo;
  /** Ứng viên logo trong header/nav, theo thứ tự DOM. */
  headerLogos: HeaderLogoCandidate[];
  icons: IconLink[];
  appleTouchIcons: IconLink[];
  manifestUrl?: string;
  ogImage?: string;
  stylesheets: string[];
  inlineStyles: string;
  socials: SocialLink[];
  themeColor?: string;
  hasViewport: boolean;
  hasResponsiveInlineCss: boolean;
  sloganText?: string;
  sloganSource?: string;
  /** Chỉ dùng để dò ngành; không log, không cache. */
  bodyText: string;
  metaKeywords?: string;
}

const BLOCKED_SCHEMES = /^(javascript|data|mailto|tel|file|blob):/i;

function cleanText(raw: string | undefined | null, max = 300): string | undefined {
  if (!raw) return undefined;
  const text = raw
    .replace(/\u00a0/g, " ")
  // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function stripTrademark(text: string): string {
  return text.replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
}

export function domainRoot(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? host;
  const secondLevel = parts[parts.length - 2] ?? "";
  const multiPartTlds = new Set(["com", "net", "org", "edu", "gov", "co", "ac", "biz", "info", "name", "pro"]);
  if (parts.length >= 3 && multiPartTlds.has(secondLevel)) {
    return parts.slice(0, -2).join(".");
  }
  return parts.slice(0, -1).join(".");
}

export function nameFromDomain(hostname: string): string {
  const root = domainRoot(hostname);
  const words = root
    .split(/[.-]+/)
    .filter(Boolean)
    .map((w) => (/^[a-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w));
  return words.join(" ") || hostname;
}

/** Tên thương hiệu từ <title>: tách theo | – — · và ưu tiên phần khớp tên miền. */
export function brandNameFromTitle(title: string | undefined, hostname: string): string | undefined {
  const cleaned = cleanText(stripTrademark(title ?? ""), 160);
  if (!cleaned) return undefined;
  const rootKey = domainRoot(hostname).replace(/[^a-z0-9]/g, "");
  const segments = cleaned
    .split(/\s*[|–—·•]\s*|\s+-\s+/)
    .map((s) => cleanText(stripTrademark(s), 80))
    .filter((s): s is string => typeof s === "string" && s.length >= 2);

  if (segments.length === 0) return cleaned;
  let best: { segment: string; score: number } | undefined;
  for (const segment of segments) {
    const key = segment
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    let score = 1;
    if (rootKey && key) {
      if (key === rootKey || key.startsWith(rootKey) || rootKey.startsWith(key)) score += 8;
      else if (rootKey.includes(key) || key.includes(rootKey)) score += 4;
    }
    if (segment.length <= 40) score += 2;
    if (/^(trang chủ|home|welcome|official site)$/i.test(segment)) score -= 5;
    if (!best || score > best.score) best = { segment, score };
  }
  return stripTrademark(best?.segment ?? segments[0]!);
}

function toAbsolute(raw: string | undefined, base: URL): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value || BLOCKED_SCHEMES.test(value)) return undefined;
  try {
    const url = new URL(value, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function pickSrcset(srcset: string | undefined, base: URL): string | undefined {
  if (!srcset) return undefined;
  let best: { url: string; weight: number } | undefined;
  for (const part of srcset.split(",")) {
    const [rawUrl, descriptor] = part.trim().split(/\s+/);
    if (!rawUrl) continue;
    const abs = toAbsolute(rawUrl, base);
    if (!abs) continue;
    const weight = descriptor ? Number.parseFloat(descriptor.replace(/[^\d.]/g, "")) || 0 : 0;
    if (!best || weight > best.weight) best = { url: abs, weight };
  }
  return best?.url;
}

function parseSizes(sizes: string | undefined): number {
  if (!sizes) return 0;
  let largest = 0;
  for (const token of sizes.trim().split(/\s+/)) {
    const m = /^(\d+)x(\d+)$/i.exec(token);
    if (!m) continue;
    largest = Math.max(largest, Math.min(Number(m[1]), Number(m[2])));
  }
  return largest;
}

function collectSchemaOrg($: cheerio.CheerioAPI): SchemaOrgInfo {
  const info: SchemaOrgInfo = { sameAs: [] };
  const orgTypes = new Set([
    "organization",
    "localbusiness",
    "corporation",
    "onlinestore",
    "store",
    "brand",
    "webshop",
    "professionalservice",
    "ngo",
    "educationalorganization",
  ]);
  const nodes: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    if (!raw || raw.length > 200_000) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      const queue: unknown[] = [parsed];
      while (queue.length) {
        const item = queue.shift();
        if (Array.isArray(item)) queue.push(...item);
        else if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          if (obj["@graph"]) queue.push(obj["@graph"]);
          nodes.push(obj);
        }
      }
    } catch {
      /* JSON-LD hỏng thì bỏ qua */
    }
  });
  const typeOf = (node: Record<string, unknown>): string[] => {
    const t = node["@type"];
    if (typeof t === "string") return [t.toLowerCase()];
    if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string").map((x) => x.toLowerCase());
    return [];
  };
  const org = nodes.find((n) => typeOf(n).some((t) => orgTypes.has(t)));
  const target = org ?? nodes.find((n) => n.name);
  if (!target) return info;
  info.type = typeOf(target)[0];
  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() ? v.trim() : undefined;
  info.name = str(target.name) ?? str(target.legalName);
  info.legalName = str(target.legalName);
  info.description = str(target.description);
  info.slogan = str(target.slogan) ?? str(target.slogan2);
  const logo = target.logo;
  if (typeof logo === "string") info.logoUrl = logo;
  else if (logo && typeof logo === "object") {
    const obj = logo as Record<string, unknown>;
    info.logoUrl = str(obj.url) ?? str(obj.contentUrl) ?? str(obj["@id"]);
  }
  const sameAs = target.sameAs;
  if (typeof sameAs === "string") info.sameAs.push(sameAs);
  else if (Array.isArray(sameAs)) {
    for (const v of sameAs) if (typeof v === "string" && v.trim()) info.sameAs.push(v.trim());
  }
  return info;
}

function socialType(href: string): SocialLink["type"] | undefined {
  let host: string;
  try {
    host = new URL(href).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com" || host.endsWith(".fb.com")) {
    return "facebook";
  }
  if (host === "zalo.me" || host.endsWith(".zalo.me") || host === "zaloapp.com" || host.endsWith(".zaloapp.com")) {
    return "zalo";
  }
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "youtube";
  return undefined;
}

function collectSocials($: cheerio.CheerioAPI, base: URL): SocialLink[] {
  const found: SocialLink[] = [];
  const seen = new Set<string>();
  const push = (href: string | undefined) => {
    if (!href) return;
    const abs = toAbsolute(href, base);
    if (!abs) return;
    const type = socialType(abs);
    if (!type) return;
    // Mỗi loại kênh chỉ cần một link đại diện (tránh trùng Facebook 2 lần).
    if (seen.has(type)) return;
    seen.add(type);
    found.push({ type, url: abs });
  };
  $("footer a[href]").each((_, el) => push($(el).attr("href")));
  $("a[href]").each((_, el) => push($(el).attr("href")));
  return found.slice(0, 8);
}

function extractSlogan(
  $: cheerio.CheerioAPI,
  schemaSlogan: string | undefined,
): { text?: string; source?: string } {
  const fromSchema = cleanText(schemaSlogan, 120);
  if (fromSchema) return { text: fromSchema, source: "schema.org" };
  const selectors = [
    '[itemprop="slogan"]',
    '[data-tagline]',
    '.tagline',
    '.slogan',
    '[class*="slogan" i]',
    '[class*="tagline" i]',
    '[class*="khau-hieu" i]',
  ];
  for (const selector of selectors) {
    const el = $(selector).first();
    if (!el.length) continue;
    const text = cleanText(el.first().text(), 120);
    if (text && text.length >= 4) return { text, source: selector };
  }
  return {};
}

function parseIconLinks($: cheerio.CheerioAPI, base: URL, relNeedle: string): IconLink[] {
  const out: IconLink[] = [];
  const seen = new Set<string>();
  $("link[rel]").each((_, el) => {
    const rel = ($(el).attr("rel") ?? "").toLowerCase();
    if (!rel.includes(relNeedle)) return;
    const href = toAbsolute($(el).attr("href"), base);
    if (!href || seen.has(href)) return;
    seen.add(href);
    const sizes = ($(el).attr("sizes") ?? "").trim();
    out.push({
      url: href,
      rel,
      sizes,
      minSize: parseSizes(sizes),
      type: $(el).attr("type"),
    });
  });
  return out.sort((a, b) => b.minSize - a.minSize);
}

export function parsePage(html: string, pageUrl: string): ParsedPage {
  const page = new URL(pageUrl);
  const $ = cheerio.load(html);
  const baseHref = toAbsolute($("base[href]").attr("href"), page);
  const base = baseHref ? new URL(baseHref) : page;

  const meta: Record<string, string> = {};
  $("meta").each((_, el) => {
    const name = ($(el).attr("property") ?? $(el).attr("name") ?? $(el).attr("itemprop") ?? "").toLowerCase();
    const content = $(el).attr("content");
    if (name && content && !meta[name]) meta[name] = content.trim();
  });

  const title = cleanText(stripTrademark($("title").first().text()), 200);
  const h1 = cleanText($("h1").first().text(), 160);
  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    if (headings.length >= 24) return;
    const t = cleanText($(el).text(), 120);
    if (t) headings.push(t);
  });

  const schema = collectSchemaOrg($);

  const headerLogos: HeaderLogoCandidate[] = [];
  const seenCandidates = new Set<string>();
  const headerImgSelectors = [
    'header img',
    'nav img',
    '[role="banner"] img',
    '[itemprop="logo"] img',
    'a[href="/"] img',
    'a[href="./"] img',
    '[class*="logo" i] img',
    '[id*="logo" i] img',
  ];
  for (const selector of headerImgSelectors) {
    $(selector).each((_, el) => {
      if (headerLogos.length >= 6) return;
      const src =
        toAbsolute($(el).attr("src"), base) ??
        pickSrcset($(el).attr("srcset"), base) ??
        toAbsolute($(el).attr("data-src"), base);
      if (!src || seenCandidates.has(src)) return;
      seenCandidates.add(src);
      const width = Number.parseInt($(el).attr("width") ?? "", 10);
      const height = Number.parseInt($(el).attr("height") ?? "", 10);
      const alt = cleanText($(el).attr("alt"), 120);
      const node = $(el);
      const logoSig =
        Boolean(node.closest('[class*="logo" i], [id*="logo" i], [itemprop="logo"], a[href="/"], a[href="./"]').length) ||
        /\b(logo|brand|thuong hieu|thương hiệu)\b/i.test(
          `${alt ?? ""} ${node.attr("class") ?? ""} ${node.attr("id") ?? ""}`,
        );
      headerLogos.push({
        kind: "img",
        url: src,
        alt,
        width: Number.isFinite(width) ? width : undefined,
        height: Number.isFinite(height) ? height : undefined,
        logoSig,
      });
    });
  }
  const headerSvgSelectors = [
    'header svg',
    'nav svg',
    '[role="banner"] svg',
    '[itemprop="logo"] svg',
    '[class*="logo" i] svg',
    '[id*="logo" i] svg',
    'a[href="/"] svg',
  ];
  for (const selector of headerSvgSelectors) {
    $(selector).each((_, el) => {
      if (headerLogos.length >= 8) return;
      const svg = $.html(el);
      if (!svg || svg.length < 60 || svg.length > 200_000) return;
      const key = `svg:${svg.slice(0, 120)}`;
      if (seenCandidates.has(key)) return;
      seenCandidates.add(key);
      headerLogos.push({ kind: "svg", svg, alt: cleanText($(el).attr("aria-label"), 120) });
    });
  }

  const icons = parseIconLinks($, base, "icon").filter((i) => !i.rel.includes("apple-touch"));
  const appleTouchIcons = parseIconLinks($, base, "apple-touch-icon");
  const manifestUrl = toAbsolute($('link[rel="manifest"]').attr("href"), base);
  const ogImage =
    toAbsolute(meta["og:image"] ?? meta["og:image:url"] ?? meta["twitter:image"], base) ??
    (schema.logoUrl ? toAbsolute(schema.logoUrl, base) : undefined);

  const stylesheets: string[] = [];
  const seenCss = new Set<string>();
  $('link[rel~="stylesheet"]').each((_, el) => {
    if (stylesheets.length >= 6) return;
    const href = toAbsolute($(el).attr("href"), base);
    if (!href || seenCss.has(href)) return;
    try {
      if (new URL(href).origin !== base.origin) return; // chỉ CSS same-origin
    } catch {
      return;
    }
    seenCss.add(href);
    stylesheets.push(href);
  });
  let inlineStyles = "";
  $("style").each((_, el) => {
    if (inlineStyles.length >= 200_000) return;
    inlineStyles += `${$(el).text()}\n`;
  });

  const socials = collectSocials($, base);
  const { text: sloganText, source: sloganSource } = extractSlogan($, schema.slogan);
  const themeColor = cleanText(meta["theme-color"] ?? meta["msapplication-tilecolor"], 32);

  const hasViewport = Boolean(
    meta.viewport && /width\s*=\s*device-width/i.test(meta.viewport),
  );
  const hasResponsiveInlineCss = /@media[^{]*\(/i.test(inlineStyles);
  const bodyText = cleanText($("body").text(), 6000) ?? "";

  return {
    pageUrl,
    finalUrl: page.href,
    title,
    h1,
    headings,
    meta,
    schema,
    headerLogos,
    icons,
    appleTouchIcons,
    manifestUrl,
    ogImage,
    stylesheets,
    inlineStyles,
    socials,
    themeColor,
    hasViewport,
    hasResponsiveInlineCss,
    sloganText,
    sloganSource,
    bodyText,
    metaKeywords: cleanText(meta.keywords, 500),
  };
}

/** Chọn tên hiển thị theo thứ tự spec: schema → og:site_name → application-name → title → h1 → domain. */
export function resolveBrandName(parsed: ParsedPage): { name: string; nameSource: string } {
  const candidates: { value?: string; source: string }[] = [
    { value: cleanText(parsed.schema.name, 120), source: "schema.org" },
    { value: cleanText(parsed.meta["og:site_name"], 120), source: "og:site_name" },
    { value: cleanText(parsed.meta["application-name"], 120), source: "application-name" },
    { value: brandNameFromTitle(parsed.title, new URL(parsed.finalUrl).hostname), source: "title" },
    { value: parsed.h1, source: "h1" },
  ];
  for (const candidate of candidates) {
    const value = candidate.value ? stripTrademark(candidate.value) : undefined;
    if (value && value.length >= 2 && value.length <= 120) {
      return { name: value.slice(0, 120), nameSource: candidate.source };
    }
  }
  return { name: nameFromDomain(new URL(parsed.finalUrl).hostname), nameSource: "domain" };
}

export function resolveDescription(parsed: ParsedPage): string | undefined {
  return (
    cleanText(parsed.schema.description, 300) ??
    cleanText(parsed.meta.description, 300) ??
    cleanText(parsed.meta["og:description"], 300) ??
    cleanText(parsed.meta["twitter:description"], 300)
  );
}

export function resolveTagline(parsed: ParsedPage): string | undefined {
  const explicit = cleanText(parsed.sloganText, 120);
  if (explicit) return explicit;
  const og = cleanText(parsed.meta["og:description"], 120);
  if (og && og.length <= 100) return og;
  return undefined;
}
