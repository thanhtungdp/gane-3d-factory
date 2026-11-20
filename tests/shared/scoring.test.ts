import { describe, expect, it } from "vitest";
import type {
  DecisionRecord,
  PlanetContent,
  PlanetId,
  PlanetResult,
  PreScan,
  PreScanCriterion,
} from "@/shared/types";
import { PLANET_CONTENT } from "@/game/content";
import {
  buildRunResult,
  isRealityCheck,
  litLayersFromResults,
  partialOverall,
  scorePlanet,
  starsFor,
  titleFor,
  weaknessesFor,
} from "@/shared/scoring";
import { recommendOffers } from "@/shared/offers";
import { templateInsights } from "@/shared/insights";

function makePreScan(scores: Partial<Record<PreScanCriterion, number>> = {}): PreScan {
  const keys: PreScanCriterion[] = ["logo", "color", "slogan", "social", "mobile"];
  const criteria = {} as PreScan["criteria"];
  for (const key of keys) {
    const score = scores[key] ?? 8;
    criteria[key] = {
      key,
      score,
      label: key,
      evidence: `evidence-${key}`,
      positive: score >= 7,
    };
  }
  return {
    score: 8,
    criteria,
    signals: [
      {
        id: "sig",
        zone: "identity",
        criterion: "color",
        title: "Tín hiệu",
        evidence: "Bằng chứng",
        severity: "gap",
      },
    ],
    mobileFriendly: true,
    hasSlogan: true,
    socialCount: 3,
    colorConsistency: 8,
    logoQuality: "high",
  };
}

function recordsFor(content: PlanetContent, mode: "best" | "worst"): DecisionRecord[] {
  return content.decisions.map((d) => {
    const option =
      mode === "best"
        ? d.options.reduce((a, b) => (b.points > a.points ? b : a))
        : d.options.reduce((a, b) => (b.points < a.points ? b : a));
    return {
      decisionId: d.id,
      optionId: option.id,
      kind: d.kind,
      points: option.points,
      ms: 1500,
    };
  });
}

function allBest(preScan = makePreScan()): PlanetResult[] {
  return (Object.keys(PLANET_CONTENT) as PlanetId[]).map((id) =>
    scorePlanet(id, recordsFor(PLANET_CONTENT[id], "best"), PLANET_CONTENT[id], preScan, {
      meter: 10,
      timeBonus: 1,
      crisisFast: true,
    }),
  );
}

describe("scorePlanet", () => {
  it("cho 10/10 khi mọi lựa chọn là tốt nhất", () => {
    for (const id of Object.keys(PLANET_CONTENT) as PlanetId[]) {
      const result = scorePlanet(id, recordsFor(PLANET_CONTENT[id], "best"), PLANET_CONTENT[id], makePreScan(), {
        meter: 10,
        timeBonus: 1,
        crisisFast: true,
      });
      expect(result.score).toBe(10);
      expect(result.knowledge).toBe(10);
      expect(result.diagnosis).toBe(10);
    }
  });

  it("cho 0/10 khi mọi lựa chọn là tệ nhất", () => {
    for (const id of Object.keys(PLANET_CONTENT) as PlanetId[]) {
      const result = scorePlanet(id, recordsFor(PLANET_CONTENT[id], "worst"), PLANET_CONTENT[id], makePreScan(), {
        meter: 0,
      });
      expect(result.score).toBe(0);
    }
  });

  it("trừ điểm tự chẩn đoán khi website không khớp lời khai", () => {
    const content = PLANET_CONTENT.O;
    const records = recordsFor(content, "best");
    const pre = makePreScan({ color: 2 });
    const result = scorePlanet("O", records, content, pre, {});
    expect(result.diagnosis).toBe(9);
    expect(result.score).toBeLessThan(10);
  });

  it("không trừ khi tiêu chí pre-scan khớp", () => {
    const content = PLANET_CONTENT.O;
    const records = recordsFor(content, "best");
    const result = scorePlanet("O", records, content, makePreScan({ color: 9 }), {});
    expect(result.diagnosis).toBe(10);
  });

  it("áp meter cho IM và bonus cho K", () => {
    const im = scorePlanet("IM", recordsFor(PLANET_CONTENT.IM, "best"), PLANET_CONTENT.IM, makePreScan(), {
      meter: 5,
    });
    expect(im.score).toBe(9);
    const k = scorePlanet("K", recordsFor(PLANET_CONTENT.K, "best"), PLANET_CONTENT.K, makePreScan(), {
      crisisFast: true,
    });
    expect(k.score).toBe(10);
  });

  it("đánh dấu skipped khi không có quyết định", () => {
    const result = scorePlanet("S", [], PLANET_CONTENT.S, makePreScan(), {});
    expect(result.skipped).toBe(true);
    expect(result.score).toBe(0);
  });

  it("isRealityCheck chỉ đúng với diagnosis điểm 2 và tiêu chí yếu", () => {
    const d = PLANET_CONTENT.S.decisions.find((x) => x.kind === "diagnosis")!;
    expect(isRealityCheck(d, 2, makePreScan({ slogan: 1 }))).toBe(true);
    expect(isRealityCheck(d, 2, makePreScan({ slogan: 9 }))).toBe(false);
    expect(isRealityCheck(d, 1, makePreScan({ slogan: 1 }))).toBe(false);
  });
});

