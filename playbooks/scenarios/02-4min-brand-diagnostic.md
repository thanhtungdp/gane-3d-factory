---
scenario: 4 phút · brand diagnostic
duration: 4 phút
goal: Chủ doanh nghiệp nhận một bản chẩn đoán thương hiệu ngắn có bằng chứng từ website và để lại liên hệ để nhận bản đầy đủ.
skills: [game-brief-for-brand, brand-crawl-to-kit, game-narrative-and-tone, game-storyboard-and-sound, brand-game-loop, mobile-game-cockpit, brand-report-gate, game-qa-autopilot]
outputs: [brief.md, story-bible.md, tone-matrix.md, storyboard.md, sound-cue-sheet.md, loop.md, cockpit.md, report-outline.md, qa-plan.md]
---

# 4 phút · Brand diagnostic

## 1. Bối cảnh

Người chơi nhập website; game đọc thông tin công khai, dựng brand kit và dẫn qua 3 chặng tự soi. Kết thúc bằng bản chẩn đoán ngắn (không cần lead) và bản đầy đủ sau lead gate. Không hứa "audit miễn phí toàn diện".

Brand hư cấu: **Nha khoa An Nhiên** — phòng khám gia đình, thế mạnh là chăm sóc trẻ em; website công khai có logo, bảng màu, 2 kênh social.

## 2. Brief rút gọn

| Hạng mục | Nội dung |
|---|---|
| Vấn đề | Phòng khám có chuyên môn nhưng website không nói rõ khác biệt so với phòng khám gần nhà |
| Audience | Phụ huynh 30–45 tuổi, sợ con đau, không phân biệt được cơ sở tốt/xấu |
| Insight | Họ chọn nơi khiến trẻ bớt sợ, không chọn nơi quảng cáo nhiều |
| Promise | 4 phút để thấy website đang nói gì và thiếu gì so với điều phụ huynh cần |
| Proof | Quy trình đón trẻ, phòng chờ, đội ngũ, đánh giá công khai (nếu có) |
| Hành động chính | Để lại liên hệ nhận báo cáo đầy đủ + đặt lịch tư vấn |
| Kênh | Link trong bài post/email; mobile dọc |
| KPI giả thuyết | Hoàn thành 3 chặng; tỉ lệ mở báo cáo đầy đủ; tỉ lệ đặt lịch |
| Guardrail | Không bịa đánh giá/khách; không chẩn đoán y khoa; không so sánh đối thủ cụ thể |
| Ràng buộc | Chỉ đọc dữ liệu công khai; consent NĐ 13/2023; lưu tối thiểu |

## 3. Narrative

- **Premise:** Website của bạn đang nói với phụ huynh bằng ngôn ngữ của người lớn, trong khi người quyết định là nỗi sợ của đứa trẻ.
- **Ẩn dụ:** Relationship (hai bên hiểu nhau dần) — brand truth là chăm sóc, không phải kỹ thuật.
- **Player role:** phụ huynh/người đại diện đang chuẩn bị chọn nơi chăm sóc.
- **Guide:** một điều dưỡng kỳ cựu ({{guide}}), hỏi ngắn, không phán xét.
- **3 hồi:** Mở (website hiện ra, thấy điều phụ huynh thấy) → Thử thách (3 quyết định về thông điệp, nhận diện, quy trình) → Hé lộ (bản đồ 3 lớp + 2 vùng tối).

## 4. Loop

3 act, 9 quyết định (3/3/3), mỗi câu 3 đáp án 2/1/0.

| Act | Mục tiêu | Quyết định mẫu | Evidence |
|---|---|---|---|
| 1 · Điều phụ huynh thấy | Nhìn lại tín hiệu | "Website có câu nào nói về trẻ em trong 5 giây đầu?" / "Logo có đọc được trên điện thoại?" | pre-scan logo, slogan |
| 2 · Điều phụ huynh cần | Chọn hướng | "Phụ huynh sợ nhất điều gì?" / "Một câu nên nói gì?" / "Chọn 2 tính cách" | slogan, social |
| 3 · Điều giữ niềm tin | Quy trình & nhất quán | "Đón trẻ thế nào?" / "Ai trả lời phản hồi?" / "Có quy trình cập nhật nội dung?" | social, mobile |

