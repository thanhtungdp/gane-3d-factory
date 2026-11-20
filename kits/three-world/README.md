# three-world kit

Kit hợp đồng cho lớp không gian 3D/2.5D của một brand game: chốt scene brief, quality tiers và implementation map trước khi dựng canvas. Kit **không chứa engine** và không phải template code — nó là lớp contract để dev/QA bám vào, tránh mỗi người hiểu một kiểu.

## Khi nào dùng

- Đã có storyboard/beat list và cần biến thành scene/camera/motion cụ thể.
- Cần thống nhất: một canvas, mode nào WebGL, tier low fallback gì, test hook nào.
- Cần handoff rõ cho dev 3D, dev UI và QA.

Không dùng khi chỉ cần landing tĩnh, hoặc chưa có brand truth/CTA/viewport matrix — quay lại skill brief/storyboard trước.

## Files

| File | Dùng để |
|---|---|
| [`contracts/scene-brief.md`](contracts/scene-brief.md) | Chốt world logic, scene modes, camera/motion, depth, tier, asset, test hook |
| [`contracts/quality-tiers.md`](contracts/quality-tiers.md) | Chốt detect tier, ma trận high/mid/low, fallback 2.5D, reduced motion |
| [`contracts/implementation-map.md`](contracts/implementation-map.md) | Map contract → file/module thật, test hook, budget, case study reference |

Skill điều phối: [`brand-3d-world`](../../.dsh/skills/brand-3d-world/SKILL.md). Gate chung: [`_shared/quality-gates.md`](../../.dsh/skills/_shared/quality-gates.md).

## Cách dùng

1. Copy ba contract vào dự án (hoặc link từ plan), điền placeholder `{{brand}}`, `{{world}}`, `{{acts}}`.
2. Chốt visual language + scene modes; mỗi mode ghi camera, object, enter/exit.
3. Chốt tier + fallback low + reduced motion; ghi rõ test hook.
4. Cập nhật implementation map sang file thật; ghi budget fps/chunk/asset.
5. QA dùng implementation map + contract quality làm checklist; screenshot theo beat.

## Nguyên tắc

- **Một canvas**, full-screen, `pointer-events: none`; UI/CTA/HUD ở DOM.
- **Tier low không WebGL**; fallback poster/CSS giữ nguyên nội dung và CTA.
- 3D chunk **lazy**; DPR ≤ 1.5; không postprocessing nặng; dispose sạch.
- Hero/CTA không bị đè ở viewport thấp; scrim chữ thuộc DOM, không che CTA.
- Reduced motion: camera tĩnh, fade ngắn, không mất thông tin.
- Chỉ brand asset same-origin + procedural; không stock/asset ngoài.

## Case study (chỉ để tham chiếu, không copy nội dung)

- Storyboard/beat: [`docs/06-storyboard.md`](../../docs/06-storyboard.md).
- Entry/canvas + fallback: [`src/three/SceneCanvas.tsx`](../../src/three/SceneCanvas.tsx), [`src/three/Poster.tsx`](../../src/three/Poster.tsx).
- Tier detect/downgrade: [`src/lib/quality.ts`](../../src/lib/quality.ts).
- Mapping chi tiết: [`contracts/implementation-map.md`](contracts/implementation-map.md).

Khi dùng case study: chỉ lấy **cấu trúc và quyết định**, không copy câu chữ, màu, tên nhân vật hay bố cục của dự án đó sang dự án mới.
