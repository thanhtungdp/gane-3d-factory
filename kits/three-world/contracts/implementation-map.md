# Implementation map (case study)

Map khái niệm contract → file/module trong dự án tham chiếu. Đây là **reference**, không phải stack bắt buộc: dự án mới thay bằng đường dẫn tương đương. Không copy code/nội dung; chỉ dùng để kiểm tra một contract đã đủ chi tiết chưa.

| Khái niệm contract | File tham chiếu | Vai trò | Ghi chú |
|---|---|---|---|
| Canvas entry, fallback, modes | [`src/three/SceneCanvas.tsx`](../../../src/three/SceneCanvas.tsx) | Một canvas full-screen; tier low trả poster/CSS | `pointer-events: none`, lazy chunk |
| 2.5D poster/backdrop | [`src/three/Poster.tsx`](../../../src/three/Poster.tsx) | SVG/CSS không import three | Dùng cho map/report/low tier |
| Scene modes + camera/ship/star | [`src/three/scene/tokens.ts`](../../../src/three/scene/tokens.ts) | Bảng mode → transform/camera | Dễ đổi bố cục bằng số |
| Camera rig | [`src/three/scene/CameraRig.tsx`](../../../src/three/scene/CameraRig.tsx) | Damping, dolly, parallax, reduced motion | Không cắt cảnh |
| Object chính | [`src/three/scene/Planet.tsx`](../../../src/three/scene/Planet.tsx), [`src/three/scene/Star4.tsx`](../../../src/three/scene/Star4.tsx), [`src/three/scene/Ship.tsx`](../../../src/three/scene/Ship.tsx) | Hero/vehicle/guide | Dispose texture tự tạo |
| Nền/particle | [`src/three/scene/SpaceBackdrop.tsx`](../../../src/three/scene/SpaceBackdrop.tsx) | Starfield/nebula procedural | Tắt theo tier/reduced |
| Chuyển cảnh có quỹ đạo | [`src/three/scene/flight.ts`](../../../src/three/scene/flight.ts) | Pose theo tiến trình | Không set state mỗi frame |
| Quality detect/downgrade | [`src/lib/quality.ts`](../../../src/lib/quality.ts) | Tier + fps watcher + hook | Chỉ hạ bậc |
| Scene state | [`src/state/scene.ts`](../../../src/state/scene.ts) | Mode/planet/palette/lit/tier | Không copy state shape vào kit |
| Storyboard tham chiếu | [`docs/06-storyboard.md`](../../../docs/06-storyboard.md) | Beat, camera, sound, fallback | Chỉ tham chiếu cấu trúc |
| Audio (kit riêng) | [`kits/audio/README.md`](../../audio/README.md) | Cue taxonomy + reference map | Không trộn vào 3D kit |
| Mobile QA | [`docs/09-mobile-qa.md`](../../../docs/09-mobile-qa.md) | Viewport matrix, tiêu chí | Dùng cho test hook |
| Shot/QA script | [`scripts/shots.ts`](../../../scripts/shots.ts) | Chụp ảnh beat/viewport | Không bắt buộc |

## Cách điền cho dự án mới

1. Thay cột `File tham chiếu` bằng đường dẫn thật của dự án.
2. Thêm dòng cho test hook: `data-scene`, query tier, data attribute mode.
3. Thêm dòng cho budget: chunk lazy, fps, dpr, draw call, memory.
4. Ghi rõ file nào **không được copy** từ case study (engine, content, palette, tên riêng).

## Không copy

- Không copy shader/component code, câu chữ, logo, màu, tên nhân vật hay bố cục của dự án tham chiếu.
- Không coi stack trong case study là yêu cầu; chỉ giữ các gate/hợp đồng trong kit.
