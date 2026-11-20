/** CRM outbox: webhook HMAC SHA256, retry backoff, dead-letter, CSV export có escape đúng. */
import type { Db, LeadRow, OutboxRow } from "../db";
import {
  countOutbox,
  dueOutbox,
  insertOutbox,
  markOutboxRetry,
  markOutboxSent,
} from "../db";
import { hmacSha256Hex } from "../lib/hash";
import { newId } from "../lib/ids";
import type { Logger } from "../lib/log";
import type { AppConfig } from "../config";

export interface CrmFetchLike {
  (url: string, init: RequestInit): Promise<{ ok: boolean; status: number }>;
}

export interface OutboxDeps {
  db: Db;
  config: AppConfig;
  logger: Logger;
  fetchImpl?: CrmFetchLike;
  now?: () => number;
}

export interface LeadOutboxPayload {
  id: string;
  sessionId: string;
  reportId: string;
  name: string;
  phone: string | null;
  email: string | null;
  isRepresentative: boolean;
  consent: boolean;
  consentVersion: string | null;
  marketingOptIn: boolean;
  website: string | null;
  status: string;
  offerCode: string | null;
  offerName: string | null;
  overall: number | null;
  industry: string | null;
  companySize: string | null;
  role: string | null;
  createdAt: string;
  source: "hanh-trinh-sao-kim";
}

export type OutboxFlushResult = { sent: number; retrying: number; dead: number };

export function enqueueLeadOutbox(deps: OutboxDeps, lead: LeadOutboxPayload): void {
  const now = new Date(deps.now?.() ?? Date.now()).toISOString();
  insertOutbox(deps.db, {
    id: newId(),
    type: "lead.created",
    payload: lead,
    now,
    nextAttemptAt: now,
  });
}

function deliverySignature(secret: string, body: string): string {
  return `sha256=${hmacSha256Hex(secret, body)}`;
}

function backoffMs(attempts: number): number {
  const base = 30_000;
  return Math.min(base * 2 ** Math.max(0, attempts - 1), 60 * 60 * 1000);
}

export async function flushOutbox(deps: OutboxDeps, limit = 20): Promise<OutboxFlushResult> {
  const result: OutboxFlushResult = { sent: 0, retrying: 0, dead: 0 };
  const { config } = deps;
  if (!config.crm.webhookUrl || !config.crm.webhookSecret) return result;

  const nowMs = deps.now?.() ?? Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const due = dueOutbox(deps.db, nowIso, limit);
  const fetchImpl = deps.fetchImpl ?? (globalThis.fetch as unknown as CrmFetchLike);

  for (const row of due) {
    await deliverOne(row, deps, fetchImpl, nowMs, result);
  }
  return result;
}

async function deliverOne(
  row: OutboxRow,
  deps: OutboxDeps,
  fetchImpl: CrmFetchLike,
  nowMs: number,
  result: OutboxFlushResult,
): Promise<void> {
  const { config, db } = deps;
  const nowIso = new Date(nowMs).toISOString();
  const body = row.payload_json;
  let errorMessage = "";
  let ok = false;
  try {
    const res = await fetchImpl(config.crm.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SaoKimCRMOutbox/1.0",
        "X-Saokim-Event": row.type,
        "X-Saokim-Delivery": row.id,
        "X-Saokim-Signature": deliverySignature(config.crm.webhookSecret, body),
      },
      body,
      signal: AbortSignal.timeout(config.crm.timeoutMs),
    });
    ok = res.ok;
    if (!ok) errorMessage = `HTTP ${res.status}`;
  } catch (err) {
    errorMessage = err instanceof Error && err.name === "TimeoutError" ? "timeout" : "network_error";
  }

  if (ok) {
    markOutboxSent(db, row.id, nowIso);
    result.sent += 1;
    deps.logger.info("crm.outbox.sent", { delivery: row.id });
    return;
  }

  const attempts = row.attempts + 1;
  if (attempts >= config.crm.maxAttempts) {
    markOutboxRetry(db, row.id, attempts, nowIso, "dead", errorMessage, nowIso);
    result.dead += 1;
    deps.logger.error("crm.outbox.dead", { delivery: row.id, attempts, error: errorMessage });
    return;
  }
  const nextAttemptAt = new Date(nowMs + backoffMs(attempts)).toISOString();
  markOutboxRetry(db, row.id, attempts, nextAttemptAt, "pending", errorMessage, nowIso);
  result.retrying += 1;
  deps.logger.warn("crm.outbox.retry", { delivery: row.id, attempts, error: errorMessage });
}

/** Worker nền: flush mỗi phút. Trả hàm stop để test/server shutdown dùng. */
export function startOutboxWorker(deps: OutboxDeps, intervalMs = 60_000): { stop: () => void; flush: () => Promise<OutboxFlushResult> } {
  const timer = setInterval(() => {
    void flushOutbox(deps).catch((err) => {
      deps.logger.error("crm.outbox.worker_failed", { error: err instanceof Error ? err.name : "unknown" });
    });
  }, intervalMs);
  timer.unref?.();
  return {
    stop: () => clearInterval(timer),
    flush: () => flushOutbox(deps),
  };
}

export function outboxCounts(db: Db): { pending: number; sent: number; dead: number } {
  return { pending: countOutbox(db, "pending"), sent: countOutbox(db, "sent"), dead: countOutbox(db, "dead") };
}

const CSV_COLUMNS = [
  "id",
  "created_at",
  "name",
  "phone",
  "email",
  "is_representative",
  "consent",
  "consent_version",
  "marketing_opt_in",
  "website",
  "session_id",
  "report_id",
  "status",
  "offer_code",
  "offer_name",
  "overall",
  "industry",
  "company_size",
  "role",
] as const;

export function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  // Chống CSV formula injection khi mở bằng Excel/Sheets
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function leadsToCsv(leads: LeadRow[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const lead of leads) {
    lines.push(
      [
        lead.id,
        lead.created_at,
        lead.name,
        lead.phone,
        lead.email,
        lead.is_representative ? 1 : 0,
        lead.consent ? 1 : 0,
        lead.consent_version,
        lead.marketing_opt_in ? 1 : 0,
        lead.website,
        lead.session_id,
        lead.report_id,
        lead.status,
        lead.offer_code,
        lead.offer_name,
        lead.overall,
        lead.industry,
        lead.company_size,
        lead.role,
      ]
        .map(escapeCsv)
        .join(","),
    );
  }
  return lines.join("\r\n");
}
