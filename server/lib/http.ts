/** Helper HTTP dùng chung: error JSON, zod message, chuyển Buffer → ArrayBuffer. */
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AppError } from "./errors";

export { AppError, badRequest, forbidden, notFound, payloadTooLarge, unauthorized, tooManyRequests, internalError, unavailable } from "./errors";

export function errorResponse(c: Context, error: AppError): Response {
  return c.json(
    {
      error: error.code,
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
    error.status as ContentfulStatusCode,
  );
}

export function firstZodMessage(issues: { message: string; path?: (string | number | symbol)[] }[]): string {
  const issue = issues[0];
  if (!issue) return "Dữ liệu gửi lên chưa đúng.";
  if (issue.message && /[àáảãạăâđêôơư]/iu.test(issue.message)) return issue.message;
  if (/invalid input|expected|too (small|big)|unrecognized|required/i.test(issue.message)) {
    return "Dữ liệu gửi lên chưa đúng định dạng.";
  }
  return issue.message || "Dữ liệu gửi lên chưa đúng.";
}

export function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}

export function clientIpFromHeaders(headers: Headers, trustProxy: boolean): string | null {
  if (trustProxy) {
    const forwarded = headers.get("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return null;
}
