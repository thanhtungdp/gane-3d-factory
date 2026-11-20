---
scenario: 7 phút · product launch
duration: 7 phút
goal: Người xem hiểu ba lợi ích cụ thể của sản phẩm mới, tự chọn cấu hình phù hợp và đặt lịch trải nghiệm.
skills: [game-brief-for-brand, game-narrative-and-tone, game-storyboard-and-sound, brand-game-loop, mobile-game-cockpit, brand-3d-world, brand-report-gate, game-launch-kpi, game-qa-autopilot]
outputs: [brief.md, story-bible.md, tone-matrix.md, storyboard.md, sound-cue-sheet.md, loop.md, cockpit.md, report-outline.md, qa-plan.md]
---

# 7 phút · Product launch

## 1. Bối cảnh

Sản phẩm mới cần được hiểu đúng, không chỉ được nhìn thấy. Game dẫn người xem qua một hành trình sử dụng thật: chọn cách đi, gặp tình huống, thấy hậu quả, rồi nhận bản tóm tắt cấu hình phù hợp và lời mời trải nghiệm.

Brand hư cấu: **Xe đạp điện Lá** — xe cho người đi làm trong đô thị, thế mạnh là trọng lượng nhẹ và pin tháo rời; chưa công bố số liệu bán.

## 2. Brief rút gọn

| Hạng mục | Nội dung |
|---|---|
| Vấn đề | Người mua không phân biệt được khác biệt kỹ thuật giữa các mẫu xe đạp điện |
| Audience | Người 25–40 tuổi đi làm 5–15 km/ngày, sợ xe nặng và sạc bất tiện |
| Insight | Họ không cần "mạnh nhất"; họ cần một chiếc xe không làm họ mệt thêm |
| Promise | 7 phút để thấy chiếc xe phù hợp với quãng đường và thói quen của mình |
| Proof | Trọng lượng, pin tháo rời, bảo hành, xưởng lắp ráp (có tài liệu) |
| Hành động chính | Đặt lịch trải nghiệm tại cửa hàng gần nhất |
| Kênh | Landing chiến dịch + social; mobile dọc, desktop 2 cột |
| KPI giả thuyết | Hoàn thành 3 act; tỉ lệ chọn cấu hình; tỉ lệ đặt lịch |
| Guardrail | Không bịa thông số; không so sánh đối thủ; không hứa tiết kiệm chi phí |
| Ràng buộc | Thông số phải có nguồn từ tài liệu sản phẩm; CTA đặt lịch `[cần xác nhận link]` |

## 3. Narrative

- **Premise:** Một người đi làm mỗi ngày phải chọn cách di chuyển; chiếc xe chỉ đúng nếu nó khớp với quãng đường, chỗ để và người sạc.
- **Ẩn dụ:** Journey (hành trình có mốc) — brand truth là "nhẹ nhàng hơn mỗi ngày", không phải "nhanh nhất".
- **Player role:** người đi làm đang cân nhắc mua xe; quyền chọn cấu hình, không quyền thay đổi luật giao thông.
- **Guide:** một kỹ thuật viên cửa hàng ({{guide}}), giải thích ngắn, không bán.
- **3 hồi:** Mở (một ngày đi làm bình thường) → Thử thách (chọn cấu hình, xử lý tình huống) → Hé lộ (bản tóm tắt chiếc xe khớp với mình).

## 4. Loop

3 act, 10 quyết định (4/3/3), điểm 2/1/0.

| Act | Mục tiêu | Quyết định mẫu | Feedback |
|---|---|---|---|
| 1 · Quãng đường | Hiểu nhu cầu thật | "Quãng đường mỗi ngày?" / "Chỗ để xe?" / "Ai sạc pin?" | Cấu hình gợi ý đổi theo lựa chọn |
| 2 · Tình huống | Chọn dưới áp lực | "Trời mưa, pin còn 20/100?" / "Cầu thang 4 tầng?" / "Bảo hành gãy?" | Hậu quả nhìn thấy trên chiếc xe |
| 3 · Cấu hình | Chốt | "Chọn phụ kiện" / "Chọn cách nhận xe" / "Chọn lịch trải nghiệm" | Bản tóm tắt + CTA |

