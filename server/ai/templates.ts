/** 3 insight template deterministic khi không có AI key hoặc AI trả dữ liệu không hợp lệ. */
import type { AiInsight, BrandProfile, PlanetId, PreScan, PreScanCriterion, RunResult, WeakStep } from "../../src/shared/types";

export interface InsightsInput {
  brand: BrandProfile;
  preScan: PreScan;
  answers: { companySize: string; role: string };
  result: RunResult;
  weaknesses: WeakStep[];
}

const CRITERION_FOR_PLANET: Record<PlanetId, PreScanCriterion> = {
  S: "logo",
  A: "slogan",
  O: "color",
  K: "social",
  IM: "mobile",
};

const ROLE_PHRASE: Record<string, string> = {
  founder: "với vai trò người chủ doanh nghiệp",
  cmo: "với vai trò giám đốc marketing",
  brand: "với vai trò phụ trách thương hiệu",
  other: "với vai trò hiện tại của bạn",
};

const PLANET_INSIGHT: Record<
  PlanetId,
  { title: string; action: string; body: (ctx: InsightContext) => string }
> = {
  S: {
    title: "Chẩn đoán thiếu dữ kiện thật",
    action: "Chọn một giả định về khách hàng và kiểm chứng bằng 5 cuộc gọi trong tuần này.",
    body: (ctx) =>
      `${ctx.brand.name} đang dựa nhiều vào cảm nhận khi quyết định thương hiệu. Hãy đối chiếu lại bằng dữ kiện khách hàng thật thay vì phỏng đoán.`,
  },
  A: {
    title: "Định vị chưa đủ khác biệt",
    action: "Viết lại một câu định vị duy nhất và dùng nó ở phần giới thiệu website.",
    body: (ctx) =>
      `${ctx.brand.name} chưa nói rõ vì sao khách nên chọn mình. ${ctx.industryPhrase} đang cạnh tranh bằng giá nếu câu chuyện khác biệt chưa rõ.`,
  },
  O: {
    title: "Nhận diện chưa thành hệ thống",
    action: "Chốt ba màu chủ đạo và hai font, rồi ghi thành một trang quy chuẩn dùng chung.",
    body: (ctx) =>
      `Logo và màu của ${ctx.brand.name} chưa được chuẩn hoá thành bộ quy tắc. Mỗi lần thiết kế lại phải quyết định lại, khiến nhận diện trôi dần.`,
  },
  K: {
    title: "Ra mắt chưa có kịch bản",
    action: "Lập kịch bản 30 ngày gồm thông điệp chính, ba kênh và một người phát ngôn.",
    body: (ctx) =>
      `${ctx.brand.name} chưa có kịch bản ra mắt rõ ràng. Khi thông điệp đi trước, đội bán hàng và kênh xã hội sẽ nói hai câu chuyện khác nhau.`,
  },
  IM: {
    title: "Thiếu nhịp giữ nhất quán",
    action: "Tạo checklist duyệt nội dung trước khi đăng và giao cho một người chịu trách nhiệm.",
    body: (ctx) =>
      `${ctx.brand.name} dễ mất nhất quán khi đội đông hơn hoặc có người mới. Chuẩn bị một quy trình duyệt nội dung ngắn sẽ giữ thương hiệu không trôi.`,
  },
};

const CRITERION_INSIGHT: Record<
  PreScanCriterion,
  { title: string; action: string; body: (ctx: InsightContext) => string }
> = {
  logo: {
    title: "Logo chưa đủ độ nét",
    action: "Xin file SVG gốc từ đơn vị thiết kế và lưu một bộ logo đủ nền sáng, tối.",
    body: (ctx) =>
      `Logo đang dùng của ${ctx.brand.name} chưa đủ rõ để in ấn và hiển thị trên màn hình lớn. Một bộ file gốc sẽ tránh phải phóng to ảnh nhỏ.`,
  },
  color: {
    title: "Màu chưa được kiểm soát",
    action: "Ghi lại mã màu chủ đạo và kiểm tra lại trên một ấn phẩm in thử.",
    body: (ctx) =>
      `Màu sắc của ${ctx.brand.name} đang xuất hiện rải rác giữa website và ấn phẩm. Chốt mã màu chuẩn giúp mọi điểm chạm nhìn cùng một thương hiệu.`,
  },
  slogan: {
    title: "Thiếu câu định vị riêng",
    action: "Thử ba câu định vị ngắn và hỏi khách quen xem câu nào dễ nhớ nhất.",
    body: (ctx) =>
      `Website của ${ctx.brand.name} chưa có câu nói rõ điều khác biệt. Khách phải tự suy luận, và thường kết luận bằng cách so sánh giá.`,
  },
  social: {
    title: "Kênh xã hội còn rời",
    action: "Đặt link kênh chính ở footer và dùng cùng một ảnh đại diện trên mọi kênh.",
    body: (ctx) =>
      `Các kênh của ${ctx.brand.name} chưa được nối về một mối. Người xem khó tin một kênh là chính thức nếu thông tin và hình ảnh không khớp nhau.`,
  },
  mobile: {
    title: "Bản di động chưa mượt",
    action: "Mở website trên một điện thoại tầm trung và sửa ba chỗ khó bấm nhất.",
    body: (ctx) =>
      `Khách của ${ctx.brand.name} phần lớn vào bằng điện thoại. Nếu bản di động chưa mượt, họ rời đi trước khi đọc hết lợi ích.`,
  },
};

