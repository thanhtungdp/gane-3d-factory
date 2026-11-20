# Offer map — {{game_title}}

> Artifact của skill `brand-report-gate`. Map **điểm yếu + evidence** sang offer, chỉ hiển thị sau lead gate. Không tự thêm offer ngoài catalog.

## 1. Catalog đầu vào

| Mã | Tên | Outcome (một câu) | Khoảng giá tham khảo | Điều kiện hiển thị giá |
|---|---|---|---|---|
| `{{offer_code}}` | {{offer_name}} | {{outcome}} | {{price_range}} | {{sau gate / luôn ẩn / theo cờ}} |
| `{{offer_code}}` | {{offer_name}} | {{outcome}} | {{price_range}} | {{...}} |
| `{{offer_code}}` | {{offer_name}} | {{outcome}} | {{price_range}} | {{...}} |

## 2. Luật map (theo thứ tự ưu tiên, dừng ở điều kiện đầu tiên khớp)

| Ưu tiên | Điều kiện | Offer trả về | Lý do |
|---|---|---|---|
| 1 | Số act yếu ≥3 **hoặc** tổng <5 | `{{full_offer}}` | quá nhiều lỗ hổng, làm từng phần sẽ đứt đoạn |
| 2 | Mọi act ≥8 | `{{companion_offer}}` | nền đã vững, cần giữ nhịp |
| 3 | Cặp yếu = ({{act_a}}, {{act_b}}) | `{{paired_offer}}` | hai act cùng gốc vấn đề |
| 4 | Cặp yếu khác có luật riêng | `{{paired_offer_2}}` | cùng một câu chuyện |
| 5 | Cặp còn lại | Offer đơn theo từng act, khử trùng | mỗi act một hướng |
| 6 | Không xác định được | `{{fallback_offer}}` | an toàn, không hứa quá |

Tối đa **2 offer**: gói chính trước, gói bổ trợ sau. Không lặp cùng một mã.

## 3. Câu `why` (sinh tự động)

Cấu trúc:

1. "Điểm yếu nằm ở {act_1} ({score}/10) và {act_2} ({score}/10)." — chỉ dùng điểm thật.
2. "Bạn đang làm tốt {act_mạnh} — giữ nguyên phần đó." — nếu có act ≥7; nếu không: "Chưa có act nào thật vững; đi từ gốc sẽ nhanh hơn sửa ngọn."
3. "Offer này tập trung đúng vào phần đang giữ thương hiệu của bạn lại phía sau." — câu nối, không số liệu.

Không viết tay số liệu ngoài report; không nhắc khách hàng/đối thủ/benchmark.

## 4. Quy tắc hiển thị

- **Trước gate:** chỉ tên offer chính (teaser) + một câu `why`; không thành phần, không giá, không CTA mua.
- **Sau gate:** bảng thành phần + khoảng giá tham khảo + outcome + CTA đặt lịch/báo giá.
- Giá luôn ghi "khoảng tham khảo, báo giá qua tư vấn"; không hứa giảm giá, không bịa %.
- Không dùng ký hiệu phần trăm; dùng X/10, n/5, x/100.

## 5. Kiểm tra trước handoff

- [ ] Offer map chỉ dùng mã trong catalog.
- [ ] Tối đa 2 offer; gói chính đứng trước; không trùng.
- [ ] `why` được sinh từ report, không copy marketing.
- [ ] Không giá trước gate; không offer nào xuất hiện trong màn chơi.
- [ ] Có CTA "nhận báo giá" nếu cờ hiển thị giá tắt.
- [ ] Offer name/price khớp catalog tại thời điểm tạo báo cáo.
