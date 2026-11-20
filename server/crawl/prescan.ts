/** Pre-scan 5 tiêu chí + tín hiệu có bằng chứng thật (không quyết định điểm trạm). */
import type {
  BrandColor,
  BrandLogo,
  PreScan,
  PreScanCriterion,
  PreScanCriterionResult,
  ScanSignal,
  ScanSource,
  SignalZone,
  SocialLink,
} from "../../src/shared/types";
import { clamp, round1 } from "../../src/shared/scoring";

export interface PreScanInput {
  source: ScanSource;
  logo: BrandLogo | null;
  palette: BrandColor[];
  colorConsistency: number;
  hasSlogan: boolean;
  sloganText?: string;
  socials: SocialLink[];
  mobileFriendly: boolean;
  hasViewport: boolean;
  hasResponsiveCss: boolean;
  themeColorFound: boolean;
}

const SOURCE_LABEL: Record<string, string> = {
  header: "header website",
  "header-svg": "SVG trong header",
  "schema.org": "dữ liệu schema.org",
  "apple-touch-icon": "apple-touch-icon",
  manifest: "manifest icon",
  "og:image": "og:image",
  favicon: "favicon",
  google: "Google favicon",
  duckduckgo: "DuckDuckGo favicon",
  upload: "logo tải lên",
  monogram: "monogram tạm",
  "manual": "nhập tay",
};

const SOCIAL_LABEL: Record<string, string> = {
  facebook: "Facebook",
  zalo: "Zalo",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  other: "kênh khác",
};

function friendlySource(source: string): string {
  const key = Object.keys(SOURCE_LABEL).find((k) => source.toLowerCase().includes(k));
  return key ? SOURCE_LABEL[key]! : source;
}

function labelFor(score: number): string {
  if (score >= 8) return "Rõ ràng";
  if (score >= 6) return "Khá ổn";
  if (score >= 4) return "Cần củng cố";
  return "Còn thiếu";
}

function roundScore(n: number): number {
  return round1(clamp(n, 0, 10));
}

function logoCriterion(logo: BrandLogo | null): PreScanCriterionResult {
  if (!logo) {
    return {
      key: "logo",
      score: 1,
      label: labelFor(1),
      evidence: "Chưa tìm thấy logo đủ rõ trên website.",
      positive: false,
    };
  }
  let score: number;
  if (logo.isMonogram) score = 2;
  else if (logo.quality === "high") score = 9;
  else if (logo.quality === "medium") score = 7;
  else if (logo.quality === "low") score = 4;
  else score = 1;
  if (!logo.isMonogram && /header|svg/i.test(logo.source)) score = Math.min(10, score + 1);
  const evidence = logo.isMonogram
    ? "Chưa tải được logo gốc; đang dùng monogram tạm từ tên thương hiệu."
    : `Logo ${logo.width}×${logo.height}px lấy từ ${friendlySource(logo.source)}.`;
  return { key: "logo", score: roundScore(score), label: labelFor(score), evidence, positive: score >= 6 };
}

function colorCriterion(input: PreScanInput): PreScanCriterionResult {
  const onlyFallback = input.palette.length > 0 && input.palette.every((c) => c.source === "fallback");
  let score = clamp(input.colorConsistency, 0, 10);
  if (input.palette.length >= 2) score += 0.5;
  if (input.themeColorFound) score += 0.5;
  if (onlyFallback) score = 2;
  const hexes = input.palette
    .slice(0, 3)
    .map((c) => c.hex)
    .join(", ");
  const sources = [...new Set(input.palette.map((c) => c.source))].join(", ");
  const evidence = onlyFallback
    ? "Chưa trích được màu thương hiệu từ logo/CSS; đang dùng bảng màu tạm."
    : `Tìm thấy ${input.palette.length} màu chủ đạo (${hexes}) từ ${sources}.`;
  const rounded = roundScore(score);
  return { key: "color", score: rounded, label: labelFor(rounded), evidence, positive: rounded >= 6 };
}

