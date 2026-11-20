import type { Offer, PlanetId, RunResult, ServicePackage, WeakStep } from "./types";
import { PLANET_META, PLANET_ORDER } from "./planets";

/** Catalog gói thật — lấy từ saokim-os/scripts/seed.ts. Sửa ở đây là sửa toàn hệ thống. */
export const SERVICE_PACKAGES: Record<string, ServicePackage> = {
  audit: { key: "brand_audit", name: "Brand audit", price: "25–50 triệu" },
  strategy: { key: "brand_strategy", name: "Chiến lược thương hiệu", price: "120–300 triệu" },
  identity: { key: "brand_identity", name: "Nhận diện thương hiệu", price: "80–200 triệu" },
  guideline: { key: "brand_guideline", name: "Brand guideline", price: "40–80 triệu" },
  marcom: { key: "marcom", name: "Marcom", price: "Theo chiến dịch" },
  profile: { key: "profile", name: "Profile / Brochure", price: "30–70 triệu" },
  design: { key: "design_request", name: "Design request", price: "8–20 triệu/tháng" },
  care: { key: "website_care", name: "Website care", price: "3–8 triệu/tháng" },
};

function offer(
  code: string,
  name: string,
  tagline: string,
  packageKeys: (keyof typeof SERVICE_PACKAGES)[],
  outcomes: string[],
): Offer {
  const packages = packageKeys.map((k) => SERVICE_PACKAGES[k]!);
  return {
    code,
    name,
    tagline,
    why: "",
    packages,
    priceLine: packages.map((p) => `${p.name}: ${p.price}`).join(" · "),
    outcomes,
  };
}

const BASE_OFFERS: Record<string, Offer> = {
  foundation: offer(
    "foundation",
    "Gói Nền tảng",
    "Xây trên sự thật, không trên giả định",
    ["audit", "strategy"],
    [
      "Một bản chẩn đoán đối chiếu với đối thủ và khách hàng thật",
      "Tuyên bố định vị đủ rõ để đội sale dùng hằng ngày",
      "Bản đồ ưu tiên: làm gì trước, bỏ gì lại",
    ],
  ),
  identity: offer(
    "identity",
    "Gói Nhận diện",
    "Một hệ thống nhìn thấy được, dùng được",
    ["identity", "guideline"],
    [
      "Logo và bộ nhận diện dùng được trên 6 bề mặt",
      "Bộ quy chuẩn để đội thiết kế, in ấn và đối tác cùng làm đúng",
      "Một lần đầu tư thay cho nhiều lần sửa vặt",
    ],
  ),
  launch: offer(
    "launch",
    "Gói Ra mắt",
    "Ra mắt như một sự kiện, không như một thông báo",
    ["marcom", "profile"],
    [
      "Kế hoạch ra mắt 30 ngày với thông điệp xuyên suốt",
      "Bộ nội dung cho kênh sở hữu, social và PR",
      "Kịch bản xử lý khủng hoảng trước khi cần đến",
    ],
  ),
  operate: offer(
    "operate",
    "Gói Vận hành",
    "Giữ lửa sau ngày ra mắt",
    ["guideline", "design", "care"],
    [
      "Bộ chuẩn để nhân viên mới làm đúng mà không cần hỏi",
      "Nguồn thiết kế theo tháng cho các điểm chạm thường xuyên",
      "Website được giữ ổn định và cập nhật",
    ],
  ),
  launchOperate: offer(
    "launch_operate",
    "Gói Ra mắt & Vận hành",
    "Từ ngày cất tiếng đến nhịp chạy đều",
    ["marcom", "guideline", "design", "care"],
    [
      "Một kế hoạch ra mắt gắn với hệ thống giữ nhất quán",
      "Nội dung và thiết kế không lệch nhau giữa các kênh",
      "Có người chịu trách nhiệm cho từng điểm chạm",
    ],
  ),
  accelerate: offer(
    "accelerate",
    "Gói Tăng tốc",
    "Nhìn đúng và nói đúng, cùng một lúc",
    ["identity", "guideline", "marcom", "profile"],
    [
      "Hệ thống nhận diện đi kèm kế hoạch ra mắt",
      "Bộ ấn phẩm đủ để đội sale mang đi gặp khách",
      "Một câu chuyện thương hiệu dùng được ở mọi kênh",
    ],
  ),
  full: offer(
    "full",
    "Gói Trọn bộ SAOKIM",
    "Đi trọn 5 trạm với một đội",
    ["audit", "strategy", "identity", "guideline", "marcom", "profile", "design", "care"],
    [
      "Một đội đi cùng từ chẩn đoán đến vận hành",
      "Không đứt đoạn giữa chiến lược, nhận diện và ra mắt",
      "Lộ trình 12 tháng thay vì từng dự án rời",
    ],
  ),
  companion: offer(
    "companion",
    "Gói Đồng hành",
    "Thương hiệu đã sáng — giữ cho nó không tối đi",
    ["guideline", "design", "care"],
    [
      "Hệ thống chuẩn được cập nhật khi bạn mở rộng",
      "Đội thiết kế theo tháng cho nhu cầu thường xuyên",
      "Một nhịp kiểm tra định kỳ để không trôi",
    ],
  ),
};

