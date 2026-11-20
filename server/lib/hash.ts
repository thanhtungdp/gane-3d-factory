import { createHmac, timingSafeEqual } from "node:crypto";
import { sha256Hex } from "./ids";

/** IP chỉ được lưu dưới dạng hash + salt, không bao giờ lưu IP thô. */
export function hashIp(ip: string, salt: string): string {
  return sha256Hex(`${salt}:${ip}`).slice(0, 32);
}

export function hmacSha256Hex(secret: string, payload: string | Buffer): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function safeEqualStrings(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
