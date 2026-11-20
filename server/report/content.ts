/**
 * Nội dung 5 trạm cho việc tính điểm server-side.
 * Ưu tiên import module gameplay (src/game/content/index.ts) khi đã có;
 * nếu chưa có (chạy sớm), suy ra "khung" từ chính decision records để công thức shared vẫn chạy.
 */
import type { Decision, PlanetContent, PlanetId, PlanetResult, PreScanCriterion } from "../../src/shared/types";
import { PLANET_ORDER } from "../../src/shared/planets";

export type PlanetContentMap = Record<PlanetId, PlanetContent>;

const MODULE_CANDIDATES = ["../../src/game/content/index.js", "../../src/game/content/index.ts"];

let resolved: PlanetContentMap | null | undefined;

function isPlanetContent(value: unknown): value is PlanetContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Partial<PlanetContent>;
  return Array.isArray(content.decisions) && typeof content.planet === "string";
}

export function isPlanetContentMap(value: unknown): value is PlanetContentMap {
  if (!value || typeof value !== "object") return false;
  const map = value as Record<string, unknown>;
  return PLANET_ORDER.every((planet) => isPlanetContent(map[planet]));
}

/** Tìm export PLANET_CONTENT (hoặc default) trong module gameplay nếu đã tồn tại. */
export async function loadPlanetContent(): Promise<PlanetContentMap | null> {
  if (resolved !== undefined) return resolved;
  for (const specifier of MODULE_CANDIDATES) {
    try {
      const mod = (await import(/* @vite-ignore */ specifier)) as Record<string, unknown>;
      const candidate = mod.PLANET_CONTENT ?? mod.default;
      if (isPlanetContentMap(candidate)) {
        resolved = candidate;
        return resolved;
      }
    } catch {
      /* module chưa có — thử đường dẫn .ts hoặc fallback */
    }
  }
  resolved = null;
  return null;
}

const EVIDENCE_KEY: Record<PlanetId, PreScanCriterion | undefined> = {
  S: "logo",
  A: "slogan",
  O: "color",
  K: "social",
  IM: undefined,
};

/** Fallback: dựng PlanetContent tối thiểu từ records client gửi (đúng số quyết định đã chọn). */
export function deriveContentFromResults(results: PlanetResult[]): PlanetContentMap {
  const map = {} as PlanetContentMap;
  for (const planet of PLANET_ORDER) {
    const result = results.find((r) => r.planet === planet);
    const decisions: Decision[] = (result?.decisions ?? []).map((record) => ({
      id: record.decisionId,
      planet,
      kind: record.kind,
      prompt: "",
      options: [],
      explain: "",
      evidenceKey: record.kind === "diagnosis" ? EVIDENCE_KEY[planet] : undefined,
    }));
    map[planet] = {
      planet,
      slug: planet.toLowerCase(),
      intro: [],
      outro: [],
      insight: "",
      badge: { id: planet.toLowerCase(), name: planet, blurb: "" },
      decisions,
    };
  }
  return map;
}

export function contentForPlanet(
  map: PlanetContentMap | null,
  planet: PlanetId,
  results: PlanetResult[],
): PlanetContent {
  if (map?.[planet]) return map[planet];
  return deriveContentFromResults(results)[planet];
}
