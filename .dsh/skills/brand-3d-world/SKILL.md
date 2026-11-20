---
name: brand-3d-world
description: Use when choosing a 3D/2.5D visual language and specifying scene, camera, motion, quality tiers, mobile depth/orbit, and fallbacks.
---

# Brand 3D world

Chốt **ngôn ngữ hình ảnh không gian** cho brand game: có cần WebGL không, scene gồm lớp nào, camera/motion ra sao, tier nào chạy gì, mobile/fold xử lý thế nào, fallback ra sao. Skill này không viết story, không thiết kế gameplay, không đặc tả shader chi tiết — các phần đó thuộc skill khác và kit implementation.

## When to use

- Cần không gian làm wow thị giác cho `{{brand}}`, không chỉ landing tĩnh.
- Cần trả lời: WebGL hay 2.5D; scene gồm gì; camera/motion; tier low có gì; CTA có bị che không.
- Cần scene contract đủ rõ để dev dựng canvas và QA test trên mobile/fold.
- Không dùng khi chỉ cần typography/layout; chưa có brand truth; hoặc cần đặc tả engine/shader (dùng kit).

**Dừng nếu thiếu:** brand truth có proof; danh sách beat/storyboard; hành động CTA chính; viewport matrix. Ghi `[cần xác nhận]`, không tự sáng tác.

## Inputs

- `brief.md`, `story-bible.md`/`storyboard.md` từ các skill trước.
- Brand truth + proof; logo/palette có quyền dùng, cùng origin.
- Hành động chính + vị trí CTA/HUD/dock.
- Viewport matrix, thiết bị yếu nhất, ngân sách hiệu năng.
- Placeholder: `{{brand}}`, `{{audience}}`, `{{world}}`, `{{guide}}`, `{{acts}}`, `{{duration}}`.
- Kit: `../../../kits/three-world/README.md`; gate: `../_shared/quality-gates.md`.

## Steps

### 1. Chọn visual language theo brand truth
Chọn 1 trong 3 hướng và ghi lý do gắn với proof, không chọn theo trend:

| Hướng | Hợp khi | Rủi ro |
|---|---|---|
| Procedural world (shader/low-poly) | brand truth là chuyển hoá/hệ thống, cần "thế giới sống" | nặng GPU, dễ generic |
| Diorama 2.5D (SVG/CSS/lớp phẳng) | brand truth là craft/sản phẩm vật lý, cần gần gũi | ít wow nếu thiếu nhịp |
| Hybrid (hero 3D + phần còn lại 2.5D) | cần wow ở 1-2 beat, phần còn lại nhẹ | phải quản lý 2 ngôn ngữ |

Viết **1 câu world logic** và **1 câu cảm giác** người chơi phải có. Chi tiết wow phải bám brand truth/proof; cắt hiệu ứng trang trí vô nghĩa.

### 2. Scene contract
Một canvas duy nhất, full-screen, `pointer-events: none`, nằm sau UI; UI/CTA/HUD thuộc DOM. Chốt bảng scene mode generic (`intro | hero | act | transition | reveal`): camera, object chính, ánh sáng, enter/exit, state thuộc về ai. Ghi resize/orientation/fold, pause khi tab ẩn, cleanup listener/RAF. Không tạo canvas thứ hai.

### 3. Camera & motion
Một camera; nội suy vị trí/lookAt/fov có damping; easing mặc định `cubic-bezier(0.22, 1, 0.36, 1)`. Chọn motion theo nghĩa: tiến gần = quan tâm, lùi = nhìn lại, di chuyển = khoảng cách, pulse = hé lộ. Giới hạn: shake chỉ khi có lý do và ≤ 0,4s; không zoom liên tục; parallax 2-3 lớp biên độ nhỏ. Ghi transition matrix (fade/dolly) 300-700ms, không cắt cảnh, không chặn input. Recipe: `references/motion-recipes.md`.

### 4. Mobile depth/orbit & fold
Chia 3 dải depth: far (chậm), mid (hero), near (nhanh, không che UI). Hero/CTA nằm trong vùng an toàn, không đi sau panel/overlay/dock — **hero không bị đè** là gate cứng. Mobile: giảm orbit/parallax, ưu tiên hero + UI tĩnh; test fold/duo. Checklist: `references/depth-and-occlusion.md`.

### 5. Quality tiers
Detect theo thứ tự: query dev (`?quality=`) → WebGL2 → saveData → deviceMemory/hardwareConcurrency → reduced-motion (cap mức thấp hơn). Ba tier; mỗi tier ghi rõ DPR cap, geometry detail, particle/star count, texture/anisotropy, postFX (không bật trên mobile), nhánh bỏ bớt. Chỉ tự **hạ** tier khi fps thấp; không tự nâng. Lưu tier, expose cho QA. Contract: `references/quality-tiers.md` và `../../../kits/three-world/contracts/quality-tiers.md`.

