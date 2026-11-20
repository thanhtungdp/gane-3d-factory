/** Parse env một lần, có default an toàn cho dev. Không log secret. */
import path from "node:path";

export interface DeepSeekConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface CrmConfig {
  webhookUrl: string;
  webhookSecret: string;
  timeoutMs: number;
  maxAttempts: number;
}

export interface AppConfig {
  nodeEnv: "development" | "production" | "test";
  isProduction: boolean;
  host: string;
  port: number;
  publicOrigin: string;
  bookingUrl: string;
  dataDir: string;
  distDir: string;
  assetsDir: string;
  cacheDir: string;
  dbPath: string;
  fontsDir: string;
  ipHashSalt: string;
  trustProxy: boolean;
  adminToken: string;
  pdfTokenSecret: string;
  pdfTokenTtlMs: number;
  deepseek: DeepSeekConfig;
  crm: CrmConfig;
  serveDist: boolean;
  crawl: {
    timeoutMs: number;
    maxHtmlBytes: number;
    maxCssBytes: number;
    maxImageBytes: number;
    maxRedirects: number;
    maxCssFiles: number;
    maxLogoCandidates: number;
    userAgent: string;
    scanTtlMs: number;
    negativeTtlMs: number;
  };
  limits: {
    jsonBodyBytes: number;
    uploadBodyBytes: number;
    logoFileBytes: number;
    rateWindowMs: number;
    scanPerWindow: number;
    generalPerWindow: number;
    leadPerWindow: number;
    eventsPerWindow: number;
  };
  warnings: string[];
}

const DEFAULT_ADMIN_TOKEN = "doi-token-admin-o-production";
const DEFAULT_IP_SALT = "doi-salt-nay-o-production";
const DEFAULT_UA = "SaoKimBrandScanner/1.0";
const MAX_2MB = 2 * 1024 * 1024;

function parseIntEnv(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

function boolEnv(raw: string | undefined, fallback = false): boolean {
  if (raw === undefined || raw.trim() === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

/**
 * Đọc env. Test có thể truyền env riêng + cwd riêng để không đụng .data thật.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env, cwd = process.cwd()): AppConfig {
  const nodeEnvRaw = (env.NODE_ENV ?? "development").trim();
  const nodeEnv: AppConfig["nodeEnv"] =
    nodeEnvRaw === "production" ? "production" : nodeEnvRaw === "test" ? "test" : "development";
  const isProduction = nodeEnv === "production";

  const dataDir = path.resolve(cwd, env.DATA_DIR?.trim() || ".data");
  const distDir = path.resolve(cwd, env.DIST_DIR?.trim() || "dist");
  const fontsDir = path.resolve(cwd, "server/assets/fonts");

  const ipHashSalt = env.IP_HASH_SALT?.trim() || DEFAULT_IP_SALT;
  const adminToken = env.ADMIN_TOKEN?.trim() || DEFAULT_ADMIN_TOKEN;
  const pdfTokenSecret = env.PDF_TOKEN_SECRET?.trim() || ipHashSalt;

  const warnings: string[] = [];
  if (isProduction && ipHashSalt === DEFAULT_IP_SALT) {
    warnings.push("IP_HASH_SALT đang dùng giá trị mẫu — đổi trước khi production.");
  }
  if (isProduction && adminToken === DEFAULT_ADMIN_TOKEN) {
    warnings.push("ADMIN_TOKEN đang dùng giá trị mẫu — đổi trước khi production.");
  }
  if (isProduction && pdfTokenSecret === ipHashSalt) {
    warnings.push("PDF_TOKEN_SECRET chưa đặt — đang dùng chung IP_HASH_SALT.");
  }

  const publicOrigin = trimTrailingSlashes(env.PUBLIC_ORIGIN?.trim() || "http://127.0.0.1:5173");

  return {
    nodeEnv,
    isProduction,
    host: env.HOST?.trim() || "127.0.0.1",
    port: parseIntEnv(env.PORT, 8788, 1, 65_535),
    publicOrigin,
    bookingUrl: env.BOOKING_URL?.trim() || "",
    dataDir,
    distDir,
    assetsDir: path.join(dataDir, "assets"),
    cacheDir: path.join(dataDir, "cache"),
    dbPath: path.join(dataDir, "app.db"),
    fontsDir,
    ipHashSalt,
    trustProxy: boolEnv(env.TRUST_PROXY, false),
    adminToken,
    pdfTokenSecret,
    pdfTokenTtlMs: parseIntEnv(env.PDF_TOKEN_TTL_MS, 7 * 24 * 60 * 60 * 1000, 60_000, 90 * 24 * 60 * 60 * 1000),
    deepseek: {
      apiKey: env.DEEPSEEK_API_KEY?.trim() || "",
      model: env.DEEPSEEK_MODEL?.trim() || "deepseek-flash",
      baseUrl: trimTrailingSlashes(env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com"),
    },
    crm: {
      webhookUrl: env.CRM_WEBHOOK_URL?.trim() || "",
      webhookSecret: env.CRM_WEBHOOK_SECRET?.trim() || "",
      timeoutMs: parseIntEnv(env.CRM_WEBHOOK_TIMEOUT_MS, 5_000, 500, 30_000),
      maxAttempts: parseIntEnv(env.CRM_MAX_ATTEMPTS, 5, 1, 10),
    },
    serveDist: isProduction || boolEnv(env.SERVE_STATIC, false),
    crawl: {
      timeoutMs: parseIntEnv(env.CRAWL_TIMEOUT_MS, 8_000, 1_000, 30_000),
      maxHtmlBytes: parseIntEnv(env.CRAWL_MAX_HTML_BYTES, MAX_2MB, 64 * 1024, 8 * MAX_2MB),
      maxCssBytes: 300 * 1024,
      maxImageBytes: Math.floor(1.5 * MAX_2MB),
      maxRedirects: 3,
      maxCssFiles: 3,
      maxLogoCandidates: 6,
      userAgent: DEFAULT_UA,
      scanTtlMs: 24 * 60 * 60 * 1000,
      negativeTtlMs: 10 * 60 * 1000,
    },
    limits: {
      jsonBodyBytes: 3_500_000,
      uploadBodyBytes: 2_500_000,
      logoFileBytes: 2 * 1024 * 1024,
      rateWindowMs: 60_000,
      scanPerWindow: 10,
      generalPerWindow: 240,
      leadPerWindow: 10,
      eventsPerWindow: 120,
    },
    warnings,
  };
}
