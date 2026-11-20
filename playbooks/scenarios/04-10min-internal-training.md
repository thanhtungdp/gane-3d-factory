---
scenario: 10 phút · internal training
duration: 10 phút
goal: Nhân viên mới hiểu 5 quy tắc thương hiệu, tự xử lý 4 tình huống thường gặp và hoàn thành bài kiểm tra nội bộ.
skills: [game-brief-for-brand, game-narrative-and-tone, game-storyboard-and-sound, brand-game-loop, mobile-game-cockpit, game-qa-autopilot]
outputs: [brief.md, story-bible.md, tone-matrix.md, storyboard.md, sound-cue-sheet.md, loop.md, cockpit.md, qa-plan.md]
---

# 10 phút · Internal training

## 1. Bối cảnh

Đây là game nội bộ, không có lead gate, không bán hàng. Mục tiêu là hiểu đúng và làm đúng, có ghi nhận hoàn thành để HR/team lead theo dõi. Nội dung phải dùng tài liệu thương hiệu thật của doanh nghiệp, không dùng case study bên ngoài.

Brand hư cấu: **Bánh mì Hạnh** — chuỗi 12 cửa hàng (số liệu hư cấu dùng trong brief nội bộ, ghi rõ là ví dụ), có bộ nhận diện và quy trình vận hành.

## 2. Brief rút gọn

| Hạng mục | Nội dung |
|---|---|
| Vấn đề | Nhân viên mới làm đúng trong tuần đầu nhưng sai dần khi gặp tình huống ngoài kịch bản |
| Audience | Nhân viên cửa hàng mới, 0–3 tháng, dùng điện thoại |
| Insight | Họ không sợ học; họ sợ làm sai trước mặt khách |
| Promise | 10 phút để thử 4 tình huống thật trước khi gặp khách thật |
| Proof | Quy trình cửa hàng, bộ nhận diện, checklist mở/đóng ca |
| Hành động chính | Hoàn thành bài kiểm tra và xác nhận đã đọc quy trình |
| Kênh | Link nội bộ, mobile dọc; không cần 3D nặng |
| KPI giả thuyết | Tỉ lệ hoàn thành; điểm kiểm tra; tỉ lệ làm lại |
| Guardrail | Không thu dữ liệu khách; không bịa quy định; không dùng tên khách thật |
| Ràng buộc | Nội dung nội bộ; không chia sẻ ra ngoài; thời hạn hoàn thành `[cần xác nhận]` |

## 3. Narrative

- **Premise:** Ca làm đầu tiên của một nhân viên mới; mỗi tình huống là một lần chọn giữa làm nhanh và làm đúng.
- **Ẩn dụ:** Workshop (xưởng) — brand truth nằm ở quy trình và sự nhất quán tay nghề.
- **Player role:** nhân viên mới trong ca đầu; quyền hỏi, quyền dừng, không quyền tự đổi quy trình.
- **Guide:** quản lý ca ({{guide}}), đưa luật ngắn, không làm hộ.
- **4 hồi:** Mở (nhận ca) → Mở cửa (chuẩn bị) → Gặp khách (xử lý) → Đóng ca & kiểm tra.

## 4. Loop

4 act, 12 quyết định (3/3/3/3), điểm 2/1/0.

| Act | Mục tiêu | Quyết định mẫu | Feedback |
|---|---|---|---|
| 1 · Nhận ca | Hiểu chuẩn bị | "Đồng phục thiếu phù hiệu?" / "Bảng hiệu bị lệch?" / "Mở máy POS thế nào?" | Checklist + hậu quả |
| 2 · Mở cửa | Nhất quán | "Ai duyệt bài đăng?" / "Giá khuyến mãi?" / "Nhân viên mới đăng sai logo?" | Quy trình ngắn |
| 3 · Gặp khách | Xử lý tình huống | "Khách phàn nàn?" / "Khách đòi giảm giá?" / "Khách quay video?" | Cách nói + người chịu trách nhiệm |
| 4 · Đóng ca | Kiểm tra | "Bàn giao ca?" / "Báo cáo sự cố?" / "Bài kiểm tra cuối" | Điểm + xác nhận |

