# Game shell kit

Khung tối thiểu để dựng một game thương hiệu mới, không phụ thuộc story/theme cụ thể.

## Khi nào dùng

- Cần state màn hình, intro lần đầu, audio sau gesture, dock CTA, viewport.
- Muốn giữ đúng pattern đã chứng minh trong game hiện tại mà không copy toàn bộ app.

## Cách dùng

1. Copy file `.template` vào `src/` của dự án mới, bỏ hậu tố `.template`.
2. Thay `{{...}}` bằng tên game/route/cue.
3. Giữ interface `AudioPort`/`GameScreen`; thay implementation.
4. Đọc `reference-map.md` để xem implementation đầy đủ trong repo này.

## Không copy

- Nội dung/story hiện tại.
- API key, asset khách.
- Logic scoring/report cụ thể.

## Files

| File | Dùng cho |
|---|---|
| `templates/screen-flow.ts.template` | union screen + reducer |
| `templates/intro-gate.ts.template` | first-visit/query/resume |
| `templates/audio-director.tsx.template` | audio sau gesture + mute |
| `templates/game-dock.tsx.template` | CTA ngoài vùng cuộn |
| `templates/viewports.ts.template` | breakpoint/fold/duo |

## Reference map

Xem `reference-map.md`.
