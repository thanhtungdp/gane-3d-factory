/**
 * Fetch an toàn: timeout, giới hạn byte, redirect thủ công (tối đa 3 hop, kiểm SSRF lại từng hop),
 * decode charset bằng iconv-lite. Test inject `fetchImpl` để không gọi mạng.
 */
import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import iconv from "iconv-lite";
import { guardedLookup, validatePublicUrl } from "./ssrf";
import { CrawlError } from "./types";

export interface RawResponse {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
  url: string;
}

export interface FetchInit {
  timeoutMs: number;
  maxBytes: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type FetchLike = (url: string, init: FetchInit) => Promise<RawResponse>;

export interface SafeFetchOptions {
  timeoutMs: number;
  maxBytes: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  fetchImpl?: FetchLike;
  userAgent: string;
}

export interface SafeFetchResult extends RawResponse {
  finalUrl: string;
  contentType: string;
  charset: string;
}

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

function flattenHeaders(raw: http.IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    out[key.toLowerCase()] = Array.isArray(value) ? value.join(", ") : value;
  }
  return out;
}

function decodeContentEncoding(body: Buffer, headers: Record<string, string>, maxBytes: number): Buffer {
  const encoding = (headers["content-encoding"] ?? "").toLowerCase().trim();
  let decoded = body;
  try {
    if (encoding.includes("br")) decoded = zlib.brotliDecompressSync(body);
    else if (encoding.includes("gzip")) decoded = zlib.gunzipSync(body);
    else if (encoding.includes("deflate")) decoded = zlib.inflateSync(body);
  } catch {
    return body;
  }
  if (decoded.byteLength > maxBytes) throw new CrawlError("TOO_LARGE", "Nội dung website vượt giới hạn cho phép.");
  return decoded;
}

/** Fetch mặc định dùng node:http(s) + lookup chặn IP nội bộ. Không tự follow redirect. */
export const defaultFetch: FetchLike = (rawUrl, init) =>
  new Promise<RawResponse>((resolve, reject) => {
    let url: URL;
    try {
      url = validatePublicUrl(rawUrl);
    } catch (err) {
      reject(err);
      return;
    }
    const isHttps = url.protocol === "https:";
    const headers: Record<string, string> = {
      "Accept-Encoding": "identity",
      ...init.headers,
    };
    let settled = false;
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };
    const done = (res: RawResponse) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(res);
    };

    const req = (isHttps ? https : http).request(
      url,
      { method: "GET", headers, lookup: guardedLookup, agent: false },
      (res) => {
        const status = res.statusCode ?? 0;
        const resHeaders = flattenHeaders(res.headers);
        const declared = Number(resHeaders["content-length"] ?? "0");
        if (Number.isFinite(declared) && declared > init.maxBytes) {
          res.destroy();
          fail(new CrawlError("TOO_LARGE", "Nội dung website vượt giới hạn cho phép."));
          return;
        }
        const chunks: Buffer[] = [];
        let total = 0;
        res.on("data", (chunk: Buffer) => {
          total += chunk.byteLength;
          if (total > init.maxBytes) {
            res.destroy();
            fail(new CrawlError("TOO_LARGE", "Nội dung website vượt giới hạn cho phép."));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          try {
            const body = decodeContentEncoding(Buffer.concat(chunks), resHeaders, init.maxBytes);
            done({ status, headers: resHeaders, body, url: url.href });
          } catch (err) {
            fail(err instanceof Error ? err : new CrawlError("FETCH_FAILED", "Không tải được nội dung."));
          }
        });
        res.on("error", () => fail(new CrawlError("FETCH_FAILED", "Kết nối bị ngắt khi tải nội dung.")));
      },
    );

    const timer = setTimeout(() => {
      req.destroy();
      fail(new CrawlError("TIMEOUT", "Website phản hồi quá lâu."));
    }, init.timeoutMs);

    const onAbort = () => {
      req.destroy();
      fail(new CrawlError("TIMEOUT", "Yêu cầu đã bị huỷ."));
    };
    init.signal?.addEventListener("abort", onAbort, { once: true });

    const cleanup = () => {
      clearTimeout(timer);
      init.signal?.removeEventListener("abort", onAbort);
    };

    req.on("error", (err) => {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "DNS_BLOCKED") {
        fail(new CrawlError("DNS_BLOCKED", "Tên miền trỏ vào mạng nội bộ."));
      } else if (code === "ETIMEDOUT" || err.name === "AbortError") {
        fail(new CrawlError("TIMEOUT", "Website phản hồi quá lâu."));
      } else {
        fail(new CrawlError("FETCH_FAILED", "Không kết nối được website."));
      }
    });
    req.end();
  });

export function detectCharset(body: Buffer, contentTypeHeader: string): string {
  const fromHeader = /charset\s*=\s*["']?([\w-]+)/i.exec(contentTypeHeader);
  if (fromHeader?.[1]) return normalizeCharset(fromHeader[1]);
  const head = body.subarray(0, 4096).toString("latin1");
  const metaCharset = /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(head);
  if (metaCharset?.[1]) return normalizeCharset(metaCharset[1]);
  const httpEquiv = /<meta[^>]+content\s*=\s*["'][^"']*charset=([\w-]+)/i.exec(head);
  if (httpEquiv?.[1]) return normalizeCharset(httpEquiv[1]);
  return "utf-8";
}

function normalizeCharset(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (value === "utf8" || value === "unicode-1-1-utf-8") return "utf-8";
  if (iconv.encodingExists(value)) return value;
  return "utf-8";
}

export function decodeText(body: Buffer, charset: string): string {
  try {
    const text = iconv.decode(body, charset);
    return text.replace(/^\uFEFF/, "");
  } catch {
    return body.toString("utf8");
  }
}

/** Fetch 1 URL với redirect thủ công + kiểm SSRF từng hop. Trả buffer đã giới hạn byte. */
export async function safeFetch(rawUrl: string, options: SafeFetchOptions): Promise<SafeFetchResult> {
  const fetchImpl = options.fetchImpl ?? defaultFetch;
  const maxRedirects = options.maxRedirects ?? 3;
  let current = validatePublicUrl(rawUrl);

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const response = await fetchImpl(current.href, {
      timeoutMs: options.timeoutMs,
      maxBytes: options.maxBytes,
      signal: options.signal,
      headers: {
        "User-Agent": options.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/*;q=0.8,*/*;q=0.5",
        "Accept-Language": "vi,en;q=0.8",
        ...options.headers,
      },
    });

    if (REDIRECT_STATUS.has(response.status)) {
      const location = response.headers.location ?? response.headers.Location;
      if (!location) throw new CrawlError("FETCH_FAILED", "Website chuyển hướng không hợp lệ.");
      if (hop === maxRedirects) throw new CrawlError("REDIRECT_LIMIT", "Website chuyển hướng quá nhiều lần.");
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        throw new CrawlError("FETCH_FAILED", "Địa chỉ chuyển hướng không hợp lệ.");
      }
      // Kiểm lại SSRF cho từng hop, không tin redirect của server đích.
      current = validatePublicUrl(next.href);
      continue;
    }

    const contentType = (response.headers["content-type"] ?? "").split(";")[0]!.trim().toLowerCase();
    const charset = detectCharset(response.body, response.headers["content-type"] ?? "");
    return { ...response, finalUrl: current.href, contentType, charset };
  }
  throw new CrawlError("REDIRECT_LIMIT", "Website chuyển hướng quá nhiều lần.");
}
