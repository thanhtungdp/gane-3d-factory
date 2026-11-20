# Run brief 01 — 90 giây booth teaser

## Run meta

| Trường | Giá trị |
|---|---|
| Scenario | `playbooks/scenarios/01-90s-booth-teaser.md` |
| Mode đề xuất (factory) | `design` → chạy thêm `qa-plan` để kiểm trước khi dựng booth |
| Thời lượng | 90 giây |
| Brand hư cấu | Xưởng Gốm La |
| Người chạy | Tester độc lập (không đọc docs/case hiện tại) |
| Ngày | 2026-11-14 |
| Phiên bản skill | Theo `.dsh/skills/` tại thời điểm chạy |
| Trạng thái | Đủ artifact để duyệt design; còn 4 mục `[cần xác nhận]` |

## Inputs audit

| Input bắt buộc | Có? | Ghi chú |
|---|---|---|
| Vấn đề kinh doanh | Có | Khách đi ngang không hiểu vì sao gốm thủ công khác gốm công nghiệp |
| Audience + insight | Có | Người mua đồ gia dụng cho nhà mới; sợ "thủ công" nhưng nhận hàng loạt giống nhau |
| Brand truth + proof | Một phần | Proof trong scenario: quy trình nung theo lô, vết men không lặp, ảnh xưởng thật. Cần file ảnh được duyệt `[cần xác nhận]` |
| Hành động chính | Có | Quét QR nhận thiệp + để lại Zalo/email |
| Kênh/thiết bị/ngôn ngữ | Có | Booth, màn hình dọc, mobile; tiếng Việt |
| KPI + guardrail | Có tên chỉ số | Baseline chưa có; không đặt số mục tiêu |
| Ràng buộc pháp lý | Một phần | Consent khi thu Zalo/email `[cần xác nhận]`; pháp nhân/DPO `[cần xác nhận]` |
| Asset | Một phần | Chỉ ảnh xưởng được cấp; chưa có danh sách file `[cần xác nhận]` |
| Link QR/landing | Chưa | `[cần xác nhận]` |
| Offline sau lần tải đầu | Có yêu cầu | Booth có thể mất Wi-Fi; cần cache shell |

**Kết luận:** đủ để chạy `design`; không đủ để build vì thiếu asset list, QR link và consent text.

## Skill đã dùng

| Skill | Vì sao | Artifact |
|---|---|---|
| `brand-game-factory` | Chọn mode, routing, gate | `run-brief.md` |
| `game-brief-for-brand` | Chốt vấn đề, audience, promise, proof, wow | `brief.md` |
| `game-narrative-and-tone` | Premise, ẩn dụ, guide, tone | `story-bible.md`, `tone-matrix.md` |
| `game-storyboard-and-sound` | Beat, thời lượng, cue sheet | `storyboard.md`, `sound-cue-sheet.md` |
| `brand-game-loop` | 3 act, 6 quyết định, scoring, skip | `loop.md` |
| `mobile-game-cockpit` | Layout booth, dock, sheet, safe area | `cockpit.md` |
| `game-qa-autopilot` | Matrix viewport, assertion, screenshot | `qa-plan.md` |
| `brand-3d-world` (tùy chọn) | Chỉ dùng cho beat reveal nếu cần không gian | Ghi chú trong `storyboard.md`; không dựng 3D ở bản 90 giây này |

Giới hạn đọc: đã đọc factory + scenario + các skill con cần thiết (`brief`, `narrative-tone`, `storyboard-sound`, `loop`, `mobile`, `qa`, `3d`). Không đọc docs/01, docs/06, `src/game/content`, `playbooks/case-saokim.md`.

## Artifact manifest

| Artifact | Trạng thái | Ghi chú |
|---|---|---|
| `run-brief.md` | Xong | File này |
| `brief.md` | Xong | 1 hành động chính, 3 wow moments |
| `story-bible.md` | Xong | Workshop pattern, 3 hồi |
| `tone-matrix.md` | Xong | 4 trục, 5 câu mẫu |
| `storyboard.md` | Xong | 8 beat, 90 giây |
| `sound-cue-sheet.md` | Xong | 9 cue, phủ taxonomy |
| `loop.md` | Xong | 3 act, 6 quyết định |
| `cockpit.md` | Xong | Booth + mobile, 320→1440 |
| `qa-plan.md` | Xong | Matrix 7 viewport, assertion |

## Gate status

| Gate | Trạng thái | Ghi chú |
|---|---|---|
| Một hành động chính | Đạt | QR nhận thiệp |
| Không bán trong lúc chơi | Đạt | Không giá/offer |
| CTA không bị chôn | Chưa test | Chỉ định trong cockpit/QA |
| Một vùng cuộn | Đạt thiết kế | Body một vùng; dock ngoài |
| Không `%` trong UI | Đạt thiết kế | Dùng X/10 và số đếm act |
| Không bịa số/khách/đối thủ | Đạt | Proof chỉ từ scenario; số liệu để trống |
| Storyboard trước code | Đạt | Có storyboard + cue sheet |
| Offline sau tải đầu | Cần build | Chưa có service worker; QA có test |

## Quyết định & giả định

1. Không có intro riêng: beat Hook 5 giây đóng vai trò intro, vì booth cần CTA sớm. Nếu brand muốn intro, phải thêm 10–15 giây và giảm beat choice.
2. Không dùng 3D WebGL: 90 giây trên thiết bị booth không ổn định; dùng 2.5D/CSS. Ghi là tùy chọn đã bỏ, không phải thiếu sót.
3. Không có lead gate trong game; form chỉ mở sau khi bấm "Nhận thiệp" và rời màn hình game.
4. Điểm số không hiển thị trong 90 giây; chỉ dùng nội bộ để chọn thiệp. Scoring vẫn định nghĩa trong `loop.md` để tái sử dụng.

## Điều kiện dừng

Dừng trước build đến khi có: (1) danh sách ảnh xưởng được duyệt, (2) link QR + form consent, (3) xác nhận pháp nhân/DPO cho câu consent, (4) xác nhận booth có tablet dọc hay màn hình ngang.