function sloganCriterion(input: PreScanInput): PreScanCriterionResult {
  const text = input.sloganText?.trim();
  let score: number;
  let evidence: string;
  if (input.hasSlogan && text) {
    score = text.length >= 8 && text.length <= 90 ? 9 : 7;
    evidence = `Tìm thấy câu định vị: “${text.slice(0, 120)}”.`;
  } else if (input.hasSlogan) {
    score = 7;
    evidence = "Có dấu hiệu slogan/tagline nhưng chưa lấy được câu đầy đủ.";
  } else {
    score = 2;
    evidence = "Chưa tìm thấy slogan hoặc câu định vị riêng trên trang chủ.";
  }
  const rounded = roundScore(score);
  return { key: "slogan", score: rounded, label: labelFor(rounded), evidence, positive: rounded >= 6 };
}

function socialCriterion(input: PreScanInput): PreScanCriterionResult {
  const count = input.socials.length;
  const score = count === 0 ? 1 : count === 1 ? 4 : count === 2 ? 6 : count === 3 ? 8 : 9;
  const labels = [...new Set(input.socials.map((s) => SOCIAL_LABEL[s.type] ?? "kênh khác"))];
  const evidence =
    count === 0
      ? "Chưa tìm thấy liên kết mạng xã hội (Facebook/Zalo/TikTok/LinkedIn/YouTube) trên trang."
      : `Tìm thấy ${count} liên kết kênh: ${labels.join(", ")}.`;
  return { key: "social", score, label: labelFor(score), evidence, positive: score >= 6 };
}

function mobileCriterion(input: PreScanInput): PreScanCriterionResult {
  let score: number;
  let evidence: string;
  if (input.hasViewport && input.hasResponsiveCss) {
    score = 9;
    evidence = "Có meta viewport và CSS responsive (@media) — website thân thiện thiết bị di động.";
  } else if (input.hasViewport) {
    score = 7;
    evidence = "Có meta viewport nhưng chưa thấy CSS responsive trong phần đọc được.";
  } else if (input.hasResponsiveCss) {
    score = 4;
    evidence = "Có CSS responsive nhưng thiếu meta viewport — hiển thị mobile chưa chuẩn.";
  } else {
    score = 2;
    evidence = "Không thấy meta viewport — website chưa tối ưu cho điện thoại.";
  }
  return { key: "mobile", score, label: labelFor(score), evidence, positive: score >= 6 };
}

const ZONE: Record<PreScanCriterion, SignalZone> = {
  logo: "identity",
  color: "identity",
  slogan: "market",
  social: "internal",
  mobile: "market",
};

const SIGNAL_TITLE: Record<PreScanCriterion, { gap: string; watch: string; strength: string }> = {
  logo: {
    gap: "Nhận diện chưa có logo đủ chuẩn",
    watch: "Logo đã có nhưng chưa đủ độ nét",
    strength: "Logo đủ rõ để dùng đa kênh",
  },
  color: {
    gap: "Bảng màu chưa được kiểm soát",
    watch: "Bảng màu đang ở mức tạm ổn",
    strength: "Bảng màu đủ nhất quán",
  },
  slogan: {
    gap: "Thiếu câu định vị khác biệt",
    watch: "Câu định vị mới ở dạng tiềm ẩn",
    strength: "Đã có câu định vị riêng",
  },
  social: {
    gap: "Kênh xã hội chưa được nối về một mối",
    watch: "Hiện diện xã hội còn mỏng",
    strength: "Các kênh xã hội đã hiện diện",
  },
  mobile: {
    gap: "Trải nghiệm di động chưa được chăm",
    watch: "Bản di động dùng được nhưng chưa mượt",
    strength: "Website thân thiện di động",
  },
};

