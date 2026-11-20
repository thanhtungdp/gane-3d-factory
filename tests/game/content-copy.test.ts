import { describe, expect, it } from "vitest";
import { PLANET_IDS } from "@/shared/types";
import { PLANET_CONTENT } from "@/game/content";

/**
 * Ba nhãn dưới 20 ký tự đã được chốt nguyên văn trong copy pass
 * (một nhãn nằm trong danh sách chuỗi phải đổi đúng từng chữ, hai nhãn còn lại
 * thuộc nhóm "option không liệt kê giữ nguyên"). Test vẫn chặn nhãn rỗng/quá ngắn
 * bằng ngưỡng 14 và không cho phép thêm ngoại lệ nào khác.
 */
const COPY_FROZEN_SHORT_IDS = new Set([
  "s-customer-words-b", // "Tên công ty và giá." — chuỗi chốt nguyên văn
  "o-why-mismatch-c", // "Nhà in làm ẩu." — giữ nguyên theo yêu cầu
  "o-color-memory-b", // "Vì màu sáng hơn." — giữ nguyên theo yêu cầu
]);

const decisions = PLANET_IDS.flatMap((planet) => PLANET_CONTENT[planet].decisions);

describe("content copy — prompt", () => {
  it("mọi prompt ≤ 85 ký tự, kết thúc bằng ?, không chứa 'đúng nhất'", () => {
    for (const decision of decisions) {
      const prompt = decision.prompt.trim();
      expect(prompt.length, `${decision.id}: prompt quá dài (${prompt.length})`).toBeLessThanOrEqual(85);
      expect(prompt.endsWith("?"), `${decision.id}: prompt phải kết thúc bằng ?`).toBe(true);
      expect(/đúng nhất/i.test(prompt), `${decision.id}: prompt còn meta-answer "đúng nhất"`).toBe(false);
      expect(prompt.length, `${decision.id}: prompt rỗng`).toBeGreaterThan(0);
    }
  });
});

describe("content copy — option", () => {
  it("mỗi decision giữ đúng 3 option, đúng một 2 / một 1 / một 0", () => {
    expect(decisions).toHaveLength(18);
    for (const decision of decisions) {
      expect(decision.options, `${decision.id}: phải có 3 option`).toHaveLength(3);
      expect(decision.options.filter((o) => o.points === 2), `${decision.id}: phải có một option 2`).toHaveLength(1);
      expect(decision.options.filter((o) => o.points === 1), `${decision.id}: phải có một option 1`).toHaveLength(1);
      expect(decision.options.filter((o) => o.points === 0), `${decision.id}: phải có một option 0`).toHaveLength(1);
    }
  });

  it("nhãn option 20–120 ký tự (trừ 3 nhãn chốt nguyên văn), không chứa []", () => {
    for (const decision of decisions) {
      const lengths = decision.options.map((option) => option.label.trim().length);
      for (let index = 0; index < decision.options.length; index += 1) {
        const option = decision.options[index]!;
        const length = lengths[index]!;
        expect(length, `${option.id}: nhãn rỗng`).toBeGreaterThan(0);
        expect(length, `${option.id}: nhãn quá dài (${length})`).toBeLessThanOrEqual(120);
        expect(/[[\]]/.test(option.label), `${option.id}: nhãn còn template ngoặc vuông`).toBe(false);
        if (COPY_FROZEN_SHORT_IDS.has(option.id)) {
          expect(length, `${option.id}: nhãn chốt nguyên văn bị rút ngắn bất thường`).toBeGreaterThanOrEqual(14);
        } else {
          expect(length, `${option.id}: nhãn ngắn hơn 20 ký tự (${length})`).toBeGreaterThanOrEqual(20);
        }
      }

      const spread = Math.max(...lengths) - Math.min(...lengths);
      expect(spread, `${decision.id}: chênh lệch độ dài option quá lớn (${lengths.join(", ")})`).toBeLessThanOrEqual(55);
    }
  });

  it("không còn id nào ngoài danh sách ngoại lệ bị ngắn hơn 20 ký tự", () => {
    const shortIds = decisions
      .flatMap((decision) => decision.options)
      .filter((option) => option.label.trim().length < 20)
      .map((option) => option.id)
      .sort();
    expect(shortIds).toEqual([...COPY_FROZEN_SHORT_IDS].sort());
  });
});
