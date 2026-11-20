import type { AiInsight, BrandProfile, PlanetId, PreScan, ProfileAnswers, RunResult } from "./types";
import { PLANET_META } from "./planets";

const SIZE_LABEL: Record<ProfileAnswers["companySize"], string> = {
  "1-5": "dưới 5 người",
  "6-20": "6–20 người",
  "21-50": "21–50 người",
  "51-200": "51–200 người",
  "200+": "trên 200 người",
};

const ROLE_LABEL: Record<ProfileAnswers["role"], string> = {
  founder: "người sáng lập",
  cmo: "giám đốc marketing",
  brand: "người phụ trách thương hiệu",
  other: "người ra quyết định",
};

const TEMPLATES: Record<PlanetId, { title: string; body: string; action: string }[]> = {
  S: [
    {
      title: "Bạn đang đoán thay vì biết",
      body: "{brand} đang ra quyết định thương hiệu trên những mảnh dữ liệu rời. Tín hiệu “{evidence}” cho thấy chưa có một vòng quét đủ rộng trước khi chi tiền.",
      action: "Dành 90 phút rà đủ 4 vùng: nội tại, thị trường, đối thủ, nhận diện.",
    },
    {
      title: "Chưa có điểm xuất phát",
      body: "Một cuộc kiểm toán không phải để tìm lỗi, mà để biết {brand} đang đứng ở đâu. Hiện tại bạn chưa có tấm bản đồ đó.",
      action: "Ghi lại 5 giả định lớn nhất về khách hàng và kiểm chứng từng cái.",
    },
  ],
  A: [
    {
      title: "Khác biệt chưa được chọn",
      body: "Ở ngành {industry}, {brand} chưa nói rõ mình từ chối điều gì. Khi mọi thứ đều là điểm mạnh, khách chỉ còn cách so sánh bạn bằng giá.",
      action: "Viết một câu định vị 12 từ, rồi kiểm tra đội sale có dùng đúng câu đó.",
    },
    {
      title: "Định vị chưa thành lựa chọn",
      body: "Một định vị tốt là một lời từ chối. {brand} đang cố phục vụ nhiều nhóm khách cùng lúc, nên không nhóm nào thấy mình được nói tới.",
      action: "Chọn một nhóm khách chính và bỏ một nhóm khỏi thông điệp 6 tháng.",
    },
  ],
  O: [
    {
      title: "Nhận diện chưa thành hệ thống",
      body: "Logo sống trên nhiều bề mặt hơn một file thiết kế. Tín hiệu “{evidence}” cho thấy bộ nhận diện chưa đủ chuẩn để người khác làm đúng.",
      action: "Chốt 3 biến thể logo, 4 màu, 2 font và một template văn bản.",
    },
    {
      title: "Mỗi bề mặt một kiểu",
      body: "Khi {brand} xuất hiện khác nhau trên danh thiếp, biển hiệu và fanpage, khách phải học lại bạn mỗi lần gặp.",
      action: "Kiểm tra 6 bề mặt thường gặp và sửa chỗ lệch rõ nhất trước.",
    },
  ],
  K: [
    {
      title: "Tiếng nói chưa có nhịp",
      body: "{brand} có thể đang ra mắt như một thông báo, không phải một sự kiện. Không có kịch bản, khủng hoảng sẽ tự viết kịch bản thay bạn.",
      action: "Lập timeline 30 ngày và chỉ định một người phát ngôn duy nhất.",
    },
    {
      title: "Chưa có người giữ tiếng nói",
      body: "Khi mọi người đều có thể trả lời thay {brand}, không ai thật sự đại diện cho bạn. Tín hiệu “{evidence}” cho thấy kênh chính thức còn mờ.",
      action: "Chốt một người phát ngôn và một quy trình duyệt phát ngôn 3 bước.",
    },
  ],
  IM: [
    {
      title: "Lửa đang tắt dần",
      body: "Mỗi nhân viên mới là một lần thương hiệu bị làm lại. Không có quy trình, {brand} sẽ mạnh ở ngày ra mắt và nhạt dần sau đó.",
      action: "Tạo checklist duyệt nội dung 5 dòng và đưa vào onboarding.",
    },
    {
      title: "Nhất quán là việc của hệ thống",
      body: "Đừng trông vào việc mọi người tự nhớ. {brand} cần template, quyền duyệt và một nhịp kiểm tra định kỳ.",
      action: "Đặt lịch rà soát thương hiệu mỗi quý, có người chịu trách nhiệm.",
    },
  ],
};

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length]!;
}

