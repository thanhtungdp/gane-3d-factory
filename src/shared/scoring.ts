import {
  PLANET_IDS,
  REPORT_TITLES,
  type Decision,
  type DecisionRecord,
  type PlanetContent,
  type PlanetId,
  type PlanetResult,
  type PreScan,
  type RunResult,
  type WeakStep,
} from "./types";
import { PLANET_ORDER, type PlanetMeta } from "./planets";

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function clamp(n: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, n));
}

export function titleFor(overall: number): { title: string; blurb: string } {
  const found = REPORT_TITLES.find((t) => overall >= t.min) ?? REPORT_TITLES[REPORT_TITLES.length - 1]!;
  return { title: found.title, blurb: found.blurb };
}

export function starsFor(overall: number): number {
  return Math.round((overall / 10) * 5 * 2) / 2;
}

export function isRealityCheck(decision: Decision, points: number, preScan: PreScan): boolean {
  if (decision.kind !== "diagnosis" || points !== 2 || !decision.evidenceKey) return false;
  const criterion = preScan.criteria[decision.evidenceKey];
  return Boolean(criterion && criterion.score < 6);
}

export interface ScoreOptions {
  meter?: number;
  timeBonus?: number;
  crisisFast?: boolean;
}

/**
 * Điểm trạm 0–10. Không dùng % ở UI; mọi nơi hiển thị X/10.
 * Công thức gốc ở docs/04-scoring-offers.md.
 */
export function scorePlanet(
  planet: PlanetId,
  records: DecisionRecord[],
  content: PlanetContent,
  preScan: PreScan,
  opts: ScoreOptions = {},
): PlanetResult {
  const byId = new Map(records.map((r) => [r.decisionId, r]));
  const knowledgeDecisions = content.decisions.filter((d) => d.kind === "knowledge");
  const diagnosisDecisions = content.decisions.filter((d) => d.kind === "diagnosis");

  let knowledgeSum = records
    .filter((r) => r.kind === "knowledge")
    .reduce((sum, r) => sum + Math.max(0, Math.min(2, r.points)), 0);

  if (opts.timeBonus) knowledgeSum += Math.min(1, Math.max(0, opts.timeBonus));

  const knowledge = knowledgeDecisions.length
    ? clamp((10 * knowledgeSum) / (2 * knowledgeDecisions.length))
    : 0;

  let penalty = 0;
  for (const d of diagnosisDecisions) {
    const rec = byId.get(d.id);
    if (rec && isRealityCheck(d, rec.points, preScan)) penalty += 1;
  }
  penalty = Math.min(2, penalty);

  const diagnosisRaw = diagnosisDecisions.length
    ? (10 * diagnosisDecisions.reduce((sum, d) => sum + (byId.get(d.id)?.points ?? 0), 0)) /
      (2 * diagnosisDecisions.length)
    : 0;
  const diagnosis = clamp(diagnosisRaw - penalty);

  let score: number;
  switch (planet) {
    case "S":
    case "A":
      score = 0.6 * knowledge + 0.4 * diagnosis;
      break;
    case "O":
      score = 0.7 * knowledge + 0.3 * diagnosis;
      break;
    case "K":
      score = 0.7 * knowledge + 0.3 * diagnosis + (opts.crisisFast ? 0.5 : 0);
      break;
    case "IM": {
      const meter = clamp(opts.meter ?? 0);
      score = 0.5 * knowledge + 0.3 * diagnosis + 0.2 * meter;
      break;
    }
    default:
      score = 0;
  }

  const skipped = records.length === 0;
  return {
    planet,
    score: skipped ? 0 : round1(clamp(score)),
    knowledge: round1(knowledge),
    diagnosis: round1(diagnosis),
    meter: planet === "IM" ? round1(clamp(opts.meter ?? 0)) : undefined,
    decisions: records,
    skipped,
    completedAt: new Date().toISOString(),
  };
}

