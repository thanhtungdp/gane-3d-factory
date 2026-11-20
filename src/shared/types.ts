/** Hợp đồng dữ liệu dùng chung client ↔ server. Không import gì từ DOM/Node ở đây. */

export const PLANET_IDS = ["S", "A", "O", "K", "IM"] as const;
export type PlanetId = (typeof PLANET_IDS)[number];

export type QualityTier = "high" | "mid" | "low";
export type ScanSource = "url" | "manual" | "fallback";

export interface BrandLogo {
  id: string;
  /** URL same-origin (/api/assets/...) — dùng được cho canvas, decal, PDF. */
  url: string;
  width: number;
  height: number;
  source: string;
  quality: "high" | "medium" | "low" | "none";
  isMonogram?: boolean;
}

export interface BrandColor {
  hex: string;
  role: "primary" | "accent" | "neutral";
  source: "logo" | "css" | "theme" | "manual" | "fallback";
}

export interface SocialLink {
  type: "facebook" | "zalo" | "tiktok" | "linkedin" | "youtube" | "other";
  url: string;
}

export interface BrandProfile {
  name: string;
  domain?: string;
  tagline?: string;
  description?: string;
  industry?: string;
  socials: SocialLink[];
  logo: BrandLogo | null;
  logoAlternatives: BrandLogo[];
  palette: BrandColor[];
}

export type PreScanCriterion = "logo" | "color" | "slogan" | "social" | "mobile";

export interface PreScanCriterionResult {
  key: PreScanCriterion;
  score: number;
  label: string;
  evidence: string;
  positive: boolean;
}

export type SignalZone = "internal" | "market" | "competitor" | "identity";

export interface ScanSignal {
  id: string;
  zone: SignalZone;
  criterion: PreScanCriterion;
  title: string;
  evidence: string;
  severity: "gap" | "watch" | "strength";
}

export interface PreScan {
  score: number;
  criteria: Record<PreScanCriterion, PreScanCriterionResult>;
  signals: ScanSignal[];
  mobileFriendly: boolean;
  hasSlogan: boolean;
  socialCount: number;
  colorConsistency: number;
  logoQuality: "high" | "medium" | "low" | "none";
}

export interface ScanResult {
  scanId: string;
  source: ScanSource;
  brand: BrandProfile;
  preScan: PreScan;
  warnings: string[];
  cached: boolean;
  fetchedAt: string;
}

export interface ScanRequest {
  url?: string;
  manual?: {
    name: string;
    website?: string;
    industry?: string;
    logoDataUrl?: string;
  };
}

export interface ProfileAnswers {
  companySize: "1-5" | "6-20" | "21-50" | "51-200" | "200+";
  role: "founder" | "cmo" | "brand" | "other";
}

export const COMPANY_SIZE_OPTIONS: { value: ProfileAnswers["companySize"]; label: string }[] = [
  { value: "1-5", label: "1–5 người" },
  { value: "6-20", label: "6–20 người" },
  { value: "21-50", label: "21–50 người" },
  { value: "51-200", label: "51–200 người" },
  { value: "200+", label: "Trên 200 người" },
];

export const ROLE_OPTIONS: { value: ProfileAnswers["role"]; label: string }[] = [
  { value: "founder", label: "Chủ doanh nghiệp / CEO" },
  { value: "cmo", label: "Giám đốc Marketing" },
  { value: "brand", label: "Phụ trách thương hiệu" },
  { value: "other", label: "Vai trò khác" },
];

export type DecisionKind = "knowledge" | "diagnosis";

export interface DecisionOption {
  id: string;
  label: string;
  /** 2 = tốt nhất / đã có; 1 = một phần; 0 = chưa có hoặc sai. */
  points: 0 | 1 | 2;
  feedback: string;
}

export interface Decision {
  id: string;
  planet: PlanetId;
  kind: DecisionKind;
  prompt: string;
  hint?: string;
  options: DecisionOption[];
  explain: string;
  /** Tiêu chí pre-scan dùng để kiểm tra "tôi đã có" có khớp với website không. */
  evidenceKey?: PreScanCriterion;
  evidenceLabel?: string;
}

export interface PlanetContent {
  planet: PlanetId;
  slug: string;
  intro: string[];
  outro: string[];
  insight: string;
  badge: { id: string; name: string; blurb: string };
  decisions: Decision[];
}

export interface DecisionRecord {
  decisionId: string;
  optionId: string;
  kind: DecisionKind;
  points: number;
  ms: number;
}

export interface PlanetResult {
  planet: PlanetId;
  score: number;
  knowledge: number;
  diagnosis: number;
  meter?: number;
  decisions: DecisionRecord[];
  skipped?: boolean;
  completedAt: string;
}

export interface WeakStep {
  planet: PlanetId;
  score: number;
  consequence: string;
  evidence?: string;
  packageName: string;
}

export interface RunResult {
  overall: number;
  title: string;
  titleBlurb: string;
  stars: number;
  planets: Partial<Record<PlanetId, PlanetResult>>;
  weak: PlanetId[];
  badges: PlanetId[];
  completedAt: string;
  durationMs?: number;
}

export interface ServicePackage {
  key: string;
  name: string;
  price: string;
}

export interface Offer {
  code: string;
  name: string;
  tagline: string;
  why: string;
  packages: ServicePackage[];
  priceLine: string;
  outcomes: string[];
}

export interface AiInsight {
  title: string;
  body: string;
  evidence: string;
  action: string;
}

export interface Report {
  id: string;
  createdAt: string;
  brand: BrandProfile;
  preScan: PreScan;
  answers: ProfileAnswers;
  result: RunResult;
  weaknesses: WeakStep[];
  insights: AiInsight[];
  aiSource: "ai" | "template";
  offers: Offer[];
  teaserOffer: string;
  industryRank?: number;
  industryTotal?: number;
}

export interface LeadInput {
  sessionId: string;
  reportId: string;
  name: string;
  phone?: string;
  email?: string;
  isRepresentative: boolean;
  consent: boolean;
  marketingOptIn?: boolean;
  website?: string;
}

export interface LeadResult {
  ok: boolean;
  pdfUrl: string;
  offerUnlocked: boolean;
}

export interface LeaderboardEntry {
  id: string;
  alias: string;
  industry: string;
  score: number;
  title: string;
  createdAt: string;
}

export interface FunnelEvent {
  name: string;
  sessionId?: string;
  planet?: PlanetId;
  props?: Record<string, string | number | boolean | null>;
  ts?: string;
}

export const REPORT_TITLES: { min: number; title: string; blurb: string }[] = [
  {
    min: 8,
    title: "Ngôi Sao Đã Thắp Sáng",
    blurb: "Thương hiệu của bạn có hệ thống, có tiếng nói và có người giữ lửa.",
  },
  {
    min: 7,
    title: "Thương Hiệu Ngôi Sao Mới",
    blurb: "Bạn đã có nền móng tốt. Điều còn thiếu là một vài quyết định dứt khoát.",
  },
  {
    min: 5,
    title: "Ngôi Sao Đang Lên",
    blurb: "Bạn đang đi đúng hướng, nhưng hệ thống chưa đủ chắc để đi nhanh.",
  },
  {
    min: 0,
    title: "Mầm Sao Đang Chờ",
    blurb: "Không phải thương hiệu yếu — mà là một thương hiệu chưa được đặt đúng chỗ.",
  },
];

export const CONSENT_VERSION = "2026-11-v1";
