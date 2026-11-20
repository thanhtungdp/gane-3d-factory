# Report outline — {{game_title}} / {{brand_name}}

> Artifact của skill `brand-report-gate`. Điền theo kết quả chơi thật + pre-scan evidence. Không bịa số, không giá trước gate.

## 0. Metadata

| Trường | Giá trị |
|---|---|
| `report_id` | `{{report_id}}` |
| `created_at` | `{{iso_time}}` |
| `session_id` | `{{session_id}}` |
| `ai_source` | {{ai \| template}} |
| `offer_unlocked` | {{false cho tới khi gate hợp lệ}} |
| Gói chính (teaser) | {{offer_name}} — chỉ tên, chưa giá |

## 1. Báo cáo ungated — trả giá trị trước

| Khối | Nội dung | Ghi chú |
|---|---|---|
| Tổng quan | {{overall}}/10 · {{title}} · {{stars}} sao | dùng X/10, không dùng ký hiệu phần trăm |
| Blurb | {{title_blurb ≤140 ký tự}} | viết sẵn trong catalog danh hiệu |
| Radar | {{n}} act, điểm từng act | trạm/act yếu hiển thị khác trạm mạnh |
| 2 act yếu | {{act_a}} + {{act_b}} | kèm evidence + hệ quả kinh doanh |
| Badge | {{badge_list}} | chỉ hiện badge đã đạt |
| CTA | "Mở khoá bản đầy đủ" + "Để sau" + share | không chặn người chơi |

**Bắt buộc:** không bảng giá, không form, không CTA mua, không insight dài ở phần này.

## 2. Gate — điều kiện và form

- Điều kiện mở: người chơi đã thấy báo cáo ungated và **chủ động bấm** "Mở khoá bản đầy đủ".
- Form tối thiểu: `{{name_field}}`, `{{phone_or_email}}`, checkbox đại diện, checkbox consent, checkbox marketing (tuỳ chọn, mặc định tắt).
- Consent: `{{consent_version}}`, `{{consent_text}}`, link privacy `{{privacy_url}}`.
- Nút chính: `{{unlock_cta}}`; nút phụ: `{{later_cta}}`.
- Honeypot ẩn `{{honeypot_field}}` phải rỗng.

## 3. Báo cáo gated — chỉ sau gate hợp lệ

### 3.1 Insight (đúng 3)

| # | Title ≤70 ký tự | Body ≤2 câu | Evidence | Action ≤30 ngày |
|---|---|---|---|---|
| 1 | {{title_1}} | {{body_1}} | {{evidence_1}} | {{action_1}} |
| 2 | {{title_2}} | {{body_2}} | {{evidence_2}} | {{action_2}} |
| 3 | {{title_3}} | {{body_3}} | {{evidence_3}} | {{action_3}} |

Không nhắc tên offer, không hứa kết quả, không số liệu bịa, không giá.

### 3.2 Offer map

| Thứ tự | Offer | Vì sao (từ dữ liệu người chơi) | Thành phần | Khoảng giá tham khảo |
|---|---|---|---|---|
| 1 | {{offer_name}} | {{why}} | {{packages}} | {{price_range}} |
| 2 (tuỳ chọn) | {{offer_name_2}} | {{why_2}} | {{packages_2}} | {{price_range_2}} |

Tối đa 2 offer; gói chính đứng trước. Giá chỉ hiển thị khi cờ cấu hình cho phép và **sau gate**; nếu không, hiển thị "Liên hệ để nhận báo giá".

### 3.3 CTA sau báo cáo

- Tải PDF: `{{pdf_cta}}` (token, hết hạn `{{ttl}}`).
- Đặt lịch: `{{booking_cta}}` → `{{booking_url}}`.
- Nhận báo giá: `{{quote_cta}}`.
- Share 9:16: `{{share_cta}}` (không PII).
- Leaderboard: `{{leaderboard_cta}}` (alias, ẩn danh mặc định).

## 4. PDF (3 trang)

1. Bìa: brand, logo, overall, danh hiệu, ngày.
2. Radar + điểm từng act + 2 act yếu + hệ quả.
3. Insight + offer + CTA + QR; font tiếng Việt đủ dấu; lỗi font vẫn tạo file.

## 5. Share 9:16

- Có: brand, logo, overall, danh hiệu, badge/radar rút gọn.
- Không: tên người chơi, SĐT, email, report id nhạy cảm.

## 6. Leaderboard

- Alias tự đặt; mặc định ẩn danh; theo ngành; top 20 + hạng của mình; không hiện PII.

## 7. CRM payload (sau gate)

| Trường | Giá trị |
|---|---|
| `status` | `{{new}}` |
| `offer_code` / `offer_name` | {{...}} |
| `overall` | {{overall}} |
| `industry` | {{industry}} |
| `company_size` / `role` | {{answers}} |
| `consent_version` | {{version}} |
| `marketing_opt_in` | {{true/false}} |

## 8. Analytics

`report_view` → `gate_view` → `lead_submit` / `lead_fail` → `lead_success` → `pdf_download` / `booking_click` / `share_click` / `leaderboard_submit`. Không gửi PII.

## 9. Trường hợp biên

- [ ] Bỏ qua act: điểm 0, ghi "chưa quyết" thay vì "yếu".
- [ ] Tất cả điểm thấp: offer trọn bộ; không làm người chơi xấu hổ.
- [ ] Tất cả điểm cao: offer duy trì/đồng hành; không bịa thêm lỗi.
- [ ] Pre-scan lỗi: báo cáo ghi rõ "chưa có dữ liệu quét"; dùng neutral.
- [ ] PDF lỗi: retry 1 lần, fallback gửi email qua outbox.
- [ ] Mất mạng khi submit: giữ form, cho thử lại, không mất dữ liệu đã nhập.
