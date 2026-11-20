import { CONSENT_VERSION } from "@/shared/types";

export const PRIVACY = {
  version: CONSENT_VERSION,
  title: "Thông báo thu thập và xử lý dữ liệu cá nhân",
  updatedAt: "11/2026",
  intro:
    "Sao Kim Branding tôn trọng dữ liệu của bạn. Thông báo này giải thích chúng tôi thu thập gì, để làm gì, lưu bao lâu và bạn có những quyền gì theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.",
  sections: [
    {
      title: "1. Chúng tôi thu thập gì",
      body: "Thông tin công khai trên website doanh nghiệp bạn nhập (tên, logo, bảng màu, mô tả, liên kết mạng xã hội); câu trả lời của bạn trong game; và — chỉ khi bạn chủ động gửi để nhận báo cáo đầy đủ — tên, số điện thoại hoặc email, chức danh, quy mô doanh nghiệp.",
    },
    {
      title: "2. Để làm gì",
      body: "Tạo brand kit và báo cáo cá nhân hóa cho phiên chơi của bạn; đề xuất gói dịch vụ phù hợp; liên hệ tư vấn nếu bạn đồng ý; cải thiện trải nghiệm game. Chúng tôi không bán dữ liệu của bạn.",
    },
    {
      title: "3. Lưu bao lâu",
      body: "Dữ liệu phiên chơi và báo cáo được lưu tối đa 180 ngày. Dữ liệu liên hệ được lưu đến khi bạn rút đồng ý hoặc yêu cầu xoá. Bạn có thể yêu cầu xoá bất kỳ lúc nào qua email bên dưới.",
    },
    {
      title: "4. Chia sẻ với ai",
      body: "Chỉ đội ngũ Sao Kim Branding và nhà cung cấp hạ tầng cần thiết để vận hành (lưu trữ, gửi email). Không chuyển cho bên thứ ba vì mục đích quảng cáo.",
    },
    {
      title: "5. Quyền của bạn",
      body: "Bạn có quyền được biết, truy cập, chỉnh sửa, xoá, hạn chế xử lý, phản đối xử lý, rút lại sự đồng ý và khiếu nại theo Nghị định 13/2023/NĐ-CP.",
    },
    {
      title: "6. Liên hệ",
      body: "Sao Kim Branding · hello@saokim.vn · [địa chỉ pháp nhân cập nhật sau khi pháp chế duyệt].",
    },
  ],
  consentLabel:
    "Tôi đã đọc thông báo trên và đồng ý để Sao Kim Branding xử lý dữ liệu của tôi cho mục đích nhận báo cáo và liên hệ tư vấn.",
  marketingLabel:
    "Tôi muốn nhận thêm nội dung về xây dựng thương hiệu từ Sao Kim Branding (không bắt buộc).",
  representativeLabel:
    "Tôi là đại diện của thương hiệu này và có quyền nhận báo cáo thương hiệu của doanh nghiệp.",
  representativeHint:
    "Chúng tôi chỉ mở báo cáo đầy đủ cho người đại diện hợp pháp hoặc người được uỷ quyền của thương hiệu.",
} as const;
