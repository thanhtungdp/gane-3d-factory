# 10 — KPI & Đo lường

Tài liệu chốt phễu, định nghĩa event, mục tiêu (ghi rõ là **giả thuyết**), truy vấn SQL, trạng thái CRM, SLA sales, dashboard và backlog thử nghiệm. Nguyên tắc: đo cái dẫn tới **lịch tư vấn đã xác nhận**, không đo cho đẹp báo cáo. Chỉ số kỹ thuật ở [07](07-architecture.md) §11, [09](09-mobile-qa.md) §4.

## 1. North star & ràng buộc

- **North star:** số **lịch tư vấn đã xác nhận mỗi tuần** (booking_confirmed, đến từ CRM, không phải click).
- **Chỉ số vệ tinh:** lead đủ điều kiện/tuần; tỉ lệ hoàn thành 5 trạm; tỉ lệ share.
- **Ràng buộc không thoả hiệp:** consent phải đúng 100/100 lead; không dùng dark pattern để tăng lead; không bán/không chia sẻ dữ liệu ngoài mục đích đã nêu; P0 = 0 khi release.
- Mọi mục tiêu dưới đây là **giả thuyết cần kiểm chứng trong 8 tuần**, không phải cam kết. Khi có dữ liệu thật, thay số và ghi ngày cập nhật.

## 2. Phễu & mục tiêu

Đơn vị x/100. Cột "so với landing" là số người còn lại trên 100 người vào landing; cột "so với bước trước" là tỉ lệ chuyển đổi từng bước.

| # | Bước | Event | Mục tiêu so với landing | So với bước trước | Cơ sở giả thuyết |
|---|---|---|---|---|---|
| 0 | Xem intro (chỉ lần đầu) | `intro_view` | — | — | Đo trên lượt mở mới/ép xem; không phải bước bắt buộc, không dùng làm mẫu số landing |
| 0b | Intro → landing | `intro_complete` + `intro_skip` | — | ≥ 90/100 người xem intro | CTA hoặc bỏ qua đều sang landing |
| 1 | Vào landing | `landing_view` | 100 | — | Mốc chuẩn |
| 2 | Bắt đầu (nhập URL/bấm CTA) | `scan_start` | 35,0 | 35/100 | Landing 3D + lời hứa 8 phút; dưới 25/100 phải sửa headline |
| 3 | Crawl xong | `scan_success` | 33,0 | 94/100 | Fallback nhập tay giữ người chơi |
| 4 | Xác nhận brand kit | `confirm_submit` | 30,0 | 91/100 | Sửa được mọi thứ nên ít bỏ |
| 5 | Bắt đầu chuyến bay | `flight_start` | 28,5 | 95/100 | Chuyến bay 2,9s có skip |
| 6 | Vào trạm S | `planet_enter` (S) | 28,0 | 98/100 | Hạ cánh tự động |
| 7 | Xong S | `planet_complete` (S) | 24,0 | 86/100 | Trạm chậm nhất; theo dõi rơi ở đây |
| 8 | Xong A | `planet_complete` (A) | 20,0 | 83/100 | — |
| 9 | Xong O | `planet_complete` (O) | 16,0 | 80/100 | 15 giây tạo áp lực; nếu rơi > 30/100 phải nới |
| 10 | Xong K | `planet_complete` (K) | 13,0 | 81/100 | Cao trào |
| 11 | Xong IM | `planet_complete` (IM) | 11,0 | 85/100 | Hoàn thành 5 trạm / bắt đầu = 30/100 (mục tiêu chính) |
| 12 | Xem finale | `finale_view` | 10,8 | 98/100 | Chuyến bay cuối tự chuyển |
| 13 | Xem báo cáo | `report_view` | 10,5 | 97/100 | — |
| 14 | Mở gate | `gate_view` | 6,3 | 60/100 | Xem teaser gói rồi mới quyết |
| 15 | Gửi lead thành công | `lead_success` | **1,6** | 25/100 | 15/100 người hoàn thành để lại lead |
| 16 | Lead đủ điều kiện | CRM `qualified` | 0,63 | 40/100 lead | Có nhu cầu + đúng vai trò + ngân sách |
| 17 | Đặt lịch | CRM `booked` | 0,16 | 25/100 lead đủ điều kiện | Phụ thuộc SLA sales |
| 18 | Lịch xác nhận | CRM `booking_confirmed` | 0,13 | 80/100 lịch đặt | **North star** |
| — | Share | `share_success` | 0,84 | 8/100 người hoàn thành | Kênh lan truyền |
| — | Tải PDF | `pdf_download` | 1,1 | 70/100 lead | Giá trị của gate |

