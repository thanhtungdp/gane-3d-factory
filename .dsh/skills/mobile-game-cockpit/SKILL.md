---
name: mobile-game-cockpit
description: Use when designing a mobile-first game UI with one-finger interaction, one scroll region, an always-visible action dock, compact question sheets, safe areas, and fold/duo support.
---

# Mobile Game Cockpit

Biến game loop thành một khung chơi mobile không cần scroll để thấy CTA, không có scroll lồng nhau, và không vỡ trên fold/duo.

## When to use

- Game có hành động chọn/kéo/giữ trên điện thoại.
- Cần popup câu hỏi, panel nội dung, hoặc nhiều bước trong một màn.
- Cần hỗ trợ iPhone, fold cover/inner, duo, tablet.

Không dùng cho landing page tĩnh không có gameplay.

## Inputs

- Loop/act spec từ `brand-game-loop`.
- Danh sách màn hình và CTA chính mỗi màn.
- Nội dung câu hỏi/feedback.
- Thiết bị mục tiêu + breakpoint.
- Có intro không, có resume không.

## Steps

1. Vẽ **một cột dọc**: HUD trên, body, dock CTA dưới.
2. Chọn **một vùng cuộn duy nhất**; header và dock nằm ngoài vùng cuộn.
3. Đặt CTA chính trong dock; trạng thái disabled phải có nhãn nói rõ cần làm gì.
4. Thiết kế **one-question sheet**:
   - một câu, tối đa 4 option;
   - footer luôn thấy;
   - sau khi chọn, thu gọn option, hiện feedback + CTA;
   - ẩn được, có pill mở lại.
5. Intro gate: chỉ lần đầu, skip, resume bỏ qua, `?intro=0/1` cho test.
6. Kiểm tra 320×640 trước; sau đó 344, 390, 540, 725, 884, 1024, 1440 (canonical 8).
7. Fold/duo: nội dung tối đa 640px, console phải từ 900px, không cắt CTA.
8. Quy định safe-area, 44px tap, focus, reduced motion.
9. Đặt test ID ổn định cho QA.

## Outputs

`cockpit.md` gồm:

- Layout theo breakpoint.
- Cây màn hình.
- Hành vi dock/question/intro.
- Test ID.
- Checklist 320/fold.
- Ghi chú audio/reduced.

Template: `templates/cockpit-spec.md`.
Code tham chiếu: [`kits/mobile-cockpit`](../../../kits/mobile-cockpit/README.md).

## Quality gates

- Không có scroll lồng nhau.
- CTA chính thấy ở 320×640 khi đã đến lúc dùng; màn chơi luôn có CTA trong dock, teaser/intro có thể chỉ hiện sau reveal nhưng không cần cuộn.
- Popup sau khi chọn không cần cuộn để thấy CTA (mục tiêu).
- Không có nút chỉ xuất hiện sau khi cuộn.
- Mọi tap target ≥44px.
- Fold/duo không cắt nội dung.
- Reduced motion không làm mất thông tin.
- Audio không chặn thao tác; tắt được.

## Handoff

Sang `game-qa-autopilot` với `cockpit.md` và test ID. Nếu có 3D, sang `brand-3d-world` để chốt vùng nhìn/che khuất.
