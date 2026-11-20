---
scenario: 3 phút · fashion drop
duration: 3 phút
goal: Người xem chọn được một trong ba phong cách của bộ sưu tập, chia sẻ thẻ phong cách và đăng ký nhận thông báo mở bán.
skills: [game-brief-for-brand, game-narrative-and-tone, game-storyboard-and-sound, brand-game-loop, mobile-game-cockpit, brand-3d-world, game-launch-kpi, game-qa-autopilot]
outputs: [brief.md, story-bible.md, tone-matrix.md, storyboard.md, sound-cue-sheet.md, loop.md, cockpit.md, qa-plan.md]
---

# 3 phút · Fashion drop

## 1. Bối cảnh

Drop giới hạn, khách đến từ social, thời gian quyết định ngắn. Game không giải thích bộ sưu tập bằng lời; nó cho người xem thử gu, thấy mình trong một trong ba phong cách, rồi chia sẻ hoặc đăng ký nhận thông báo.

Brand hư cấu: **Studio Vải Sông** — thời trang nữ, bộ sưu tập "Nước Lên" gồm ba phong cách; chưa có số liệu bán.

## 2. Brief rút gọn

| Hạng mục | Nội dung |
|---|---|
| Vấn đề | Khách xem ảnh nhưng không biết món nào hợp với mình, nên chờ giảm giá hoặc bỏ qua |
| Audience | Nữ 22–32 tuổi, mua theo phong cách, nhạy với "bị đụng hàng" |
| Insight | Họ không cần nhiều lựa chọn; họ cần một lựa chọn thấy đúng là mình |
| Promise | 3 phút để chọn một phong cách và nhận thẻ chia sẻ đúng gu |
| Proof | Chất liệu, phom dáng, cách phối (ảnh/bộ mẫu thật) |
| Hành động chính | Đăng ký nhận thông báo mở bán hoặc chia sẻ thẻ phong cách |
| Kênh | Link bio/Instagram/TikTok; mobile dọc |
| KPI giả thuyết | Tỉ lệ chọn xong phong cách; tỉ lệ chia sẻ; tỉ lệ đăng ký nhận tin |
| Guardrail | Không bịa số lượng, không hứa "không đụng hàng"; không bán trong lúc chơi |
| Ràng buộc | Ảnh lookbook đã được duyệt; không dùng nhạc có bản quyền ngoài gói; CTA `[cần xác nhận link]` |

## 3. Narrative

- **Premise:** Một buổi chiều đứng trước tủ đồ, chọn một chiếc áo để đi; mỗi lựa chọn thu hẹp gu của bạn.
- **Ẩn dụ:** Memory (ký ức/vật gợi nhớ) — brand truth là "mặc thứ khiến bạn nhớ mình là ai", không phải chạy theo trend.
- **Player role:** người mặc, không phải stylist; quyền chọn, không quyền thay đổi chất liệu.
- **Guide:** người thợ may trong studio ({{guide}}), gợi ý ngắn, không áp đặt.
- **3 hồi:** Mở (tủ đồ mở) → Thử thách (chọn chất liệu, phom, cách phối) → Hé lộ (một phong cách + thẻ chia sẻ).

## 4. Loop

3 act, 6 quyết định (2/2/2), điểm 2/1/0; không có báo cáo dài.

| Act | Mục tiêu | Quyết định mẫu | Feedback |
|---|---|---|---|
| 1 · Chất liệu | Thu hẹp gu | "Chạm vào chất liệu nào trước?" / "Ánh sáng nào khiến bạn thấy dễ chịu?" | Đổi texture/ánh sáng của tủ |
| 2 · Phom | Chọn dáng | "Ôm hay suông?" / "Dài hay ngắn?" | Look đổi phom, kèm 1 câu |
| 3 · Phối | Chốt phong cách | "Chọn phụ kiện" / "Chọn cách xuất hiện" | Thẻ phong cách + CTA |

- **Progress:** 3 mảnh vải sáng dần thành một look.
- **Skip:** có; skip dùng phong cách mặc định, vẫn ra thẻ.
- **Report mapping:** không có report; thẻ chia sẻ là artifact, CTA đăng ký nhận tin.

## 5. Storyboard

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Dừng mắt | Tủ đồ tối, 1 tay kéo mở | Tĩnh | Tap "Mở tủ" | "Hôm nay bạn muốn mặc gì?" | `amb_studio` | 0–6s | Có |
| 2 | Promise | Nói rõ nhận gì | 3 mảnh vải bay vào khung | Fade 200ms | Tap "Bắt đầu" | "3 phút để tìm phong cách của bạn." | `ui_confirm` | 6–14s | Có |
| 3 | First action | Dạy luật | 3 chất liệu chạm được | Theo thao tác | Tap 1 chất liệu | "Chạm vào chất liệu bạn thấy đúng." | `ui_tap` | 14–40s | Không |
| 4 | Choice | Quyết định | Popup một câu, 3 đáp án | Ổn định | Tap đáp án | "{{prompt}}" | `ui_select` | 40–110s | Có |
| 5 | Consequence | Hậu quả | Look đổi phom/texture | Fade/zoom nhẹ | Tap "Tiếp tục" | "{{feedback}}" | `confirm_partial` | 110–140s | Có |
| 6 | Progress | Thấy tiến bộ | 3 mảnh vải ghép thành look | Một lần, không lặp | Không | "Còn một lựa chọn để chốt." | `progress_tick` | 140–155s | Có |
| 7 | Reveal | Trả phong cách | Look hoàn chỉnh + tên phong cách | Dolly/fade ngắn | Tap "Xem phong cách" | "Đây là cách bạn mặc bộ này." | `reward` | 155–170s | Có |
| 8 | CTA | Chia sẻ/đăng ký | Thẻ 9:16 + nút nhận thông báo | Tĩnh | Tap "Nhận thông báo" | "Mở bán: nhận tin trước." | `silence` | 170–180s | Không |

## 6. Sound cue

| Cue | Trigger | Intent | Texture | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_studio` | Vào game | Không gian studio | Pad + noise vải | Loop | −28 dB | Im lặng |
| `ui_tap` | Chạm chất liệu | Phản hồi | Vải chạm nhẹ | 80 ms | −22 dB | Texture đổi |
| `ui_select` | Chọn đáp án | Xác nhận | 2 nốt ngắn | 200 ms | −20 dB | Nút pressed |
| `confirm_partial` | Phản hồi | Ghi nhận | Chuông trầm | 300 ms | −18 dB | Feedback chữ |
| `reward` | Xem phong cách | Ghi nhận | Pad dâng + chuông | 1 s | −15 dB | Look hiện |
| `silence` | Trước CTA | Tập trung | Không | 400 ms | — | — |

## 7. Acceptance

- [ ] 3 phút ± 10/100; CTA luôn thấy; thẻ chia sẻ 9:16 không lộ dữ liệu cá nhân.
- [ ] Ảnh lookbook có quyền dùng; không dùng nhạc ngoài gói.
- [ ] Không bịa số lượng/độ hiếm; không bán trong lúc chơi.
- [ ] One-finger; kéo/rê có tap thay thế.
- [ ] Có bản no-sound và reduced motion; QA phủ 320×640 → 1440×900.
- [ ] Đăng ký nhận tin có consent rõ; không mặc định opt-in marketing.

## 8. Outputs & handoff

Tạo 8 artifact. `brand-3d-world` chỉ dùng nếu lookbook cần dựng cảnh; nếu không, dùng ảnh + CSS. `game-launch-kpi` chốt event trước khi mở bán.
