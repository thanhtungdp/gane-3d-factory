/** SQLite (node:sqlite) — schema tự khởi tạo khi start. IP chỉ lưu hash + salt. */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { BrandProfile, PreScan, ProfileAnswers, Report } from "../../src/shared/types";

export type Db = DatabaseSync;

export interface SessionRow {
  id: string;
  scan_id: string;
  brand_json: string;
  answers_json: string;
  pre_scan_json: string | null;
  consent_accepted: number;
  consent_version: string | null;
  progress_json: string | null;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  session_id: string;
  report_json: string;
  score: number;
  industry: string | null;
  created_at: string;
}

export interface LeadRow {
  id: string;
  session_id: string;
  report_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_representative: number;
  consent: number;
  consent_version: string | null;
  marketing_opt_in: number;
  website: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  /** Trạng thái chăm sóc CRM: new → contacted → qualified → won/lost. */
  status: string;
  offer_code: string | null;
  offer_name: string | null;
  overall: number | null;
  industry: string | null;
  company_size: string | null;
  role: string | null;
  created_at: string;
}

export interface LeaderboardRow {
  id: string;
  session_id: string;
  alias: string;
  industry: string | null;
  score: number;
  title: string;
  visible: number;
  created_at: string;
}

export interface OutboxRow {
  id: string;
  type: string;
  payload_json: string;
  status: "pending" | "sent" | "dead";
  attempts: number;
  next_attempt_at: string;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRecord {
  id: string;
  scanId: string;
  brand: unknown;
  answers: ProfileAnswers;
  preScan: unknown | null;
  consentAccepted: boolean;
  consentVersion: string | null;
  ipHash: string | null;
  now: string;
}

export interface CreateLeadRecord {
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
  ipHash: string | null;
  userAgent: string | null;
  /** Snapshot từ report + session để đo CRM/KPI (không cần join lúc export). */
  status: string;
  offerCode: string | null;
  offerName: string | null;
  overall: number | null;
  industry: string | null;
  companySize: string | null;
  role: string | null;
  now: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  brand_json TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  pre_scan_json TEXT,
  consent_accepted INTEGER NOT NULL DEFAULT 0,
  consent_version TEXT,
  progress_json TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  report_json TEXT NOT NULL,
  score REAL NOT NULL,
  industry TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_session ON reports(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_industry_score ON reports(industry, score DESC);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  report_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_representative INTEGER NOT NULL DEFAULT 0,
  consent INTEGER NOT NULL DEFAULT 0,
  consent_version TEXT,
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  website TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  offer_code TEXT,
  offer_name TEXT,
  overall REAL,
  industry TEXT,
  company_size TEXT,
  role TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_report ON leads(report_id);
CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  session_id TEXT,
  planet TEXT,
  props_json TEXT,
  ip_hash TEXT,
  ts TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

CREATE TABLE IF NOT EXISTS leaderboard (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  industry TEXT,
  score REAL NOT NULL,
  title TEXT NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_session ON leaderboard(session_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(visible, score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_industry ON leaderboard(industry, visible, score DESC);

CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_outbox_due ON outbox(status, next_attempt_at);
`;

export interface OpenDbOptions {
  /** WAL tốt cho file thật; memory thì bỏ qua. */
  wal?: boolean;
}

export function openDb(filePath: string, options: OpenDbOptions = {}): Db {
  if (filePath !== ":memory:") {
    mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const db = new DatabaseSync(filePath);
  db.exec("PRAGMA foreign_keys = ON;");
  if (options.wal !== false && filePath !== ":memory:") {
    try {
      db.exec("PRAGMA journal_mode = WAL;");
    } catch {
      /* một số FS không hỗ trợ WAL — vẫn chạy được */
    }
  }
  db.exec("PRAGMA busy_timeout = 3000;");
  initSchema(db);
  return db;
}

export function initSchema(db: Db): void {
  db.exec(SCHEMA);
  migrateLeadColumns(db);
  migrateSessionColumns(db);
}

/** Migration idempotent: thêm cột KPI cho bảng leads cũ mà không mất dữ liệu. */
function migrateLeadColumns(db: Db): void {
  const existing = new Set(
    (db.prepare("PRAGMA table_info(leads)").all() as { name: string }[]).map((row) => row.name),
  );
  const additions: [string, string][] = [
    ["status", "TEXT NOT NULL DEFAULT 'new'"],
    ["offer_code", "TEXT"],
    ["offer_name", "TEXT"],
    ["overall", "REAL"],
    ["industry", "TEXT"],
    ["company_size", "TEXT"],
    ["role", "TEXT"],
  ];
  for (const [column, ddl] of additions) {
    if (existing.has(column)) continue;
    db.exec(`ALTER TABLE leads ADD COLUMN ${column} ${ddl}`);
  }
  db.exec("CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at DESC);");
}

/** Migration idempotent: lưu snapshot pre-scan để báo cáo không mất bằng chứng khi cache hết hạn. */
function migrateSessionColumns(db: Db): void {
  const existing = new Set(
    (db.prepare("PRAGMA table_info(sessions)").all() as { name: string }[]).map((row) => row.name),
  );
  if (!existing.has("pre_scan_json")) {
    db.exec("ALTER TABLE sessions ADD COLUMN pre_scan_json TEXT");
  }
}

function one<T>(value: unknown): T | null {
  return (value as T | undefined) ?? null;
}

function parseJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function insertSession(db: Db, record: CreateSessionRecord): void {
  db.prepare(
    `INSERT INTO sessions (id, scan_id, brand_json, answers_json, pre_scan_json, consent_accepted, consent_version, progress_json, ip_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
  ).run(
    record.id,
    record.scanId,
    JSON.stringify(record.brand),
    JSON.stringify(record.answers),
    record.preScan ? JSON.stringify(record.preScan) : null,
    record.consentAccepted ? 1 : 0,
    record.consentVersion,
    record.ipHash,
    record.now,
    record.now,
  );
}

export function getSession(db: Db, id: string): SessionRow | null {
  return one<SessionRow>(db.prepare("SELECT * FROM sessions WHERE id = ?").get(id));
}

export function getSessionBrand(
  db: Db,
  id: string,
): { brand: BrandProfile; answers: ProfileAnswers; preScan: PreScan | null } | null {
  const row = getSession(db, id);
  if (!row) return null;
  const brand = parseJson<BrandProfile>(row.brand_json);
  const answers = parseJson<ProfileAnswers>(row.answers_json);
  if (!brand || !answers) return null;
  return { brand, answers, preScan: parseJson<PreScan>(row.pre_scan_json) };
}

export function updateSessionProgress(db: Db, id: string, progress: unknown, now: string): boolean {
  const res = db
    .prepare("UPDATE sessions SET progress_json = ?, updated_at = ? WHERE id = ?")
    .run(JSON.stringify(progress ?? null), now, id);
  return Number(res.changes) > 0;
}

export function insertReport(db: Db, row: ReportRow): void {
  db.prepare(
    `INSERT INTO reports (id, session_id, report_json, score, industry, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(row.id, row.session_id, row.report_json, row.score, row.industry, row.created_at);
}

export function getReportRow(db: Db, id: string): ReportRow | null {
  return one<ReportRow>(db.prepare("SELECT * FROM reports WHERE id = ?").get(id));
}

export function getReport(db: Db, id: string): Report | null {
  const row = getReportRow(db, id);
  if (!row) return null;
  return parseJson<Report>(row.report_json);
}

export function getLatestReportForSession(db: Db, sessionId: string): ReportRow | null {
  return one<ReportRow>(
    db.prepare("SELECT * FROM reports WHERE session_id = ? ORDER BY created_at DESC LIMIT 1").get(sessionId),
  );
}

export function insertLead(db: Db, record: CreateLeadRecord): void {
  db.prepare(
    `INSERT INTO leads (id, session_id, report_id, name, phone, email, is_representative, consent, consent_version, marketing_opt_in, website, ip_hash, user_agent, status, offer_code, offer_name, overall, industry, company_size, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    record.id,
    record.sessionId,
    record.reportId,
    record.name,
    record.phone,
    record.email,
    record.isRepresentative ? 1 : 0,
    record.consent ? 1 : 0,
    record.consentVersion,
    record.marketingOptIn ? 1 : 0,
    record.website,
    record.ipHash,
    record.userAgent,
    record.status,
    record.offerCode,
    record.offerName,
    record.overall,
    record.industry,
    record.companySize,
    record.role,
    record.now,
  );
}

export function listLeads(db: Db, limit = 5000): LeadRow[] {
  return db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT ?").all(limit) as unknown as LeadRow[];
}

export function insertEvents(
  db: Db,
  events: { name: string; sessionId?: string; planet?: string; props?: unknown; ts?: string }[],
  ipHash: string | null,
  now: string,
): number {
  const stmt = db.prepare(
    "INSERT INTO events (name, session_id, planet, props_json, ip_hash, ts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  db.exec("BEGIN");
  try {
    for (const e of events) {
      stmt.run(e.name, e.sessionId ?? null, e.planet ?? null, e.props ? JSON.stringify(e.props) : null, ipHash, e.ts ?? now, now);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return events.length;
}

export function upsertLeaderboardEntry(
  db: Db,
  entry: { id: string; sessionId: string; alias: string; industry: string | null; score: number; title: string; visible: boolean; now: string },
): LeaderboardRow {
  db.prepare(
    `INSERT INTO leaderboard (id, session_id, alias, industry, score, title, visible, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       alias = excluded.alias,
       industry = excluded.industry,
       score = excluded.score,
       title = excluded.title,
       visible = excluded.visible`,
  ).run(
    entry.id,
    entry.sessionId,
    entry.alias,
    entry.industry,
    entry.score,
    entry.title,
    entry.visible ? 1 : 0,
    entry.now,
  );
  return one<LeaderboardRow>(db.prepare("SELECT * FROM leaderboard WHERE session_id = ?").get(entry.sessionId))!;
}

export function listLeaderboard(db: Db, industry: string | undefined, limit = 20): LeaderboardRow[] {
  if (industry) {
    return db
      .prepare(
        "SELECT * FROM leaderboard WHERE visible = 1 AND industry = ? ORDER BY score DESC, created_at ASC LIMIT ?",
      )
      .all(industry, limit) as unknown as LeaderboardRow[];
  }
  return db
    .prepare("SELECT * FROM leaderboard WHERE visible = 1 ORDER BY score DESC, created_at ASC LIMIT ?")
    .all(limit) as unknown as LeaderboardRow[];
}

export function leaderboardRank(db: Db, industry: string | null, score: number): { rank: number; total: number } {
  const totalRow = industry
    ? (db
        .prepare("SELECT COUNT(*) AS n FROM leaderboard WHERE visible = 1 AND industry = ?")
        .get(industry) as { n: number })
    : (db.prepare("SELECT COUNT(*) AS n FROM leaderboard WHERE visible = 1").get() as { n: number });
  const aheadRow = industry
    ? (db
        .prepare("SELECT COUNT(*) AS n FROM leaderboard WHERE visible = 1 AND industry = ? AND score > ?")
        .get(industry, score) as { n: number })
    : (db.prepare("SELECT COUNT(*) AS n FROM leaderboard WHERE visible = 1 AND score > ?").get(score) as { n: number });
  return { rank: Number(aheadRow.n) + 1, total: Number(totalRow.n) };
}

export function insertOutbox(
  db: Db,
  row: { id: string; type: string; payload: unknown; now: string; nextAttemptAt: string },
): void {
  db.prepare(
    `INSERT INTO outbox (id, type, payload_json, status, attempts, next_attempt_at, last_error, created_at, updated_at)
     VALUES (?, ?, ?, 'pending', 0, ?, NULL, ?, ?)`,
  ).run(row.id, row.type, JSON.stringify(row.payload), row.nextAttemptAt, row.now, row.now);
}

export function dueOutbox(db: Db, now: string, limit = 20): OutboxRow[] {
  return db
    .prepare("SELECT * FROM outbox WHERE status = 'pending' AND next_attempt_at <= ? ORDER BY next_attempt_at ASC LIMIT ?")
    .all(now, limit) as unknown as OutboxRow[];
}

export function markOutboxSent(db: Db, id: string, now: string): void {
  db.prepare("UPDATE outbox SET status = 'sent', updated_at = ?, last_error = NULL WHERE id = ?").run(now, id);
}

export function markOutboxRetry(
  db: Db,
  id: string,
  attempts: number,
  nextAttemptAt: string,
  status: "pending" | "dead",
  lastError: string,
  now: string,
): void {
  db.prepare(
    "UPDATE outbox SET attempts = ?, next_attempt_at = ?, status = ?, last_error = ?, updated_at = ? WHERE id = ?",
  ).run(attempts, nextAttemptAt, status, lastError.slice(0, 500), now, id);
}

export function countOutbox(db: Db, status: "pending" | "sent" | "dead"): number {
  const row = db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE status = ?").get(status) as { n: number };
  return Number(row.n);
}

export function closeDb(db: Db): void {
  try {
    db.close();
  } catch {
    /* ignore */
  }
}