describe("buildRunResult", () => {
  it("tính tổng theo trọng số và danh hiệu", () => {
    const all = allBest();
    const run = buildRunResult(all);
    expect(run.overall).toBe(10);
    expect(run.title).toBe(titleFor(10).title);
    expect(run.stars).toBe(5);
    expect(run.badges).toHaveLength(5);
  });

  it("chọn 2 bước yếu và tie-break theo thứ tự S→A→O→K→IM", () => {
    const planets: PlanetResult[] = (Object.keys(PLANET_CONTENT) as PlanetId[]).map((id) => ({
      planet: id,
      score: id === "A" || id === "K" ? 4 : 7,
      knowledge: 7,
      diagnosis: 7,
      decisions: [],
      completedAt: new Date().toISOString(),
    }));
    const run = buildRunResult(planets);
    expect(run.weak).toEqual(["A", "K"]);
  });

  it("partialOverall bỏ qua trạm chưa chơi", () => {
    const one = scorePlanet("S", recordsFor(PLANET_CONTENT.S, "best"), PLANET_CONTENT.S, makePreScan(), {});
    expect(partialOverall({ S: one })).toBe(10);
    expect(partialOverall({})).toBe(0);
  });

  it("lit layers map điểm 0–10 sang 0.12–1", () => {
    const layers = litLayersFromResults({});
    expect(layers.atmosphere).toBeCloseTo(0.12);
    const all = allBest();
    const run = buildRunResult(all);
    const lit = litLayersFromResults(run.planets);
    expect(lit.atmosphere).toBe(1);
  });

  it("starsFor làm tròn 0.5", () => {
    expect(starsFor(0)).toBe(0);
    expect(starsFor(7.4)).toBe(3.5);
    expect(starsFor(10)).toBe(5);
  });
});

describe("recommendOffers", () => {
  function runWith(scores: Partial<Record<PlanetId, number>>) {
    const planets = (Object.keys(PLANET_CONTENT) as PlanetId[]).map((id) => ({
      planet: id,
      score: scores[id] ?? 7,
      knowledge: 7,
      diagnosis: 7,
      decisions: [],
      completedAt: new Date().toISOString(),
    }));
    const run = buildRunResult(planets);
    const weak = weaknessesFor(run, makePreScan());
    return { run, weak, offers: recommendOffers(run, weak) };
  }

  it("S+A yếu → Gói Nền tảng", () => {
    const { offers } = runWith({ S: 4, A: 4 });
    expect(offers[0]?.code).toBe("foundation");
  });

  it("O+K yếu → Gói Tăng tốc", () => {
    const { offers } = runWith({ O: 4, K: 4 });
    expect(offers[0]?.code).toBe("accelerate");
  });

  it("K+IM yếu → Gói Ra mắt & Vận hành", () => {
    const { offers } = runWith({ K: 4, IM: 4 });
    expect(offers[0]?.code).toBe("launch_operate");
  });

  it("3 bước yếu → Gói Trọn bộ", () => {
    const { offers } = runWith({ S: 4, A: 4, O: 4, K: 4 });
    expect(offers[0]?.code).toBe("full");
  });

  it("tổng dưới 5 → Gói Trọn bộ dù chỉ 2 bước yếu", () => {
    const { offers } = runWith({ S: 3, A: 3, O: 3, K: 3, IM: 3 });
    expect(offers[0]?.code).toBe("full");
  });

  it("tất cả mạnh → Gói Đồng hành", () => {
    const { offers } = runWith({ S: 9, A: 9, O: 9, K: 9, IM: 9 });
    expect(offers[0]?.code).toBe("companion");
  });

  it("chỉ O yếu → Gói Nhận diện", () => {
    const { offers } = runWith({ O: 4, S: 8 });
    expect(offers[0]?.code).toBe("identity");
  });

  it("gói có giải thích và gói thật bên trong", () => {
    const { offers } = runWith({ S: 4, A: 4 });
    expect(offers[0]?.why.length).toBeGreaterThan(20);
    expect(offers[0]?.packages.map((p) => p.name)).toContain("Brand audit");
    expect(offers[0]?.priceLine).toContain("triệu");
  });
});

describe("templateInsights", () => {
  it("luôn trả 3 insight tiếng Việt, không %", () => {
    const run = buildRunResult(allBest().map((r) => ({ ...r, score: 5 })));
    const insights = templateInsights(
      {
        name: "Cà phê Nắng Mai",
        industry: "F&B",
        socials: [],
        logo: null,
        logoAlternatives: [],
        palette: [],
      },
      makePreScan(),
      { companySize: "6-20", role: "founder" },
      run,
    );
    expect(insights).toHaveLength(3);
    for (const i of insights) {
      expect(i.title.length).toBeGreaterThan(3);
      expect(i.action.length).toBeGreaterThan(5);
      expect(`${i.title} ${i.body} ${i.action}`).not.toContain("%");
    }
  });
});
