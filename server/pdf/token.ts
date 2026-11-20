/** Token HMAC cho PDF: url chỉ dùng được khi có token hợp lệ + còn hạn. */
import { createHmac, timingSafeEqual } from "node:crypto";

export interface PdfTokenPayload {
  v: 1;
  r: string;
  exp: number;
}

export type PdfTokenVerification =
  | { ok: true; reportId: string }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

function sign(payloadPart: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadPart).digest("base64url");
}

export function issuePdfToken(reportId: string, secret: string, ttlMs: number, now = Date.now()): string {
  const payload: PdfTokenPayload = { v: 1, r: reportId, exp: now + ttlMs };
  const payloadPart = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadPart}.${sign(payloadPart, secret)}`;
}

export function verifyPdfToken(token: string, secret: string, now = Date.now()): PdfTokenVerification {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [payloadPart, signature] = parts as [string, string];
  if (!payloadPart || !signature) return { ok: false, reason: "malformed" };

  const expected = sign(payloadPart, secret);
  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (givenBuffer.length !== expectedBuffer.length) return { ok: false, reason: "bad_signature" };
  if (!timingSafeEqual(givenBuffer, expectedBuffer)) return { ok: false, reason: "bad_signature" };

  let payload: PdfTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as PdfTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!payload || payload.v !== 1 || typeof payload.r !== "string" || typeof payload.exp !== "number") {
    return { ok: false, reason: "malformed" };
  }
  if (payload.exp <= now) return { ok: false, reason: "expired" };
  return { ok: true, reportId: payload.r };
}
