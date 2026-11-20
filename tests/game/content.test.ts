import { describe, expect, it } from "vitest";
import { PLANET_IDS, type PlanetContent } from "@/shared/types";
import { PLANET_SLUGS } from "@/shared/planets";
import {
  ALL_DECISIONS,
  PLANET_CONTENT,
  decisionById,
  decisionsFor,
  decisionsOfKind,
} from "@/game/content";

const EXPECTED_DECISIONS: Record<(typeof PLANET_IDS)[number], number> = { S: 4, A: 3, O: 3, K: 4, IM: 4 };

const EXPECTED_KIND: Record<(typeof PLANET_IDS)[number], { knowledge: number; diagnosis: number }> = {
  S: { knowledge: 3, diagnosis: 1 },
  A: { knowledge: 2, diagnosis: 1 },
  O: { knowledge: 2, diagnosis: 1 },
  K: { knowledge: 3, diagnosis: 1 },
  IM: { knowledge: 2, diagnosis: 2 },
};

const EXPECTED_EVIDENCE: Record<(typeof PLANET_IDS)[number], string | undefined> = {
  S: "slogan",
  A: "logo",
  O: "color",
  K: "social",
  IM: undefined,
};

const FORBIDDEN_PACKAGES = [
  "brand audit",
  "chiến lược thương hiệu",
  "marcom",
  "brand guideline",
  "design request",
  "website care",
  "profile/brochure",
];

function stringsOf(content: PlanetContent): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const push = (where: string, text: string | undefined) => {
    if (text !== undefined) out.push({ where, text });
  };
  content.intro.forEach((text, index) => push(`intro[${index}]`, text));
  content.outro.forEach((text, index) => push(`outro[${index}]`, text));
  push("insight", content.insight);
  push("badge.name", content.badge.name);
  push("badge.blurb", content.badge.blurb);
  for (const decision of content.decisions) {
    push(`${decision.id}.prompt`, decision.prompt);
    push(`${decision.id}.hint`, decision.hint);
    push(`${decision.id}.explain`, decision.explain);
    push(`${decision.id}.evidenceLabel`, decision.evidenceLabel);
    for (const option of decision.options) {
      push(`${option.id}.label`, option.label);
      push(`${option.id}.feedback`, option.feedback);
    }
  }
  return out;
}