- **Progress:** 3 lớp sáng; mỗi act trả 1 evidence thật từ pre-scan.
- **Skip:** có; skip act vẫn tính 0 và hiện vùng tối.
- **Report mapping:** act 1–2 → chẩn đoán; act 3 → gợi ý gói chăm sóc/vận hành (sau gate).

## 5. Storyboard

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Tạo liên quan | Ảnh website của chính người chơi thu nhỏ trong khung | Tĩnh | Tap "Xem website" | "Đây là điều phụ huynh thấy." | `amb_soft` | 0–8s | Có |
| 2 | Promise | Nói rõ kết quả | 3 lớp của một "hồ sơ" sáng dần | Fade 200ms | Tap "Bắt đầu" | "4 phút để thấy 3 lớp đang tối." | `ui_confirm` | 8–18s | Có |
| 3 | First action | Dạy luật | Tín hiệu thật: logo, câu định vị | Theo thao tác | Chạm mở từng tín hiệu | "Mở tín hiệu, rồi chọn điều bạn nghĩ." | `ui_tap` | 18–60s | Không |
| 4 | Choice | Quyết định | Popup một câu, 3 đáp án | Ổn định | Tap đáp án | "{{prompt}}" | `ui_select` | 60–150s | Có |
| 5 | Consequence | Hậu quả | Phụ huynh/đứa trẻ minh hoạ ẩn dụ | Fade/zoom nhẹ | Tap "Tiếp tục" | "{{feedback}}" | `confirm_partial` | 150–190s | Có |
| 6 | Progress | Thấy tiến bộ | 3 lớp sáng, vùng tối rõ | Một lần, không lặp | Không | "Còn 1 lớp cần quyết." | `progress_tick` | 190–215s | Có |
| 7 | Reveal | Trả bản đồ | Bản đồ 3 lớp + 2 vùng tối | Dolly/fade ngắn | Tap "Xem bản đồ" | "Đây là chỗ nên sửa trước." | `reward` | 215–235s | Có |
| 8 | CTA | Lead gate | Báo cáo ungated + nút mở đầy đủ | Tĩnh | Tap "Mở báo cáo" | "Nhận báo cáo đầy đủ." | `silence` | 235–240s | Không |

## 6. Sound cue

| Cue | Trigger | Intent | Texture | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_soft` | Vào game | Không gian tin cậy | Pad ấm, rất thấp | Loop | −28 dB | Im lặng |
| `ui_tap` | Mở tín hiệu | Phản hồi | Click nhẹ | 80 ms | −22 dB | Đổi viền |
| `ui_select` | Chọn đáp án | Xác nhận lựa chọn | 2 nốt ngắn | 250 ms | −20 dB | Nút pressed |
| `confirm_partial` | Phản hồi | Không phán xét | Chuông trầm | 350 ms | −18 dB | Feedback chữ |
| `reward` | Mở bản đồ | Ghi nhận | Pad dâng | 1.2 s | −15 dB | Bản đồ hiện |
| `silence` | Trước gate | Tập trung | Không | 600 ms | — | — |

## 7. Acceptance

- [ ] Không cần lead vẫn xem được điểm, 2 vùng tối, evidence; gate chỉ sau đó.
- [ ] Mỗi evidence là dữ liệu thật từ pre-scan hoặc "chưa có dữ liệu".
- [ ] Không chẩn đoán y khoa, không bịa đánh giá khách hàng, không so sánh đối thủ cụ thể.
- [ ] Consent + pháp nhân/DPO là placeholder `[cần xác nhận]` nếu chưa có.
- [ ] Report mapping chỉ hiện sau gate; không nhắc giá trong lúc chơi.
- [ ] QA phủ 320×640, 390×844, 540×720, 725×870, 1440×900.

## 8. Outputs & handoff

Tạo 9 artifact. `brand-crawl-to-kit` chạy trước `game-narrative-and-tone` để có evidence thật; `brand-report-gate` nhận `report-outline.md`; `game-qa-autopilot` chạy cuối.
