/**
 * Tính báo cáo server-side bằng shared scoring/offers — không tự viết lại công thức.
 * Client có thể gửi điểm đã tính (kèm bonus mini-game), server recompute và chặn điểm bất thường.
 */
import type {
  BrandProfile,
  PlanetId,
  PlanetResult,
  PreScan,
  ProfileAnswers,
  Report,
  RunResult,
  WeakStep,
} from "../../src/shared/types";
import { PLANET_ORDER } from "../../src/shared/planets";
import { buildRunResult, clamp, round1, scorePlanet, weaknessesFor } from "../../src/shared/scoring";
import { recommendOffers } from "../../src/shared/offers";
import { contentForPlanet, type PlanetContentMap } from "./content";
import type { InsightsInput } from "../ai/templates";

export interface BuildReportInput {
  sessionId: string;
  results: PlanetResult[];
  durationMs?: number;
  brand: BrandProfile;
  answers: ProfileAnswers;
  preScan: PreScan;
  content?: PlanetContentMap | null;
  id?: string;
  createdAt?: string;
  industryRank?: { rank: number; total: number };
}

export interface BuildReportDeps {
  generateInsights?: (input: InsightsInput) => Promise<{ insights: Report["insights"]; source: "ai" | "template" }>;
  newId?: () => string;
  now?: () => number;
}

/** Bonus tối đa hợp lệ của từng trạm (O timeBonus, K crisisFast) — dùng để chặn điểm bịa. */
const MAX_BONUS: Record<PlanetId, number> = { S: 0.05, A: 0.05, O: 2, K: 3, IM: 0.05 };

export function buildPlanetResults(input: BuildReportInput, content: PlanetContentMap | null): PlanetResult[] {
  const byPlanet = new Map<PlanetId, PlanetResult>();
  for (const result of input.results) {
    if (!byPlanet.has(result.planet)) byPlanet.set(result.planet, result);
  }

  const planets: PlanetResult[] = [];
  for (const planet of PLANET_ORDER) {
    const submitted = byPlanet.get(planet);
    if (!submitted) continue;
    const contentFor = contentForPlanet(content, planet, input.results);
    const recomputed = scorePlanet(planet, submitted.decisions, contentFor, input.preScan, {
      meter: planet === "IM" ? submitted.meter : undefined,
    });
    const submittedScore = clamp(submitted.score, 0, 10);
    const withinBonus =
      submittedScore >= recomputed.score - 0.05 && submittedScore <= recomputed.score + MAX_BONUS[planet];
    planets.push({
      ...recomputed,
      // Chỉ chấp nhận điểm client khi khớp công thức (sai lệch trong ngưỡng bonus hợp lệ).
      score: withinBonus ? round1(submittedScore) : recomputed.score,
      decisions: submitted.decisions,
      completedAt: submitted.completedAt || new Date().toISOString(),
      skipped: submitted.skipped ?? recomputed.skipped,
    });
  }
  return planets;
}

export async function buildReport(input: BuildReportInput, deps: BuildReportDeps = {}): Promise<Report> {
  const nowIso = new Date(deps.now?.() ?? Date.now()).toISOString();
  const planets = buildPlanetResults(input, input.content ?? null);
  const runResult: RunResult = buildRunResult(planets, input.durationMs);
  const weaknesses: WeakStep[] = weaknessesFor(runResult, input.preScan);
  const offers = recommendOffers(runResult, weaknesses);
  const insightsInput: InsightsInput = {
    brand: input.brand,
    preScan: input.preScan,
    answers: input.answers,
    result: runResult,
    weaknesses,
  };
  const insights = deps.generateInsights
    ? await deps.generateInsights(insightsInput)
    : { insights: [], source: "template" as const };

  const report: Report = {
    id: input.id ?? deps.newId?.() ?? `rp_${Math.random().toString(36).slice(2, 14)}`,
    createdAt: input.createdAt ?? nowIso,
    brand: input.brand,
    preScan: input.preScan,
    answers: input.answers,
    result: runResult,
    weaknesses,
    insights: insights.insights,
    aiSource: insights.source,
    offers,
    teaserOffer: offers[0]?.name ?? "Gói Nền tảng",
    ...(input.industryRank
      ? { industryRank: input.industryRank.rank, industryTotal: input.industryRank.total }
      : {}),
  };
  return report;
}