const SINGLE: Record<PlanetId, Offer> = {
  S: BASE_OFFERS.foundation!,
  A: BASE_OFFERS.foundation!,
  O: BASE_OFFERS.identity!,
  K: BASE_OFFERS.launch!,
  IM: BASE_OFFERS.operate!,
};

function withWhy(o: Offer, weak: WeakStep[], result: RunResult): Offer {
  const names = weak.map((w) => `${PLANET_META[w.planet].letter} — ${PLANET_META[w.planet].stepVi} (${w.score.toFixed(1)}/10)`);
  const strong = PLANET_ORDER.filter((id) => (result.planets[id]?.score ?? 0) >= 7);
  const strongLine = strong.length
    ? `Bạn đang làm tốt ${strong.map((id) => PLANET_META[id].letter).join(", ")} — giữ nguyên phần đó.`
    : "Bạn chưa có trạm nào thật sự vững; đi từ gốc sẽ nhanh hơn sửa ngọn.";

  return {
    ...o,
    why: `${names.length ? `Điểm yếu nằm ở ${names.join(" và ")}.` : ""} ${strongLine} Gói này tập trung đúng vào phần đang giữ thương hiệu của bạn lại phía sau.`,
  };
}

function uniqOffers(list: Offer[]): Offer[] {
  const seen = new Set<string>();
  return list.filter((o) => {
    if (seen.has(o.code)) return false;
    seen.add(o.code);
    return true;
  });
}

/**
 * Quy tắc map điểm → gói. Thứ tự ưu tiên ghi ở docs/04-scoring-offers.md §5.
 * Trả về tối đa 2 gói: gói chính trước, gói kết hợp sau.
 */
export function recommendOffers(result: RunResult, weak: WeakStep[]): Offer[] {
  const scores = result.planets;
  const weakIds = weak.map((w) => w.planet);
  const weakCount = weakIds.length;
  const allStrong = PLANET_ORDER.every((id) => (scores[id]?.score ?? 0) >= 8);

  if (weakCount >= 3 || result.overall < 5) {
    return [withWhy(BASE_OFFERS.full!, weak, result)];
  }
  if (allStrong) {
    return [withWhy(BASE_OFFERS.companion!, weak, result)];
  }

  const set = new Set(weakIds);
  if (set.has("S") && set.has("A")) {
    return [withWhy(BASE_OFFERS.foundation!, weak, result)];
  }
  if (set.has("O") && set.has("K")) {
    return [withWhy(BASE_OFFERS.accelerate!, weak, result)];
  }
  if (set.has("K") && set.has("IM")) {
    return [withWhy(BASE_OFFERS.launchOperate!, weak, result)];
  }

  const primaryId = weakIds[0];
  const secondaryId = weakIds[1];
  const list: Offer[] = [];
  if (primaryId) list.push(SINGLE[primaryId]);
  if (secondaryId && SINGLE[secondaryId].code !== SINGLE[primaryId!].code) {
    list.push(SINGLE[secondaryId]);
  }
  return uniqOffers(list).map((o) => withWhy(o, weak, result));
}
