/** Entry point server: config → DB → cache → Hono app → listen 8788. */
import { serve } from "@hono/node-server";
import { initSchema, openDb } from "./db";
import { createApp } from "./app";
import { loadConfig } from "./config";
import { createLogger } from "./lib/log";
import { createAssetStore } from "./storage/assets";
import { createScanCache } from "./crawl/cache";
import { startOutboxWorker } from "./crm/outbox";

const config = loadConfig();
const logger = createLogger({
  level: config.nodeEnv === "development" ? "debug" : "info",
});

for (const warning of config.warnings) logger.warn("config.warning", { message: warning });

const db = openDb(config.dbPath);
initSchema(db);
const assets = createAssetStore(config.assetsDir);
const scanCache = createScanCache({
  dir: config.cacheDir,
  ttlMs: config.crawl.scanTtlMs,
  negativeTtlMs: config.crawl.negativeTtlMs,
});

const app = createApp({ config, db, assets, scanCache, logger });
const outboxWorker = startOutboxWorker({ db, config, logger });

const server = serve(
  { fetch: app.fetch, port: config.port, hostname: config.host },
  (info) => {
    logger.info("server.start", {
      host: config.host,
      port: info.port,
      env: config.nodeEnv,
      serveDist: config.serveDist,
      db: config.dbPath,
    });
    if (config.serveDist) {
      logger.info("server.static", { distDir: config.distDir });
    }
  },
);

let shuttingDown = false;
function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("server.shutdown", { signal });
  outboxWorker.stop();
  server.close(() => {
    try {
      db.close();
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("process.unhandled_rejection", {
    error: reason instanceof Error ? reason.name : "unknown",
    message: reason instanceof Error ? reason.message.slice(0, 200) : String(reason).slice(0, 200),
  });
});
