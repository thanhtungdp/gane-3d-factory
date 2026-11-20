# Cockpit — Ca đầu tiên · Bánh mì Hạnh

> Một cột dọc: HUD trên, body, dock dưới. Không scroll lồng. CTA luôn ngoài vùng cuộn.

## 1. Màn hình

| Screen | Mục tiêu | CTA chính | Test ID |
|---|---|---|---|
| `intro` | Vào ca, nói rõ 10 phút và 4 tình huống | Vào ca | `intro-cta` |
| `play` | Act hiện tại + checklist + câu hỏi | Tiếp tục (disabled có nhãn) | `continue` |
| `question` | Một câu, 3 đáp án, ẩn được | Chọn đáp án | `question-modal`, `question-option-{a,b,c}` |
| `consequence` | Hậu quả + explain | Tiếp tục | `continue` |
| `quiz` | 3 câu kiểm tra cuối ca | Nộp bài | `quiz-submit` |
| `result` | X/10, n/3, 2 vùng yếu | Xem bàn giao | `result-cta` |
| `handover` | Bản bàn giao đã điền + xác nhận đã đọc | Xác nhận | `handover-confirm` |
| `saved` | Đã gửi quản lý ca, mã ghi nhận | Đóng | `saved-close` |

## 2. Layout

| Breakpoint | Cách đặt panel | Chiều cao | Ghi chú |
|---|---|---|---|
| 320–699 | Panel đáy, bo trên 16px | max 72dvh | Câu hỏi 1 câu; option xếp dọc, mỗi option ≥44px |
| 700–899 | Panel đáy rộng | max 72dvh | Nội dung max 640px, canh giữa |
| 900–1199 | Console phải 420px | cao 100dvh | Chỉ khi chiều cao ≥700px; nếu thấp hơn, quay về panel đáy |
| ≥1200 | Console phải 480px | cao 100dvh | Desktop xem lại kết quả; cùng luồng chơi |
| Landscape thấp (≤600px cao) | Console phải | 100dvh | Không dùng panel `59dvh`, không cắt dock |

- Fold cover (344×882 dọc): nội dung max 640px; dock vẫn thấy.
- Fold inner (725×870): console phải; không đặt CTA trong vùng cuộn.
- Duo (540×720 một màn): panel đáy; chữ không nhỏ hơn 14px.

## 3. Vùng cuộn

- Chỉ một scroller: `#stage` (`overflow-y:auto; overscroll-behavior:contain`).
- Header `#hud` (4 mốc act + điểm tạm + nút loa) cố định, ngoài scroller.
- Dock `#dock` cố định đáy, ngoài scroller, có safe-area padding.
- Không đặt CTA cuối nội dung; không có `position:sticky` cho 2 phần tử cùng lúc.

## 4. One-question sheet

- Một câu, tối đa 3 option (đúng schema 2/1/0).
- Footer luôn thấy: `Ẩn câu hỏi` + `Tiếp tục` (disabled tới khi chọn).
- Sau khi chọn: thu gọn option thành 1 dòng đã chọn, hiện feedback + CTA.
- Ẩn → pill `Câu hỏi 2/3 đang chờ`; hàng đợi FIFO; câu đã trả lời không tự mở lại.
- Nút phụ `Dừng, hỏi quản lý ca` ở act 2–4: mở panel giải thích ngắn, không trừ điểm, không thoát game.
- Test ID: `question-modal`, `question-option-a|b|c`, `question-continue`, `question-pill`, `question-help`.

## 5. Intro gate

- Lần đầu thấy intro; đã xem thì vào thẳng act hiện tại.
- `?intro=0` bỏ intro, `?intro=1` luôn hiện (dùng cho QA/ảnh chụp).
- Skip intro luôn thấy, không cần đăng nhập, không cần tên/email.
- Lưu `localStorage` key `hanh-ca1-intro`.

## 6. Mobile rules

- Tap target ≥44×44px; khoảng cách giữa 2 option ≥8px.
- Safe-area top/bottom bằng `env(safe-area-inset-*)`; dock cao tối thiểu 56px + safe-area.
- Không hover-only; focus ring 2px thấy được trên nền sáng.
- Chữ tối thiểu 14px; option tối đa 3 dòng, không cắt chữ bằng ellipsis ở câu hỏi.
- Motion: sheet trượt 240ms, tick 120ms; reduced motion → hiện tức thì, cùng nội dung.

## 7. Audio / reduced motion

- Nút loa trong HUD: `aria-pressed`, nhớ ở `hanh-ca1-audio`; mặc định bật nhưng chỉ phát sau tap "Vào ca".
- No-sound: đúng/chưa khớp có nhãn chữ + đổi viền; không phụ thuộc `confirm_*`.
- Reduced motion: tắt trượt/fade/đổi màu dần; không mất nhãn, không mất mốc act.
- Tab ẩn: dừng `amb_shop`; quay lại khôi phục đúng lựa chọn âm thanh.

## 8. Test matrix

| Viewport | CTA thấy | Không tràn ngang | Popup không scroll | Ghi chú |
|---|---|---|---|---|
| 320×640 | ☐ | ☐ | ☐ | Mốc P0; option 3 dòng vẫn thấy `Tiếp tục` |
| 390×844 | ☐ | ☐ | ☐ | P0 |
| 540×720 | ☐ | ☐ | ☐ | Duo một màn |
| 725×870 | ☐ | ☐ | ☐ | Fold inner, console phải |
| 1024×600 | ☐ | ☐ | ☐ | Landscape thấp |
| 1440×900 | ☐ | ☐ | ☐ | Desktop |

## 9. Checklist 320 / fold

- [ ] Dock vẫn thấy khi bàn phím hệ thống mở; màn `handover` có 1 ô tuỳ chọn "mã nhân viên" (không bắt buộc, không phải bước đăng ký).
- [ ] Mốc act thứ 4 không bị cắt ở 320px (thu về chấm tròn + số).
- [ ] Câu hỏi dài 61 ký tự không đẩy `Tiếp tục` ra ngoài.
- [ ] Panel hậu quả ở act 3 dài nhất vẫn không cần cuộn để thấy CTA.
- [ ] Xoay ngang giữa phiên không mất act hiện tại.
