/** Cache scan 24h (memory + .data/cache) và negative cache 10 phút. Không lưu nội dung trang. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ScanResult } from "../../src/shared/types";
import { sha256Hex } from "../lib/ids";

export interface NegativeScanEntry {
  code: string;
  message: string;
  warning: string;
}

export interface ScanCacheOptions {
  dir?: string;
  ttlMs?: number;
  negativeTtlMs?: number;
  now?: () => number;
}

export interface ScanCache {
  get(urlKey: string): Promise<ScanResult | null>;
  set(urlKey: string, result: ScanResult): Promise<void>;
  getNegative(urlKey: string): Promise<NegativeScanEntry | null>;
  setNegative(urlKey: string, entry: NegativeScanEntry): Promise<void>;
  saveById(scanId: string, result: ScanResult): Promise<void>;
  getById(scanId: string): Promise<ScanResult | null>;
}

interface CacheEnvelope {
  v: 1;
  kind: "scan" | "negative" | "byId";
  expiresAt: number;
  scan?: ScanResult;
  negative?: NegativeScanEntry;
}

function fileSlug(prefix: string, key: string): string {
  return `${prefix}-${sha256Hex(key).slice(0, 32)}.json`;
}

/** Chuẩn hoá key cache: host + path (bỏ dấu / cuối, tracking param, hash). */
export function scanCacheKey(rawUrl: string): string {
  const url = new URL(rawUrl);
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key);
  }
  const params = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const pathname = url.pathname.replace(/\/+$/, "");
  return `${url.host.toLowerCase()}${pathname}${params ? `?${params}` : ""}`;
}

export function createScanCache(options: ScanCacheOptions = {}): ScanCache {
  const ttlMs = options.ttlMs ?? 24 * 60 * 60 * 1000;
  const negativeTtlMs = options.negativeTtlMs ?? 10 * 60 * 1000;
  const now = options.now ?? (() => Date.now());
  const dir = options.dir;
  const memory = new Map<string, CacheEnvelope>();

  const filePath = (key: string, kind: "scan" | "negative" | "byId"): string | null =>
    dir ? path.join(dir, fileSlug(kind === "byId" ? "id" : kind, key)) : null;

  async function readEnvelope(key: string, kind: "scan" | "negative" | "byId"): Promise<CacheEnvelope | null> {
    const memoryKey = `${kind}:${key}`;
    const inMemory = memory.get(memoryKey);
    if (inMemory && inMemory.expiresAt > now()) return inMemory;
    if (inMemory) memory.delete(memoryKey);
    const file = filePath(key, kind);
    if (!file) return null;
    try {
      const raw = await readFile(file, "utf8");
      const envelope = JSON.parse(raw) as CacheEnvelope;
      if (envelope.v !== 1 || envelope.kind !== kind || envelope.expiresAt <= now()) return null;
      memory.set(memoryKey, envelope);
      return envelope;
    } catch {
      return null;
    }
  }

  async function writeEnvelope(key: string, kind: "scan" | "negative" | "byId", envelope: CacheEnvelope): Promise<void> {
    memory.set(`${kind}:${key}`, envelope);
    const file = filePath(key, kind);
    if (!file) return;
    try {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(envelope));
    } catch {
      /* cache là best-effort, không làm hỏng request */
    }
  }

  return {
    async get(urlKey) {
      const envelope = await readEnvelope(urlKey, "scan");
      if (!envelope?.scan) return null;
      return { ...envelope.scan, cached: true };
    },
    async set(urlKey, result) {
      await writeEnvelope(urlKey, "scan", {
        v: 1,
        kind: "scan",
        expiresAt: now() + ttlMs,
        scan: { ...result, cached: false },
      });
    },
    async getNegative(urlKey) {
      const envelope = await readEnvelope(urlKey, "negative");
      return envelope?.negative ?? null;
    },
    async setNegative(urlKey, entry) {
      await writeEnvelope(urlKey, "negative", {
        v: 1,
        kind: "negative",
        expiresAt: now() + negativeTtlMs,
        negative: entry,
      });
    },
    async saveById(scanId, result) {
      await writeEnvelope(scanId, "byId", {
        v: 1,
        kind: "byId",
        expiresAt: now() + ttlMs,
        scan: { ...result, cached: false },
      });
    },
    async getById(scanId) {
      const envelope = await readEnvelope(scanId, "byId");
      return envelope?.scan ?? null;
    },
  };
}
