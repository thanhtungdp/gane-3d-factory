/** Helper test server: fixture loaders, fake fetch (không gọi mạng), temp data dir. */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, type AppConfig } from "../../server/config";
import { createNoopLogger, type Logger } from "../../server/lib/log";
import { createAssetStore, type AssetStore } from "../../server/storage/assets";
import { createScanCache, type ScanCache } from "../../server/crawl/cache";
import type { CrawlDeps } from "../../server/crawl";
import type { FetchLike, RawResponse } from "../../server/crawl/fetch";
import type {
  BrandColor,
  BrandLogo,
  PlanetContent,
  PlanetId,
  PlanetResult,
  PreScan,
} from "../../src/shared/types";
import { PLANET_ORDER } from "../../src/shared/planets";
import { buildPreScan } from "../../server/crawl/prescan";
import type { PlanetContentMap } from "../../server/report/content";

const REPO_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const FIXTURE_DIR = path.join(REPO_ROOT, "tests/fixtures");

export { REPO_ROOT, FIXTURE_DIR };

export function fixturePath(name: string): string {
  return path.join(FIXTURE_DIR, name);
}

export async function fixture(name: string): Promise<Buffer> {
  return readFile(fixturePath(name));
}

export async function fixtureText(name: string): Promise<string> {
  return readFile(fixturePath(name), "utf8");
}

export async function makeTempDir(prefix = "saokim-test-"): Promise<string> {
  return mkdtemp(path.join(tmpdir(), prefix));
}

export function testConfig(overrides: { dataDir: string; deepseekApiKey?: string; crmWebhookUrl?: string; crmSecret?: string }): AppConfig {
  return loadConfig(
    {
      NODE_ENV: "test",
      DATA_DIR: overrides.dataDir,
      SERVE_STATIC: "0",
      PORT: "8788",
      IP_HASH_SALT: "test-salt",
      ADMIN_TOKEN: "test-admin-token",
      PDF_TOKEN_SECRET: "test-pdf-secret",
      DEEPSEEK_API_KEY: overrides.deepseekApiKey ?? "",
      CRM_WEBHOOK_URL: overrides.crmWebhookUrl ?? "",
      CRM_WEBHOOK_SECRET: overrides.crmSecret ?? "",
    },
    REPO_ROOT,
  );
}

export interface FakeSiteOptions {
  disallowRobots?: boolean;
  pageStatus?: number;
  htmlFile?: string;
  omitLogo?: boolean;
  omitCss?: boolean;
}

export interface FakeFetchHandle {
  fetchImpl: FetchLike;
  calls: string[];
  countCalls(suffix: string): number;
}

const BASE = "https://www.hoasen.vn";

function response(status: number, body: Buffer | string, contentType?: string): RawResponse {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  return { status, headers, body: Buffer.isBuffer(body) ? body : Buffer.from(body, "utf8"), url: BASE };
}

export async function createFakeSiteFetch(options: FakeSiteOptions = {}): Promise<FakeFetchHandle> {
  const html = await fixtureText(options.htmlFile ?? "brand-page.html");
  const css = await fixtureText("brand-page-css.css");
  const manifest = await fixtureText("site.webmanifest");
  const robots = await fixtureText(options.disallowRobots ? "robots-disallow.txt" : "robots-allow.txt");
  const images: Record<string, { file: string; type: string }> = {
    "/logo-header.svg": { file: "logo-header.svg", type: "image/svg+xml" },
    "/logo-schema.png": { file: "logo-schema.png", type: "image/png" },
    "/apple-touch-icon.png": { file: "apple-touch-icon.png", type: "image/png" },
    "/favicon-32.png": { file: "favicon-32.png", type: "image/png" },
    "/favicon-16.png": { file: "favicon-16.png", type: "image/png" },
    "/og-image.png": { file: "og-image.png", type: "image/png" },
    "/icon-192.png": { file: "icon-192.png", type: "image/png" },
    "/icon-512.png": { file: "icon-512.png", type: "image/png" },
    "/tiny-logo.png": { file: "tiny-logo.png", type: "image/png" },
  };
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (url) => {
    calls.push(url);
    const parsed = new URL(url);
    const pageUrl = new URL(html.includes("/tiny-logo.png") ? `${BASE}/` : `${BASE}/`);
    const key = parsed.href;
    if (parsed.host !== "www.hoasen.vn") {
      return response(404, "not found", "text/plain");
    }
    void pageUrl;
    if (parsed.pathname === "/robots.txt") return response(200, robots, "text/plain");
    if (parsed.pathname === "/") {
      if (options.pageStatus && options.pageStatus >= 400) {
        return response(options.pageStatus, "forbidden", "text/html");
      }
      return response(200, html, "text/html; charset=utf-8");
    }
    if (parsed.pathname === "/assets/site.css") {
      return options.omitCss ? response(404, "missing", "text/plain") : response(200, css, "text/css; charset=utf-8");
    }
    if (parsed.pathname === "/site.webmanifest") return response(200, manifest, "application/manifest+json");
    const image = images[parsed.pathname];
    if (image && !(options.omitLogo && parsed.pathname.includes("logo"))) {
      return response(200, await fixture(image.file), image.type);
    }
    return response(404, "not found", "text/plain");
  };
  return {
    fetchImpl,
    calls,
    countCalls(suffix: string) {
      return calls.filter((url) => url.endsWith(suffix)).length;
    },
  };
}

