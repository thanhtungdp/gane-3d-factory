import { rm } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { PLANET_ORDER } from "../../src/shared/planets";
import { buildRunResult, scorePlanet, weaknessesFor } from "../../src/shared/scoring";
import type { BrandProfile, PlanetResult } from "../../src/shared/types";
import { clearAiMemoryCache, generateInsights, type AiFetchLike } from "../../server/ai/insights";
import type { InsightsInput } from "../../server/ai/templates";
import { createNoopLogger } from "../../server/lib/log";
import { fakeContentMap, goodPreScan, makeTempDir, testConfig } from "./helpers";

const dirs: string[] = [];
afterEach(async () => {
  clearAiMemoryCache();
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const brand: BrandProfile = {
  name: "Hoa Sen Group",
  domain: "hoasen.vn",
  industry: "Xây dựng & Nội thất",
  tagline: "Vật liệu bền vững",
  description: "Doanh nghiệp vật liệu xây dựng.",
  socials: [],
  logo: null,
  logoAlternatives: [],
  palette: [{ hex: "#0a6e3d", role: "primary", source: "logo" }],
};

function makeInput(): InsightsInput {
  const content = fakeContentMap();
  const preScan = goodPreScan();
  const planets: PlanetResult[] = PLANET_ORDER.map((planet) =>
    scorePlanet(
      planet,
      content[planet].decisions.map((decision) => ({
        decisionId: decision.id,
        optionId: "b",
        kind: decision.kind,
        points: 1 as const,
        ms: 1_000,
      })),
      content[planet],
      preScan,
    ),
  );
  const result = buildRunResult(planets, 500_000);
  return {
    brand,
    preScan,
    answers: { companySize: "6-20", role: "founder" },
    result,
    weaknesses: weaknessesFor(result, preScan),
  };
}

const VALID_AI = {
  insights: [
    {
      title: "Chẩn đoán chưa dựa dữ kiện",
      body: "Hồ sơ thương hiệu cho thấy bạn đang thiếu bằng chứng khách hàng trước khi quyết định.",
      evidence: "Chưa tìm thấy câu định vị riêng trên trang chủ.",
      action: "Gọi năm khách quen và ghi lại lý do họ chọn bạn.",
    },
    {
      title: "Logo cần bộ file gốc",
      body: "Logo hiện tại chưa đủ rõ để dùng trên mọi bề mặt in ấn và màn hình lớn.",
      evidence: "Logo tìm thấy nhỏ hơn 128px.",
      action: "Xin file SVG và lưu ba phiên bản nền sáng tối.",
    },
    {
      title: "Kênh xã hội cần nối",
      body: "Các kênh đang rời nhau khiến người xem khó tin đâu là kênh chính thức.",
      evidence: "Tìm thấy ba liên kết kênh mạng xã hội.",
      action: "Đặt link kênh chính ở footer và đồng bộ ảnh đại diện.",
    },
  ],
};

const aiFetch = (content: string): AiFetchLike => async () => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [{ message: { content } }] }),
});

describe("AI insights", () => {
  it("không có key → 3 template deterministic, không gọi mạng", async () => {
    const dir = await makeTempDir();
    dirs.push(dir);
    const config = testConfig({ dataDir: dir });
    let called = 0;
    const fetchImpl: AiFetchLike = async () => {
      called += 1;
      return { ok: true, status: 200, json: async () => ({}) };
    };
    const result = await generateInsights(makeInput(), { config, logger: createNoopLogger(), fetchImpl });
    expect(result.source).toBe("template");
    expect(result.insights).toHaveLength(3);
    expect(called).toBe(0);
  });

  it("DeepSeek JSON mode hợp lệ → aiSource ai + cache theo hash", async () => {
    const dir = await makeTempDir();
    dirs.push(dir);
    const config = testConfig({ dataDir: dir, deepseekApiKey: "test-key" });
    let calls = 0;
    const fetchImpl: AiFetchLike = async () => {
      calls += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: JSON.stringify(VALID_AI) } }] }),
      };
    };
    const first = await generateInsights(makeInput(), { config, logger: createNoopLogger(), fetchImpl });
    expect(first.source).toBe("ai");
    expect(first.insights[0]?.title).toBe("Chẩn đoán chưa dựa dữ kiện");
    expect(calls).toBe(1);

    const failing: AiFetchLike = async () => {
      calls += 1;
      return { ok: false, status: 500, json: async () => ({}) };
    };
    const second = await generateInsights(makeInput(), { config, logger: createNoopLogger(), fetchImpl: failing });
    expect(second.source).toBe("ai");
    expect(calls).toBe(1); // lấy từ cache, không gọi lại
  });

  it("AI trả nội dung có % / số liệu bịa → fallback template", async () => {
    const dir = await makeTempDir();
    dirs.push(dir);
    const config = testConfig({ dataDir: dir, deepseekApiKey: "test-key" });
    const bad = structuredClone(VALID_AI);
    bad.insights[0]!.body = "Chỉ cần thay đổi nhỏ là doanh thu tăng 30% ngay.";
    const result = await generateInsights(makeInput(), {
      config,
      logger: createNoopLogger(),
      fetchImpl: aiFetch(JSON.stringify(bad)),
    });
    expect(result.source).toBe("template");
    expect(result.insights).toHaveLength(3);
  });

  it("AI timeout/lỗi JSON → fallback template", async () => {
    const dir = await makeTempDir();
    dirs.push(dir);
    const config = testConfig({ dataDir: dir, deepseekApiKey: "test-key" });
    const broken = await generateInsights(makeInput(), {
      config,
      logger: createNoopLogger(),
      fetchImpl: aiFetch("không phải json"),
    });
    expect(broken.source).toBe("template");

    const failing: AiFetchLike = async () => {
      throw Object.assign(new Error("timeout"), { name: "TimeoutError" });
    };
    const failed = await generateInsights(makeInput(), { config, logger: createNoopLogger(), fetchImpl: failing });
    expect(failed.source).toBe("template");
    expect(failed.insights).toHaveLength(3);
  });
});