export function buildPreScan(input: PreScanInput): PreScan {
  const criteriaList: PreScanCriterionResult[] = [
    logoCriterion(input.logo),
    colorCriterion(input),
    sloganCriterion(input),
    socialCriterion(input),
    mobileCriterion(input),
  ];
  const criteria = Object.fromEntries(criteriaList.map((c) => [c.key, c])) as Record<
    PreScanCriterion,
    PreScanCriterionResult
  >;
  const average = criteriaList.reduce((sum, c) => sum + c.score, 0) / criteriaList.length;

  const signals: ScanSignal[] = [];
  const usedIds = new Set<string>();
  for (const criterion of criteriaList) {
    const severity = criterion.score < 6 ? "gap" : criterion.score < 8 ? "watch" : "strength";
    const id = `${criterion.key}-${severity}`;
    usedIds.add(id);
    signals.push({
      id,
      zone: ZONE[criterion.key],
      criterion: criterion.key,
      title: SIGNAL_TITLE[criterion.key][severity],
      evidence: criterion.evidence,
      severity,
    });
  }

  // Tín hiệu vùng đối thủ: dựa vào việc có/không có câu khác biệt hoá thật trên trang.
  const slogan = criteria.slogan;
  if (slogan.score < 6) {
    signals.push({
      id: "competitor-differentiation-gap",
      zone: "competitor",
      criterion: "slogan",
      title: "Khách chưa có lý do chọn bạn thay vì đối thủ",
      evidence: "Website chưa nêu câu khác biệt hoá; khách phải tự so sánh bằng giá hoặc cảm tính.",
      severity: "gap",
    });
  } else {
    signals.push({
      id: "competitor-differentiation-watch",
      zone: "competitor",
      criterion: "slogan",
      title: "Khác biệt hoá cần dùng nhất quán",
      evidence: slogan.evidence,
      severity: "watch",
    });
  }

  const allPositive = criteriaList.every((c) => c.positive);
  const periodicCandidates: ScanSignal[] = [
    {
      id: "periodic-logo-watch",
      zone: "identity",
      criterion: "logo",
      title: "Kiểm tra định kỳ bộ logo",
      evidence: `${criteria.logo.evidence} Nên rà lại biến thể SVG, nền tối và favicon mỗi 6 tháng.`,
      severity: "watch",
    },
    {
      id: "periodic-color-watch",
      zone: "identity",
      criterion: "color",
      title: "Kiểm tra định kỳ mã màu",
      evidence: `${criteria.color.evidence} Nên đối chiếu màu in ấn và màn hình khi đổi nhà in.`,
      severity: "watch",
    },
    {
      id: "periodic-mobile-watch",
      zone: "market",
      criterion: "mobile",
      title: "Kiểm tra định kỳ bản di động",
      evidence: `${criteria.mobile.evidence} Nên thử lại trên một điện thoại tầm trung mỗi quý.`,
      severity: "watch",
    },
    {
      id: "periodic-social-watch",
      zone: "internal",
      criterion: "social",
      title: "Kiểm tra định kỳ kênh xã hội",
      evidence: `${criteria.social.evidence} Nên rà link hỏng và ảnh đại diện mỗi quý.`,
      severity: "watch",
    },
  ];

  if (allPositive) {
    for (const signal of periodicCandidates.slice(0, 2)) signals.push(signal);
  }
  let cursor = 0;
  while (signals.length < 5 && cursor < periodicCandidates.length) {
    const candidate = periodicCandidates[cursor++]!;
    if (!usedIds.has(candidate.id)) {
      usedIds.add(candidate.id);
      signals.push(candidate);
    }
  }

  return {
    score: round1(average),
    criteria,
    signals: signals.slice(0, 8),
    mobileFriendly: input.mobileFriendly,
    hasSlogan: input.hasSlogan,
    socialCount: input.socials.length,
    colorConsistency: round1(clamp(input.colorConsistency, 0, 10)),
    logoQuality: input.logo ? input.logo.quality : "none",
  };
}

/** Pre-scan trung tính khi không có dữ liệu quét (báo cáo vẫn tính được). */
export function neutralPreScan(warnings: string[] = []): PreScan {
  const evidence = warnings[0] ?? "Chưa có dữ liệu quét website.";
  const criteriaList: PreScanCriterionResult[] = (["logo", "color", "slogan", "social", "mobile"] as const).map(
    (key) => ({
      key,
      score: 5,
      label: labelFor(5),
      evidence,
      positive: false,
    }),
  );
  const criteria = Object.fromEntries(criteriaList.map((c) => [c.key, c])) as Record<
    PreScanCriterion,
    PreScanCriterionResult
  >;
  return {
    score: 5,
    criteria,
    signals: criteriaList.map((c) => ({
      id: `${c.key}-watch`,
      zone: ZONE[c.key],
      criterion: c.key,
      title: SIGNAL_TITLE[c.key].watch,
      evidence: c.evidence,
      severity: "watch" as const,
    })),
    mobileFriendly: false,
    hasSlogan: false,
    socialCount: 0,
    colorConsistency: 5,
    logoQuality: "none",
  };
}
