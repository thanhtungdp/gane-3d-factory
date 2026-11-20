---
name: game-qa-autopilot
description: Use when turning a playable brand game into an automated QA plan for viewport layout, CTA visible at the right moment, one-scroll behavior, copy quality, audio opt-out, reduced motion, and screenshot evidence.
---

# Game QA Autopilot

Biến bản chơi được thành bộ kiểm tra lặp lại được, không phụ thuộc cảm giác “nhìn ổn”.

## When to use

- Trước khi cho khách xem hoặc launch.
- Sau khi đổi layout, intro, câu hỏi, âm thanh.
- Khi cần chứng minh game chạy trên iPhone/fold/duo/desktop.

## Inputs

- URL dev/staging.
- Danh sách screen + CTA chính.
- Test ID đã chốt.
- Nội dung copy cần kiểm tra.
- Thiết bị mục tiêu + browser.

## Steps

1. Chọn **ma trận viewport**: 320×640, 344×882, 390×844, 540×720, 725×870, 884×1104, 1024×600, 1440×900.
2. Với mỗi screen:
   - CTA chính visible + bounding box nằm trong viewport;
   - không tràn ngang;
   - không có scroll lồng nhau;
   - screenshot.
3. Popup câu hỏi: sau khi chọn, footer + CTA visible; body không cần scroll ở 320×640.
4. Nội dung: prompt ≤85, option ≤120, chênh lệch ≤55, không `%`, không meta-answer.
5. Audio: mặc định bật nhưng chỉ sau gesture; tắt được; nhớ lựa chọn; no-sound vẫn đủ.
6. Reduced motion + tier low: CTA vẫn thấy, không mất nội dung.
7. Ghi **failure modes** đã gặp và test bảo vệ.

## Outputs

`qa-plan.md` gồm:

- Matrix.
- Assertions.
- Test file mapping.
- Screenshot list.
- Known risks.

Template: `templates/qa-plan.md`.
Code tham chiếu: [`kits/qa-playwright`](../../../kits/qa-playwright/README.md).

## Quality gates

- Không có CTA nào cần scroll mới thấy. Ở teaser/intro, test trạng thái sau reveal; ở màn chơi, test ngay khi màn mở.
- Không có nested scroll ở màn chơi.
- Tất cả tap target ≥44px.
- 320×640 là gate cứng.
- Có ít nhất 1 screenshot mỗi viewport chính.
- Test content-copy chạy trong unit test.
- Test không phụ thuộc dữ liệu thật của một brand cụ thể.

## Handoff

Nếu fail: quay lại `mobile-game-cockpit` (layout) hoặc `brand-game-loop` (nội dung). Nếu pass: sang `game-launch-kpi`.
