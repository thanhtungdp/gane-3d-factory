/** Hono app: middleware (request id, security headers, rate limit, body limit) + toàn bộ API + static/SPA. */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { getConnInfo } from "@hono/node-server/conninfo";
import { serveStatic } from "@hono/node-server/serve-static";
import QRCode from "qrcode";
import type { AppConfig } from "./config";
import type { Db, LeadRow } from "./db";
import {
  getLatestReportForSession,
  getReport,
  getReportRow,
  getSession,
  getSessionBrand,
  insertEvents,
  insertLead,
  insertReport,
  insertSession,
  leaderboardRank,
  listLeaderboard,
  listLeads,
  updateSessionProgress,
  upsertLeaderboardEntry,
} from "./db";
import type { AssetStore } from "./storage/assets";
import type { ScanCache } from "./crawl/cache";
import { scanBrand } from "./crawl";
import { CrawlError } from "./crawl/types";
import { neutralPreScan } from "./crawl/prescan";
import type { FetchLike } from "./crawl/fetch";
import type { Logger } from "./lib/log";
import {
  AppError,
  badRequest,
  errorResponse,
  firstZodMessage,
  forbidden,
  notFound,
  payloadTooLarge,
  toArrayBuffer,
  unauthorized,
} from "./lib/http";
import { AppError as AppErrorBase } from "./lib/errors";
import { hashIp, safeEqualStrings } from "./lib/hash";
import { newId, shortId } from "./lib/ids";
import { processToPng } from "./lib/images";
import { createRateLimit } from "./middleware/rate-limit";
import { generateInsights, type AiFetchLike } from "./ai/insights";
import { buildReport } from "./report/build";
import { loadPlanetContent } from "./report/content";
import { issuePdfToken, verifyPdfToken } from "./pdf/token";
import { renderReportPdf } from "./pdf/report";
import { enqueueLeadOutbox, flushOutbox, leadsToCsv, type CrmFetchLike } from "./crm/outbox";
import {
  createReportSchema,
  createSessionSchema,
  eventBatchSchema,
  leaderboardSubmitSchema,
  leadSchema,
  saveProgressSchema,
  scanRequestSchema,
} from "../src/shared/api";
import {
  CONSENT_VERSION,
  type LeaderboardEntry,
  type Report,
} from "../src/shared/types";

export interface AppEnv {
  Variables: {
    requestId: string;
    ip: string;
  };
}

export type App = Hono<AppEnv>;
type AppContext = Context<AppEnv>;

export interface AppDeps {
  config: AppConfig;
  db: Db;
  assets: AssetStore;
  scanCache: ScanCache;
  logger: Logger;
  fetchImpl?: FetchLike;
  aiFetchImpl?: AiFetchLike;
  crmFetchImpl?: CrmFetchLike;
  now?: () => number;
  enableStatic?: boolean;
}

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

function requestIp(c: AppContext, config: AppConfig): string {
  if (config.trustProxy) {
    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return forwarded;
  }
  try {
    const info = getConnInfo(c as never);
    const address = (info.remote as { address?: string }).address;
    if (address) return address;
  } catch {
    /* test app.request không có socket — fallback header */
  }
  return c.req.header("x-real-ip")?.trim() || "127.0.0.1";
}

function securityHeaders(c: AppContext): void {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  c.header("Cross-Origin-Opener-Policy", "same-origin");
  c.header("Cross-Origin-Resource-Policy", "same-origin");
  const contentType = c.res?.headers.get("Content-Type") ?? "";
  if (contentType.includes("text/html")) c.header("Content-Security-Policy", CSP);
}

async function readJson(c: AppContext): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw badRequest("BAD_JSON", "Dữ liệu gửi lên không phải JSON hợp lệ.");
  }
}