interface InsightContext {
  brand: BrandProfile;
  preScan: PreScan;
  result: RunResult;
  industryPhrase: string;
  rolePhrase: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? words.join(" ") : `${words.slice(0, max).join(" ")}.`;
}

function toInsight(
  template: { title: string; action: string; body: (ctx: InsightContext) => string },
  evidence: string,
  ctx: InsightContext,
): AiInsight {
  return {
    title: trimWords(template.title, 6),
    body: trimWords(template.body(ctx), 35),
    evidence: trimWords(evidence, 30),
    action: trimWords(template.action, 22),
  };
}

/** Chọn deterministic theo 2 bước yếu + tiêu chí pre-scan yếu nhất + brand/industry/role. */
export function buildTemplateInsights(input: InsightsInput): AiInsight[] {
  const { brand, preScan, result, answers } = input;
  const ctx: InsightContext = {
    brand,
    preScan,
    result,
    industryPhrase: brand.industry ? `Thương hiệu trong ${brand.industry}` : "Thương hiệu của bạn",
    rolePhrase: ROLE_PHRASE[answers.role] ?? ROLE_PHRASE.other!,
  };

  const weakPlanets = result.weak.slice(0, 2);
  const weakCriteria = (Object.keys(preScan.criteria) as PreScanCriterion[]).sort(
    (a, b) => preScan.criteria[a].score - preScan.criteria[b].score,
  );

  const pool: { key: string; insight: AiInsight }[] = [];
  for (const planet of weakPlanets) {
    const criterion = CRITERION_FOR_PLANET[planet];
    const evidence =
      preScan.criteria[criterion]?.evidence ??
      input.weaknesses.find((w) => w.planet === planet)?.evidence ??
      "Dữ liệu quét chưa đủ để đối chiếu.";
    pool.push({
      key: `planet:${planet}`,
      insight: toInsight(PLANET_INSIGHT[planet], evidence, ctx),
    });
  }
  for (const criterion of weakCriteria) {
    pool.push({
      key: `criterion:${criterion}`,
      insight: toInsight(CRITERION_INSIGHT[criterion], preScan.criteria[criterion].evidence, ctx),
    });
  }
  // bổ sung insight theo vai trò/quy mô nếu thiếu (luôn đủ 3)
  pool.push({
    key: "role:follow-up",
    insight: {
      title: "Một việc nên làm ngay",
      body: trimWords(
        `${brand.name} nên chọn một điểm chạm duy nhất để sửa trước, ${ctx.rolePhrase}. Làm xong một việc nhỏ đúng chuẩn sẽ tạo đà cho các việc sau.`,
        35,
      ),
      evidence: trimWords(preScan.criteria[weakCriteria[0] ?? "logo"]?.evidence ?? "Dựa trên kết quả 5 trạm.", 30),
      action: trimWords("Chọn một điểm chạm và đặt hạn hoàn thành trong 7 ngày.", 22),
    },
  });

  const picked: AiInsight[] = [];
  const usedTitles = new Set<string>();
  for (const item of pool) {
    if (picked.length >= 3) break;
    if (usedTitles.has(item.insight.title)) continue;
    usedTitles.add(item.insight.title);
    picked.push(item.insight);
  }
  while (picked.length < 3) {
    const fallback = pool[picked.length % pool.length]!.insight;
    picked.push({ ...fallback, title: trimWords(`${fallback.title} ${picked.length + 1}`, 6) });
  }
  return picked.slice(0, 3);
}

export { wordCount as countWords };