Các tỉ lệ phụ cần theo dõi: hoàn thành 5 trạm / bắt đầu trên **tier mid-low ≥ 25/100** (không thấp hơn tier high quá 5 điểm); resume thành công ≥ 70/100 lần mở lại; lỗi crawl fallback ≤ 20/100.

## 3. Event dictionary

Tất cả event gửi qua `POST /api/events` (batch ≤ 30, best-effort, `keepalive`). `sessionId` gắn sau khi có session; trước đó dùng `anonymousId` trong localStorage. **Không chứa PII.**

| Event | Khi nào | Props bắt buộc | Props tuỳ chọn |
|---|---|---|---|
| `intro_view` | Intro hiện | `replay`, `reduced` | — |
| `intro_complete` | Bấm CTA intro | `replay`, `reduced`, `step`, `ms` | — |
| `intro_skip` | Bấm "Bỏ qua" intro | `replay`, `reduced`, `step`, `ms` | — |
| `intro_replay` | Mở lại intro từ landing | — | — |
| `landing_view` | Landing hiện | `source`, `deviceTier` | `utm_source`, `utm_medium`, `utm_campaign`, `referrer` |
| `resume_offer` | Có bản lưu | `domain`, `currentPlanet` | `ageHours` |
| `resume_success` | Người chơi bấm tiếp tục | `currentPlanet` | — |
| `scan_start` | Bấm bắt đầu | `inputType` (`url`/`manual`) | `utm_*` |
| `scan_success` | Có brand kit (kể cả fallback) | `cached`, `source` (`url`/`manual`/`fallback`), `logoQuality`, `preScanScore`, `durationMs` | `warningsCount` |
| `scan_fallback` | Crawl lỗi nhưng có brand kit fallback | `code`, `durationMs` | `domain`, `logoQuality` |
| `scan_manual_open` | Mở form nhập tay | `reason` | — |
| `confirm_view` | Màn xác nhận hiện | `source` | `logoQuality` |
| `confirm_edit` | Sửa logo/tên/màu/ngành | `field` | — |
| `confirm_submit` | Bấm "Cất cánh" | `companySize`, `role` | `editedFields` |
| `launch_start` | Bắt đầu cinematic | — | — |
| `launch_skip` | Bỏ qua cinematic | `atMs` | — |
| `map_view` | Về bản đồ | `completedCount` | — |
| `flight_start` | Chuyến bay bắt đầu | `from`, `to` | — |
| `flight_complete` | Hạ cánh (không skip) | `to` | — |
| `flight_skip` | Bỏ qua chuyến bay | `to` | — |
| `takeoff_next` | Bấm cất cánh từ kết quả trạm | `from`, `to` | — |
| `planet_enter` | Vào trạm | `planet` | `resumed` |
| `decision_select` | Mỗi lần chọn | `planet`, `decisionId`, `optionId`, `kind`, `points`, `ms` | `realityCheck` |
| `planet_complete` | Trạm xong | `planet`, `score`, `knowledge`, `diagnosis`, `durationMs` | `meter`, `timeBonus`, `crisisFast`, `skipped` |
| `planet_skip` | Bỏ qua trạm | `planet`, `atMs` | — |
| `finale_view` | Finale bắt đầu | `overall` | `skipped` |
| `report_view` | Báo cáo ungated | `overall`, `title`, `stars`, `weakSteps` | `quality` |
| `gate_view` | Gate hiện | `overall` | `teaserOffer` |
| `lead_submit` | Bấm gửi form | `hasPhone`, `hasEmail`, `marketingOptIn` | — |
| `lead_fail` | Server từ chối | `code` | — |
| `lead_success` | Lead lưu xong | `offerCode`, `overall` | `timeToLeadMs` |
| `pdf_download` | Tải PDF | `reportId` | `source` |
| `booking_click` | Bấm đặt lịch | `offerCode` | `bookingUrlSet` |
| `share_click` / `share_success` | Share | `method`, `format` | — |
| `leaderboard_view` / `leaderboard_submit` | Bảng xếp hạng | `industry`, `anonymous` | `rank` |
| `quality_change` | Hạ tier | `from`, `to`, `reason` | `fps` |
| `audio_toggle` | Bật/tắt tiếng | `enabled` | `planet` |
| `error` | Lỗi UI/API | `code`, `screen` | `status`, `planet` |
| `page_leave` | Rời trang | `screen`, `completedCount` | `durationMs` |

