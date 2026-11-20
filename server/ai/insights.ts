/**
 * AI insight: gọi DeepSeek JSON mode (timeout 8s), validate chặt, cache theo hash.
 * Không key/lỗi/JSON hỏng → 3 template deterministic. Luôn trả aiSource.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { AiInsight, PlanetId } from "../../src/shared/types";
import type { AppConfig } from "../config";
import { sha256Hex } from "../lib/ids";
import type { Logger } from "../lib/log";
import { buildTemplateInsights, type InsightsInput } from "./templates";

export { buildTemplateInsights } from "./templates";

export interface AiFetchLike {
  (url: string, init: RequestInit): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
}

export interface AiDeps {
  config: AppConfig;
  logger: Logger;
  fetchImpl?: AiFetchLike;
  now?: () => number;
}

export interface InsightsResult {
  insights: AiInsight[];
  source: "ai" | "template";
}

const AI_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const insightSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(400),
  evidence: z.string().trim().min(1).max(300),
  action: z.string().trim().min(1).max(300),
});

const aiResponseSchema = z.object({ insights: z.array(insightSchema).length(3) });

const FORBIDDEN_PATTERNS: RegExp[] = [
  /%/,
  /\b\d+\s*(triệu|tỷ|đồng|vnđ|vnd|usd)\b/iu,
  /\bgiá\s+(bán|niêm yết|từ|thị trường)\b/iu,
  /\b(bảo đảm|cam kết|chắc chắn)\b/iu,
  /https?:\/\//i,
];

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Validate + hậu kiểm nội dung AI (không %, không số liệu/giá/bảo đảm bịa). */
export function isAcceptableInsights(insights: AiInsight[]): boolean {
  if (insights.length !== 3) return false;
  for (const insight of insights) {
    if (!insight.title || !insight.body || !insight.evidence || !insight.action) return false;
    if (countWords(insight.title) > 6) return false;
    if (countWords(insight.body) > 35) return false;
    const merged = `${insight.title} ${insight.body} ${insight.evidence} ${insight.action}`;
    if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(merged))) return false;
  }
  return true;
}

function cachePayload(input: InsightsInput): Record<string, unknown> {
  const planetScores: Partial<Record<PlanetId, number>> = {};
  for (const [planet, result] of Object.entries(input.result.planets)) {
    planetScores[planet as PlanetId] = result?.score ?? 0;
  }
  const criteria: Record<string, { score: number; evidence: string }> = {};
  for (const [key, value] of Object.entries(input.preScan.criteria)) {
    criteria[key] = { score: value.score, evidence: value.evidence };
  }
  return {
    v: 2,
    brand: {
      name: input.brand.name,
      industry: input.brand.industry ?? null,
      tagline: input.brand.tagline ?? null,
      description: input.brand.description ?? null,
    },
    preScan: { score: input.preScan.score, criteria },
    answers: input.answers,
    result: { overall: input.result.overall, title: input.result.title, scores: planetScores, weak: input.result.weak },
    weaknesses: input.weaknesses.map((w) => ({ planet: w.planet, score: w.score, evidence: w.evidence ?? null })),
  };
}

function buildPrompt(input: InsightsInput, payload: Record<string, unknown>): { system: string; user: string } {
  const system = [
    "Bạn là KIM, trợ lý thương hiệu của Sao Kim Branding (Việt Nam).",
    "Bạn viết nhận xét thương hiệu cụ thể, thẳng thắn, không sáo rỗng.",
    "Chỉ trả về JSON hợp lệ dạng {\"insights\":[{\"title\":\"...\",\"body\":\"...\",\"evidence\":\"...\",\"action\":\"...\"}]} với đúng 3 phần tử.",
    "Quy tắc bắt buộc: mỗi title tối đa 6 từ; mỗi body tối đa 35 từ; evidence phải lấy từ dữ liệu quét được cung cấp; action là một việc làm cụ thể.",
    "Không dùng ký hiệu phần trăm. Không bịa số liệu, không nêu giá, không hứa bảo đảm hay cam kết kết quả.",
    "Không nhắc tên gói dịch vụ. Giọng điệu bình tĩnh, tôn trọng, không hạ thấp doanh nghiệp.",
  ].join(" ");
  const user = [
    "Dữ liệu quét thật của doanh nghiệp (không phải nội dung đầy đủ của website):",
    JSON.stringify(payload),
    "Hãy trả về 3 insight tiếng Việt theo đúng JSON schema đã nêu.",
  ].join("\n");
  return { system, user };
}

