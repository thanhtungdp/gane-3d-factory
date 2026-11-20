import { rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PLANET_ORDER } from "../../src/shared/planets";
import { scorePlanet } from "../../src/shared/scoring";
import type { BrandProfile, PlanetResult, Report } from "../../src/shared/types";
import { createAssetStore, type AssetStore } from "../../server/storage/assets";
import { renderReportPdf } from "../../server/pdf/report";
import { issuePdfToken, verifyPdfToken } from "../../server/pdf/token";
import { buildReport } from "../../server/report/build";
import { buildTemplateInsights } from "../../server/ai/templates";
import { createNoopLogger } from "../../server/lib/log";
import { fakeContentMap, fixture, goodPreScan, makeTempDir, testConfig } from "./helpers";
import type { AppConfig } from "../../server/config";

let dir = "";
let config: AppConfig;
let assets: AssetStore;
let report: Report;

async function makeReport(): Promise<Report> {
  const png = await fixture("logo-large.png");
  const asset = await assets.savePng(png);
  const brand: BrandProfile = {
    name: "Hoa Sen Group",
    domain: "hoasen.vn",
    tagline: "Vật liệu bền vững, ngôi nhà bền lâu",
    description: "Doanh nghiệp vật liệu xây dựng.",
    industry: "Xây dựng & Nội thất",
    socials: [{ type: "facebook", url: "https://facebook.com/hoasengroup" }],
    logo: { id: asset.id, url: asset.url, width: 512, height: 171, source: "header", quality: "high" },
    logoAlternatives: [],
    palette: [
      { hex: "#0a6e3d", role: "primary", source: "logo" },
      { hex: "#f4a261", role: "accent", source: "css" },
    ],
  };
  const preScan = goodPreScan();
  const content = fakeContentMap();
  const results: PlanetResult[] = PLANET_ORDER.map((planet) =>
    scorePlanet(
      planet,
      content[planet].decisions.map((decision) => ({
        decisionId: decision.id,
        optionId: "a",
        kind: decision.kind,
        points: 2 as const,
        ms: 1_000,
      })),
      content[planet],
      preScan,
      { meter: 9 },
    ),
  );
  return buildReport(
    {
      sessionId: "s1",
      results,
      durationMs: 500_000,
      brand,
      answers: { companySize: "6-20", role: "founder" },
      preScan,
      content,
    },
    {
      newId: () => "rp_pdf_test",
      now: () => Date.parse("2026-11-14T07:00:00Z"),
      generateInsights: async (input) => ({ insights: buildTemplateInsights(input), source: "template" }),
    },
  );
}

beforeAll(async () => {
  dir = await makeTempDir();
  config = testConfig({ dataDir: dir });
  assets = createAssetStore(path.join(dir, "assets"));
  report = await makeReport();
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("PDF report", () => {
  it("tạo được buffer PDF 3 trang có font tiếng Việt", async () => {
    const pdf = await renderReportPdf({ report, config, assets, logger: createNoopLogger() });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(5_000);
    const text = pdf.toString("latin1");
    const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pageCount).toBeGreaterThanOrEqual(3);
  });

  it("font lỗi (thư mục font không tồn tại) vẫn tạo PDF", async () => {
    const brokenConfig: AppConfig = { ...config, fontsDir: path.join(dir, "khong-co-font") };
    const pdf = await renderReportPdf({ report, config: brokenConfig, assets, logger: createNoopLogger() });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(3_000);
  });
});

describe("PDF token HMAC", () => {
  it("issue + verify đúng report và hạn", () => {
    const now = Date.parse("2026-11-14T07:00:00Z");
    const token = issuePdfToken("rp_abc", "secret", 60_000, now);
    const verified = verifyPdfToken(token, "secret", now + 1_000);
    expect(verified).toEqual({ ok: true, reportId: "rp_abc" });
  });

  it("từ chối token sửa nội dung, sai secret hoặc hết hạn", () => {
    const now = Date.parse("2026-11-14T07:00:00Z");
    const token = issuePdfToken("rp_abc", "secret", 60_000, now);
    expect(verifyPdfToken(`${token}x`, "secret", now).ok).toBe(false);

    const [payload] = token.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ v: 1, r: "rp_khac", exp: now + 60_000 })).toString("base64url");
    expect(verifyPdfToken(`${forgedPayload}.${token.split(".")[1]}`, "secret", now)).toEqual({
      ok: false,
      reason: "bad_signature",
    });
    expect(verifyPdfToken(token, "secret-khac", now).ok).toBe(false);
    expect(verifyPdfToken(token, "secret", now + 120_000)).toEqual({ ok: false, reason: "expired" });
    expect(verifyPdfToken("rac", "secret", now)).toEqual({ ok: false, reason: "malformed" });
    expect(payload).toBeTruthy();
  });
});
