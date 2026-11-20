# Mobile cockpit kit

Template cho one-scroll cockpit, one-question sheet, dock CTA và fold/duo.

## Files

| File | Dùng cho |
|---|---|
| `templates/one-question-sheet.tsx.template` | popup một câu, footer luôn thấy |
| `templates/cockpit.css` | panel tiers, dock, safe-area |
| `references/ux-rules.md` | checklist mobile |

## Cách dùng

1. Copy `one-question-sheet` vào project, nối với state câu hỏi.
2. Copy CSS, đổi token màu/spacing theo brand.
3. Chạy QA matrix 320/390/540/725/884/1024/1440.
4. Không đặt CTA trong vùng `overflow-y: auto`.

## Không làm

- Không dùng modal full-screen che toàn bộ hành động.
- Không để footer trong body cuộn.
- Không bắt scroll để thấy nút chính.
- Không hardcode số act cố định; panel dùng cho bất kỳ số act.
