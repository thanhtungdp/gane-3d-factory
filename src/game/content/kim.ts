import type { PlanetId } from "@/shared/types";

/**
 * Copy phản hồi ngắn của KIM cho gameplay 2.0.
 * Không bán hàng, không nhắc gói dịch vụ, không dùng ký hiệu phần trăm.
 */

const REACTION_HAPPY = "KIM: Chuẩn hướng. Quyết định này giữ thương hiệu đi đúng một trục.";
const REACTION_NEUTRAL = "KIM: Được một phần. Điều còn thiếu là sự dứt khoát, không phải thêm ý tưởng.";
const REACTION_ENCOURAGE = "KIM: Chưa khớp, nhưng đây là chỗ đáng dừng lại. Thử lại bằng câu hỏi gốc.";

/** 2 = vui, 1 = trung tính, 0 = động viên. */
export function kimReaction(points: number): string {
  const safe = Number.isFinite(points) ? points : 0;
  if (safe >= 2) return REACTION_HAPPY;
  if (safe === 1) return REACTION_NEUTRAL;
  return REACTION_ENCOURAGE;
}

type LineBucket = "high" | "mid" | "low";

function bucketFor(score: number): LineBucket {
  if (score >= 8) return "high";
  if (score >= 5) return "mid";
  return "low";
}

const PLANET_LINES: Record<PlanetId, Record<LineBucket, string>> = {
  S: {
    high: "{brand} nhìn thấy tín hiệu thật, không còn đoán theo cảm giác. Nền móng đã rõ.",
    mid: "{brand} đã mở được vài vùng sương. Còn chỗ nên tự soi lại bằng dữ kiện.",
    low: "{brand} vừa nhìn thấy chỗ mình hay tin vào giả định. Đó là khởi đầu đúng.",
  },
  A: {
    high: "{brand} có một trục rõ: sứ mệnh, tầm nhìn và giá trị nói cùng một hướng.",
    mid: "{brand} đã chọn được hướng, nhưng chỗ từ chối vẫn còn mờ. Cần siết thêm.",
    low: "{brand} đang đứng trước nhiều hướng. Việc cần làm là chọn một và bỏ phần còn lại.",
  },
  O: {
    high: "{brand} giữ được bề mặt nhận diện đồng bộ. Khách nhìn vào thấy cùng một thương hiệu.",
    mid: "{brand} có vài bề mặt lệch màu hoặc font. Sửa từ quy chuẩn sẽ bền hơn sửa từng mẫu.",
    low: "{brand} đang để mỗi điểm chạm nói một kiểu. Một bộ quy chuẩn ngắn sẽ giúp thống nhất.",
  },
  K: {
    high: "{brand} đã có thứ tự ra mắt và người nói thay khi có biến. Tín hiệu phát đi rõ ràng.",
    mid: "{brand} ra mắt được, nhưng kịch bản và người phát ngôn còn thiếu chắc.",
    low: "{brand} cần chuẩn bị thứ tự trước khi cất tiếng. Ra mắt vội thường phải làm lại.",
  },
  IM: {
    high: "{brand} giữ được lửa qua thời gian. Nhất quán đang là thói quen của cả đội.",
    mid: "{brand} giữ được phần lớn, nhưng vài tháng đã có chỗ phai. Cần người nhắc và quy chuẩn.",
    low: "{brand} đang phai dần vì mỗi người làm một kiểu. Đưa luật ngắn vào vận hành là việc trước mắt.",
  },
};

/** Một dòng KIM sau khi chấm trạm — dùng cho header/result. */
export function kimPlanetLine(planet: PlanetId, score: number, brandName: string): string {
  const safeScore = Math.max(0, Math.min(10, Number.isFinite(score) ? score : 0));
  const bucket = bucketFor(safeScore);
  const name = brandName.trim() || "thương hiệu của bạn";
  const template = PLANET_LINES[planet][bucket];
  return `${template.replace("{brand}", name)} Điểm trạm: ${safeScore.toFixed(1)}/10.`;
}
