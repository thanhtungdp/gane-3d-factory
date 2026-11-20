import { get, set, del } from "idb-keyval";
import type {
  BrandProfile,
  DecisionRecord,
  PlanetId,
  PlanetResult,
  PreScan,
  ProfileAnswers,
  Report,
  ScanResult,
} from "@/shared/types";

export const RUN_VERSION = 2;
const KEY_LAST = "saokim:last-run";
const KEY_PREFIX = "saokim:run:";

export interface RunSnapshot {
  version: number;
  savedAt: string;
  domain: string;
  scan: ScanResult | null;
  brand: BrandProfile | null;
  preScan: PreScan | null;
  answers: ProfileAnswers;
  sessionId: string | null;
  currentPlanet: PlanetId | null;
  results: Partial<Record<PlanetId, PlanetResult>>;
  decisions: Partial<Record<PlanetId, DecisionRecord[]>>;
  report: Report | null;
  leadUnlocked: boolean;
  startedAt: string;
}

export function domainKey(domain?: string | null, fallback = "manual"): string {
  return (domain || fallback).toLowerCase().replace(/^www\./, "").replace(/[^a-z0-9.-]/g, "-");
}

async function safeGet<T>(key: string): Promise<T | undefined> {
  try {
    const v = await get<T>(key);
    if (v !== undefined) return v;
  } catch {
    // IndexedDB có thể bị chặn trong private mode → thử localStorage
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

async function safeSet<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
    return;
  } catch {
    /* noop */
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

async function safeDel(key: string): Promise<void> {
  try {
    await del(key);
  } catch {
    /* noop */
  }
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export async function saveRun(snapshot: RunSnapshot): Promise<void> {
  const key = `${KEY_PREFIX}${domainKey(snapshot.domain)}`;
  await safeSet(key, snapshot);
  await safeSet(KEY_LAST, key);
}

export async function loadLastRun(): Promise<RunSnapshot | null> {
  const key = await safeGet<string>(KEY_LAST);
  if (!key) return null;
  const snapshot = await safeGet<RunSnapshot>(key);
  if (!snapshot || snapshot.version !== RUN_VERSION) return null;
  return snapshot;
}

export async function clearRun(domain?: string | null): Promise<void> {
  const key = `${KEY_PREFIX}${domainKey(domain)}`;
  await safeDel(key);
  await safeDel(KEY_LAST);
}

export function isResumable(snapshot: RunSnapshot | null): boolean {
  if (!snapshot) return false;
  const age = Date.now() - new Date(snapshot.savedAt).getTime();
  return age < 7 * 24 * 60 * 60 * 1000 && !snapshot.report;
}
