import { describe, expect, it } from "vitest";
import { PLANET_IDS, type PlanetId } from "@/shared/types";
import { kimPlanetLine, kimReaction } from "@/game/content/kim";

const FORBIDDEN = ["%", "gói", "brand audit", "marcom", "brand guideline", "design request", "mua ngay", "ưu đãi"];

function expectSafe(text: string) {
  expect(text.trim().length).toBeGreaterThan(10);
  for (const word of FORBIDDEN) {
    expect(text.toLowerCase().includes(word), `copy chứa "${word}": ${text}`).toBe(false);
  }
}

describe("kim content", () => {
  it("kimReaction: 2 vui, 1 trung tính, 0 động viên — khác nhau và an toàn", () => {
    const happy = kimReaction(2);
    const neutral = kimReaction(1);
    const encourage = kimReaction(0);
    expect(new Set([happy, neutral, encourage]).size).toBe(3);
    [happy, neutral, encourage].forEach(expectSafe);
    expect(kimReaction(5)).toBe(happy);
    expect(kimReaction(Number.NaN)).toBe(encourage);
  });

  it("kimPlanetLine: đủ 5 trạm, 3 mức điểm, có brand và X/10, không %", () => {
    for (const planet of PLANET_IDS as readonly PlanetId[]) {
      const low = kimPlanetLine(planet, 2, "Cà Phê Đất Việt");
      const mid = kimPlanetLine(planet, 6, "Cà Phê Đất Việt");
      const high = kimPlanetLine(planet, 9, "Cà Phê Đất Việt");
      for (const [label, text] of [
        ["low", low],
        ["mid", mid],
        ["high", high],
      ] as const) {
        expectSafe(text);
        expect(text, `${planet} ${label} thiếu brand`).toContain("Cà Phê Đất Việt");
        expect(text, `${planet} ${label} thiếu điểm X/10`).toMatch(/\d+\.\d\/10/);
      }
      expect(new Set([low, mid, high]).size).toBe(3);
    }
  });

  it("kimPlanetLine clamp điểm và fallback tên brand", () => {
    expect(kimPlanetLine("S", -4, "")).toMatch(/0\.0\/10/);
    expect(kimPlanetLine("S", 99, "Thương hiệu A")).toMatch(/10\.0\/10/);
    expect(kimPlanetLine("S", 5, "  ")).toContain("thương hiệu của bạn");
  });
});