function parseWith<T>(
  schema: { safeParse: (input: unknown) => { success: true; data: T } | { success: false; error: { issues: { message: string; path: (string | number | symbol)[] }[] } } },
  value: unknown,
): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw badRequest("VALIDATION", firstZodMessage(parsed.error.issues), {
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  return parsed.data;
}

function toLeaderboardEntry(row: {
  id: string;
  alias: string;
  industry: string | null;
  score: number;
  title: string;
  created_at: string;
}): LeaderboardEntry {
  return {
    id: row.id,
    alias: row.alias,
    industry: row.industry ?? "",
    score: row.score,
    title: row.title,
    createdAt: row.created_at,
  };
}

export function createApp(deps: AppDeps): App {
  const { config, db, assets, scanCache, logger } = deps;
  const now = deps.now ?? (() => Date.now());
  const app = new Hono<AppEnv>();

  const scanLimit = createRateLimit({ scope: "scan", windowMs: config.limits.rateWindowMs, max: config.limits.scanPerWindow, now });
  const generalLimit = createRateLimit({ scope: "api", windowMs: config.limits.rateWindowMs, max: config.limits.generalPerWindow, now });
  const leadLimit = createRateLimit({ scope: "lead", windowMs: config.limits.rateWindowMs, max: config.limits.leadPerWindow, now });
  const eventLimit = createRateLimit({ scope: "events", windowMs: config.limits.rateWindowMs, max: config.limits.eventsPerWindow, now });
  const jsonLimit = bodyLimit({
    maxSize: config.limits.jsonBodyBytes,
    onError: (c) => errorResponse(c, payloadTooLarge()),
  });
  const uploadLimit = bodyLimit({
    maxSize: config.limits.uploadBodyBytes,
    onError: (c) => errorResponse(c, payloadTooLarge()),
  });

  // ── Middleware: request id + access log ───────────────────────────────
  app.use("*", async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    c.set("ip", requestIp(c, config));
    c.header("X-Request-Id", requestId);
    const started = performance.now();
    let status = 500;
    try {
      await next();
      status = c.res.status;
    } catch (err) {
      deps.logger.error("http.unhandled", {
        requestId,
        method: c.req.method,
        path: c.req.path,
        error: err instanceof Error ? err.name : "unknown",
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      });
      throw err;
    } finally {
      const fields = {
        requestId,
        method: c.req.method,
        path: c.req.path,
        status,
        durationMs: Math.round(performance.now() - started),
      };
      if (c.req.path.startsWith("/api/assets/")) deps.logger.debug("http.request", fields);
      else deps.logger.info("http.request", fields);
    }
  });

  // ── Middleware: security headers + cache mặc định ─────────────────────
  app.use("*", async (c, next) => {
    await next();
    securityHeaders(c);
    if (c.req.path.startsWith("/api/")) {
      if (!c.res.headers.get("Cache-Control")) c.header("Cache-Control", "no-store");
    }
  });

  // ── Health ────────────────────────────────────────────────────────────
  app.get("/api/health", (c) => {
    let dbOk = true;
    try {
      db.prepare("SELECT 1 AS ok").get();
    } catch {
      dbOk = false;
    }
    return c.json({
      ok: dbOk,
      version: "0.9.0",
      time: new Date(now()).toISOString(),
      uptime: Math.round(process.uptime()),
      env: config.nodeEnv,
      db: dbOk ? "ok" : "error",
      ai: Boolean(config.deepseek.apiKey),
      crm: Boolean(config.crm.webhookUrl),
    });
  });

  // ── Scan ──────────────────────────────────────────────────────────────
  app.post("/api/scan", jsonLimit, scanLimit, async (c) => {
    const input = parseWith(scanRequestSchema, await readJson(c));
    const result = await scanBrand(input, {
      config,
      cache: scanCache,
      assetStore: assets,
      logger,
      fetchImpl: deps.fetchImpl,
      now,
    });
    return c.json(result);
  });

  // ── Logo upload (multipart ≤2MB) ──────────────────────────────────────
  app.post("/api/logo", uploadLimit, generalLimit, async (c) => {
    let form: Record<string, unknown>;
    try {
      form = (await c.req.parseBody()) as Record<string, unknown>;
    } catch {
      throw badRequest("BAD_MULTIPART", "Không đọc được tệp tải lên.");
    }
    const file = form.logo;
    if (!(file instanceof File)) {
      throw badRequest("MISSING_FILE", "Cần gửi kèm tệp logo.");
    }
    if (file.size === 0 || file.size > config.limits.logoFileBytes) {
      throw payloadTooLarge("LOGO_TOO_LARGE", "Logo cần nhỏ hơn 2MB.");
    }
    const mime = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    const allowed =
      mime.startsWith("image/") || /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(name);
    if (!allowed) throw badRequest("UNSUPPORTED_IMAGE", "Chỉ nhận tệp ảnh PNG, JPG, WEBP hoặc SVG.");
    if (/\.ico$/i.test(name) || mime.includes("icon")) {
      throw badRequest("UNSUPPORTED_IMAGE", "Định dạng .ico chưa hỗ trợ — bạn gửi PNG hoặc SVG nhé.");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    let processed: Awaited<ReturnType<typeof processToPng>>;
    try {
      processed = await processToPng(buffer, { targetSize: 512, allowUpscale: true });
    } catch {
      throw badRequest("UNREADABLE_IMAGE", "Không đọc được ảnh logo. Bạn thử tệp PNG hoặc SVG khác nhé.");
    }
    const asset = await assets.savePng(processed.png);
    const minDim = Math.min(processed.width, processed.height);
    return c.json({
      id: asset.id,
      url: asset.url,
      width: processed.width,
      height: processed.height,
      source: "upload",
      quality: minDim >= 256 ? "high" : minDim >= 128 ? "medium" : "low",
    });
  });

  // ── Sessions ──────────────────────────────────────────────────────────
  app.post("/api/sessions", jsonLimit, generalLimit, async (c) => {
    const input = parseWith(createSessionSchema, await readJson(c));
    const sessionId = newId();
    const timestamp = new Date(now()).toISOString();
    insertSession(db, {
      id: sessionId,
      scanId: input.scanId,
      brand: input.brand,
      answers: input.answers,
      preScan: input.preScan ?? null,
      consentAccepted: input.consent.accepted,
      consentVersion: input.consent.version,
      ipHash: hashIp(c.get("ip"), config.ipHashSalt),
      now: timestamp,
    });
    return c.json({ sessionId }, 201);
  });

  app.patch("/api/sessions/:id", jsonLimit, generalLimit, async (c) => {
    const sessionId = c.req.param("id");
    if (!sessionId || sessionId.length > 80) throw notFound("SESSION_NOT_FOUND", "Phiên chơi không tồn tại.");
    const input = parseWith(saveProgressSchema, await readJson(c));
    const updated = updateSessionProgress(db, sessionId, input.progress, new Date(now()).toISOString());
    if (!updated) throw notFound("SESSION_NOT_FOUND", "Phiên chơi không tồn tại trên máy chủ.");
    return c.json({ ok: true });
  });

  // ── Reports ───────────────────────────────────────────────────────────
  app.post("/api/reports", jsonLimit, generalLimit, async (c) => {
    const input = parseWith(createReportSchema, await readJson(c));
    const session = getSession(db, input.sessionId);
    const sessionBrand = getSessionBrand(db, input.sessionId);
    if (!session || !sessionBrand) {
      throw notFound("SESSION_NOT_FOUND", "Phiên chơi không tồn tại hoặc đã hết hạn.");
    }
    const scan = await scanCache.getById(session.scan_id);
    const preScan =
      sessionBrand.preScan ??
      scan?.preScan ??
      neutralPreScan(["Phiên quét đã hết hạn — dùng dữ liệu pre-scan trung tính."]);
    const content = await loadPlanetContent();
    const reqLogger = logger.child({ requestId: c.get("requestId") });
    const report = await buildReport(
      {
        sessionId: input.sessionId,
        results: input.results,
        durationMs: input.durationMs,
        brand: sessionBrand.brand,
        answers: sessionBrand.answers,
        preScan,
        content,
        id: shortId("rp_"),
      },
      {
        newId: () => shortId("rp_"),
        now,
        generateInsights: async (insightsInput) => {
          const generated = await generateInsights(insightsInput, {
            config,
            logger: reqLogger,
            fetchImpl: deps.aiFetchImpl,
            now,
          });
          return { insights: generated.insights, source: generated.source };
        },
      },
    );
    const rank = leaderboardRank(db, report.brand.industry ?? null, report.result.overall);
    if (rank.total > 0) {
      report.industryRank = rank.rank;
      report.industryTotal = rank.total;
    }
    insertReport(db, {
      id: report.id,
      session_id: input.sessionId,
      report_json: JSON.stringify(report),
      score: report.result.overall,
      industry: report.brand.industry ?? null,
      created_at: report.createdAt,
    });
    return c.json({ report }, 201);
  });

  app.get("/api/reports/:id", generalLimit, (c) => {
    const reportId = c.req.param("id");
    if (!reportId || reportId.length > 80) throw notFound("REPORT_NOT_FOUND", "Báo cáo không tồn tại.");
    const report = getReport(db, reportId);
    if (!report) throw notFound("REPORT_NOT_FOUND", "Báo cáo không tồn tại.");
    return c.json({ report });
  });

  app.get("/api/reports/:id/pdf", generalLimit, async (c) => {
    const reportId = c.req.param("id");
    const token = c.req.query("token") ?? "";
    const verification = verifyPdfToken(token, config.pdfTokenSecret, now());
    if (!verification.ok) {
      throw forbidden("PDF_TOKEN_INVALID", "Liên kết PDF không hợp lệ hoặc đã hết hạn.");
    }
    if (verification.reportId !== reportId) {
      throw forbidden("PDF_TOKEN_INVALID", "Liên kết PDF không khớp báo cáo.");
    }
    const report = getReport(db, reportId);
    if (!report) throw notFound("REPORT_NOT_FOUND", "Báo cáo không tồn tại.");
    const reqLogger = logger.child({ requestId: c.get("requestId") });
    const pdf = await renderReportPdf({ report, config, assets, logger: reqLogger });
    c.header("Content-Type", "application/pdf");
    c.header("Content-Disposition", 'inline; filename="ban-do-thuong-hieu.pdf"');
    c.header("Cache-Control", "private, no-store");
    return c.body(toArrayBuffer(pdf), 200);
  });

  // ── Leads ─────────────────────────────────────────────────────────────
  app.post("/api/leads", jsonLimit, leadLimit, async (c) => {
    const input = parseWith(leadSchema, await readJson(c));
    const reportRow = getReportRow(db, input.reportId);
    if (!reportRow) throw notFound("REPORT_NOT_FOUND", "Báo cáo không tồn tại — bạn tạo lại báo cáo nhé.");
    if (reportRow.session_id !== input.sessionId) {
      throw badRequest("SESSION_MISMATCH", "Phiên chơi không khớp báo cáo.");
    }
    const timestamp = new Date(now()).toISOString();
    const leadId = newId();
    // Snapshot CRM/KPI từ report + session answers (không lưu thêm PII nào khác).
    const savedReport = getReport(db, input.reportId);
    const sessionBrand = getSessionBrand(db, input.sessionId);
    const primaryOffer = savedReport?.offers?.[0];
    const leadSnapshot = {
      status: "new",
      offerCode: primaryOffer?.code ?? null,
      offerName: primaryOffer?.name ?? null,
      overall: savedReport?.result.overall ?? reportRow.score ?? null,
      industry: savedReport?.brand.industry ?? reportRow.industry ?? null,
      companySize: sessionBrand?.answers.companySize ?? null,
      role: sessionBrand?.answers.role ?? null,
    };
    insertLead(db, {
      id: leadId,
      sessionId: input.sessionId,
      reportId: input.reportId,
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      isRepresentative: input.isRepresentative,
      consent: input.consent,
      consentVersion: CONSENT_VERSION,
      marketingOptIn: Boolean(input.marketingOptIn),
      website: null,
      ipHash: hashIp(c.get("ip"), config.ipHashSalt),
      userAgent: (c.req.header("user-agent") ?? "").slice(0, 200) || null,
      ...leadSnapshot,
      now: timestamp,
    });
    enqueueLeadOutbox(
      { db, config, logger, fetchImpl: deps.crmFetchImpl, now },
      {
        id: leadId,
        sessionId: input.sessionId,
        reportId: input.reportId,
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        isRepresentative: input.isRepresentative,
        consent: input.consent,
        consentVersion: CONSENT_VERSION,
        marketingOptIn: Boolean(input.marketingOptIn),
        website: null,
        ...leadSnapshot,
        createdAt: timestamp,
        source: "hanh-trinh-sao-kim",
      },
    );
    if (config.crm.webhookUrl && config.crm.webhookSecret) {
      void flushOutbox({ db, config, logger, fetchImpl: deps.crmFetchImpl, now }).catch(() => undefined);
    }
    const token = issuePdfToken(input.reportId, config.pdfTokenSecret, config.pdfTokenTtlMs, now());
    return c.json({
      ok: true,
      pdfUrl: `/api/reports/${encodeURIComponent(input.reportId)}/pdf?token=${encodeURIComponent(token)}`,
      offerUnlocked: true,
    });
  });

  // ── Leaderboard ───────────────────────────────────────────────────────
  app.get("/api/leaderboard", generalLimit, (c) => {
    const industry = (c.req.query("industry") ?? "").trim().slice(0, 80);
    const entries = listLeaderboard(db, industry || undefined, 20).map(toLeaderboardEntry);
    return c.json({ entries });
  });

  app.post("/api/leaderboard", jsonLimit, generalLimit, async (c) => {
    const input = parseWith(leaderboardSubmitSchema, await readJson(c));
    const session = getSession(db, input.sessionId);
    if (!session) throw notFound("SESSION_NOT_FOUND", "Phiên chơi không tồn tại.");
    const reportRow = getLatestReportForSession(db, input.sessionId);
    if (!reportRow) throw badRequest("REPORT_REQUIRED", "Bạn cần hoàn thành báo cáo trước khi vào bảng xếp hạng.");
    let title = "";
    try {
      title = (JSON.parse(reportRow.report_json) as Report).result.title;
    } catch {
      title = "";
    }
    const row = upsertLeaderboardEntry(db, {
      id: newId(),
      sessionId: input.sessionId,
      alias: input.anonymous ? "Ẩn danh" : input.alias,
      industry: (input.industry ?? reportRow.industry ?? "").trim().slice(0, 80) || null,
      score: reportRow.score,
      title: title || "Ngôi Sao Đang Lên",
      visible: input.visible,
      now: new Date(now()).toISOString(),
    });
    return c.json({ entry: toLeaderboardEntry(row) }, 201);
  });

  // ── Events ────────────────────────────────────────────────────────────
  app.post("/api/events", jsonLimit, eventLimit, async (c) => {
    const input = parseWith(eventBatchSchema, await readJson(c));
    insertEvents(
      db,
      input.events.map((event) => ({
        name: event.name,
        sessionId: event.sessionId,
        planet: event.planet,
        props: event.props,
        ts: event.ts,
      })),
      hashIp(c.get("ip"), config.ipHashSalt),
      new Date(now()).toISOString(),
    );
    return c.json({ ok: true });
  });

  // ── Assets (immutable) ────────────────────────────────────────────────
  app.get("/api/assets/:id", async (c) => {
    const id = c.req.param("id");
    const buffer = await assets.read(id);
    if (!buffer) throw notFound("ASSET_NOT_FOUND", "Không tìm thấy asset.");
    c.header("Content-Type", "image/png");
    c.header("Cache-Control", "public, max-age=31536000, immutable");
    c.header("ETag", `"${id}"`);
    return c.body(toArrayBuffer(buffer), 200);
  });

  // ── QR ────────────────────────────────────────────────────────────────
  app.get("/api/qr", generalLimit, async (c) => {
    const data = c.req.query("data") ?? "";
    if (!data.trim()) throw badRequest("MISSING_DATA", "Cần nội dung để tạo mã QR.");
    if (data.length > 500) throw badRequest("DATA_TOO_LONG", "Nội dung QR quá dài.");
    let buffer: Buffer;
    try {
      buffer = await QRCode.toBuffer(data, {
        type: "png",
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
      });
    } catch {
      throw badRequest("QR_FAILED", "Không tạo được mã QR.");
    }
    c.header("Content-Type", "image/png");
    c.header("Cache-Control", "public, max-age=86400");
    return c.body(toArrayBuffer(buffer), 200);
  });

  // ── Admin CSV ─────────────────────────────────────────────────────────
  app.get("/api/admin/leads.csv", generalLimit, (c) => {
    const token = c.req.query("token") ?? "";
    if (!token || !safeEqualStrings(token, config.adminToken)) {
      throw unauthorized("ADMIN_TOKEN_INVALID", "Token quản trị không hợp lệ.");
    }
    const leads: LeadRow[] = listLeads(db, 5000);
    const csv = `\uFEFF${leadsToCsv(leads)}`;
    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", 'attachment; filename="saokim-leads.csv"');
    c.header("Cache-Control", "no-store");
    return c.body(csv, 200);
  });

  // ── 404 API ───────────────────────────────────────────────────────────
  app.all("/api/*", (c) => c.json({ error: "NOT_FOUND", code: "NOT_FOUND", message: "Không tìm thấy endpoint." }, 404));

  // ── Static dist + SPA fallback (production) ───────────────────────────
  const serveDist = (deps.enableStatic ?? true) && config.serveDist;
  const distIndex = path.join(config.distDir, "index.html");
  if (serveDist && existsSync(distIndex)) {
    app.use("*", serveStatic({ root: config.distDir, precompressed: true }));
    app.get("*", async (c) => {
      if (c.req.path.startsWith("/api/")) return c.json({ error: "NOT_FOUND" }, 404);
      const accept = c.req.header("accept") ?? "";
      if (!accept.includes("text/html") && /\.\w{1,8}$/.test(c.req.path)) {
        return c.json({ error: "NOT_FOUND" }, 404);
      }
      const html = await readFile(distIndex, "utf8");
      c.header("Content-Type", "text/html; charset=utf-8");
      c.header("Cache-Control", "no-cache");
      return c.body(html, 200);
    });
  } else {
    app.get("/", (c) =>
      c.json({
        name: "Hành trình Sao Kim — API",
        health: "/api/health",
        hint: "Chạy `npm run build` rồi `NODE_ENV=production npx tsx server/index.ts` để phục vụ giao diện.",
      }),
    );
  }

  // ── Error handler ─────────────────────────────────────────────────────
  app.onError((err, c) => {
    securityHeaders(c);
    if (err instanceof AppErrorBase) return errorResponse(c, err);
    if (err instanceof CrawlError) {
      const status = err.code === "INVALID_URL" || err.code === "UNSUPPORTED_PROTOCOL" || err.code === "SSRF_BLOCKED" ? 400 : 502;
      return errorResponse(c, new AppErrorBase(status, err.code, err.message));
    }
    deps.logger.error("http.error", {
      requestId: c.get("requestId"),
      path: c.req.path,
      error: err instanceof Error ? err.name : "unknown",
      message: err instanceof Error ? err.message.slice(0, 300) : "unknown",
    });
    return errorResponse(c, new AppErrorBase(500, "INTERNAL", "Máy chủ gặp sự cố. Bạn thử lại nhé."));
  });

  return app;
}