- **Progress:** 3 mốc trên bản đồ tuyến đường; mỗi mốc mở một phần cấu hình.
- **Skip:** có; skip act 1 dùng cấu hình mặc định, báo rõ.
- **Report mapping:** cấu hình + 2 điểm chưa khớp + lời mời trải nghiệm (sau gate).

## 5. Storyboard

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Liên quan tức thì | Một người đứng trước 3 chiếc xe, chọn một | Tĩnh | Tap "Đi làm thử" | "Chọn cách bạn đến chỗ làm." | `amb_city` | 0–10s | Có |
| 2 | Promise | Nói rõ nhận gì | Bản đồ tuyến đường 3 mốc | Fade 200ms | Tap "Bắt đầu" | "7 phút để tìm chiếc xe khớp với bạn." | `ui_confirm` | 10–20s | Có |
| 3 | First action | Dạy luật | Chọn quãng đường, chỗ để | Theo thao tác | Tap 1 trong 3 | "Ngày thường của bạn dài bao nhiêu?" | `ui_tap` | 20–60s | Không |
| 4 | Choice | Quyết định | Popup một câu, 3 đáp án | Ổn định | Tap đáp án | "{{prompt}}" | `ui_select` | 60–240s | Có |
| 5 | Consequence | Hậu quả | Chiếc xe đổi cấu hình/thông số | Fade/zoom nhẹ | Tap "Tiếp tục" | "{{feedback}}" | `confirm_partial` | 240–330s | Có |
| 6 | Progress | Thấy tiến bộ | Bản đồ sáng mốc, pin hiển thị | Một lần, không lặp | Không | "Còn 1 mốc để chốt." | `progress_tick` | 330–360s | Có |
| 7 | Reveal | Trả cấu hình | Chiếc xe hoàn chỉnh + 3 thông số có nguồn | Dolly/fade ngắn | Tap "Xem cấu hình" | "Đây là cấu hình khớp với bạn." | `reward` | 360–400s | Có |
| 8 | CTA | Đặt trải nghiệm | Nút đặt lịch + địa chỉ placeholder | Tĩnh | Tap "Đặt lịch" | "Trải nghiệm 15 phút tại cửa hàng." | `silence` | 400–420s | Không |

## 6. Sound cue

| Cue | Trigger | Intent | Texture | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_city` | Vào game | Không gian đô thị | Pad + noise xa | Loop | −27 dB | Im lặng |
| `ui_tap` | Chọn | Phản hồi | Click nhẹ | 70 ms | −22 dB | Nút pressed |
| `confirm_partial` | Phản hồi | Ghi nhận | Chuông trầm | 300 ms | −18 dB | Feedback chữ |
| `progress_tick` | Qua mốc | Tiến bộ | Tick gỗ | 80 ms | −22 dB | Mốc sáng |
| `reward` | Xem cấu hình | Ghi nhận | Pad dâng | 1.2 s | −15 dB | Cấu hình hiện |
| `warn` | Pin thấp | Cảnh báo thật | Pulse trung tính | 400 ms | −18 dB | Chữ + màu |

## 7. Acceptance

- [ ] Mọi thông số có nguồn hoặc `[cần xác nhận]`; không so sánh đối thủ.
- [ ] CTA đặt lịch luôn thấy; link là placeholder nếu chưa có.
- [ ] Không bán/giá trong lúc chơi; báo cáo mở sau gate.
- [ ] Ba act có skip; skip không làm mất CTA.
- [ ] QA phủ mobile, fold/duo, desktop 1440/1920; kiểm tra âm thanh tắt vẫn đủ thông tin.

## 8. Outputs & handoff

Tạo 9 artifact. `brand-3d-world` nhận storyboard để chọn cảnh; `brand-report-gate` nhận `report-outline.md`; `game-launch-kpi` chốt KPI và event trước khi release.
