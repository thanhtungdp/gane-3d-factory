import { describe, expect, it } from "vitest";
import { buildPreScan, neutralPreScan } from "../../server/crawl/prescan";
import { GOOD_PALETTE, fakeLogo, goodPreScan } from "./helpers";

const SIGNAL_ZONES = ["internal", "market", "competitor", "identity"];
const SEVERITIES = ["gap", "watch", "strength"];

describe("pre-scan", () => {
  it("website tốt: 5 tiêu chí, tín hiệu đủ 5+, có tín hiệu kiểm tra định kỳ", () => {
    const preScan = goodPreScan();
    expect(preScan.criteria.logo.positive).toBe(true);
    expect(preScan.criteria.color.positive).toBe(true);
    expect(preScan.criteria.slogan.positive).toBe(true);
    expect(preScan.criteria.social.positive).toBe(true);
    expect(preScan.criteria.mobile.positive).toBe(true);
    expect(preScan.signals.length).toBeGreaterThanOrEqual(5);
    expect(preScan.signals.length).toBeLessThanOrEqual(8);
    expect(preScan.signals.some((s) => s.title.includes("Kiểm tra định kỳ"))).toBe(true);
    for (const signal of preScan.signals) {
      expect(SIGNAL_ZONES).toContain(signal.zone);
      expect(SEVERITIES).toContain(signal.severity);
      expect(signal.evidence.length).toBeGreaterThan(0);
      expect(signal.id.length).toBeGreaterThan(0);
    }
    expect(preScan.mobileFriendly).toBe(true);
    expect(preScan.socialCount).toBe(3);
    expect(preScan.logoQuality).toBe("high");
    expect(preScan.score).toBeGreaterThanOrEqual(7);
  });

  it("website yếu: gap + tín hiệu vùng đối thủ, vẫn tối thiểu 5 tín hiệu", () => {
    const preScan = buildPreScan({
      source: "url",
      logo: null,
      palette: [{ hex: "#8a5a44", role: "primary", source: "css" }],
      colorConsistency: 2,
      hasSlogan: false,
      socials: [],
      mobileFriendly: false,
      hasViewport: false,
      hasResponsiveCss: false,
      themeColorFound: false,
    });
    expect(preScan.criteria.logo.score).toBeLessThan(6);
    expect(preScan.criteria.slogan.score).toBeLessThan(6);
    expect(preScan.criteria.social.score).toBeLessThan(6);
    expect(preScan.signals.length).toBeGreaterThanOrEqual(5);
    expect(preScan.signals.some((s) => s.severity === "gap")).toBe(true);
    expect(preScan.signals.some((s) => s.zone === "competitor")).toBe(true);
    expect(preScan.signals.find((s) => s.id === "competitor-differentiation-gap")).toBeTruthy();
    expect(preScan.logoQuality).toBe("none");
    expect(preScan.score).toBeLessThan(5);
  });

  it("monogram không được coi là logo chất lượng cao", () => {
    const preScan = buildPreScan({
      source: "fallback",
      logo: fakeLogo({ source: "monogram", quality: "low", isMonogram: true }),
      palette: GOOD_PALETTE,
      colorConsistency: 6,
      hasSlogan: false,
      socials: [],
      mobileFriendly: false,
      hasViewport: false,
      hasResponsiveCss: false,
      themeColorFound: false,
    });
    expect(preScan.criteria.logo.score).toBeLessThanOrEqual(3);
    expect(preScan.criteria.logo.evidence).toContain("monogram");
  });

  it("neutralPreScan dùng khi không có dữ liệu quét", () => {
    const preScan = neutralPreScan(["Không quét được website."]);
    expect(preScan.score).toBe(5);
    expect(preScan.signals.length).toBe(5);
    expect(Object.keys(preScan.criteria)).toEqual(["logo", "color", "slogan", "social", "mobile"]);
  });
});
