/**
 * SSRF guard: chỉ cho http/https tới host công cộng.
 * Kiểm tra cả IP literal, dạng số (inet_aton), hostname nội bộ và DNS resolve lúc kết nối.
 */
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import type { LookupFunction } from "node:net";
import { CrawlError } from "./types";

const ALLOWED_PORTS = new Set(["", "80", "443", "8080", "8443"]);
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "host.docker.internal",
  "gateway.docker.internal",
  "kubernetes",
  "kubernetes.default",
  "kubernetes.default.svc",
  "kubernetes.default.svc.cluster.local",
  "consul",
  "vault",
]);
const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".intranet",
  ".lan",
  ".home.arpa",
  ".localdomain",
  ".in-addr.arpa",
  ".ip6.arpa",
  ".metadata.google.internal",
  ".svc.cluster.local",
  ".cluster.local",
];

function parseIPv4(ip: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return null;
  const nums = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (nums.some((n) => n > 255)) return null;
  return ((nums[0]! << 24) | (nums[1]! << 16) | (nums[2]! << 8) | nums[3]!) >>> 0;
}

/** Dạng số kỳ lạ: 2130706433, 0x7f000001, 0177.0.0.1 — đều quy về IPv4. */
export function parseNumericHostIpv4(host: string): string | null {
  if (!host) return null;
  const parts = host.split(".");
  if (parts.length > 4) return null;
  const parsePart = (part: string): number | null => {
    if (/^0x[0-9a-f]+$/i.test(part)) return Number.parseInt(part.slice(2), 16);
    if (/^0[0-7]+$/.test(part)) return Number.parseInt(part.slice(1), 8);
    if (/^\d+$/.test(part)) return Number.parseInt(part, 10);
    return null;
  };
  const values: number[] = [];
  for (const part of parts) {
    const v = parsePart(part);
    if (v === null || !Number.isFinite(v) || v < 0) return null;
    values.push(v);
  }
  let int: number | null = null;
  if (values.length === 1) {
    if (values[0]! > 0xffffffff) return null;
    int = values[0]!;
  } else if (values.length === 2) {
    if (values[0]! > 255 || values[1]! > 0xffffff) return null;
    int = values[0]! * 0x1000000 + values[1]!;
  } else if (values.length === 3) {
    if (values.slice(0, 2).some((n) => n > 255) || values[2]! > 0xffff) return null;
    int = values[0]! * 0x1000000 + values[1]! * 0x10000 + values[2]!;
  } else {
    if (values.some((n) => n > 255)) return null;
    int = ((values[0]! << 24) | (values[1]! << 16) | (values[2]! << 8) | values[3]!) >>> 0;
  }
  if (int === null) return null;
  return [int >>> 24, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(".");
}

export function isBlockedIpv4(ip: string): boolean {
  const int = parseIPv4(ip);
  if (int === null) return false;
  const a = int >>> 24;
  const b = (int >>> 16) & 255;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true; // 192.0.0.0/24, 192.0.2.0/24
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmark
  if (a === 198 && b === 51) return true; // TEST-NET-2
  if (a === 203 && b === 0) return true; // TEST-NET-3
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 224) return true; // multicast bắt đầu
  if (a >= 224) return true; // multicast + reserved + broadcast
  return false;
}

export function isBlockedIpv6(rawIp: string): boolean {
  const ip = rawIp.trim().toLowerCase().replace(/^\[/, "").replace(/\]$/, "").split("%")[0] ?? "";
  if (!ip) return true;
  if (ip === "::" || ip === "::1") return true;
  if (ip.startsWith("fe8") || ip.startsWith("fe9") || ip.startsWith("fea") || ip.startsWith("feb")) return true; // fe80::/10
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // ULA fc00::/7
  if (ip.startsWith("ff")) return true; // multicast
  if (ip.startsWith("64:ff9b:")) return true; // NAT64
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(ip);
  if (mapped) return isBlockedIpv4(mapped[1]!);
  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(ip);
  if (mappedHex) {
    const hi = Number.parseInt(mappedHex[1]!, 16);
    const lo = Number.parseInt(mappedHex[2]!, 16);
    const ipv4 = [hi >>> 8, hi & 255, lo >>> 8, lo & 255].join(".");
    return isBlockedIpv4(ipv4);
  }
  if (ip.startsWith("::")) return true; // IPv4-compatible / địa chỉ đặc biệt
  return false;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "").replace(/^\[/, "").replace(/\]$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  // host một nhãn (không có dấu chấm) không thể là domain công cộng
  if (!host.includes(".")) return true;
  return false;
}

/** Trả URL đã chuẩn hoá; ném CrawlError nếu không an toàn. */
export function validatePublicUrl(rawUrl: string): URL {
  const raw = rawUrl.trim();
  if (!raw) throw new CrawlError("INVALID_URL", "Thiếu địa chỉ website.");
  if (raw.length > 2048) throw new CrawlError("INVALID_URL", "Địa chỉ website quá dài.");

  let candidate = raw;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, "")}`;
  }
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new CrawlError("INVALID_URL", "Địa chỉ website chưa đúng.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new CrawlError("UNSUPPORTED_PROTOCOL", "Chỉ hỗ trợ địa chỉ http hoặc https.");
  }
  if (url.username || url.password) {
    throw new CrawlError("SSRF_BLOCKED", "Địa chỉ chứa thông tin đăng nhập — không hỗ trợ.");
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new CrawlError("SSRF_BLOCKED", "Cổng kết nối không được phép.");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname) throw new CrawlError("INVALID_URL", "Địa chỉ website chưa đúng.");

  const bareHost = hostname.replace(/^\[/, "").replace(/\]$/, "");
  const numericIpv4 = parseNumericHostIpv4(bareHost);
  if (numericIpv4) {
    if (isBlockedIpv4(numericIpv4)) {
      throw new CrawlError("SSRF_BLOCKED", "Địa chỉ nội bộ không được phép quét.");
    }
  } else if (isBlockedHostname(hostname)) {
    throw new CrawlError("SSRF_BLOCKED", "Địa chỉ nội bộ không được phép quét.");
  }

  if (bareHost.includes(":")) {
    if (isBlockedIpv6(bareHost)) throw new CrawlError("SSRF_BLOCKED", "Địa chỉ nội bộ không được phép quét.");
  }

  // IDN còn dạng unicode cũng cần chặn các nhãn gây nhầm (localhost, metadata...)
  const asciiHost = url.hostname.toLowerCase();
  if (isBlockedHostname(asciiHost)) {
    throw new CrawlError("SSRF_BLOCKED", "Địa chỉ nội bộ không được phép quét.");
  }
  return url;
}

/** Lookup cho http.request: chặn DNS trỏ về IP nội bộ (kể cả DNS rebinding của hop đầu). */
export const guardedLookup: LookupFunction = (hostname, options, callback) => {
  const family = typeof options.family === "number" ? options.family : 0;
  dnsLookup(hostname, { family, all: true, verbatim: true }, (err, addresses) => {
    if (err) {
      callback(err, "");
      return;
    }
    const safe = (addresses as LookupAddress[]).filter((a) =>
      a.family === 6 ? !isBlockedIpv6(a.address) : !isBlockedIpv4(a.address),
    );
    if (safe.length === 0) {
      const blocked = Object.assign(new Error("Địa chỉ DNS trỏ vào mạng nội bộ."), { code: "DNS_BLOCKED" });
      callback(blocked, "");
      return;
    }
    if (options.all) {
      callback(null, safe);
      return;
    }
    const first = safe[0]!;
    callback(null, first.address, first.family);
  });
};
