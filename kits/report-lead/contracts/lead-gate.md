# Contract — `lead-gate.md`

Hợp đồng cho form consent/lead, điều kiện mở báo cáo đầy đủ, token PDF và bàn giao CRM. Checklist review: [lead gate checklist](../../../.dsh/skills/brand-report-gate/references/lead-gate-checklist.md).

## Điều kiện mở gate

- Người chơi đã xem báo cáo ungated và **chủ động** bấm "Mở khoá bản đầy đủ".
- Không auto-mở form, không bắt buộc nhập trước khi chơi, luôn có "Để sau".
- Form chỉ xuất hiện sau khi có value (điểm, radar, 2 act yếu + evidence).

## Input

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `session_id` | string | Có | Phiên chơi đã có báo cáo |
| `report_id` | string | Có | Báo cáo thuộc đúng session |
| `name` | string | Có | 2–120 ký tự |
| `phone` | string? | Một trong hai | Định dạng nội địa/quốc tế; chuẩn hoá trước khi lưu |
| `email` | string? | Một trong hai | Regex hợp lệ; ≤160 ký tự |
| `is_representative` | `true` | Có | Bắt buộc `true`; lưu dạng boolean |
| `consent` | `true` | Có | Bắt buộc `true`; gắn `consent_version` |
| `marketing_opt_in` | boolean | Không | Mặc định `false`; tách khỏi consent |
| `website` (honeypot) | string | Không | Phải rỗng; nếu khác rỗng → từ chối im lặng |

## Server xử lý

1. Validate lại toàn bộ; không tin client.
2. Kiểm `report_id` tồn tại và `session_id` khớp; lỗi rõ cho người dùng.
3. Lưu lead với `status` mặc định (`new`) + snapshot: `offer_code`, `offer_name`, `overall`, `industry`, `company_size`, `role`.
4. Lưu `consent_version` + thời điểm; `marketing_opt_in` riêng; IP chỉ hash + salt; không log PII.
5. Cấp token PDF HMAC: payload `{report_id, exp}`; TTL mặc định 7 ngày; route PDF kiểm token trước khi render.
6. Trả `{ ok, pdf_url, offer_unlocked }`; client mở khoá ngay, không reload.
7. Đẩy lead vào outbox CRM (nếu cấu hình): HMAC SHA-256, retry backoff, dead-letter; không mất lead khi webhook lỗi.
8. Ghi event `lead_submit` → `lead_success`/`lead_fail` (không PII).

## Lưu trữ & quyền

| Hạng mục | Quy tắc |
|---|---|
| Dữ liệu tối thiểu | Tên + một contact + 2 checkbox; không bắt địa chỉ/công ty/ngân sách |
| Consent | Chủ động, mặc định tắt; version + thời điểm; marketing riêng |
| Retention | Nêu trong privacy; có đầu mối yêu cầu xoá |
| IP | Chỉ hash + salt, không lưu thô |
| Log/analytics | Không PII; không log body form |
| PDF/share/leaderboard | Không PII; token không đoán được |

## Trạng thái CRM

`new → contacted → qualified → booked → booking_confirmed`; nhánh `lost` có lý do. SLA và người chịu trách nhiệm do `game-launch-kpi` chốt.

## Lỗi & fallback

| Tình huống | Xử lý |
|---|---|
| Thiếu tên / thiếu contact | Lỗi tại trường, giữ dữ liệu đã nhập |
| Thiếu consent/đại diện | Không submit; thông báo rõ, không shaming |
| Honeypot bị điền | Từ chối im lặng; không gợi ý |
| Report không khớp session | 400 rõ ràng; không tạo lead |
| Mất mạng khi submit | Giữ form; cho thử lại; không mất dữ liệu |
| PDF lỗi/timeout | Retry 1 lần; vẫn lỗi → hẹn gửi email + ghi outbox |
| Rate limit | 429 với thông báo chờ; không mất dữ liệu form |

## Validation

- [ ] Không thể xem offer/giá/PDF trước khi gate hợp lệ.
- [ ] Consent + đại diện bắt buộc, lưu version; marketing tuỳ chọn tắt mặc định.
- [ ] Server validate độc lập; honeypot; rate limit.
- [ ] Lead có status + snapshot KPI; outbox retry/dead-letter; CSV escape.
- [ ] Token PDF HMAC có hạn, gắn đúng report; không PII.
- [ ] Event funnel đủ; log/analytics sạch PII; PDF/share/leaderboard không lộ PII.