- **Progress:** 4/4 act; mỗi act có checklist riêng.
- **Skip:** chỉ skip phần đọc, không skip bài kiểm tra; ghi rõ.
- **Report mapping:** điểm bài kiểm tra + 2 lỗ hổng cần đào tạo lại (gửi team lead, không phải offer).

## 5. Storyboard

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Tạo liên quan | Ca làm sáng sớm, cửa chưa mở | Tĩnh | Tap "Vào ca" | "Ca đầu tiên của bạn bắt đầu." | `amb_shop` | 0–12s | Có |
| 2 | Promise | Nói rõ nhận gì | 4 mốc ca làm | Fade 200ms | Tap "Bắt đầu" | "10 phút để thử 4 tình huống trước khách thật." | `ui_confirm` | 12–25s | Có |
| 3 | First action | Dạy luật | Checklist mở ca | Theo thao tác | Tap từng mục | "Kiểm tra 3 thứ trước khi mở cửa." | `ui_tap` | 25–90s | Không |
| 4 | Choice | Quyết định | Popup một câu, 3 đáp án | Ổn định | Tap đáp án | "{{prompt}}" | `ui_select` | 90–360s | Không |
| 5 | Consequence | Hậu quả | Hình ảnh hậu quả ở cửa hàng | Fade/zoom nhẹ | Tap "Tiếp tục" | "{{feedback}}" | `confirm_partial` | 360–450s | Có |
| 6 | Progress | Thấy tiến bộ | 4 mốc sáng, checklist cập nhật | Một lần, không lặp | Không | "Còn 1 act trước bài kiểm tra." | `progress_tick` | 450–480s | Có |
| 7 | Reveal | Kiểm tra | 3 câu kiểm tra nhanh + kết quả | Dolly/fade ngắn | Tap đáp án | "Bài kiểm tra cuối ca." | `reward` | 480–560s | Không |
| 8 | CTA | Xác nhận | Nút xác nhận đã đọc quy trình | Tĩnh | Tap "Xác nhận" | "Gửi kết quả cho quản lý ca." | `silence` | 560–600s | Không |

## 6. Sound cue

| Cue | Trigger | Intent | Texture | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_shop` | Vào game | Không gian cửa hàng | Pad ấm + noise nhẹ | Loop | −28 dB | Im lặng |
| `ui_tap` | Tap checklist | Phản hồi | Click nhẹ | 70 ms | −22 dB | Ô tick đổi |
| `ui_select` | Chọn đáp án | Xác nhận | 2 nốt ngắn | 220 ms | −20 dB | Nút pressed |
| `confirm_partial` | Phản hồi | Không phán xét | Chuông trầm | 300 ms | −18 dB | Feedback chữ |
| `warn` | Lỗi quy trình | Cảnh báo thật | Pulse trung tính | 400 ms | −18 dB | Chữ + màu |
| `ui_confirm` | Mở/đóng sheet | Báo lớp mới | Noise nhẹ | 180 ms | −22 dB | Sheet hiện |
| `progress_tick` | Đóng act | Đã đi tiếp | Tick gỗ | 80 ms | −22 dB | Mốc đổi |
| `silence` | Trước gửi kết quả | Khoảng lặng có chủ đích | Không | 600 ms | — | UI đứng yên |
| `reward` | Hoàn thành | Ghi nhận | Pad dâng | 1 s | −15 dB | Kết quả hiện |

## 7. Acceptance

- [ ] Không lead gate, không offer/giá; dữ liệu chỉ để ghi nhận hoàn thành nội bộ.
- [ ] Không dùng tên khách thật, không có dữ liệu khách trong nội dung.
- [ ] Mọi quy định lấy từ tài liệu nội bộ; chỗ chưa có ghi `[cần xác nhận]`.
- [ ] Bài kiểm tra không thể skip; phần đọc có skip.
- [ ] Có bản no-sound và reduced motion; QA phủ mobile + desktop.
- [ ] Kết quả gửi team lead, không gửi marketing.

## 8. Outputs & handoff

Tạo 8 artifact. Không chạy `brand-report-gate` (không có offer); `game-qa-autopilot` phủ thêm luồng "hoàn thành bài kiểm tra" và trạng thái lưu kết quả nội bộ.
