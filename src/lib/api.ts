import type {
  BrandLogo,
  LeaderboardEntry,
  LeadInput,
  LeadResult,
  Report,
  ScanRequest,
  ScanResult,
} from "@/shared/types";
import type { CreateReportInput, CreateSessionInput, LeaderboardSubmit } from "@/shared/api";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = "UNKNOWN", status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.", "NETWORK", 0);
  }

  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    let message = "Có lỗi xảy ra. Bạn thử lại nhé.";
    try {
      const body = (await res.json()) as { error?: string; message?: string; code?: string };
      if (body.code) code = body.code;
      if (body.message) message = body.message;
      else if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, code, res.status);
  }

  return (await res.json()) as T;
}

export function scanBrand(input: ScanRequest): Promise<ScanResult> {
  return request<ScanResult>("/api/scan", { method: "POST", body: JSON.stringify(input) });
}

export async function uploadLogo(file: File): Promise<BrandLogo> {
  const fd = new FormData();
  fd.append("logo", file);
  return request<BrandLogo>("/api/logo", { method: "POST", body: fd });
}

export async function createSession(input: CreateSessionInput): Promise<{ sessionId: string }> {
  return request<{ sessionId: string }>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function saveProgress(
  sessionId: string,
  progress: {
    currentPlanet: string | null;
    completed: string[];
    results?: Record<string, unknown>;
    decisions?: Record<string, unknown>;
  },
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ progress }),
  });
}

export function createReport(input: CreateReportInput): Promise<{ report: Report }> {
  return request<{ report: Report }>("/api/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchReport(id: string): Promise<{ report: Report }> {
  return request<{ report: Report }>(`/api/reports/${encodeURIComponent(id)}`);
}

export function submitLead(input: LeadInput): Promise<LeadResult> {
  return request<LeadResult>("/api/leads", { method: "POST", body: JSON.stringify(input) });
}

export function submitLeaderboard(input: LeaderboardSubmit): Promise<{ entry: LeaderboardEntry }> {
  return request<{ entry: LeaderboardEntry }>("/api/leaderboard", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchLeaderboard(industry?: string): Promise<{ entries: LeaderboardEntry[] }> {
  const q = industry ? `?industry=${encodeURIComponent(industry)}` : "";
  return request<{ entries: LeaderboardEntry[] }>(`/api/leaderboard${q}`);
}

export function sendEvents(
  events: { name: string; sessionId?: string; planet?: string; props?: Record<string, unknown> }[],
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/api/events", {
    method: "POST",
    body: JSON.stringify({ events }),
    keepalive: true,
  });
}

export function pdfUrl(reportId: string, token: string): string {
  return `/api/reports/${encodeURIComponent(reportId)}/pdf?token=${encodeURIComponent(token)}`;
}
