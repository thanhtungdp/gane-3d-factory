# Run log

Bảng ghi các lần chạy playbook. Mỗi dòng là một lần chấm bằng `rubric.md`; **không xoá dòng cũ**, chỉ thêm dòng mới.

## Quy ước

- `Ngày`: YYYY-MM-DD.
- `Scenario`: tên file trong `../scenarios/` (không ghi tắt).
- `Brand`: tên brand hư cấu/thật đã dùng; nếu là client thật thì ghi mã nội bộ, không ghi PII.
- `Người chấm`: 1–2 người; nếu 1 người ghi `Tester độc lập`, nếu 2 người cách nhau dấu `/`.
- `Điểm`: 10 tiêu chí theo thứ tự clarity, story, tone, wow, loop, one-finger, mobile, evidence, report, measurement.
- `TB`: trung bình 10 tiêu chí, 1 số lẻ.
- `Gate`: `OK` hoặc mã lỗi cứng (ví dụ `CTA-320`, `SCROLL-LONG`, `PERCENT-UI`, `SELL-IN-GAME`).
- `Quyết định`: `pass` / `revise` / `fail`.
- `Việc tiếp`: 1 dòng, có người chịu trách nhiệm.

## Bảng

Kết quả dry-run 2026-11-14: scenario 01 và 04 ở mode `design`; đây là **spec draft**, chưa có asset/SOP thật nên Wow/Evidence còn 3 và quyết định `revise` là đúng. Artifact nằm trong `runs/01/`, `runs/04/`.

| Ngày | Scenario | Brand | Người chấm | Clarity | Story | Tone | Wow | Loop | One-finger | Mobile | Evidence | Report | Measurement | TB | Gate | Quyết định | Việc tiếp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-14 | 01-90s-booth-teaser.md | Xưởng Gốm La (hư cấu) | Tester độc lập | 4 | 4 | 4 | 3 | 4 | 5 | 4 | 3 | 3 | 3 | 3,7 | OK | revise | Bổ sung file proof/ảnh + event plan; CTA sau reveal đã được làm rõ trong quality gate |
| 2026-11-14 | 04-10min-internal-training.md | Bánh mì Hạnh (hư cấu) | Tester độc lập | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 4 | 3,8 | OK | revise | Bổ sung SOP/ảnh thật; scenario 04 đã sửa skip beat 4, thêm Camera/Motion và 3 cue còn thiếu |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Ghi chú lỗi hay gặp

- `CTA-320`: CTA rơi khỏi màn hình 320×640 — kiểm tra safe area và dock.
- `SCROLL-LONG`: scroll lồng hoặc CTA nằm trong vùng cuộn — tách dock.
- `PERCENT-UI`: còn ký hiệu phần trăm trong copy — đổi sang X/10, n/5, x/100.
- `SELL-IN-GAME`: offer/giá xuất hiện trước báo cáo/gate — chuyển ra sau gate.
- `NO-EVIDENCE`: phản hồi không gắn dữ liệu brand — bổ sung pre-scan hoặc proof.
- `AUDIO-ONLY`: tín hiệu quan trọng chỉ có âm thanh — thêm hình + chữ.
