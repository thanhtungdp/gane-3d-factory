---
scenario: 90 giây · booth teaser
duration: 90 giây
goal: Khách dừng 90 giây tại quầy, hiểu một điểm khác biệt của sản phẩm và để lại liên hệ hoặc quét QR nhận thiệp.
skills: [game-brief-for-brand, game-narrative-and-tone, game-storyboard-and-sound, brand-game-loop, mobile-game-cockpit, brand-3d-world, game-qa-autopilot]
outputs: [brief.md, story-bible.md, tone-matrix.md, storyboard.md, sound-cue-sheet.md, loop.md, cockpit.md, qa-plan.md]
---

# 90 giây · Booth teaser

## 1. Bối cảnh

Quầy hội chợ, khách đi ngang, thời gian chú ý rất ngắn. Game phải tự giải thích trong 10 giây và trả một thứ hữu hình (thiệp, mẫu thử, waitlist) để khách mang đi. Mục tiêu không phải dạy hết sản phẩm.

Brand hư cấu: **Xưởng Gốm La** — gốm thủ công, mỗi lô men khác nhau; chưa có số liệu bán hàng công khai.

## 2. Brief rút gọn

| Hạng mục | Nội dung |
|---|---|
| Vấn đề | Khách đi ngang không biết vì sao gốm thủ công khác gốm công nghiệp |
| Audience | Người mua đồ gia dụng cho nhà mới, thích sản phẩm có câu chuyện |
| Insight | Họ sợ mua "đồ thủ công" nhưng nhận hàng loạt giống nhau |
| Promise | Trong 90 giây, khách tự tay chọn men và thấy thành phẩm khác nhau ra sao |
| Proof | Quy trình nung theo lô, vết men không lặp, ảnh xưởng thật |
| Hành động chính | Quét QR để nhận ảnh thành phẩm + để lại Zalo/email |
| Kênh | Màn hình dựng tại booth + QR; mobile dọc |
| KPI giả thuyết | Tỉ lệ hoàn thành 90 giây; tỉ lệ để lại liên hệ; tỉ lệ quét QR |
| Guardrail | Không bịa số lô, không hứa "độc nhất"; không bán trong lúc chơi |
| Ràng buộc | Không asset ngoài ảnh xưởng được cấp; chạy offline sau lần tải đầu |

## 3. Narrative

- **Premise:** Người chơi là người chọn men cho một chiếc bình sắp vào lò, nhưng mỗi lò chỉ cho một lần chọn.
- **Ẩn dụ:** Workshop (xưởng) — theo `metaphor-patterns.md` mục 2; lý do: brand truth nằm ở quy trình và tay nghề.
- **Player role:** người đặt men, không phải người nung; quyền chọn, không quyền sửa lò.
- **Guide:** nghệ nhân trong xưởng ({{guide}}), nói ngắn, không quyết thay.
- **3 hồi:** Mở (nhận bình trống) → Thử thách (chọn men, nghe hậu quả) → Hé lộ (mở lò, thấy vết men của mình).

## 4. Loop

3 act, 100% một ngón tay.

| Act | Hành động | Quyết định | Feedback |
|---|---|---|---|
| 1 | Kéo bình vào lò | Chọn 1 trong 3 men (đất, tro, men mờ) | Mỗi men đổi màu/họa tiết và một câu hậu quả |
| 2 | Giữ nắp lò 2 giây | Giữ đúng nhịp hay mở sớm | Mở sớm: vết nứt; đúng: men chảy đều |
| 3 | Mở lò | Chọn cách kể về bình (ảnh, câu chuyện, cả hai) | Hiện thiệp chia sẻ + QR |

- **Progress:** 1/3 → 2/3 → 3/3 bằng hình bình sáng dần.
- **Skip:** có, ở mọi act; skip trả về thiệp mặc định.
- **Report mapping:** không có report dài; thiệp cuối là artifact.

## 5. Storyboard

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Dừng mắt | Bình trống trên bàn xoay, 1 vệt sáng | Tĩnh | Không | "Chiếc bình này chưa có men." | `amb_workshop` | 0–5s | Có |
| 2 | Promise | Nói rõ nhận gì | Ba hũ men mở nắp | Fade 200ms | Tap "Chọn men" | "Bạn chọn men. Lò sẽ kể phần còn lại." | `ui_confirm` | 5–12s | Có |
| 3 | First action | Dạy luật | Kéo bình vào lò | Theo thao tác | Kéo hoặc tap "Đưa vào lò" | "Đưa bình vào lò." | `ui_tap` | 12–30s | Không |
| 4 | Choice | Quyết định | 3 hũ men + mô tả ngắn | Ổn định | Tap 1 hũ | "Chọn một men." | `ui_select` | 30–50s | Có (mặc định) |
| 5 | Consequence | Thấy hậu quả | Lò nung, men chảy | Fade/zoom nhẹ | Tap "Giữ nắp" | "{{feedback}}" | `confirm_partial` | 50–65s | Có |
| 6 | Reveal | Trả proof | Mở lò, bình có vết men riêng | Một lần, không lặp | Tap "Mở lò" | "Không lô nào giống lô nào." | `reward` | 65–80s | Có |
| 7 | CTA | Hành động | Thiệp + QR | Dolly/fade ngắn | Tap "Nhận thiệp" | "Nhận ảnh bình của bạn." | `silence` | 80–90s | Không |

## 6. Sound cue

| Cue | Trigger | Intent | Texture | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_workshop` | Vào game | Không gian xưởng | Pad trầm + noise nhẹ | Loop | −26 dB | Im lặng |
| `ui_tap` | Tap chọn | Phản hồi | Click gỗ | 80 ms | −20 dB | Nút đổi màu |
| `confirm_partial` | Chọn men | Ghi nhận | Chuông trầm | 350 ms | −18 dB | Feedback chữ |
| `reward` | Mở lò | Ghi nhận thành phẩm | Pad dâng | 1.2 s | −14 dB | Ảnh + copy |
| `silence` | Trước QR | Tập trung | Không | 500 ms | — | — |

## 7. Acceptance

- [ ] 90 giây ± 10/100; CTA "Nhận thiệp" hiện ở 80 giây, từ lúc hiện luôn thấy và không cần cuộn; có QR/hành động phụ thay thế.
- [ ] Mọi thao tác một ngón tay; kéo bình có tap thay thế.
- [ ] Chạy offline sau lần tải đầu; không có asset ngoài ảnh xưởng.
- [ ] Không bán hàng/giá trong game; QR chỉ dẫn tới thiệp.
- [ ] Mỗi lựa chọn có hậu quả nhìn thấy được, không phán xét.
- [ ] `qa-plan.md` dùng canonical 8 mốc (320/344/390/540/725/884/1024/1440); tối thiểu 4 mốc chính, mở rộng đủ 8 trước launch.

## 8. Outputs & handoff

Tạo đủ 8 artifact ở frontmatter. Sau `loop.md` và `cockpit.md`, chạy `game-qa-autopilot`. Nếu booth không có Wi-Fi ổn định, ghi rõ chế độ offline trong `brief.md` trước khi dựng.
