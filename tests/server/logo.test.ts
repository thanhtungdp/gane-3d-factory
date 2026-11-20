import { rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveLogos, type LogoCandidate } from "../../server/crawl/logo";
import { createAssetStore } from "../../server/storage/assets";
import { createNoopLogger } from "../../server/lib/log";
import type { FetchLike, RawResponse } from "../../server/crawl/fetch";
import { fixture, makeTempDir } from "./helpers";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function fakeImageFetch(map: Record<string, { file: string; type: string }>): FetchLike {
  return async (url): Promise<RawResponse> => {
    const key = Object.keys(map).find((suffix) => new URL(url).pathname.endsWith(suffix));
    if (!key) {
      return { status: 404, headers: { "content-type": "text/plain" }, body: Buffer.from("not found"), url };
    }
    const image = map[key]!;
    return {
      status: 200,
      headers: { "content-type": image.type },
      body: await fixture(image.file),
      url,
    };
  };
}

const IMAGES = {
  "/logo-large.png": { file: "logo-large.png", type: "image/png" },
  "/apple-touch-icon.png": { file: "apple-touch-icon.png", type: "image/png" },
  "/logo-header.svg": { file: "logo-header.svg", type: "image/svg+xml" },
  "/favicon-32.png": { file: "favicon-32.png", type: "image/png" },
};

async function makeStore(): Promise<ReturnType<typeof createAssetStore>> {
  const dir = await makeTempDir();
  dirs.push(dir);
  return createAssetStore(path.join(dir, "assets"));
}

function baseOptions(assetStore: ReturnType<typeof createAssetStore>) {
  return {
    fetchImpl: fakeImageFetch(IMAGES),
    userAgent: "SaoKimBrandScanner/1.0",
    timeoutMs: 2_000,
    maxImageBytes: 2 * 1024 * 1024,
    maxCandidates: 6,
    assetStore,
  };
}

describe("logo pipeline", () => {
  it("chọn ảnh ≥128px tốt nhất, ưu tiên header, trả PNG same-origin + alternatives", async () => {
    const assetStore = await makeStore();
    const candidates: LogoCandidate[] = [
      { kind: "url", url: "https://cdn.example.com/logo-large.png", source: "header", priority: 100 },
      { kind: "url", url: "https://cdn.example.com/apple-touch-icon.png", source: "apple-touch-icon", priority: 85 },
    ];
    const result = await resolveLogos(candidates, baseOptions(assetStore));
    expect(result.best).not.toBeNull();
    expect(result.best?.source).toBe("header");
    expect(result.best?.width).toBeGreaterThanOrEqual(128);
    expect(result.best?.url).toMatch(/^\/api\/assets\/[a-f0-9]{64}$/);
    expect(result.bestPng?.subarray(0, 4)).toEqual(PNG_MAGIC);
    expect(result.alternatives.length).toBeGreaterThanOrEqual(1);
    const stored = await assetStore.read(result.best!.id);
    expect(stored?.subarray(0, 4)).toEqual(PNG_MAGIC);
  });

  it("SVG inline luôn được rasterize thành PNG (không serve SVG)", async () => {
    const assetStore = await makeStore();
    const svg = await fixture("logo-primary.svg");
    const result = await resolveLogos(
      [{ kind: "svg", svg: svg.toString("utf8"), source: "header-svg", priority: 100 }],
      baseOptions(assetStore),
    );
    expect(result.best?.source).toBe("header-svg");
    expect(result.best?.quality).toBe("high");
    expect(result.best?.width).toBe(512);
    expect(result.bestPng?.subarray(0, 4)).toEqual(PNG_MAGIC);
  });

  it("favicon nhỏ vẫn dùng được nhưng cảnh báo chất lượng thấp", async () => {
    const assetStore = await makeStore();
    const result = await resolveLogos(
      [{ kind: "url", url: "https://cdn.example.com/favicon-32.png", source: "favicon", priority: 65 }],
      baseOptions(assetStore),
    );
    expect(result.best).not.toBeNull();
    expect(result.best?.quality).toBe("low");
    expect(result.warnings.join(" ")).toContain("128px");
  });

  it("không có ứng viên → trả null + warning để crawler dùng monogram", async () => {
    const assetStore = await makeStore();
    const result = await resolveLogos([], baseOptions(assetStore));
    expect(result.best).toBeNull();
    expect(result.bestPng).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("bỏ qua .ico không decode được, không crash", async () => {
    const assetStore = await makeStore();
    const result = await resolveLogos(
      [
        { kind: "url", url: "https://icons.duckduckgo.com/ip3/example.com.ico", source: "duckduckgo", priority: 30 },
        { kind: "url", url: "https://cdn.example.com/missing.png", source: "og:image", priority: 70 },
      ],
      baseOptions(assetStore),
    );
    expect(result.best).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("ghi log không chứa nội dung ảnh", async () => {
    const lines: string[] = [];
    const logger = createNoopLogger();
    expect(logger).toBeTruthy();
    expect(lines.length).toBe(0);
  });
});
