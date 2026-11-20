import { describe, expect, it } from "vitest";
import { PLANET_IDS, type PlanetId, type PreScanCriterion } from "@/shared/types";
import { PLANET_CONTENT } from "@/game/content";
import { buildRunResult, scorePlanet } from "@/shared/scoring";
import { ALL_BEST, ALL_WORST, MIXED, makePreScan, recordsWith, type PickPoints } from "./helpers";

const HIGH_PRESCAN = makePreScan();
const LOW_PRESCAN = makePreScan({ logo: 3, color: 3, slogan: 3, social: 3, mobile: 3 });

function score(
  planet: PlanetId,
  pick = ALL_BEST,
  preScan = HIGH_PRESCAN,
  opts: Parameters<typeof scorePlanet>[4] = {},
) {
  return scorePlanet(planet, recordsWith(PLANET_CONTENT[planet], pick), PLANET_CONTENT[planet], preScan, opts);
}

describe("scoring integration — 5 trạm", () => {
  it("best / mixed / worst cho mọi trạm: best 10, worst 0, mixed ở giữa", () => {
    for (const planet of PLANET_IDS) {
      const best = score(planet, ALL_BEST, HIGH_PRESCAN, planet === "IM" ? { meter: 10 } : {});
      const mixed = score(planet, MIXED, HIGH_PRESCAN, planet === "IM" ? { meter: 5 } : {});
      const worst = score(planet, ALL_WORST);

      expect(best.score, `${planet} best`).toBe(10);
      expect(worst.score, `${planet} worst`).toBe(0);
      expect(mixed.score, `${planet} mixed`).toBeGreaterThan(worst.score);
      expect(mixed.score, `${planet} mixed`).toBeLessThan(best.score);
      expect(best.knowledge).toBe(10);
      expect(best.diagnosis).toBe(10);
      expect(best.decisions).toHaveLength(PLANET_CONTENT[planet].decisions.length);
    }
  });

  it("records rỗng → skipped và 0 điểm cho mọi trạm", () => {
    for (const planet of PLANET_IDS) {
      const result = scorePlanet(planet, [], PLANET_CONTENT[planet], HIGH_PRESCAN, { meter: 9, timeBonus: 1, crisisFast: true });
      expect(result.skipped).toBe(true);
      expect(result.score).toBe(0);
    }
  });

  it("O nhận timeBonus 0..1 và cộng vào phần knowledge", () => {
    const base = score("O", MIXED);
    const withBonus = score("O", MIXED, HIGH_PRESCAN, { timeBonus: 1 });
    const overBonus = score("O", MIXED, HIGH_PRESCAN, { timeBonus: 5 });
    expect(withBonus.score).toBeGreaterThan(base.score);
    // timeBonus bị clamp 1 nên vượt 1 không cộng thêm.
    expect(overBonus.score).toBe(withBonus.score);
  });

  it("K cộng 0.5 khi crisisFast, chỉ ở trạm K", () => {
    const slow = score("K", MIXED);
    const fast = score("K", MIXED, HIGH_PRESCAN, { crisisFast: true });
    expect(fast.score - slow.score).toBeCloseTo(0.5, 5);

    for (const planet of PLANET_IDS.filter((id) => id !== "K")) {
      const a = score(planet, MIXED);
      const b = score(planet, MIXED, HIGH_PRESCAN, { crisisFast: true });
      expect(b.score, `${planet} không được cộng crisisFast`).toBe(a.score);
    }
  });

  it("IM dùng meter 0..10 vào 20% điểm và trả meter đã clamp", () => {
    const low = score("IM", MIXED, HIGH_PRESCAN, { meter: 0 });
    const high = score("IM", MIXED, HIGH_PRESCAN, { meter: 9 });
    expect(high.score - low.score).toBeCloseTo(1.8, 1);
    expect(low.meter).toBe(0);
    expect(high.meter).toBe(9);

    const clampedLow = score("IM", ALL_BEST, HIGH_PRESCAN, { meter: -5 });
    const clampedHigh = score("IM", ALL_BEST, HIGH_PRESCAN, { meter: 99 });
    expect(clampedLow.meter).toBe(0);
    expect(clampedHigh.meter).toBe(10);

    for (const planet of PLANET_IDS.filter((id) => id !== "IM")) {
      expect(score(planet, MIXED)).toHaveProperty("meter", undefined);
    }
  });

  it("reality check S/O/K: diagnosis chọn 2 nhưng pre-scan yếu thì bị trừ đúng trọng số", () => {
    const cases: { planet: PlanetId; weight: number; criterion: PreScanCriterion }[] = [
      { planet: "S", weight: 0.4, criterion: "slogan" },
      { planet: "O", weight: 0.3, criterion: "color" },
      { planet: "K", weight: 0.3, criterion: "social" },
    ];

    for (const item of cases) {
      const high = score(item.planet, ALL_BEST, HIGH_PRESCAN);
      const low = score(item.planet, ALL_BEST, makePreScan({ [item.criterion]: 2 }));
      expect(low.score, `${item.planet} phải bị reality check`).toBeLessThan(high.score);
      expect(high.score - low.score).toBeCloseTo(item.weight, 1);
    }
  });

  it("reality check chỉ trừ khi diagnosis chọn đáp án 2 (đã có)", () => {
    // S diagnosis nằm ở index 3; chọn điểm 1 để không kích hoạt reality check.
    const partialDiagnosis: PickPoints = (decision, index) => (decision.kind === "diagnosis" && index === 3 ? 1 : 2);
    const high = score("S", partialDiagnosis, HIGH_PRESCAN);
    const lowPrescan = score("S", partialDiagnosis, LOW_PRESCAN);
    expect(lowPrescan.score).toBe(high.score);
  });

  it("IM không có evidenceKey nên pre-scan yếu không trừ điểm diagnosis", () => {
    const highPre = score("IM", ALL_BEST, HIGH_PRESCAN, { meter: 7 });
    const lowPre = score("IM", ALL_BEST, LOW_PRESCAN, { meter: 7 });
    expect(lowPre.score).toBe(highPre.score);
    expect(lowPre.diagnosis).toBe(highPre.diagnosis);
  });
});

describe("buildRunResult — tổng hợp 5 trạm", () => {
  it("cả 5 trạm best → 10 điểm, danh hiệu cao nhất, đủ 5 huy hiệu", () => {
    const results = PLANET_IDS.map((planet) =>
      scorePlanet(
        planet,
        recordsWith(PLANET_CONTENT[planet], ALL_BEST),
        PLANET_CONTENT[planet],
        HIGH_PRESCAN,
        planet === "IM" ? { meter: 10 } : planet === "K" ? { crisisFast: true } : {},
      ),
    );
    const run = buildRunResult(results, 90_000);
    expect(run.overall).toBe(10);
    expect(run.title).toBe("Ngôi Sao Đã Thắp Sáng");
    expect(run.stars).toBe(5);
    expect(run.badges).toEqual([...PLANET_IDS]);
    expect(run.weak).toHaveLength(2);
    expect(run.durationMs).toBe(90_000);
  });
});
