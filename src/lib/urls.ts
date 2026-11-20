export function normalizeWebsite(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (/\s/.test(raw)) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname.includes(".") || u.hostname.startsWith(".") || u.hostname.endsWith(".")) return null;
    if (u.hostname.length > 253) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function hostOf(input?: string | null): string {
  if (!input) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return input.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0] ?? "";
  }
}

export function prettyDomain(input?: string | null): string {
  return hostOf(input) || "doanh nghiệp của bạn";
}
