import { describe, expect, it } from "vitest";
import { checkRobots } from "../../server/crawl/robots";
import type { FetchLike, RawResponse } from "../../server/crawl/fetch";

function textResponse(status: number, body: string, contentType = "text/plain"): RawResponse {
  return { status, headers: { "content-type": contentType }, body: Buffer.from(body, "utf8"), url: "" };
}

const UA = "SaoKimBrandScanner/1.0";

describe("robots.txt", () => {
  it("allow khi robots.txt cho phép", async () => {
    const fetchImpl: FetchLike = async () => textResponse(200, "User-agent: *\nAllow: /\n");
    const decision = await checkRobots("https://example.com/trang-chu", { fetchImpl, userAgent: UA });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("allowed");
  });

  it("disallow → không crawl", async () => {
    const fetchImpl: FetchLike = async () => textResponse(200, "User-agent: *\nDisallow: /\n");
    const decision = await checkRobots("https://example.com/", { fetchImpl, userAgent: UA });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("disallowed");
  });

  it("robots.txt 404 → coi như được phép", async () => {
    const fetchImpl: FetchLike = async () => textResponse(404, "not found");
    const decision = await checkRobots("https://example.com/", { fetchImpl, userAgent: UA });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("unavailable");
  });

  it("lỗi mạng → không chặn nhầm", async () => {
    const fetchImpl: FetchLike = async () => {
      throw new Error("network down");
    };
    const decision = await checkRobots("https://example.com/", { fetchImpl, userAgent: UA });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("unavailable");
  });

  it("disallow riêng cho bot của mình", async () => {
    const fetchImpl: FetchLike = async () =>
      textResponse(200, "User-agent: SaoKimBrandScanner\nDisallow: /\n\nUser-agent: *\nAllow: /\n");
    const decision = await checkRobots("https://example.com/", { fetchImpl, userAgent: UA });
    expect(decision.allowed).toBe(false);
  });
});
