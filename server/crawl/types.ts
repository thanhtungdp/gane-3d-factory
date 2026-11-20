/** Lỗi crawl có mã — route quyết định fallback hay trả lỗi 4xx. */
export type CrawlErrorCode =
  | "INVALID_URL"
  | "SSRF_BLOCKED"
  | "UNSUPPORTED_PROTOCOL"
  | "REDIRECT_LIMIT"
  | "TIMEOUT"
  | "TOO_LARGE"
  | "HTTP_ERROR"
  | "ROBOTS_DISALLOWED"
  | "FETCH_FAILED"
  | "DNS_BLOCKED"
  | "PARSING_FAILED";

export class CrawlError extends Error {
  readonly code: CrawlErrorCode;

  constructor(code: CrawlErrorCode, message: string) {
    super(message);
    this.name = "CrawlError";
    this.code = code;
  }
}

/** Lỗi vẫn trả ScanResult fallback (để UI cho nhập tay) thay vì 4xx. */
const FALLBACK_CODES: ReadonlySet<CrawlErrorCode> = new Set<CrawlErrorCode>([
  "TIMEOUT",
  "TOO_LARGE",
  "HTTP_ERROR",
  "ROBOTS_DISALLOWED",
  "FETCH_FAILED",
  "REDIRECT_LIMIT",
  "DNS_BLOCKED",
  "PARSING_FAILED",
]);

export function isFallbackCrawlError(code: CrawlErrorCode): boolean {
  return FALLBACK_CODES.has(code);
}