export function buildRunResult(planets: PlanetResult[], durationMs?: number): RunResult {
  const map: Partial<Record<PlanetId, PlanetResult>> = {};
  for (const p of planets) map[p.planet] = p;

  const total = PLANET_ORDER.reduce((sum, id) => sum + (map[id]?.score ?? 0) * WEIGHTS[id], 0);
  const overall = round1(total);

  const weak = [...PLANET_ORDER]
    .filter((id) => map[id])
    .sort((a, b) => {
      const diff = (map[a]!.score ?? 0) - (map[b]!.score ?? 0);
      if (diff !== 0) return diff;
      return PLANET_ORDER.indexOf(a) - PLANET_ORDER.indexOf(b);
    })
    .slice(0, 2);

  const badges = PLANET_ORDER.filter((id) => (map[id]?.score ?? 0) >= 6);
  const { title, blurb } = titleFor(overall);

  return {
    overall,
    title,
    titleBlurb: blurb,
    stars: starsFor(overall),
    planets: map,
    weak,
    badges,
    completedAt: new Date().toISOString(),
    durationMs,
  };
}

export const WEIGHTS: Record<PlanetId, number> = {
  S: 0.15,
  A: 0.2,
  O: 0.25,
  K: 0.2,
  IM: 0.2,
};

const CONSEQUENCES: Record<PlanetId, string> = {
  S: "Bạn đang chi tiền cho những giả định chưa được kiểm chứng. Ngân sách marketing chảy vào thông điệp mà khách không cần.",
  A: "Mỗi kênh nói một kiểu. Khách không hiểu vì sao nên chọn bạn thay vì một lựa chọn rẻ hơn.",
  O: "Nhận diện thiếu nhất quán khiến bạn trả tiền quảng cáo để khách nhớ một thương hiệu mờ nhạt.",
  K: "Ra mắt không có kịch bản, đối thủ chiếm chỗ trong tâm trí khách trước khi bạn kịp cất tiếng.",
  IM: "Thương hiệu mạnh lúc ra mắt nhưng mai một dần vì mỗi người làm một kiểu.",
};

const PACKAGE_HINT: Record<PlanetId, string> = {
  S: "Brand audit",
  A: "Chiến lược thương hiệu",
  O: "Nhận diện thương hiệu",
  K: "Marcom",
  IM: "Brand guideline + Design request",
};

export function weaknessesFor(result: RunResult, preScan: PreScan): WeakStep[] {
  return result.weak.map((planet) => {
    const score = result.planets[planet]?.score ?? 0;
    const evidence = evidenceFor(planet, preScan);
    return {
      planet,
      score,
      consequence: CONSEQUENCES[planet],
      evidence,
      packageName: PACKAGE_HINT[planet],
    };
  });
}

function evidenceFor(planet: PlanetId, preScan: PreScan): string | undefined {
  const keyByPlanet: Partial<Record<PlanetId, keyof PreScan["criteria"]>> = {
    S: "slogan",
    A: "logo",
    O: "color",
    K: "social",
    IM: "mobile",
  };
  const key = keyByPlanet[planet];
  if (!key) return undefined;
  const criterion = preScan.criteria[key];
  // Chỉ dùng bằng chứng khi tiêu chí thật sự yếu; tín hiệu tốt không nên
  // xuất hiện dưới một bước yếu trong báo cáo.
  if (!criterion || criterion.score >= 7) return undefined;
  return criterion.evidence;
}

/** 0–1 cho độ sáng của lớp hành tinh; vùng tối = bước yếu. */
export function layerStrength(score: number): number {
  return Math.max(0.12, Math.min(1, score / 10));
}

export function litLayersFromResults(
  results: Partial<Record<PlanetId, PlanetResult>>,
): Record<PlanetMeta["layerKey"], number> {
  return {
    atmosphere: layerStrength(results.S?.score ?? 0),
    rotation: layerStrength(results.A?.score ?? 0),
    surface: layerStrength(results.O?.score ?? 0),
    signal: layerStrength(results.K?.score ?? 0),
    satellites: layerStrength(results.IM?.score ?? 0),
  };
}

export function hasAllPlanets(result: RunResult): boolean {
  return PLANET_IDS.every((id) => Boolean(result.planets[id]));
}

export function planetScoresList(result: RunResult): { id: PlanetId; score: number }[] {
  return PLANET_ORDER.map((id) => ({ id, score: result.planets[id]?.score ?? 0 }));
}

/** Điểm tạm tính khi mới hoàn thành một phần hành trình (chia theo trọng số đã có). */
export function partialOverall(results: Partial<Record<PlanetId, PlanetResult>>): number {
  let sum = 0;
  let weight = 0;
  for (const id of PLANET_ORDER) {
    const r = results[id];
    if (!r) continue;
    sum += r.score * WEIGHTS[id];
    weight += WEIGHTS[id];
  }
  return weight > 0 ? round1(sum / weight) : 0;
}