### 6. Low-tier 2.5D
Tier low = **không tạo WebGL context**. Thay bằng poster/SVG/CSS dùng cùng brand asset, cùng thứ tự nội dung, cùng CTA, cùng test hook. Animation chỉ fade/transform nhẹ; không mất thông tin; không console error. Test bằng query tier low: canvas count = 0, fallback render đúng.

### 7. Reduced motion
Camera tĩnh (không dolly/shake/parallax), không autoplay motion dài, transition chỉ fade ≤200ms, tắt particle/scanline, chữ đánh máy hiện đủ câu. Vẫn giữ đủ lớp thông tin và thứ tự beat.

### 8. Performance budget
Chốt trước khi code: 3D chunk lazy (nằm ngoài initial bundle); mục tiêu ~60fps high, sàn ~30fps mid; DPR ≤1.5; trần draw call/vertex/texture; không postprocessing nặng; texture procedural/brand asset; dispose geometry/material/texture; fps sampler cửa sổ ~3s. Đưa budget vào `implementation-map`.

### 9. Asset vs procedural
Chỉ brand asset same-origin (logo, màu, font có quyền) + procedural (shader, gradient, particle). Không stock ảnh/texture/âm thanh ngoài, không font lạ, không nhúng nội dung web. Logo thiếu → fallback monogram. Decal canvas texture phải dispose; cache asset dùng lại.

### 10. Depth & occlusion rules
UI luôn trên canvas; canvas `pointer-events: none`. Hero path không đi qua vùng dock/panel/CTA; scrim chữ thuộc DOM, không che CTA. Kiểm overlap ở viewport thấp nhất và fold: hero không bị cắt mất phần nhận diện; CTA không bị world object/overlay đè. Bảng kiểm: `references/depth-and-occlusion.md`.

### 11. Intro & transition
Intro là tuỳ chọn: chỉ lần đầu, skip luôn hiện, CTA hiện sau beat cuối, không tự chuyển cảnh. Nội dung intro lấy từ brand truth/act contract, không hardcode câu chuyện. Transition có matrix fade/dolly; skip phải dừng timer/camera đúng; restore mode cũ.

### 12. Test hooks
Expose `data-scene="canvas|fallback"`, testid cho canvas/fallback/hero/controls, data attribute mode. QA cần: canvas count = 1; tier low không WebGL; không console error; CTA hiện ở viewport matrix; reduced-motion parity; fps + downgrade; screenshot theo beat. Ghi test hook vào `implementation-map`.

## Outputs

- `scene-brief.md` theo `references/scene-brief.md` và kit contract.
- `quality-tiers.md`, `motion-recipes.md`, `depth-and-occlusion.md` đã điền cho dự án.
- `implementation-map.md`: module giữ scene/camera/tier/fallback, test hook, budget.
- Screenshot theo beat + viewport; lý do chọn visual language gắn brand truth.

## Quality gates

- Gate chung: `../_shared/quality-gates.md`.
- **Không WebGL ở tier low**; tier low đủ nội dung + CTA, không lỗi console, canvas count = 0.
- **Một canvas**; canvas không chặn UI; **CTA không bị ẩn**; hero/CTA không bị đè ở viewport thấp.
- **Không say chuyển động**: không shake dài, không zoom liên tục, parallax nhỏ; reduced-motion không mất nội dung.
- **Hiệu năng**: 3D chunk lazy; fps đo được; tự hạ tier; DPR ≤1.5; dispose sạch; không postFX nặng.
- **Brand truth**: mọi beat wow gắn evidence; không hardcode câu chuyện/brand cố định trong lớp tái sử dụng.
- **Asset hợp lệ**: chỉ brand asset same-origin + procedural; có fallback logo.

## Handoff

- Giao `scene-brief.md` + `quality-tiers.md` + `implementation-map.md` cho dev/QA.
- Skill tiếp: `mobile-game-cockpit` (HUD/panel/CTA), `game-qa-autopilot` (test matrix), `game-storyboard-and-sound` (cue sheet theo beat), `brand-game-loop` (nhịp act/mode).
- Dừng nếu chưa có brand truth, CTA, viewport matrix, hoặc budget fps/asset.

## References

- `references/scene-brief.md`
- `references/quality-tiers.md`
- `references/motion-recipes.md`
- `references/depth-and-occlusion.md`
- Kit implementation: `../../../kits/three-world/README.md`
- Audio cue kit: `../../../kits/audio/README.md`
