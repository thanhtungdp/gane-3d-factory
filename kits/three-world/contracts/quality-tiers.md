# Contract — Quality tiers

Contract cho việc chọn và chạy tier hình ảnh. Không phải đặc tả engine; dự án tự chọn thư viện. Hướng dẫn dài hơn: [`brand-3d-world/references/quality-tiers.md`](../../../.dsh/skills/brand-3d-world/references/quality-tiers.md).

## Detect

| Bước | Điều kiện | Kết quả |
|---|---|---|
| 1 | Query dev `?quality=low|mid|high` | override để test |
| 2 | Không WebGL2 | low |
| 3 | `saveData` / data saver | low |
| 4 | `deviceMemory` / `hardwareConcurrency` thấp | mid hoặc low |
| 5 | `prefers-reduced-motion` | cap tối đa mid |
| 6 | fps dưới ngưỡng trong cửa sổ đo | hạ 1 bậc, không tự nâng |

- Lưu tier vào state chung; expose cho QA/debug.
- Không crash nếu thiếu API (`deviceMemory`, `matchMedia`, WebGL).
- Cửa sổ đo fps, ngưỡng fps và thời gian warmup do dự án chốt trong scene brief.

## Ma trận

| Thành phần | high | mid | low |
|---|---|---|---|
| WebGL | có | có | **không** |
| DPR | ≤ 1.5 | ≤ 1.25 | n/a |
| Geometry/particle | đủ | giảm | poster/CSS |
| PostFX | không/tối thiểu | tắt | tắt |
| Animation phụ | đủ | giảm | fade nhẹ |
| FPS mục tiêu | ~60 | sàn ~30 | n/a |

## Bắt buộc

- [ ] Tier low không tạo WebGL context; `canvas` WebGL count = 0.
- [ ] Fallback 2.5D giữ đúng nội dung, thứ tự, CTA và test hook.
- [ ] Chỉ hạ tier tự động; override dev không ghi đè dữ liệu người dùng.
- [ ] Reduced motion không mất thông tin.
- [ ] Dispose texture/geometry/material/listener khi đổi tier/unmount.
- [ ] 3D chunk lazy, không nằm trong initial bundle.

## Acceptance test

- `?quality=low`: fallback render, không console error, CTA hiện.
- Mobile yếu/high: fps thấp → hạ mid/low; không tự nâng lại.
- `prefers-reduced-motion`: camera tĩnh, chữ hiện đủ, không autoplay dài.
- Screenshot đủ 3 tier ở viewport thấp nhất + fold.

## Case study

Xem `src/lib/quality.ts` trong dự án tham chiếu (không copy implementation, chỉ đối chiếu khái niệm): [`src/lib/quality.ts`](../../../src/lib/quality.ts). Gate chung: [`_shared/quality-gates.md`](../../../.dsh/skills/_shared/quality-gates.md).
