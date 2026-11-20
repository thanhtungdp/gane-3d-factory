import { rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp, type App } from "../../server/app";
import { closeDb, openDb, type Db } from "../../server/db";
import { createAssetStore, type AssetStore } from "../../server/storage/assets";
import { createScanCache, type ScanCache } from "../../server/crawl/cache";
import { createNoopLogger } from "../../server/lib/log";
import type { AppConfig } from "../../server/config";
import { CONSENT_VERSION, type PlanetResult, type Report, type ScanResult } from "../../src/shared/types";
import { PLANET_ORDER } from "../../src/shared/planets";
import { scorePlanet } from "../../src/shared/scoring";
import {
  createFakeSiteFetch,
  fakeContentMap,
  fixture,
  makeTempDir,
  testConfig,
  type FakeFetchHandle,
} from "./helpers";

let dir = "";
let config: AppConfig;
let db: Db;
let assets: AssetStore;
let cache: ScanCache;
let site: FakeFetchHandle;
let app: App;
let scan: ScanResult;
let sessionId = "";
let reportId = "";
let pdfUrl = "";

const LEAD_NAME = "Nguyễn Văn A";
const LEAD_PHONE = "0901234567";

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

async function postJson(pathname: string, body: unknown): Promise<Response> {
  return app.request(pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function patchJson(pathname: string, body: unknown): Promise<Response> {
  return app.request(pathname, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function resultsFor(preScan: ScanResult["preScan"]): PlanetResult[] {
  const content = fakeContentMap();
  return PLANET_ORDER.map((planet) =>
    scorePlanet(
      planet,
      content[planet].decisions.map((decision) => ({
        decisionId: decision.id,
        optionId: "a",
        kind: decision.kind,
        points: 2 as const,
        ms: 800,
      })),
      content[planet],
      preScan,
      { meter: 9 },
    ),
  );
}

beforeAll(async () => {
  dir = await makeTempDir();
  config = testConfig({ dataDir: dir });
  db = openDb(":memory:");
  assets = createAssetStore(config.assetsDir);
  cache = createScanCache({ dir: config.cacheDir });
  site = await createFakeSiteFetch();
  app = createApp({
    config,
    db,
    assets,
    scanCache: cache,
    logger: createNoopLogger(),
    fetchImpl: site.fetchImpl,
    enableStatic: false,
  });

  const scanRes = await postJson("/api/scan", { url: "https://www.hoasen.vn/" });
  expect(scanRes.status).toBe(200);
  scan = await readJson<ScanResult>(scanRes);

  const sessionRes = await postJson("/api/sessions", {
    scanId: scan.scanId,
    brand: scan.brand,
    answers: { companySize: "6-20", role: "founder" },
    consent: { accepted: true, version: CONSENT_VERSION },
  });
  expect(sessionRes.status).toBe(201);
  sessionId = (await readJson<{ sessionId: string }>(sessionRes)).sessionId;

  const reportRes = await postJson("/api/reports", {
    sessionId,
    results: resultsFor(scan.preScan),
    durationMs: 500_000,
  });
  expect(reportRes.status).toBe(201);
  const reportBody = await readJson<{ report: Report }>(reportRes);
  reportId = reportBody.report.id;
});

afterAll(async () => {
  closeDb(db);
  await rm(dir, { recursive: true, force: true });
});

describe("API Hono", () => {
  it("GET /api/health trả 200 + security headers", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await readJson<{ ok: boolean; db: string; ai: boolean; crm: boolean }>(res);
    expect(body.ok).toBe(true);
    expect(body.db).toBe("ok");
    expect(body.ai).toBe(false);
    expect(body.crm).toBe(false);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("POST /api/scan trả brand kit (từ fetch inject, không gọi mạng)", () => {
    expect(scan.source).toBe("url");
    expect(scan.brand.name).toBe("Hoa Sen Group");
    expect(scan.brand.logo?.id).toBeTruthy();
    expect(scan.brand.palette.length).toBeGreaterThanOrEqual(2);
    expect(scan.preScan.signals.length).toBeGreaterThanOrEqual(5);
  });

  it("POST /api/scan validate input", async () => {
    const res = await postJson("/api/scan", {});
    expect(res.status).toBe(400);
    const body = await readJson<{ code: string }>(res);
    expect(body.code).toBe("VALIDATION");
  });

  it("PATCH /api/sessions/:id lưu tiến trình, 404 nếu không tồn tại", async () => {
    const ok = await patchJson(`/api/sessions/${sessionId}`, {
      progress: { currentPlanet: "S", completed: ["S"] },
    });
    expect(ok.status).toBe(200);
    expect(await readJson<{ ok: boolean }>(ok)).toEqual({ ok: true });

    const missing = await patchJson("/api/sessions/khong-ton-tai", {
      progress: { currentPlanet: null, completed: [] },
    });
    expect(missing.status).toBe(404);
  });

  it("POST /api/reports tính server-side + GET lại được", async () => {
    const res = await app.request(`/api/reports/${reportId}`);
    expect(res.status).toBe(200);
    const body = await readJson<{ report: Report }>(res);
    const report = body.report;
    expect(report.id).toBe(reportId);
    expect(report.result.overall).toBeGreaterThanOrEqual(0);
    expect(report.result.overall).toBeLessThanOrEqual(10);
    expect(Object.keys(report.result.planets)).toHaveLength(5);
    expect(report.weaknesses).toHaveLength(2);
    expect(report.insights).toHaveLength(3);
    expect(report.aiSource).toBe("template");
    expect(report.offers.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(report)).not.toMatch(/\d+%/);
  });

  it("GET /api/reports/:id không chứa PII của lead", async () => {
    const res = await app.request(`/api/reports/${reportId}`);
    const raw = await res.text();
    expect(raw).not.toContain(LEAD_NAME);
    expect(raw).not.toContain(LEAD_PHONE);
    expect(raw).not.toContain("a@example.com");
    expect(raw).not.toContain("consent_version");
    expect(raw).not.toContain("\"leads\"");
  });

  it("báo cáo không tồn tại → 404 JSON", async () => {
    const res = await app.request("/api/reports/khong-co");
    expect(res.status).toBe(404);
    const body = await readJson<{ code: string }>(res);
    expect(body.code).toBe("REPORT_NOT_FOUND");
  });

  it("POST /api/leads validate + chặn session không khớp", async () => {
    const base = {
      sessionId,
      reportId,
      name: LEAD_NAME,
      phone: LEAD_PHONE,
      isRepresentative: true,
      consent: true,
    };
    const badPhone = await postJson("/api/leads", { ...base, phone: "123" });
    expect(badPhone.status).toBe(400);
    const honeypot = await postJson("/api/leads", { ...base, website: "http://spam.example" });
    expect(honeypot.status).toBe(400);
    const mismatch = await postJson("/api/leads", { ...base, sessionId: "session-khac" });
    expect(mismatch.status).toBe(400);
  });

  it("POST /api/leads cấp PDF token, lưu consent", async () => {
    const res = await postJson("/api/leads", {
      sessionId,
      reportId,
      name: LEAD_NAME,
      phone: LEAD_PHONE,
      email: "a@example.com",
      isRepresentative: true,
      consent: true,
      marketingOptIn: true,
    });
    expect(res.status).toBe(200);
    const body = await readJson<{ ok: boolean; pdfUrl: string; offerUnlocked: boolean }>(res);
    expect(body.ok).toBe(true);
    expect(body.offerUnlocked).toBe(true);
    expect(body.pdfUrl).toContain("/pdf?token=");
    pdfUrl = body.pdfUrl;
    const leadRow = db.prepare("SELECT * FROM leads").get() as {
      consent: number;
      consent_version: string;
      status: string;
      offer_code: string | null;
      offer_name: string | null;
      overall: number | null;
      industry: string | null;
      company_size: string | null;
      role: string | null;
    };
    expect(leadRow.consent).toBe(1);
    expect(leadRow.consent_version).toBe(CONSENT_VERSION);
    expect(leadRow.status).toBe("new");
    expect(leadRow.offer_code).toBeTruthy();
    expect(leadRow.offer_name).toBeTruthy();
    expect(typeof leadRow.overall).toBe("number");
    expect(leadRow.company_size).toBe("6-20");
    expect(leadRow.role).toBe("founder");
    expect(leadRow.industry).toBeTruthy();
    const outbox = db.prepare("SELECT * FROM outbox").get() as { status: string; payload_json: string } | undefined;
    expect(outbox?.status).toBe("pending");
    const outboxPayload = JSON.parse(outbox!.payload_json) as Record<string, unknown>;
    expect(outboxPayload.offerCode).toBeTruthy();
    expect(outboxPayload.companySize).toBe("6-20");
  });

  it("GET PDF cần token hợp lệ và trả application/pdf", async () => {
    const res = await app.request(pdfUrl);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/pdf");
    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.byteLength).toBeGreaterThan(3_000);

    const noToken = await app.request(`/api/reports/${reportId}/pdf`);
    expect(noToken.status).toBe(403);
    const badToken = await app.request(`/api/reports/${reportId}/pdf?token=rac`);
    expect(badToken.status).toBe(403);
  });

  it("leaderboard: rỗng trước, gửi điểm rồi đọc lại", async () => {
    const before = await app.request("/api/leaderboard");
    expect(await readJson<{ entries: unknown[] }>(before)).toEqual({ entries: [] });

    const submit = await postJson("/api/leaderboard", {
      sessionId,
      alias: "Hoa Sen",
      anonymous: false,
      industry: "Xây dựng",
      visible: true,
    });
    expect(submit.status).toBe(201);
    const entry = await readJson<{ entry: { alias: string; score: number } }>(submit);
    expect(entry.entry.alias).toBe("Hoa Sen");
    expect(entry.entry.score).toBeGreaterThanOrEqual(0);

    const after = await app.request("/api/leaderboard?industry=" + encodeURIComponent("Xây dựng"));
    const list = await readJson<{ entries: { alias: string }[] }>(after);
    expect(list.entries).toHaveLength(1);
    expect(list.entries[0]?.alias).toBe("Hoa Sen");
  });

  it("POST /api/events ghi batch, validate tên rỗng", async () => {
    const ok = await postJson("/api/events", {
      events: [
        { name: "game_start", sessionId, planet: "S", props: { source: "landing" } },
        { name: "planet_complete", sessionId, planet: "S", props: { score: 8 } },
      ],
    });
    expect(ok.status).toBe(200);
    expect(await readJson<{ ok: boolean }>(ok)).toEqual({ ok: true });
    const count = (db.prepare("SELECT COUNT(*) AS n FROM events").get() as { n: number }).n;
    expect(count).toBe(2);

    const bad = await postJson("/api/events", { events: [{ name: "" }] });
    expect(bad.status).toBe(400);
  });

  it("GET asset immutable từ logo đã quét", async () => {
    const logoId = scan.brand.logo?.id;
    expect(logoId).toBeTruthy();
    const res = await app.request(`/api/assets/${logoId}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toContain("immutable");
    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it("POST /api/logo nhận multipart ≤2MB và trả BrandLogo", async () => {
    const png = await fixture("logo-large.png");
    const form = new FormData();
    form.append("logo", new File([new Uint8Array(png)], "logo.png", { type: "image/png" }));
    const res = await app.request("/api/logo", { method: "POST", body: form });
    expect(res.status).toBe(200);
    const body = await readJson<{ id: string; url: string; quality: string; source: string }>(res);
    expect(body.url).toBe(`/api/assets/${body.id}`);
    expect(body.source).toBe("upload");
    expect(["high", "medium", "low"]).toContain(body.quality);
  });

  it("GET /api/qr trả PNG", async () => {
    const res = await app.request(`/api/qr?data=${encodeURIComponent("https://saokim.vn/dat-lich")}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const missing = await app.request("/api/qr");
    expect(missing.status).toBe(400);
  });

  it("admin CSV cần token, escape đúng và chứa lead", async () => {
    const wrong = await app.request("/api/admin/leads.csv?token=sai");
    expect(wrong.status).toBe(401);

    const res = await app.request("/api/admin/leads.csv?token=test-admin-token");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("id,created_at,name,phone,email");
    expect(text).toContain(LEAD_NAME);
    expect(text).not.toContain("%");
  });

  it("endpoint lạ dưới /api → 404 JSON", async () => {
    const res = await app.request("/api/khong-ton-tai");
    expect(res.status).toBe(404);
    const body = await readJson<{ error: string }>(res);
    expect(body.error).toBe("NOT_FOUND");
  });

  it("chặn điểm bịa: report mới với toàn điểm 0 nhưng score 10", async () => {
    const sessionRes = await postJson("/api/sessions", {
      scanId: scan.scanId,
      brand: scan.brand,
      answers: { companySize: "1-5", role: "brand" },
      consent: { accepted: true, version: CONSENT_VERSION },
    });
    const newSessionId = (await readJson<{ sessionId: string }>(sessionRes)).sessionId;
    const zeroResults: PlanetResult[] = PLANET_ORDER.map((planet) => ({
      planet,
      score: 10,
      knowledge: 10,
      diagnosis: 10,
      decisions: [{ decisionId: `${planet}-x`, optionId: "c", kind: "knowledge", points: 0, ms: 100 }],
      completedAt: new Date().toISOString(),
    }));
    const res = await postJson("/api/reports", { sessionId: newSessionId, results: zeroResults });
    expect(res.status).toBe(201);
    const body = await readJson<{ report: Report }>(res);
    expect(body.report.result.overall).toBe(0);
    expect(body.report.result.title).toBe("Mầm Sao Đang Chờ");
    for (const planet of PLANET_ORDER) {
      expect(body.report.result.planets[planet]?.score).toBe(0);
    }
  });
});
