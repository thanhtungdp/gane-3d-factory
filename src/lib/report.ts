import type { BrandProfile, PlanetResult, PreScan, ProfileAnswers, Report } from "@/shared/types";
import { buildRunResult, weaknessesFor } from "@/shared/scoring";
import { recommendOffers } from "@/shared/offers";
import { templateInsights } from "@/shared/insights";

export function buildLocalReport(input: {
  brand: BrandProfile;
  preScan: PreScan;
  answers: ProfileAnswers;
  results: PlanetResult[];
  durationMs?: number;
}): Report {
  const result = buildRunResult(input.results, input.durationMs);
  const weaknesses = weaknessesFor(result, input.preScan);
  const offers = recommendOffers(result, weaknesses);
  const insights = templateInsights(input.brand, input.preScan, input.answers, result);
  const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    createdAt: new Date().toISOString(),
    brand: input.brand,
    preScan: input.preScan,
    answers: input.answers,
    result,
    weaknesses,
    insights,
    aiSource: "template",
    offers,
    teaserOffer: offers[0]?.name ?? "Gói đồng hành thương hiệu",
  };
}
