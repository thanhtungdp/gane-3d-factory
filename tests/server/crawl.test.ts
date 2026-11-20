import { afterEach, describe, expect, it } from "vitest";
import { scanBrand } from "../../server/crawl";
import { CrawlError } from "../../server/crawl/types";
import { makeCrawlFixture, type CrawlFixture } from "./helpers";

const fixtures: CrawlFixture[] = [];

async function make(options: Parameters<typeof makeCrawlFixture>[0] = {}): Promise<CrawlFixture> {
  const fixture = await makeCrawlFixture(options);
  fixtures.push(fixture);
  return fixture;
}

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((f) => f.cleanup()));
});

describe("crawl brand kit (fixture, không gọi mạng)", () => {
  it("quét trang tốt: brand kit đầy đủ, cache lần 2", async () => {
    const f = await make();
    const result = await scanBrand({ url: "https://www.hoasen.vn/" }, f.deps);

    expect(result.source).toBe("url");
    expect(result.cached).toBe(false);
    expect(result.scanId.startsWith("sc_")).toBe(true);
    expect(result.brand.name).toBe("Hoa Sen Group");
    expect(result.brand.domain).toBe("hoasen.vn");
    expect(result.brand.logo).not.toBeNull();
    expect(result.brand.logo?.url).toMatch(/^\/api\/assets\//);
    expect(result.brand.palette.length).toBeGreaterThanOrEqual(2);
    expect(result.brand.socials.length).toBeGreaterThanOrEqual(3);
    expect(result.brand.description).toBeTruthy();
    expect(result.preScan.criteria.logo.positive).toBe(true);
    expect(result.preScan.signals.length).toBeGreaterThanOrEqual(5);
    expect(result.warnings).toBeInstanceOf(Array);

    const pageCalls = f.site.countCalls("https://www.hoasen.vn/");
    const second = await scanBrand({ url: "https://www.hoasen.vn/" }, f.deps);
    expect(second.cached).toBe(true);
    expect(second.brand.name).toBe(result.brand.name);
    expect(f.site.countCalls("https://www.hoasen.vn/")).toBe(pageCalls);
  });

  it("HTTP 403 → ScanResult fallback + monogram + negative cache", async () => {
    const f = await make({ pageStatus: 403 });
    const result = await scanBrand({ url: "https://www.hoasen.vn/" }, f.deps);
    expect(result.source).toBe("fallback");
    expect(result.warnings.join(" ")).toContain("403");
    expect(result.brand.logo?.isMonogram).toBe(true);
    expect(result.preScan.score).toBe(5);

    const callsAfterFirst = f.site.calls.length;
    const second = await scanBrand({ url: "https://www.hoasen.vn/" }, f.deps);
    expect(second.source).toBe("fallback");
    expect(f.site.calls.length).toBe(callsAfterFirst);
  });

  it("robots.txt disallow → fallback, không tải trang", async () => {
    const f = await make({ disallowRobots: true });
    const result = await scanBrand({ url: "https://www.hoasen.vn/" }, f.deps);
    expect(result.source).toBe("fallback");
    expect(result.warnings.join(" ").toLowerCase()).toContain("robots");
    expect(f.site.countCalls("https://www.hoasen.vn/")).toBe(0);
  });

  it("chặn SSRF trước khi gọi fetch", async () => {
    const f = await make();
    await expect(scanBrand({ url: "http://127.0.0.1:8788/api/health" }, f.deps)).rejects.toMatchObject({
      code: "SSRF_BLOCKED",
    });
    expect(f.site.calls.length).toBe(0);
  });

  it("trang thiếu logo/icon → monogram + pre-scan thấp", async () => {
    const f = await make({ htmlFile: "brand-page-weak.html", omitLogo: true, omitCss: true });
    const result = await scanBrand({ url: "https://www.hoasen.vn/" }, f.deps);
    expect(result.source).toBe("url");
    expect(result.brand.logo?.isMonogram).toBe(true);
    expect(result.preScan.score).toBeLessThan(5);
    expect(result.preScan.signals.some((s) => s.severity === "gap")).toBe(true);
  });

  it("nhập tay không website → source manual + monogram + warning", async () => {
    const f = await make();
    const result = await scanBrand({ manual: { name: "Mộc Việt", industry: "Nội thất" } }, f.deps);
    expect(result.source).toBe("manual");
    expect(result.brand.name).toBe("Mộc Việt");
    expect(result.brand.industry).toBe("Nội thất");
    expect(result.brand.logo?.isMonogram).toBe(true);
    expect(result.warnings.join(" ")).toContain("Chưa có website");
    expect(f.site.calls.length).toBe(0);
  });

  it("nhập tay kèm logo tải lên → dùng logo upload và palette từ logo", async () => {
    const { fixture } = await import("./helpers");
    const png = await fixture("logo-large.png");
    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
    const f = await make();
    const result = await scanBrand({ manual: { name: "Sao Kim Branding", logoDataUrl: dataUrl } }, f.deps);
    expect(result.source).toBe("manual");
    expect(result.brand.logo?.source).toBe("upload");
    expect(result.brand.palette[0]?.source).not.toBe("fallback");
  });

  it("nhập tay kèm website: vẫn giữ tên người dùng, bổ sung dữ liệu quét", async () => {
    const f = await make();
    const result = await scanBrand(
      { manual: { name: "Hoa Sen Việt Nam", website: "https://www.hoasen.vn/", industry: "Vật liệu" } },
      f.deps,
    );
    expect(result.source).toBe("manual");
    expect(result.brand.name).toBe("Hoa Sen Việt Nam");
    expect(result.brand.industry).toBe("Vật liệu");
    expect(result.brand.logo).not.toBeNull();
    expect(result.brand.socials.length).toBeGreaterThanOrEqual(1);
  });

  it("URL không hợp lệ → CrawlError INVALID_URL", async () => {
    const f = await make();
    await expect(scanBrand({ url: "not a url" }, f.deps)).rejects.toBeInstanceOf(CrawlError);
  });
});