Quy ước: `points` ∈ {0,1,2}; `ms` ≤ 600000; `planet` ∈ S/A/O/K/IM; `overall` 0–10. Không gửi tên, SĐT, email, tên miền đầy đủ của khách vào event (chỉ `domain` đã chuẩn hoá ở scan event, dùng cho nội bộ, không xuất ra dashboard ngoài).

## 4. Định nghĩa chỉ số

| Chỉ số | Công thức | Ghi chú |
|---|---|---|
| Lead capture | `lead_success / report_view` | x/100; mục tiêu 15/100 |
| Completion rate | `planet_complete(IM) / scan_start` | 30/100 |
| Trạm rơi nhiều nhất | `planet_enter(P) − planet_complete(P)` theo P | Ưu tiên sửa trạm cao nhất |
| Thời gian chơi | trung bình và phân bố (`report_view.ts − scan_start.ts`) | Mục tiêu 7–10 phút |
| Chất lượng lead | `qualified / lead_success` | 40/100; cần CRM |
| Tỉ lệ đặt lịch | `booked / qualified` | 25/100 |
| Share rate | `share_success / planet_complete(IM)` | 8/100 |
| PDF rate | `pdf_download / lead_success` | 70/100 |
| Fallback rate | `scan_fallback / scan_start` | ≤ 20/100 |
| Intro completion | `intro_complete / (intro_complete + intro_skip)` | ≥ 60/100; skip > 50/100 thì xem lại nhịp/CTA |
| Intro skip | `intro_skip / intro_view` | Đo để biết intro có bị thấy dài |
| Flight skip rate | `flight_skip / (flight_complete + flight_skip)` | Đo xem chuyến bay có bị thấy dài; mục tiêu ≤ 60/100, > 80/100 thì xem lại độ dài |
| Thời gian chuyến bay | `flight_complete.ts − flight_start.ts` (ts server) | 2,9s chuẩn, 0,65s reduced motion |
| Crash-free sessions | `1 − sessions có error P0 / sessions` | Mục tiêu ≥ 99/100 |
| Reality-check rate | `decision_select(realityCheck=true) / decision_select(diagnosis chọn 2)` | Chẩn đoán chất lượng pre-scan |
| AI fallback rate | `aiSource = template / lead_success` | Nếu > 40/100, kiểm tra key/timeout |

Phân đoạn bắt buộc: `deviceTier` (high/mid/low), nguồn (`utm_source`: zalo/facebook/direct/email/khác), ngành, quy mô, có/không resume. Mọi chỉ số đọc theo tuần ISO, không so sánh tuần chưa đủ mẫu (< 100 phiên).

## 5. SQL funnel

SQLite (`node:sqlite`), bảng `events`. Có thể chạy trực tiếp hoặc dựng view.

```sql
-- 1) Phễu theo session trong khoảng thời gian
WITH steps(name, ord) AS (
  VALUES ('landing_view',1), ('scan_start',2), ('scan_success',3),
         ('confirm_submit',4), ('flight_start',5), ('planet_enter',6),
         ('planet_complete',7), ('report_view',8), ('gate_view',9),
         ('lead_success',10)
),
per_session AS (
  SELECT s.id AS session_id, e.name, MIN(e.ts) AS ts
  FROM sessions s
  JOIN events e ON e.session_id = s.id
  WHERE e.ts >= :from AND e.ts < :to
  GROUP BY s.id, e.name
),
landing AS (
  SELECT COUNT(DISTINCT session_id) AS total
  FROM events
  WHERE name = 'landing_view' AND ts >= :from AND ts < :to
)
SELECT st.ord, st.name,
       COUNT(DISTINCT ps.session_id) AS sessions,
       ROUND(100.0 * COUNT(DISTINCT ps.session_id)
             / NULLIF((SELECT total FROM landing), 0), 1) AS per_100_landing
FROM steps st
LEFT JOIN per_session ps ON ps.name = st.name
GROUP BY st.ord, st.name
ORDER BY st.ord;
```

