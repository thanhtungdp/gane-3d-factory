# Quality tiers — contract tham chiếu

Ba tier cho lớp không gian, kèm cách detect, fallback và test. Điền số cụ thể theo dự án; không copy nguyên giá trị của case study.

## 1. Thứ tự detect

1. Override dev: query `?quality=low|mid|high` (chỉ dùng để test/QA, không phải A/B).
2. Không có WebGL2 → **low**.
3. `saveData` (data saver) → **low**.
4. `deviceMemory` thấp / `hardwareConcurrency` thấp → **mid** hoặc **low** theo ngưỡng dự án.
5. `prefers-reduced-motion` → cap tối đa **mid** (không tự coi là low nếu vẫn đủ khả năng).
6. Chỉ **hạ** tier khi fps thấp; không tự nâng. Lưu tier; expose cho QA/debug.

## 2. Ma trận tier

| Thành phần | high | mid | low |
|---|---|---|---|
| WebGL canvas | có | có | **không** |
| DPR | ≤ 1.5 | ≤ 1.25 | n/a |
| Geometry detail | cao | trung bình | poster |
| Particle/star count | nhiều | ít hơn | CSS tĩnh |
| Texture/anisotropy | đủ | giảm | brand asset phẳng |
| PostFX | tối thiểu | tắt | tắt |
| Animation phụ | đủ | giảm | fade nhẹ |
| FPS mục tiêu | ~60 | sàn ~30 | không áp dụng |
| Downgrade | tự động | tự động | dừng |

Ngưỡng fps và cửa sổ đo do dự án chốt trong scene brief; ghi cả cách đo.

## 3. Low-tier 2.5D

- Không tạo WebGL context; canvas count = 0.
- Poster/SVG/CSS thay thế: cùng brand asset, cùng thứ tự nội dung, cùng CTA, cùng test hook.
- Giữ tối thiểu: hero, trạng thái tiến trình, reveal cuối.
- Motion chỉ fade/transform nhẹ; tôn trọng reduced-motion.
- Không console error; không layout shift khi chuyển tier.

## 4. Reduced motion

- Camera tĩnh, không shake/parallax/dolly dài.
- Transition chỉ fade ≤200ms.
- Tắt particle/scanline/autoplay loop; chữ đánh máy hiện đủ câu.
- Không mất thông tin hay thứ tự beat.

## 5. Test tối thiểu

- `?quality=low`: tier low, không canvas WebGL, CTA hiện, không console error.
- `?quality=high` trên thiết bị yếu: fps thấp → tự hạ, không tự nâng lại.
- Canvas count = 1; unmount dọn listener/RAF/texture.
- `prefers-reduced-motion`: screenshot parity về nội dung, không motion dài.
- Xem thêm: `../../../../kits/three-world/contracts/quality-tiers.md`, gate `../../_shared/quality-gates.md`.
