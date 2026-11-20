import { describe, expect, it } from "vitest";
import { PLANET_ORDER } from "../../src/shared/planets";
import { scorePlanet } from "../../src/shared/scoring";
import type { DecisionRecord, PlanetId, PlanetResult } from "../../src/shared/types";
import { buildReport } from "../../server/report/build";
import { countWords, buildTemplateInsights, isAcceptableInsights } from "../../server/ai/insights";
import { fakeContentMap, goodPreScan } from "./helpers";

const content = fakeContentMap();
const preScan = goodPreScan();
const brand = {
  name: "Hoa Sen Group",
  domain: "hoasen.vn",
  tagline: "Vật liệu bền vững, ngôi nhà bền lâu",
  description: "Doanh nghiệp vật liệu xây dựng.",
  industry: "Xây dựng & Nội thất",
  socials: [{ type: "facebook" as const, url: "https://facebook.com/hoasengroup" }],
  logo: {
    id: "a".repeat(64),
    url: `/api/assets/${"a".repeat(64)}`,
    width: 512,
    height: 200,
    source: "header",
    quality: "high" as const,
  },
  logoAlternatives: [],
  palette: [
    { hex: "#0a6e3d", role: "primary" as const, source: "logo" as const },
    { hex: "#f4a261", role: "accent" as const, source: "css" as const },
  ],
};
const answers = { companySize: "6-20" as const, role: "founder" as const };

function recordsFor(planet: PlanetId, points: 0 | 1 | 2): DecisionRecord[] {
  return content[planet].decisions.map((decision) => ({
    decisionId: decision.id,
    optionId: points === 2 ? "a" : points === 1 ? "b" : "c",
    kind: decision.kind,
    points,
    ms: 900,
  }));
}

function validResults(points: 0 | 1 | 2 = 2): PlanetResult[] {
  return PLANET_ORDER.map((planet) =>
    scorePlanet(planet, recordsFor(planet, points), content[planet], preScan, { meter: 10 }),
  );
}

const deps = {
  generateInsights: async (input: Parameters<typeof buildTemplateInsights>[0]) => ({
    insights: buildTemplateInsights(input),
    source: "template" as const,
  }),
  newId: () => "rp_test123",
  now: () => Date.parse("2026-11-14T07:00:00Z"),
};

describe("report build (server-side scoring dùng shared)", () => {
  it("điểm cao: tổng, danh hiệu, weak, gói, insight khớp shared scoring", async () => {
    const results = validResults(2);
    const report = await buildReport(
      { sessionId: "s1", results, durationMs: 600_000, brand, answers, preScan, content },
      deps,
    );
    expect(report.id).toBe("rp_test123");
    expect(report.result.overall).toBe(10);
    expect(report.result.title).toBe("Ngôi Sao Đã Thắp Sáng");
    expect(report.result.badges).toHaveLength(5);
    expect(report.weaknesses).toHaveLength(2);
    expect(report.weaknesses[0]?.planet).toBe("S");
    expect(report.weaknesses[1]?.planet).toBe("A");
    expect(report.offers.length).toBeGreaterThanOrEqual(1);
    // mọi trạm đều 10 → gói Đồng hành theo logic shared offers
    expect(report.offers[0]?.code).toBe("companion");
    expect(report.teaserOffer).toBe(report.offers[0]?.name);
    expect(report.insights).toHaveLength(3);
    expect(report.aiSource).toBe("template");
    expect(isAcceptableInsights(report.insights)).toBe(true);
    for (const insight of report.insights) {
      expect(countWords(insight.title)).toBeLessThanOrEqual(6);
      expect(countWords(insight.body)).toBeLessThanOrEqual(35);
    }
    expect(JSON.stringify(report)).not.toContain("%");
    expect(report.createdAt).toBe("2026-11-14T07:00:00.000Z");
  });

  it("chặn điểm bịa: client gửi 10 nhưng toàn chọn điểm 0 → server recompute về 0", async () => {
    const cheated = validResults(0).map((result) => ({ ...result, score: 10, meter: undefined }));
    const report = await buildReport(
      { sessionId: "s2", results: cheated, brand, answers, preScan, content },
      deps,
    );
    expect(report.result.overall).toBe(0);
    for (const planet of PLANET_ORDER) {
      expect(report.result.planets[planet]?.score).toBe(0);
    }
    expect(report.offers[0]?.code).toBe("full");
  });

  it("điểm trung bình: thuộc tính preScan và industryRank được giữ", async () => {
    const results = validResults(1);
    const report = await buildReport(
      {
        sessionId: "s3",
        results,
        brand,
        answers,
        preScan,
        content,
        industryRank: { rank: 3, total: 12 },
      },
      deps,
    );
    expect(report.result.overall).toBeGreaterThan(0);
    expect(report.preScan.criteria.logo.positive).toBe(true);
    expect(report.industryRank).toBe(3);
    expect(report.industryTotal).toBe(12);
    expect(report.answers.companySize).toBe("6-20");
  });

  it("insight template deterministic theo cùng input", async () => {
    const results = validResults(2);
    const a = await buildReport({ sessionId: "s", results, brand, answers, preScan, content }, deps);
    const b = await buildReport({ sessionId: "s", results, brand, answers, preScan, content }, deps);
    expect(a.insights).toEqual(b.insights);
  });
});