```sql
-- 2) Rơi theo trạm (trạm nào mất người)
SELECT planet,
       SUM(CASE WHEN name = 'planet_enter' THEN 1 ELSE 0 END) AS enters,
       SUM(CASE WHEN name = 'planet_complete' THEN 1 ELSE 0 END) AS completes,
       ROUND(100.0 * SUM(CASE WHEN name = 'planet_complete' THEN 1 ELSE 0 END)
             / NULLIF(SUM(CASE WHEN name = 'planet_enter' THEN 1 ELSE 0 END), 0), 1) AS complete_per_100
FROM events
WHERE name IN ('planet_enter','planet_complete') AND ts >= :from
GROUP BY planet ORDER BY complete_per_100 ASC;
```

```sql
-- 3) Thời gian chơi trung bình (biến thể: thêm GROUP BY device tier)
WITH t AS (
  SELECT e.session_id,
         MIN(CASE WHEN e.name = 'scan_start' THEN e.ts END) AS start_ts,
         MIN(CASE WHEN e.name = 'report_view' THEN e.ts END) AS end_ts
  FROM events e WHERE e.ts >= :from GROUP BY e.session_id
)
SELECT COUNT(*) AS sessions,
       ROUND(AVG((julianday(end_ts) - julianday(start_ts)) * 24 * 60), 1) AS avg_minutes
FROM t WHERE start_ts IS NOT NULL AND end_ts IS NOT NULL;
```

```sql
-- 4) Lead theo gói và nguồn (nối event landing để lấy UTM)
SELECT l.offer_code, l.industry, l.overall, l.status,
       json_extract(ev.props_json, '$.utm_source') AS utm_source,
       COUNT(*) AS leads
FROM leads l
LEFT JOIN events ev ON ev.session_id = l.session_id AND ev.name = 'landing_view'
WHERE l.created_at >= :from AND ev.name = 'landing_view'
GROUP BY l.offer_code, l.industry, l.overall, l.status, utm_source
ORDER BY leads DESC;
```

Lưu ý: query 1 tính gần đúng khi session không có `landing_view` (một số webview chặn analytics); loại các session đó khỏi mẫu landing. Mọi query tham số hoá, không nối chuỗi.

## 6. CRM & SLA sales

Trạng thái lead (cột `leads.status`), đồng bộ 1 chiều qua outbox (Phase 2: 2 chiều):

| Stage | Định nghĩa | Ai chuyển | Điều kiện vào |
|---|---|---|---|
| `new` | Lead vừa lưu | Hệ thống | `lead_success` |
| `contacted` | Đã gọi/nhắn lần đầu | Sales | Ghi chú thời điểm + kênh |
| `qualified` | Có nhu cầu, đúng người quyết định/ảnh hưởng, ngân sách phù hợp | Sales | Trả lời 3 câu: nhu cầu, ngân sách dự kiến, thời điểm |
| `booked` | Đã đặt lịch tư vấn | Sales | Có ngày giờ cụ thể |
| `booking_confirmed` | Khách xác nhận lịch (qua tin nhắn/email) | Sales | North star |
| `won` / `lost` | Ký hợp đồng / không tiếp tục | Sales | Lý do lost bắt buộc |

Ưu tiên gọi (gợi ý cho sales, không tự động xếp hạng khách):
1. Tổng ≥ 8 hoặc 2 bước yếu thuộc S/A.
2. Quy mô ≥ 21 người và vai trò `founder`/`cmo`.
3. Có ngân sách nêu trong lần liên hệ đầu.
4. Có ít nhất 1 trong 3 insight được khách nhắc lại khi gọi.

**SLA đề xuất** `[cần sales xác nhận]`:

