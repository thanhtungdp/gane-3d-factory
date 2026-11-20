/** robots.txt: disallow → route trả fallback, không crawl. Lỗi mạng thì coi như cho phép. */
import robotsParser from "robots-parser";
import { safeFetch, type FetchLike } from "./fetch";
import { CrawlError } from "./types";

export interface RobotsOptions {
  fetchImpl?: FetchLike;
  userAgent: string;
  timeoutMs?: number;
}

export interface RobotsDecision {
  allowed: boolean;
  reason: "allowed" | "disallowed" | "unavailable";
  robotsUrl: string;
}

export async function checkRobots(pageUrl: string, options: RobotsOptions): Promise<RobotsDecision> {
  const url = new URL(pageUrl);
  const robotsUrl = `${url.origin}/robots.txt`;
  let text: string;
  try {
    const res = await safeFetch(robotsUrl, {
      timeoutMs: options.timeoutMs ?? 5_000,
      maxBytes: 512 * 1024,
      fetchImpl: options.fetchImpl,
      userAgent: options.userAgent,
      maxRedirects: 2,
      headers: { Accept: "text/plain,*/*;q=0.5" },
    });
    if (res.status >= 400) return { allowed: true, reason: "unavailable", robotsUrl };
    text = res.body.toString("utf8");
  } catch (err) {
    if (err instanceof CrawlError && (err.code === "SSRF_BLOCKED" || err.code === "UNSUPPORTED_PROTOCOL")) throw err;
    return { allowed: true, reason: "unavailable", robotsUrl };
  }

  try {
    const parser = robotsParser(robotsUrl, text);
    const allowed = parser.isAllowed(pageUrl, options.userAgent);
    return { allowed: allowed !== false, reason: allowed === false ? "disallowed" : "allowed", robotsUrl };
  } catch {
    return { allowed: true, reason: "unavailable", robotsUrl };
  }
}
