import { describe, expect, it } from "vitest";
import {
  CRISIS_FAST_MS,
  IM_METER_START,
  SPOT_WINDOW_MS,
  applyChoiceCost,
  finalMeter,
  imChoiceCost,
  imTimeDecay,
  isCrisisFast,
  oTimeBonus,
  tickMeter,
  toneForPoints,
} from "@/game/engine/metrics";

describe("metrics — O timeBonus", () => {
  it("tìm đủ 2 mockup nhanh + nhớ đúng màu → 1", () => {
    expect(oTimeBonus({ foundBoth: true, foundMs: 0, memoryCorrect: true })).toBe(1);
  });

  it("không tìm đủ 2 mockup → chỉ còn phần ghi nhớ màu", () => {
    expect(oTimeBonus({ foundBoth: false, foundMs: 2_000, memoryCorrect: true })).toBe(0.3);
    expect(oTimeBonus({ foundBoth: false, foundMs: 2_000, memoryCorrect: false })).toBe(0);
  });

  it("tìm chậm dần thì thưởng giảm, không âm và không vượt 1", () => {
    const fast = oTimeBonus({ foundBoth: true, foundMs: 1_000, memoryCorrect: false });
    const slow = oTimeBonus({ foundBoth: true, foundMs: 14_000, memoryCorrect: false });
    const late = oTimeBonus({ foundBoth: true, foundMs: SPOT_WINDOW_MS + 5_000, memoryCorrect: false });
    expect(fast).toBeGreaterThan(slow);
    expect(slow).toBeGreaterThanOrEqual(0);
    expect(late).toBe(0);
    expect(oTimeBonus({ foundBoth: true, foundMs: 0, memoryCorrect: true })).toBeLessThanOrEqual(1);
  });
});

describe("metrics — K crisisFast", () => {
  it("dưới 10 giây là nhanh, từ 10 giây trở lên là chậm", () => {
    expect(isCrisisFast(0)).toBe(true);
    expect(isCrisisFast(CRISIS_FAST_MS - 1)).toBe(true);
    expect(isCrisisFast(CRISIS_FAST_MS)).toBe(false);
    expect(isCrisisFast(30_000)).toBe(false);
  });
});

describe("metrics — IM meter", () => {
  it("bắt đầu 10, trừ 0.1 mỗi giây chưa trả lời", () => {
    expect(IM_METER_START).toBe(10);
    expect(imTimeDecay(10)).toBeCloseTo(1, 5);
    expect(tickMeter(10, 5)).toBeCloseTo(9.5, 5);
    expect(tickMeter(0.05, 5)).toBe(0);
  });

  it("lựa chọn 2/1/0 trừ 0 / 0.8 / 2", () => {
    expect(imChoiceCost(2)).toBe(0);
    expect(imChoiceCost(1)).toBe(0.8);
    expect(imChoiceCost(0)).toBe(2);
    expect(imChoiceCost(7)).toBe(0);
    expect(applyChoiceCost(10, 1)).toBeCloseTo(9.2, 5);
    expect(applyChoiceCost(0.5, 0)).toBe(0);
  });

  it("meter cuối luôn 0..10 và làm tròn 1 số lẻ", () => {
    expect(finalMeter(10)).toBe(10);
    expect(finalMeter(7.46)).toBe(7.5);
    expect(finalMeter(-3)).toBe(0);
    expect(finalMeter(42)).toBe(10);
  });
});

describe("metrics — tone hiển thị", () => {
  it("map điểm sang nhãn UI", () => {
    expect(toneForPoints(2)).toBe("best");
    expect(toneForPoints(1)).toBe("partial");
    expect(toneForPoints(0)).toBe("miss");
  });
});
