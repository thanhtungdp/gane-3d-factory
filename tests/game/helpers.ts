import type {
  BrandProfile,
  Decision,
  DecisionRecord,
  PlanetContent,
  PreScan,
  PreScanCriterion,
  PreScanCriterionResult,
} from "@/shared/types";

export const CRITERIA: PreScanCriterion[] = ["logo", "color", "slogan", "social", "mobile"];

const CRITERION_LABEL: Record<PreScanCriterion, string> = {
  logo: "Logo",
  color: "Màu thương hiệu",
  slogan: "Câu định vị",
  social: "Kênh mạng xã hội",
  mobile: "Bản di động",
};

export function makePreScan(overrides: Partial<Record<PreScanCriterion, number>> = {}): PreScan {
  const criteria = {} as Record<PreScanCriterion, PreScanCriterionResult>;
  for (const key of CRITERIA) {
    const score = overrides[key] ?? 8;
    criteria[key] = {
      key,
      score,
      label: CRITERION_LABEL[key],
      evidence: `Bằng chứng test cho tiêu chí ${key}.`,
      positive: score >= 6,
    };
  }
  return {
    score: Math.round(CRITERIA.reduce((sum, key) => sum + criteria[key].score, 0) / CRITERIA.length),
    criteria,
    signals: [],
    mobileFriendly: (overrides.mobile ?? 8) >= 6,
    hasSlogan: (overrides.slogan ?? 8) >= 6,
    socialCount: 2,
    colorConsistency: (overrides.color ?? 8) / 10,
    logoQuality: (overrides.logo ?? 8) >= 6 ? "high" : "low",
  };
}

export function makeBrand(overrides: Partial<BrandProfile> = {}): BrandProfile {
  return {
    name: "Cà Phê Đất Việt",
    domain: "caphedatviet.example",
    tagline: "Cà phê của người trồng",
    description: "Thương hiệu cà phê rang xay cho quán nhỏ.",
    industry: "F&B",
    socials: [{ type: "facebook", url: "https://facebook.com/example" }],
    logo: null,
    logoAlternatives: [],
    palette: [
      { hex: "#21409a", role: "primary", source: "logo" },
      { hex: "#faa634", role: "accent", source: "logo" },
      { hex: "#f4f6fb", role: "neutral", source: "fallback" },
    ],
    ...overrides,
  };
}

export type PickPoints = (decision: Decision, index: number) => 0 | 1 | 2;

export function recordsWith(content: PlanetContent, pick: PickPoints): DecisionRecord[] {
  return content.decisions.map((decision, index) => {
    const points = pick(decision, index);
    const option = decision.options.find((o) => o.points === points) ?? decision.options[0]!;
    return {
      decisionId: decision.id,
      optionId: option.id,
      kind: decision.kind,
      points,
      ms: 1_200 + index * 100,
    };
  });
}

export const ALL_BEST: PickPoints = () => 2;
export const ALL_WORST: PickPoints = () => 0;
export const MIXED: PickPoints = (_decision, index) => [2, 1, 0][index % 3] as 0 | 1 | 2;

export const NOOP = () => {};
