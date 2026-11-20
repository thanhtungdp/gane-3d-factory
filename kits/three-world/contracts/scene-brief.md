# Contract — Scene brief

Artifact bắt buộc trước khi code lớp 3D/2.5D. Điền cho `{{brand}}`; mục chưa có ghi `[cần xác nhận]`. Hướng dẫn chi tiết: [`brand-3d-world/references/scene-brief.md`](../../../.dsh/skills/brand-3d-world/references/scene-brief.md).

## Bắt buộc có

- [ ] **World logic** 1 câu, gắn brand truth.
- [ ] Bảng **brand truth → beat → cảm giác → bằng chứng** (không có proof thì bỏ beat).
- [ ] **Visual language**: procedural / diorama 2.5D / hybrid + lý do và hướng loại.
- [ ] **Scene modes**: `intro | hero | act | transition | reveal` (hoặc tên tương đương), mỗi mode có camera, object chính, ánh sáng, enter/exit, owner state.
- [ ] **Camera & motion tokens**: easing, damping, fade/dolly duration, giới hạn shake/parallax.
- [ ] **Depth bands + vùng an toàn**: far/mid/near; CTA/HUD/dock; hero path.
- [ ] **Tier matrix** high/mid/low: DPR, geometry/particle, postFX, fallback.
- [ ] **Low-tier 2.5D**: dùng asset nào, giữ nội dung/CTA, cách chứng minh canvas = 0.
- [ ] **Reduced motion**: tắt gì, giữ gì.
- [ ] **Performance budget**: chunk lazy, fps, DPR, draw call/vertex/texture, memory.
- [ ] **Asset list**: brand same-origin + procedural + fallback.
- [ ] **Test hooks & screenshot beats**.
- [ ] **Risks / [cần xác nhận]**.

## Acceptance

- Một dev khác đọc contract dựng được scene mà không hỏi lại về bố cục/camera.
- QA suy ra được test case: canvas count, tier low, CTA visible, reduced motion, viewport matrix.
- Không có câu chuyện/brand cố định nào bị hardcode vào contract mẫu.
- Không có asset ngoài brand/procedural.

## Cấm

- Canvas thứ hai hoặc CTA nằm trong canvas.
- Hero/CTA bị panel/overlay che ở viewport thấp.
- Tier low vẫn tạo WebGL context.
- Reduced motion làm mất nội dung.
