/** Từ điển ngành tiếng Việt: chấm điểm keyword trên metadata/heading để đoán ngành. */

export interface IndustryRule {
  industry: string;
  keywords: string[];
}

export const INDUSTRY_RULES: IndustryRule[] = [
  {
    industry: "Thực phẩm & Đồ uống",
    keywords: ["thực phẩm", "đồ uống", "cà phê", "trà", "bánh", "nhà hàng", "quán ăn", "ẩm thực", "sữa", "nước mắm", "bia", "rượu", "mì", "gia vị", "f&b", "coffee", "restaurant", "food", "beverage", "bakery"],
  },
  {
    industry: "Bán lẻ & Thương mại điện tử",
    keywords: ["bán lẻ", "cửa hàng", "siêu thị", "shop", "store", "thương mại điện tử", "ecommerce", "mua sắm", "bán hàng", "đại lý", "retail"],
  },
  {
    industry: "Thời trang & Phụ kiện",
    keywords: ["thời trang", "quần áo", "giày", "túi xách", "phụ kiện", "may mặc", "fashion", "clothing", "apparel", "trang sức", "jewelry"],
  },
  {
    industry: "Mỹ phẩm & Làm đẹp",
    keywords: ["mỹ phẩm", "làm đẹp", "skincare", "spa", "thẩm mỹ", "son", "kem", "dưỡng da", "beauty", "cosmetic", "chăm sóc da", "tóc"],
  },
  {
    industry: "Công nghệ & Phần mềm",
    keywords: ["công nghệ", "phần mềm", "software", "saas", "ứng dụng", "app", "công nghệ thông tin", "it", "tech", "giải pháp số", "chuyển đổi số", "ai", "cloud"],
  },
  {
    industry: "Giáo dục & Đào tạo",
    keywords: ["giáo dục", "đào tạo", "trường", "học viện", "khóa học", "học sinh", "sinh viên", "education", "training", "academy", "trung tâm", "gia sư"],
  },
  {
    industry: "Bất động sản",
    keywords: ["bất động sản", "nhà đất", "căn hộ", "dự án", "chung cư", "đất", "real estate", "property", "môi giới", "biệt thự"],
  },
  {
    industry: "Xây dựng & Nội thất",
    keywords: ["xây dựng", "nội thất", "kiến trúc", "thi công", "nhà thầu", "interior", "construction", "architecture", "vật liệu", "tủ", "sofa"],
  },
  {
    industry: "Du lịch & Khách sạn",
    keywords: ["du lịch", "khách sạn", "resort", "tour", "homestay", "nghỉ dưỡng", "travel", "hotel", "vé máy bay", "ẩm thực địa phương"],
  },
  {
    industry: "Y tế & Sức khỏe",
    keywords: ["y tế", "sức khỏe", "bệnh viện", "phòng khám", "nha khoa", "thuốc", "dược", "health", "clinic", "medical", "bác sĩ", "sản phẩm sức khỏe"],
  },
  {
    industry: "Tài chính & Bảo hiểm",
    keywords: ["tài chính", "bảo hiểm", "ngân hàng", "chứng khoán", "vay", "đầu tư", "finance", "insurance", "bank", "fintech", "tiết kiệm"],
  },
  {
    industry: "Logistics & Vận tải",
    keywords: ["logistics", "vận tải", "giao hàng", "kho bãi", "vận chuyển", "shipping", "delivery", "warehouse", "chuỗi cung ứng"],
  },
  {
    industry: "Sản xuất & Công nghiệp",
    keywords: ["sản xuất", "công nghiệp", "nhà máy", "manufacturing", "factory", "máy móc", "thiết bị", "cơ khí", "industrial"],
  },
  {
    industry: "Nông nghiệp & Thực phẩm sạch",
    keywords: ["nông nghiệp", "nông sản", "thực phẩm sạch", "hữu cơ", "organic", "trang trại", "farm", "cây trồng", "chăn nuôi", "thủy sản"],
  },
  {
    industry: "Dịch vụ doanh nghiệp",
    keywords: ["dịch vụ doanh nghiệp", "tư vấn", "b2b", "giải pháp", "outsourcing", "kế toán", "nhân sự", "pháp lý", "consulting", "doanh nghiệp"],
  },
  {
    industry: "Marketing & Truyền thông",
    keywords: ["marketing", "truyền thông", "quảng cáo", "thương hiệu", "branding", "agency", "sáng tạo", "nội dung", "pr", "media", "design"],
  },
  {
    industry: "Giải trí & Truyền thông",
    keywords: ["giải trí", "âm nhạc", "phim", "game", "giải trí số", "entertainment", "music", "movie", "studio", "sự kiện"],
  },
  {
    industry: "Luật & Tư vấn pháp lý",
    keywords: ["luật", "pháp lý", "luật sư", "legal", "law", "tư vấn pháp luật", "công chứng"],
  },
  {
    industry: "Năng lượng & Môi trường",
    keywords: ["năng lượng", "điện mặt trời", "môi trường", "energy", "solar", "tái tạo", "xử lý nước", "green"],
  },
  {
    industry: "Ô tô & Xe máy",
    keywords: ["ô tô", "xe máy", "đại lý xe", "phụ tùng", "garage", "automotive", "car", "motorbike", "xe điện"],
  },
  {
    industry: "Thể thao & Thể hình",
    keywords: ["thể thao", "phòng gym", "fitness", "yoga", "gym", "thể hình", "sport", "dụng cụ thể thao"],
  },
  {
    industry: "Thú cưng",
    keywords: ["thú cưng", "chó", "mèo", "pet", "cửa hàng thú cưng", "phòng khám thú y", "thức ăn cho mèo"],
  },
  {
    industry: "Mẹ & Bé",
    keywords: ["mẹ và bé", "trẻ em", "đồ chơi", "bỉm", "sữa bột", "mầm non", "baby", "kids", "đồ sơ sinh"],
  },
  {
    industry: "Trang trí & Quà tặng",
    keywords: ["trang trí", "quà tặng", "quà tặng doanh nghiệp", "handmade", "đồ lưu niệm", "hoa", "gift", "decor"],
  },
  {
    industry: "Văn phòng phẩm & In ấn",
    keywords: ["văn phòng phẩm", "in ấn", "printing", "stationery", "bao bì", "nhãn mác", "thiết kế in"],
  },
];

