import { afterEach, describe, expect, it } from "vitest";
import { createLogger } from "../../server/lib/log";
import { hmacSha256Hex } from "../../server/lib/hash";
import {
  enqueueLeadOutbox,
  escapeCsv,
  flushOutbox,
  leadsToCsv,
  type CrmFetchLike,
} from "../../server/crm/outbox";
import { closeDb, openDb, type Db, type LeadRow } from "../../server/db";
import { makeTempDir, testConfig } from "./helpers";

let db: Db | null = null;

afterEach(() => {
  if (db) closeDb(db);
  db = null;
});

function makePayload(phone = "0901234567") {
  return {
    id: "lead-1",
    sessionId: "s1",
    reportId: "r1",
    name: "Nguyễn Văn A",
    phone,
    email: "a@example.com",
    isRepresentative: true,
    consent: true,
    consentVersion: "2026-11-v1",
    marketingOptIn: false,
    website: null,
    status: "new",
    offerCode: "identity",
    offerName: "Gói Nhận diện",
    overall: 7.4,
    industry: "Xây dựng & Nội thất",
    companySize: "6-20",
    role: "founder",
    createdAt: "2026-11-14T07:00:00.000Z",
    source: "hanh-trinh-sao-kim" as const,
  };
}

describe("CRM outbox", () => {
  it("gửi webhook với HMAC SHA256 và header sự kiện", async () => {
    const dir = await makeTempDir();
    db = openDb(":memory:");
    const config = testConfig({ dataDir: dir, crmWebhookUrl: "https://crm.example.com/hook", crmSecret: "crm-secret" });
    let captured: { url: string; body: string; signature: string; event: string } | null = null;
    const fetchImpl: CrmFetchLike = async (url, init) => {
      const headers = init.headers as Record<string, string>;
      captured = {
        url,
        body: String(init.body),
        signature: headers["X-Saokim-Signature"] ?? "",
        event: headers["X-Saokim-Event"] ?? "",
      };
      return { ok: true, status: 200 };
    };
    const logger = createLogger({ level: "error", sink: () => undefined });
    enqueueLeadOutbox({ db, config, logger, now: () => Date.parse("2026-11-14T07:00:00Z") }, makePayload());
    const result = await flushOutbox({ db, config, logger, fetchImpl, now: () => Date.parse("2026-11-14T07:00:01Z") });
    expect(result).toEqual({ sent: 1, retrying: 0, dead: 0 });
    expect(captured).not.toBeNull();
    expect(captured!.url).toBe("https://crm.example.com/hook");
    expect(captured!.event).toBe("lead.created");
    expect(captured!.signature).toBe(`sha256=${hmacSha256Hex("crm-secret", captured!.body)}`);
  });

  it("retry backoff rồi dead-letter, không log PII", async () => {
    const dir = await makeTempDir();
    db = openDb(":memory:");
    const config = testConfig({ dataDir: dir, crmWebhookUrl: "https://crm.example.com/hook", crmSecret: "crm-secret" });
    const logs: string[] = [];
    const logger = createLogger({ level: "debug", sink: (line) => logs.push(line) });
    const failingFetch: CrmFetchLike = async () => ({ ok: false, status: 500 });
    const base = Date.parse("2026-11-14T07:00:00Z");
    enqueueLeadOutbox({ db, config, logger, now: () => base }, makePayload());
    let current = base + 1_000;
    const first = await flushOutbox({ db, config, logger, fetchImpl: failingFetch, now: () => current });
    expect(first.retrying).toBe(1);
    const row = db.prepare("SELECT * FROM outbox").get() as { status: string; attempts: number };
    expect(row.status).toBe("pending");
    expect(row.attempts).toBe(1);

    for (let i = 0; i < 6; i += 1) {
      current += 60 * 60 * 1000;
      await flushOutbox({ db, config, logger, fetchImpl: failingFetch, now: () => current });
    }
    const deadRow = db.prepare("SELECT status, attempts FROM outbox").get() as { status: string; attempts: number };
    expect(deadRow.status).toBe("dead");
    expect(deadRow.attempts).toBeGreaterThanOrEqual(5);
    expect(logs.join("\n")).not.toContain("0901234567");
    expect(logs.join("\n")).not.toContain("a@example.com");
    expect(logs.join("\n")).not.toContain("Nguyễn Văn A");
  });
});

describe("CSV leads export", () => {
  it("escape dấu phẩy, ngoặc kép, xuống dòng và formula injection", () => {
    const lead: LeadRow = {
      id: "l1",
      session_id: "s1",
      report_id: "r1",
      name: 'Nguyễn "A", B',
      phone: "=SUM(A1)",
      email: "a@example.com",
      is_representative: 1,
      consent: 1,
      consent_version: "2026-11-v1",
      marketing_opt_in: 0,
      website: null,
      ip_hash: null,
      user_agent: null,
      status: "new",
      offer_code: "identity",
      offer_name: "Gói Nhận diện",
      overall: 7.4,
      industry: "Xây dựng & Nội thất",
      company_size: "6-20",
      role: "founder",
      created_at: "2026-11-14T07:00:00.000Z",
    };
    const csv = leadsToCsv([lead]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("id,created_at,name,phone,email");
    expect(lines[0]).toContain("status,offer_code,offer_name,overall,industry,company_size,role");
    expect(lines[1]).toContain('"Nguyễn ""A"", B"');
    expect(lines[1]).toContain(",'=SUM(A1),");
    expect(escapeCsv("dòng\nmới")).toBe('"dòng\nmới"');
    expect(escapeCsv("bình thường")).toBe("bình thường");
    expect(escapeCsv(null)).toBe("");
    expect(escapeCsv("@cmd")).toBe("'@cmd");
  });
});
