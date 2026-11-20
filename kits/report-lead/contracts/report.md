# Contract — `report.md`

Hợp đồng object `report` trả về từ server và render ở client. Artifact theo mẫu [report-outline](../../../.dsh/skills/brand-report-gate/templates/report-outline.md).

## Cấu trúc

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | string | Có | Khó đoán; dùng cho link share/PDF; không chứa PII |
| `created_at` | ISO-8601 | Có | Thời điểm tạo |
| `brand` | object | Có | Theo [brand-kit contract](../../brand-crawl/contracts/brand-kit.md) |
| `pre_scan` | object | Có | Theo [pre-scan contract](../../brand-crawl/contracts/pre-scan.md) |
| `answers` | object | Có | `company_size`, `role`; chỉ dùng cho insight/CTA |
| `result` | object | Có | Điểm tổng, title, stars, planets/acts, weak, badges |
| `weaknesses` | array | Có | 2 act yếu + evidence + hệ quả + offer gợi ý |
| `insights` | array | Có | Đúng 3 phần tử |
| `ai_source` | `ai` \| `template` | Có | Cho biết nguồn insight |
| `offers` | array | Có | 0–2 offer; chỉ hiển thị chi tiết sau gate |
| `teaser_offer` | string | Có | Tên offer chính cho bản ungated; không giá |
| `industry_rank` / `industry_total` | number? | Không | Chỉ khi bật leaderboard |

### `result`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `overall` | number 0–10 | 1 số lẻ; tính từ trọng số act |
| `title` | string | Từ catalog danh hiệu; không tự đặt |
| `title_blurb` | string | 1 câu, ≤140 ký tự |
| `stars` | number 0–5 | Bước 0,5 |
| `planets` / `acts` | map | Điểm từng act + `decisions`; act bỏ qua = 0 |
| `weak` | string[] | 2 act thấp nhất, tie-break theo thứ tự act |
| `badges` | string[] | Act đạt ngưỡng badge |
| `completed_at` | ISO-8601 | |

### `weaknesses[]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `act` | string | Mã act |
| `score` | number 0–10 | Khớp result |
| `consequence` | string | Hệ quả kinh doanh, từ catalog; không bịa |
| `evidence` | string? | Từ pre-scan; không có thì bỏ |
| `package_name` | string | Offer gợi ý (tên, không giá) |

### `insights[]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `title` | string | ≤70 ký tự, ≤6 từ nếu dùng AI validation |
| `body` | string | ≤2 câu, ≤220 ký tự |
| `evidence` | string | Trích pre-scan hoặc điểm act; không số liệu bịa |
| `action` | string | 1 việc làm được trong 30 ngày, ≤120 ký tự |

### `offers[]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `code` | string | Khớp catalog |
| `name` | string | Khớp catalog |
| `tagline` | string | 1 câu, không hứa kết quả |
| `why` | string | Sinh từ dữ liệu report: 2 act yếu + act mạnh |
| `packages` | array | `{ key, name, price }`; giá là khoảng tham khảo |
| `price_line` | string | Chuỗi hiển thị sau gate; không dùng trước gate |
| `outcomes` | string[] | 3 outcome cụ thể, không bịa |

## Bất biến

1. Server **tính lại điểm** từ decisions + pre-scan; chỉ giữ điểm client trong ngưỡng bonus hợp lệ.
2. Báo cáo ungated chỉ gồm: overall, title/blurb, stars, radar, 2 act yếu + hệ quả, badges, teaser offer (tên). Không insight dài, không giá, không form.
3. Báo cáo gated gồm: 3 insight, offer chi tiết + giá tham khảo, PDF, booking/quote, share, leaderboard.
4. Không có PII (tên/SĐT/email/lead) trong object report; contact chỉ nằm ở bảng lead.
5. Không dùng ký hiệu phần trăm trong bất kỳ copy hiển thị; dùng X/10, n/5, x/100.
6. `ai_source = template` khi không có AI key/lỗi/timeout/JSON sai; không bao giờ để insight rỗng.
7. Act bỏ qua ghi "chưa quyết", không ghi "yếu".

## Validation

- [ ] Đủ field; `overall` = tổng có trọng số (sai số ≤0,1).
- [ ] `weak` đúng 2, tie-break đúng thứ tự act.
- [ ] `insights` đúng 3, qua rule chống bịa (không %, không giá, không bảo đảm).
- [ ] `offers` ≤2, mã khớp catalog, `why` sinh từ report.
- [ ] Không PII trong JSON; không HTML.
- [ ] Bản ungated không render `offers[].packages/price_line`; teaser chỉ tên.
- [ ] PDF token gắn `report.id`; PDF và share không lộ PII.