/** Bỏ dấu tiếng Việt + lowercase để so khớp keyword ổn định. */
export function normalizeVi(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export interface IndustryInput {
  name?: string;
  title?: string;
  description?: string;
  tagline?: string;
  headings?: string[];
  bodyText?: string;
  metaKeywords?: string;
}

export interface IndustryDetection {
  industry: string;
  matched: string[];
  score: number;
}

/** Chấm điểm theo trường: tên/title/keyword có trọng số cao hơn body. */
export function detectIndustry(input: IndustryInput): IndustryDetection | undefined {
  const fields: { text: string; weight: number }[] = [
    { text: input.name ?? "", weight: 4 },
    { text: input.title ?? "", weight: 3 },
    { text: input.metaKeywords ?? "", weight: 3 },
    { text: input.description ?? "", weight: 2 },
    { text: input.tagline ?? "", weight: 2 },
    { text: (input.headings ?? []).join(" "), weight: 2 },
    { text: input.bodyText ?? "", weight: 1 },
  ].filter((f) => f.text.trim().length > 0);

  let best: IndustryDetection | undefined;
  for (const rule of INDUSTRY_RULES) {
    let score = 0;
    const matched: string[] = [];
    for (const keyword of rule.keywords) {
      const needle = normalizeVi(keyword);
      let hit = false;
      for (const field of fields) {
        const haystack = normalizeVi(field.text);
        if (!hit && haystack.includes(needle)) {
          score += field.weight * (needle.includes(" ") ? 2 : 1);
          hit = true;
        } else if (hit && haystack.includes(needle)) {
          score += Math.floor(field.weight / 2); // xuất hiện ở nhiều trường
        }
      }
      if (hit) matched.push(keyword);
    }
    if (score >= 6 && (!best || score > best.score)) {
      best = { industry: rule.industry, matched: matched.slice(0, 8), score };
    }
  }
  return best;
}