export interface CrawlFixture {
  config: AppConfig;
  deps: CrawlDeps;
  assetStore: AssetStore;
  cache: ScanCache;
  site: FakeFetchHandle;
  dir: string;
  logger: Logger;
  cleanup(): Promise<void>;
}

export async function makeCrawlFixture(options: FakeSiteOptions = {}): Promise<CrawlFixture> {
  const dir = await makeTempDir();
  const config = testConfig({ dataDir: dir });
  const logger = createNoopLogger();
  const assetStore = createAssetStore(config.assetsDir);
  const cache = createScanCache({ dir: config.cacheDir });
  const site = await createFakeSiteFetch(options);
  const deps: CrawlDeps = { config, cache, assetStore, logger, fetchImpl: site.fetchImpl };
  return {
    config,
    deps,
    assetStore,
    cache,
    site,
    dir,
    logger,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
}

export function fakeLogo(overrides: Partial<BrandLogo> = {}): BrandLogo {
  return {
    id: "a".repeat(64),
    url: `/api/assets/${"a".repeat(64)}`,
    width: 512,
    height: 512,
    source: "header",
    quality: "high",
    ...overrides,
  };
}

export const GOOD_PALETTE: BrandColor[] = [
  { hex: "#0a6e3d", role: "primary", source: "logo" },
  { hex: "#f4a261", role: "accent", source: "css" },
  { hex: "#efeaf5", role: "neutral", source: "fallback" },
];

export function goodPreScan(): PreScan {
  return buildPreScan({
    source: "url",
    logo: fakeLogo(),
    palette: GOOD_PALETTE,
    colorConsistency: 8,
    hasSlogan: true,
    sloganText: "Vật liệu bền vững, ngôi nhà bền lâu",
    socials: [
      { type: "facebook", url: "https://facebook.com/hoasengroup" },
      { type: "zalo", url: "https://zalo.me/hoasengroup" },
      { type: "youtube", url: "https://youtube.com/@hoasengroup" },
    ],
    mobileFriendly: true,
    hasViewport: true,
    hasResponsiveCss: true,
    themeColorFound: true,
  });
}

/** Nội dung 5 trạm tối thiểu đúng schema: 2 knowledge + 1 diagnosis mỗi trạm. */
export function fakeContentMap(): PlanetContentMap {
  const evidenceKeys: Record<PlanetId, PlanetContent["decisions"][number]["evidenceKey"]> = {
    S: "logo",
    A: "slogan",
    O: "color",
    K: "social",
    IM: undefined,
  };
  const map = {} as PlanetContentMap;
  for (const planet of PLANET_ORDER) {
    map[planet] = {
      planet,
      slug: planet.toLowerCase(),
      intro: ["Mở đầu"],
      outro: ["Kết thúc"],
      insight: "Insight ngắn",
      badge: { id: `${planet}-badge`, name: `Huy hiệu ${planet}`, blurb: "Mô tả" },
      decisions: [
        {
          id: `${planet}-k1`,
          planet,
          kind: "knowledge",
          prompt: "Câu hỏi 1",
          options: [
            { id: "a", label: "A", points: 2, feedback: "Đúng" },
            { id: "b", label: "B", points: 1, feedback: "Một phần" },
            { id: "c", label: "C", points: 0, feedback: "Sai" },
          ],
          explain: "Giải thích",
        },
        {
          id: `${planet}-k2`,
          planet,
          kind: "knowledge",
          prompt: "Câu hỏi 2",
          options: [
            { id: "a", label: "A", points: 2, feedback: "Đúng" },
            { id: "b", label: "B", points: 1, feedback: "Một phần" },
            { id: "c", label: "C", points: 0, feedback: "Sai" },
          ],
          explain: "Giải thích",
        },
        {
          id: `${planet}-d1`,
          planet,
          kind: "diagnosis",
          prompt: "Chẩn đoán",
          options: [
            { id: "a", label: "A", points: 2, feedback: "Đã có" },
            { id: "b", label: "B", points: 1, feedback: "Một phần" },
            { id: "c", label: "C", points: 0, feedback: "Chưa có" },
          ],
          explain: "Giải thích",
          evidenceKey: evidenceKeys[planet],
        },
      ],
    };
  }
  return map;
}
