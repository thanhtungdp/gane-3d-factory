import type { PreScan, PreScanCriterion, PreScanCriterionResult, ScanResult } from "@/shared/types";
import { CONSENT_VERSION } from "@/shared/types";

function criterion(
  key: PreScanCriterion,
  score: number,
  label: string,
  evidence: string,
): PreScanCriterionResult {
  return { key, score, label, evidence, positive: score >= 7 };
}

const criteria: Record<PreScanCriterion, PreScanCriterionResult> = {
  logo: criterion("logo", 6, "Logo đủ nét", "Logo 512px, nhưng chỉ có một phiên bản nền sáng"),
  color: criterion("color", 4, "Màu chưa nhất quán", "Màu trên website (#E2672F) lệch với màu trong logo (#F2B35C)"),
  slogan: criterion("slogan", 2, "Thiếu câu định vị", "Không tìm thấy slogan hoặc câu định vị trên trang chủ"),
  social: criterion("social", 7, "Có mặt trên mạng xã hội", "Tìm thấy Facebook và Zalo OA"),
  mobile: criterion("mobile", 8, "Website thân thiện mobile", "Có viewport và bố cục responsive"),
};

const preScan: PreScan = {
  score: 5.4,
  criteria,
  mobileFriendly: true,
  hasSlogan: false,
  socialCount: 2,
  colorConsistency: 4,
  logoQuality: "medium",
  signals: [
    {
      id: "no-slogan",
      zone: "internal",
      criterion: "slogan",
      title: "Không tìm thấy câu định vị",
      evidence: "Trang chủ không có slogan hoặc câu nói rõ bạn khác ở đâu",
      severity: "gap",
    },
    {
      id: "color-drift",
      zone: "identity",
      criterion: "color",
      title: "Màu giữa logo và website đang lệch",
      evidence: "Logo #F2B35C nhưng website dùng #E2672F",
      severity: "gap",
    },
    {
      id: "logo-one-variant",
      zone: "identity",
      criterion: "logo",
      title: "Logo chỉ có một phiên bản",
      evidence: "Chưa thấy bản 1 màu cho nền tối hoặc in ấn",
      severity: "watch",
    },
    {
      id: "social-ok",
      zone: "market",
      criterion: "social",
      title: "Có kênh chính thức",
      evidence: "Facebook và Zalo OA đã được liên kết ở footer",
      severity: "strength",
    },
    {
      id: "competitor-silent",
      zone: "competitor",
      criterion: "slogan",
      title: "Chưa có tuyên bố khác biệt so với đối thủ",
      evidence: "Nội dung trang chủ mô tả sản phẩm, chưa mô tả lý do chọn bạn",
      severity: "watch",
    },
  ],
};

export function demoScan(): ScanResult {
  return {
    scanId: `demo-${Date.now().toString(36)}`,
    source: "manual",
    cached: false,
    fetchedAt: new Date().toISOString(),
    warnings: ["Đây là dữ liệu mẫu để bạn trải nghiệm trước khi quét website thật."],
    brand: {
      name: "Cà phê Nắng Mai",
      domain: "nangmai.coffee",
      tagline: "Một ngày mới, một vị cà phê",
      description:
        "Chuỗi cà phê rang xay tại TP.HCM, tập trung vào hạt Việt Nam và không gian làm việc buổi sáng.",
      industry: "F&B",
      socials: [
        { type: "facebook", url: "https://facebook.com/nangmaicoffee" },
        { type: "zalo", url: "https://zalo.me/nangmaicoffee" },
      ],
      logo: {
        id: "demo-logo",
        url: "/brand/demo-logo.svg",
        width: 512,
        height: 512,
        source: "Dữ liệu mẫu",
        quality: "medium",
      },
      logoAlternatives: [],
      palette: [
        { hex: "#E2672F", role: "primary", source: "css" },
        { hex: "#F2B35C", role: "accent", source: "logo" },
        { hex: "#1B2A4A", role: "neutral", source: "css" },
      ],
    },
    preScan,
  };
}

export const DEMO_CONSENT = { accepted: true, version: CONSENT_VERSION };