function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

function evidenceFor(planet: PlanetId, preScan: PreScan): string {
  const map: Partial<Record<PlanetId, keyof PreScan["criteria"]>> = {
    S: "logo",
    A: "slogan",
    O: "color",
    K: "social",
    IM: "mobile",
  };
  const key = map[planet];
  if (!key) return "chưa đủ dữ liệu để đối chiếu";
  const c = preScan.criteria[key];
  if (!c) return "chưa đủ dữ liệu để đối chiếu";
  return c.evidence.length > 64 ? `${c.evidence.slice(0, 61)}…` : c.evidence;
}

/**
 * 3 insight template deterministic — dùng khi không có AI key hoặc AI lỗi.
 * Không số liệu bịa, không %, không giá, không đảm bảo.
 */
export function templateInsights(
  brand: BrandProfile,
  preScan: PreScan,
  answers: ProfileAnswers,
  result: RunResult,
): AiInsight[] {
  const vars = {
    brand: brand.name,
    industry: brand.industry?.toLowerCase() || "của bạn",
    evidence: "",
    size: SIZE_LABEL[answers.companySize],
    role: ROLE_LABEL[answers.role],
  };

  const weak = result.weak.length ? result.weak : (["S", "IM"] as PlanetId[]);
  const first = weak[0]!;
  const second = weak[1] ?? (first === "IM" ? "S" : "IM");
  const strongest = [...(Object.keys(result.planets) as PlanetId[])].sort(
    (a, b) => (result.planets[b]?.score ?? 0) - (result.planets[a]?.score ?? 0),
  )[0];

  const t1 = pick(TEMPLATES[first], `${brand.name}:${first}`);
  const t2 = pick(TEMPLATES[second], `${brand.name}:${second}`);
  const sig = preScan.signals.find((s) => s.severity === "gap") ?? preScan.signals[0];
  const evidence = sig?.evidence ?? evidenceFor(first, preScan);

  return [
    {
      title: t1.title,
      body: fill(t1.body, { ...vars, evidence }),
      evidence: `${PLANET_META[first].letter} · ${PLANET_META[first].stepVi} — ${(result.planets[first]?.score ?? 0).toFixed(1)}/10`,
      action: t1.action,
    },
    {
      title: t2.title,
      body: fill(t2.body, { ...vars, evidence: evidenceFor(second, preScan) }),
      evidence: strongest
        ? `Mạnh nhất hiện tại: ${PLANET_META[strongest].letter} — ${(result.planets[strongest]?.score ?? 0).toFixed(1)}/10`
        : `Hai vùng cần chú ý: ${PLANET_META[first].letter} và ${PLANET_META[second].letter}`,
      action: t2.action,
    },
    {
      title:
        answers.companySize === "1-5" || answers.companySize === "6-20"
          ? "Đừng thuê một đội — hãy chốt một người"
          : "Quy mô đang là phép thử của nhất quán",
      body:
        answers.companySize === "1-5" || answers.companySize === "6-20"
          ? `Với ${SIZE_LABEL[answers.companySize]}, ${brand.name} không cần một phòng brand. Cần một ${ROLE_LABEL[answers.role]} giữ chuẩn và một bộ template đủ dùng.`
          : `Với ${SIZE_LABEL[answers.companySize]}, mỗi phòng ban là một phiên bản của ${brand.name}. Không có quy trình duyệt, quy mô càng lớn thương hiệu càng loãng.`,
      evidence: sig ? `Tín hiệu từ website: ${sig.title}` : "Dữ liệu từ hành trình chơi của bạn",
      action:
        answers.companySize === "1-5" || answers.companySize === "6-20"
          ? "Chọn một người sở hữu thương hiệu và giao quyền duyệt cuối."
          : "Đưa brand guideline vào onboarding và gắn quyền duyệt vào quy trình nội dung.",
    },
  ];
}
