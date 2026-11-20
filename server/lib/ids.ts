import { createHash, randomBytes, randomUUID } from "node:crypto";

export function newId(): string {
  return randomUUID();
}

/** ID ngắn, an toàn cho URL (dùng cho scanId/asset id). */
export function shortId(prefix = ""): string {
  const raw = randomBytes(12).toString("base64url");
  return `${prefix}${raw}`;
}

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export function sha256Short(data: string | Buffer, len = 16): string {
  return sha256Hex(data).slice(0, len);
}