function parseAiContent(content: string): AiInsight[] | null {
  const trimmed = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  const validated = aiResponseSchema.safeParse(parsed);
  if (!validated.success) return null;
  return validated.data.insights;
}

async function readAiCache(dir: string, key: string, now: number): Promise<AiInsight[] | null> {
  try {
    const raw = await readFile(path.join(dir, `ai-${key}.json`), "utf8");
    const envelope = JSON.parse(raw) as { v: number; expiresAt: number; insights: AiInsight[] };
    if (envelope.v !== 1 || envelope.expiresAt <= now) return null;
    if (!isAcceptableInsights(envelope.insights)) return null;
    return envelope.insights;
  } catch {
    return null;
  }
}

async function writeAiCache(dir: string, key: string, insights: AiInsight[], now: number): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, `ai-${key}.json`),
      JSON.stringify({ v: 1, expiresAt: now + AI_CACHE_TTL_MS, insights }),
    );
  } catch {
    /* cache best-effort */
  }
}

const memoryAiCache = new Map<string, { insights: AiInsight[]; expiresAt: number }>();

/** Xoá cache memory (dùng cho test hoặc khi đổi cấu hình AI). */
export function clearAiMemoryCache(): void {
  memoryAiCache.clear();
}

export async function generateInsights(input: InsightsInput, deps: AiDeps): Promise<InsightsResult> {
  const now = deps.now?.() ?? Date.now();
  const payload = cachePayload(input);
  const key = sha256Hex(JSON.stringify(payload));
  const cacheDir = deps.config.cacheDir;

  const memory = memoryAiCache.get(key);
  if (memory && memory.expiresAt > now) {
    return { insights: memory.insights, source: "ai" };
  }
  const fromDisk = await readAiCache(cacheDir, key, now);
  if (fromDisk) {
    memoryAiCache.set(key, { insights: fromDisk, expiresAt: now + AI_CACHE_TTL_MS });
    return { insights: fromDisk, source: "ai" };
  }

  const template = (): InsightsResult => ({ insights: buildTemplateInsights(input), source: "template" });
  const apiKey = deps.config.deepseek.apiKey;
  if (!apiKey) return template();

  const { system, user } = buildPrompt(input, payload);
  const fetchImpl = deps.fetchImpl ?? (globalThis.fetch as unknown as AiFetchLike);
  try {
    const res = await fetchImpl(`${deps.config.deepseek.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: deps.config.deepseek.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1100,
        stream: false,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      deps.logger.warn("ai.fallback", { reason: `http_${res.status}` });
      return template();
    }
    const body = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      deps.logger.warn("ai.fallback", { reason: "empty_content" });
      return template();
    }
    const insights = parseAiContent(content);
    if (!insights || !isAcceptableInsights(insights)) {
      deps.logger.warn("ai.fallback", { reason: "invalid_json_or_copy" });
      return template();
    }
    memoryAiCache.set(key, { insights, expiresAt: now + AI_CACHE_TTL_MS });
    await writeAiCache(cacheDir, key, insights, now);
    deps.logger.info("ai.ok", { model: deps.config.deepseek.model });
    return { insights, source: "ai" };
  } catch (err) {
    deps.logger.warn("ai.fallback", {
      reason: err instanceof Error && err.name === "TimeoutError" ? "timeout" : "request_failed",
    });
    return template();
  }
}
