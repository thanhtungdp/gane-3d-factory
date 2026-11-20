/** Rate limit in-memory (sliding window theo IP + scope). Không cần Redis cho demo. */
import type { MiddlewareHandler } from "hono";
import { tooManyRequests } from "../lib/errors";

export interface RateLimitOptions {
  scope: string;
  windowMs: number;
  max: number;
  now?: () => number;
  /** Lấy key (mặc định IP đã lưu trong context). */
  keyOf?: (c: Parameters<MiddlewareHandler>[0]) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimit(options: RateLimitOptions): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();
  const now = options.now ?? (() => Date.now());
  const maxEntries = 20_000;

  const cleanup = (current: number) => {
    if (buckets.size < maxEntries) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= current) buckets.delete(key);
    }
    if (buckets.size > maxEntries) buckets.clear();
  };

  return async (c, next) => {
    const current = now();
    cleanup(current);
    const ip = (c.get("ip") as string | undefined) ?? "unknown";
    const key = `${options.scope}:${ip}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= current) {
      bucket = { count: 0, resetAt: current + options.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, options.max - bucket.count);
    const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - current) / 1000));
    c.header("X-RateLimit-Limit", String(options.max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(resetSeconds));
    if (bucket.count > options.max) {
      c.header("Retry-After", String(Math.max(1, resetSeconds)));
      throw tooManyRequests();
    }
    await next();
  };
}
