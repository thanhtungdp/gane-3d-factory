# Cockpit spec — {{game}}

## 1. Màn hình

> Chỉ giữ màn có thật; teaser không có report/question thì xoá hàng tương ứng.

| Screen | Mục tiêu | CTA chính | Test ID |
|---|---|---|---|
| intro | {{...}} | {{...}} | `intro-cta` |
| play | {{...}} | {{...}} | `continue` |
| result | {{...}} | {{...}} | `continue` |
| report | {{...}} | {{...}} | `unlock-report` |

## 2. Layout

| Breakpoint | Cách đặt panel | Chiều cao | Ghi chú |
|---|---|---|---|
| 320–699 | panel đáy | {{...}} | ưu tiên CTA |
| 700–899 | panel đáy rộng | {{...}} | nội dung max 640 |
| 900–1199 | console phải | {{...}} | nếu đủ cao |
| ≥1200 | console phải | {{...}} | desktop |
| landscape thấp | console phải | {{...}} | không panel 59dvh |

## 3. Vùng cuộn

- Chỉ một scroller: `{{selector}}`.
- Header: `{{...}}`.
- Dock: `{{...}}`.
- Không đặt CTA cuối nội dung.

## 4. One-question sheet

- Một câu, tối đa {{3/4}} option.
- Footer: `Ẩn` + `Tiếp tục`.
- Sau khi chọn: thu gọn option, feedback + giải thích ngắn.
- Ẩn → pill mở lại; queue FIFO.
- Test ID: `question-modal`, `question-option-{id}`, `question-continue`, `question-pill`.

## 5. Intro gate

- Lần đầu / đã xem / resume / `?intro=0|1`.
- Skip luôn thấy; CTA khi intro xong.
- Lưu `localStorage` key `{{key}}`.

## 6. Mobile rules

- Tap ≥44px.
- Safe-area top/bottom.
- Không hover-only.
- Text không nhỏ hơn {{12px}}.
- Motion nhẹ; reduce motion có fallback.

## 7. Test matrix

| Viewport | CTA thấy | Không tràn ngang | Popup không scroll |
|---|---|---|---|
| 320×640 | ☐ | ☐ | ☐ |
| 344×882 | ☐ | ☐ | ☐ |
| 390×844 | ☐ | ☐ | ☐ |
| 540×720 | ☐ | ☐ | ☐ |
| 725×870 | ☐ | ☐ | ☐ |
| 884×1104 | ☐ | ☐ | ☐ |
| 1024×600 | ☐ | ☐ | ☐ |
| 1440×900 | ☐ | ☐ | ☐ |
