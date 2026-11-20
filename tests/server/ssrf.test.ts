import { describe, expect, it } from "vitest";
import {
  isBlockedHostname,
  isBlockedIpv4,
  isBlockedIpv6,
  parseNumericHostIpv4,
  validatePublicUrl,
} from "../../server/crawl/ssrf";
import { CrawlError } from "../../server/crawl/types";
import { safeFetch, type FetchLike, type RawResponse } from "../../server/crawl/fetch";

function expectCrawlError(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error("Không ném lỗi");
  } catch (err) {
    expect(err).toBeInstanceOf(CrawlError);
    expect((err as CrawlError).code).toBe(code);
  }
}

function fakeResponse(overrides: Partial<RawResponse> = {}): RawResponse {
  return { status: 200, headers: {}, body: Buffer.from("ok"), url: "https://example.com/", ...overrides };
}

describe("SSRF guard", () => {
  it("chấp nhận URL http/https công cộng và tự thêm https khi thiếu scheme", () => {
    expect(validatePublicUrl("https://example.com/path?x=1").href).toBe("https://example.com/path?x=1");
    expect(validatePublicUrl("example.com").href).toBe("https://example.com/");
    expect(validatePublicUrl("http://sub.example.org").protocol).toBe("http:");
  });

  it("chặn localhost, IP riêng, link-local, metadata", () => {
    const blocked = [
      "http://localhost/",
      "http://localhost.localdomain/",
      "http://127.0.0.1/",
      "http://10.1.2.3/",
      "http://172.16.0.5/",
      "http://172.31.255.255/",
      "http://192.168.1.1/",
      "http://169.254.169.254/latest/meta-data",
      "http://0.0.0.0/",
      "http://100.64.0.1/",
      "http://[::1]/",
      "http://[fe80::1]/",
      "http://[fc00::1]/",
      "http://metadata.google.internal/",
      "http://kubernetes.default.svc/",
      "http://intranet/",
    ];
    for (const url of blocked) expectCrawlError(() => validatePublicUrl(url), "SSRF_BLOCKED");
  });

  it("chặn IP dạng số/hex/octal (inet_aton)", () => {
    expect(parseNumericHostIpv4("2130706433")).toBe("127.0.0.1");
    expect(parseNumericHostIpv4("0x7f000001")).toBe("127.0.0.1");
    expect(parseNumericHostIpv4("0177.0.0.1")).toBe("127.0.0.1");
    expect(isBlockedIpv4("127.0.0.1")).toBe(true);
    expect(isBlockedIpv4("169.254.169.254")).toBe(true);
    expect(isBlockedIpv4("8.8.8.8")).toBe(false);
    expect(isBlockedIpv6("::1")).toBe(true);
    expect(isBlockedIpv6("::ffff:127.0.0.1")).toBe(true);
    expect(isBlockedIpv6("2001:4860:4860::8888")).toBe(false);
    expect(isBlockedHostname("cdn.example.com")).toBe(false);
  });

  it("chặn scheme lạ, credentials và cổng lạ", () => {
    expectCrawlError(() => validatePublicUrl("ftp://example.com"), "UNSUPPORTED_PROTOCOL");
    expectCrawlError(() => validatePublicUrl("file:///etc/passwd"), "UNSUPPORTED_PROTOCOL");
    expectCrawlError(() => validatePublicUrl("http://user:pass@example.com/"), "SSRF_BLOCKED");
    expectCrawlError(() => validatePublicUrl("http://example.com:22/"), "SSRF_BLOCKED");
    expectCrawlError(() => validatePublicUrl(""), "INVALID_URL");
  });

  it("kiểm lại SSRF ở từng hop redirect", async () => {
    const fetchImpl: FetchLike = async () =>
      fakeResponse({ status: 302, headers: { location: "http://127.0.0.1/admin" } });
    await expect(
      safeFetch("https://example.com/", {
        fetchImpl,
        timeoutMs: 1000,
        maxBytes: 1024,
        userAgent: "SaoKimBrandScanner/1.0",
      }),
    ).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("giới hạn tối đa 3 redirect", async () => {
    let calls = 0;
    const fetchImpl: FetchLike = async () => {
      calls += 1;
      return fakeResponse({ status: 301, headers: { location: `https://example.com/hop-${calls}` } });
    };
    await expect(
      safeFetch("https://example.com/", {
        fetchImpl,
        timeoutMs: 1000,
        maxBytes: 1024,
        userAgent: "SaoKimBrandScanner/1.0",
      }),
    ).rejects.toMatchObject({ code: "REDIRECT_LIMIT" });
  });

  it("follow redirect hợp lệ và trả nội dung cuối", async () => {
    const fetchImpl: FetchLike = async (url) =>
      url.endsWith("/a")
        ? fakeResponse({ status: 302, headers: { location: "https://cdn.example.com/b" } })
        : fakeResponse({ status: 200, headers: { "content-type": "text/html; charset=utf-8" }, body: Buffer.from("<html>ok</html>") });
    const result = await safeFetch("https://example.com/a", {
      fetchImpl,
      timeoutMs: 1000,
      maxBytes: 1024,
      userAgent: "SaoKimBrandScanner/1.0",
    });
    expect(result.finalUrl).toBe("https://cdn.example.com/b");
    expect(result.contentType).toBe("text/html");
    expect(result.charset).toBe("utf-8");
  });
});