describe("content — cấu trúc 5 trạm", () => {
  it("mỗi PlanetId có nội dung và slug khớp shared", () => {
    expect(Object.keys(PLANET_CONTENT).sort()).toEqual([...PLANET_IDS].sort());
    for (const planet of PLANET_IDS) {
      const content = PLANET_CONTENT[planet];
      expect(content.planet).toBe(planet);
      expect(content.slug).toBe(PLANET_SLUGS[planet]);
    }
  });

  it("tổng 18 quyết định, đúng phân bổ S4 A3 O3 K4 IM4", () => {
    expect(ALL_DECISIONS).toHaveLength(18);
    for (const planet of PLANET_IDS) {
      expect(decisionsFor(planet)).toHaveLength(EXPECTED_DECISIONS[planet]);
      expect(decisionsFor(planet).every((d) => d.planet === planet)).toBe(true);
    }
  });

  it("phân bổ kind và evidenceKey đúng spec", () => {
    for (const planet of PLANET_IDS) {
      const content = PLANET_CONTENT[planet];
      expect(decisionsOfKind(planet, "knowledge")).toHaveLength(EXPECTED_KIND[planet].knowledge);
      expect(decisionsOfKind(planet, "diagnosis")).toHaveLength(EXPECTED_KIND[planet].diagnosis);

      for (const decision of content.decisions) {
        if (decision.kind === "knowledge") {
          expect(decision.evidenceKey, `${decision.id} knowledge không nên có evidenceKey`).toBeUndefined();
        } else {
          expect(decision.evidenceKey, `${decision.id} diagnosis`).toBe(EXPECTED_EVIDENCE[planet]);
          if (decision.evidenceKey) {
            expect(decision.evidenceLabel?.trim().length, `${decision.id} thiếu evidenceLabel`).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("mỗi quyết định 3 lựa chọn, đúng một 2 / một 1 / một 0, id và copy không rỗng", () => {
    const decisionIds = new Set<string>();
    const optionIds = new Set<string>();

    for (const planet of PLANET_IDS) {
      for (const decision of PLANET_CONTENT[planet].decisions) {
        expect(decisionIds.has(decision.id), `decision id trùng: ${decision.id}`).toBe(false);
        decisionIds.add(decision.id);

        expect(decision.options).toHaveLength(3);
        expect(decision.options.filter((o) => o.points === 2)).toHaveLength(1);
        expect(decision.options.filter((o) => o.points === 1)).toHaveLength(1);
        expect(decision.options.filter((o) => o.points === 0)).toHaveLength(1);

        expect(decision.prompt.trim().length, `${decision.id}.prompt`).toBeGreaterThan(10);
        expect(decision.explain.trim().length, `${decision.id}.explain`).toBeGreaterThan(20);
        if (decision.hint !== undefined) {
          expect(decision.hint.trim().length, `${decision.id}.hint`).toBeGreaterThan(10);
        }

        for (const option of decision.options) {
          expect(optionIds.has(option.id), `option id trùng: ${option.id}`).toBe(false);
          optionIds.add(option.id);
          expect(option.label.trim().length, `${option.id}.label`).toBeGreaterThan(8);
          expect(option.feedback.trim().length, `${option.id}.feedback`).toBeGreaterThan(15);
        }
      }
    }
  });

  it("mỗi trạm có intro/outro/insight/badge đúng hợp đồng", () => {
    for (const planet of PLANET_IDS) {
      const content = PLANET_CONTENT[planet];
      expect(content.intro.length).toBeGreaterThanOrEqual(1);
      expect(content.intro.length).toBeLessThanOrEqual(2);
      expect(content.intro.some((line) => line.includes("{brand}"))).toBe(true);
      expect(content.outro.length).toBeGreaterThanOrEqual(1);
      expect(content.outro.length).toBeLessThanOrEqual(3);
      expect(content.insight.startsWith("Bạn có biết")).toBe(true);
      expect(content.badge.id).toMatch(/^badge-/);
      expect(content.badge.name.trim().length).toBeGreaterThan(3);
      expect(content.badge.blurb.trim().length).toBeGreaterThan(10);
    }
  });

  it("tra cứu decision theo id hoạt động", () => {
    for (const decision of ALL_DECISIONS) {
      expect(decisionById(decision.id)).toBe(decision);
      for (const option of decision.options) {
        expect(decision.options.some((o) => o.id === option.id)).toBe(true);
      }
    }
    expect(decisionById("không-tồn-tại")).toBeUndefined();
  });
});

describe("content — copy an toàn cho UI", () => {
  it("không có ký hiệu % trong bất kỳ chuỗi nào", () => {
    for (const planet of PLANET_IDS) {
      for (const { where, text } of stringsOf(PLANET_CONTENT[planet])) {
        expect(text.includes("%"), `${planet} ${where} chứa %`).toBe(false);
      }
    }
  });

  it("không nhắc tên gói dịch vụ hay bán hàng", () => {
    for (const planet of PLANET_IDS) {
      for (const { where, text } of stringsOf(PLANET_CONTENT[planet])) {
        const lower = text.toLowerCase();
        for (const name of FORBIDDEN_PACKAGES) {
          expect(lower.includes(name), `${planet} ${where} nhắc gói "${name}"`).toBe(false);
        }
        expect(/\bgói\b/iu.test(text), `${planet} ${where} nhắc chữ "gói"`).toBe(false);
        expect(/\d+\s*%/u.test(text), `${planet} ${where} có số liệu phần trăm`).toBe(false);
      }
    }
  });

  it("quyết định diagnosis IM không dùng evidenceKey để tránh reality check sai", () => {
    for (const decision of decisionsOfKind("IM", "diagnosis")) {
      expect(decision.evidenceKey).toBeUndefined();
    }
  });

  it("id quyết định dùng tiền tố trạm để tránh trùng khi merge", () => {
    for (const planet of PLANET_IDS) {
      const prefix = planet.toLowerCase();
      for (const decision of PLANET_CONTENT[planet].decisions) {
        expect(decision.id.startsWith(`${prefix}-`), `${decision.id} không có tiền tố ${prefix}-`).toBe(true);
      }
    }
  });
});