| Hạng mục | Mục tiêu | Đo bằng |
|---|---|---|
| Liên hệ lần đầu | ≤ 24 giờ làm việc | `contacted_at − created_at` |
| Gửi báo cáo/gợi ý gói sau gọi | ≤ 48 giờ | CRM note |
| Xác nhận lịch | ≤ 24 giờ trước hẹn | CRM |
| Follow-up sau hẹn không đến | ≤ 24 giờ | CRM |
| Lead không phản hồi sau 3 lần | Đóng `lost` + lý do | CRM |

Không hứa SLA cho khách trong UI ngoài câu "thường phản hồi trong 1 ngày làm việc" — chỉ dùng khi SLA thực tế đã đạt trong 2 tuần liên tiếp.

## 7. Dashboard

Cập nhật hằng ngày; mỗi ô có số hiện tại, mục tiêu x/100, xu hướng 4 tuần.

| Khối | Chỉ số | Owner |
|---|---|---|
| Acquisition | landing_view, scan_start/landing, nguồn UTM | Marketing |
| Activation | scan_success, confirm_submit/scan_start | Product |
| Engagement | completion rate, rơi theo trạm, thời gian chơi, resume | Product/Game |
| Outcome | gate_view, lead_success/report, share, PDF | Product/Sales |
| Quality | qualified/lead, booked/qualified, booking_confirmed | Sales |
| Tech | P0/P1 mở, crash-free, tải MB, fps trung vị, fallback crawl | Engineering |

Ngưỡng cảnh báo đỏ (tuần): completion rate < 20/100; lead capture < 8/100; qualified < 25/100 lead; fallback > 30/100; P0 mở > 0.

## 8. Thử nghiệm

Mỗi thử nghiệm: 1 giả thuyết, 1 chỉ số chính, 1 ràng buộc không được xấu đi, thời gian tối thiểu 2 tuần hoặc 200 phiên/nhánh.

| # | Giả thuyết | Chỉ số chính | Ràng buộc |
|---|---|---|---|
| E1 | Headline tập trung vào "thấy thương hiệu đang ở đâu" tăng `scan_start` so với headline "game 3D" | `scan_start/landing` | `lead_success/report` không giảm |
| E2 | Gate đặt sau 2 bước yếu (thay vì sau teaser gói) tăng `gate_view` | `gate_view/report` | `lead_success` không giảm |
| E3 | Cho bỏ qua trạm ngay từ đầu giảm rơi ở O | completion rate | Điểm trung bình không tăng bất thường (tránh chọn skip để né) |
| E4 | Nới 15 giây tìm mockup thành 20 giây tăng completion O | `planet_complete(O)/enter(O)` | Thời gian chơi trung bình ≤ 10 phút |
| E5 | Hiển thị giá (`VITE_SHOW_PRICE=1`) tăng `gate_view` nhưng giảm `lead_success` | `lead_success/report` | Không dùng giá để ép |
| E6 | Ảnh share có tên thương hiệu lớn tăng `share_success` | share/report | Không lộ PII |
| E7 | Rút ngắn 3 insight AI thành 2 tăng `pdf_download` | `pdf_download/lead` | Không giảm `qualified` |

Kết thúc thử nghiệm: ghi vào bảng này (ngày, kết quả, quyết định) trước khi thay đổi vĩnh viễn.

## 9. Dữ liệu & riêng tư

- **UTM:** đọc từ URL ở `landing_view`, giữ trong localStorage cùng `anonymousId`, gắn vào lead khi submit (cột `source`/note CRM). Cửa sổ quy chiếu 7 ngày `[cần marketing xác nhận]`.
- **Consent:** không có analytics nào chứa PII; event chỉ chứa hành vi ẩn danh. Lead chỉ tồn tại sau khi consent hợp lệ.
- **Retention:** session/event/leaderboard 180 ngày; lead theo chính sách lead; xoá theo yêu cầu qua đầu mối DPO `[cần xác nhận]`.
- **Xuất dữ liệu:** CSV admin có token; không chia sẻ ngoài đội Sao Kim + nhà cung cấp hạ tầng.
- **Không dùng dữ liệu để bán quảng cáo** hoặc remarketing bên thứ ba.

## 10. Liên kết

- Phễu UI tương ứng: [05](05-user-flow.md) §8.
- Công thức điểm ảnh hưởng KPI chất lượng: [04](04-scoring-offers.md).
- Ngưỡng hiệu năng: [07](07-architecture.md) §11 và [09](09-mobile-qa.md) §4.
