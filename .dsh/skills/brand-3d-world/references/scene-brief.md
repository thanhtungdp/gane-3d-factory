# Scene brief — mẫu điền

Artifact chốt lớp không gian cho `{{brand}}`. Điền đủ 13 mục; mục nào chưa có ghi `[cần xác nhận]`, không tự bịa. Bản contract rút gọn cho kit: `../../../../kits/three-world/contracts/scene-brief.md`.

## 1. World logic

Một câu: không gian này vận hành theo luật gì, và luật đó lấy từ brand truth nào.

## 2. Brand truth → wow beats

| Brand truth / proof | Beat (từ storyboard) | Người chơi phải cảm thấy | Bằng chứng hiển thị |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |

Không có proof thì bỏ beat đó, không thay bằng hiệu ứng chung.

## 3. Visual language

- Hướng chọn: procedural world / diorama 2.5D / hybrid.
- Vì sao hợp `{{brand}}` và `{{audience}}` (gắn proof, không gắn trend).
- Hướng đã cân nhắc và lý do loại.
- 3 từ khoá hình ảnh; 3 thứ cấm xuất hiện.

## 4. Scene modes

| Mode | Mục đích | Camera | Object chính | Ánh sáng | Enter / Exit | State owner |
|---|---|---|---|---|---|---|
| intro |  |  |  |  |  |  |
| hero |  |  |  |  |  |  |
| act |  |  |  |  |  |  |
| transition |  |  |  |  |  |  |
| reveal |  |  |  |  |  |  |

Chỉ một canvas; UI/CTA/HUD ở DOM. Ghi rõ mode nào dùng WebGL, mode nào dùng poster.

## 5. Camera & motion tokens

| Token | Giá trị | Ghi chú |
|---|---|---|
| Easing chính | `cubic-bezier(0.22,1,0.36,1)` |  |
| Damping |  |  |
| Transition fade | 300-500ms |  |
| Dolly |  |  |
| Shake tối đa | ≤ 0,4s, biên độ  |  |
| Parallax | số lớp, biên độ |  |

Transition matrix: mode A → mode B, kiểu, thời lượng, skip xử lý thế nào.

## 6. Depth bands & vùng an toàn

| Dải | Nội dung | Tốc độ | Có che UI không |
|---|---|---|---|
| far |  |  |  |
| mid (hero) |  |  |  |
| near |  |  |  |

Vùng CTA/HUD/dock: toạ độ an toàn theo viewport thấp nhất. Hero path không đi qua các vùng này.

## 7. Quality tiers

| Tier | Điều kiện detect | DPR | Geometry/particle | PostFX | Fallback |
|---|---|---|---|---|---|
| high |  |  |  |  |  |
| mid |  |  |  |  |  |
| low |  |  |  | **không WebGL** | poster/CSS |

Ghi rõ: chỉ tự hạ tier, không tự nâng; override dev; lưu tier; fps floor.

## 8. Low-tier fallback

Poster/SVG/CSS dùng brand asset nào; giữ nguyên thứ tự nội dung/CTA; test hook; cách chứng minh không tạo WebGL canvas.

## 9. Reduced motion

Những gì tắt/đổi: camera, shake, parallax, autoplay, typewriter, particle. Những gì **không** được mất: lớp sáng, thứ tự beat, CTA, thông tin.

## 10. Performance budget

| Hạng mục | Ngân sách |
|---|---|
| 3D chunk | lazy, không trong initial bundle |
| FPS | high ~60, sàn mid ~30 |
| DPR | ≤ 1.5 |
| Draw call / vertex / texture |  |
| PostFX | không/không nặng |
| Memory |  |

## 11. Asset list

| Asset | Nguồn | Quyền | Fallback |
|---|---|---|---|
| logo | same-origin | có | monogram |
|  | procedural | — |  |

Không stock/texture/âm thanh ngoài; không nhúng nội dung web.

## 12. Test hooks & screenshot beats

- Canvas/fallback: `data-scene`, testid cụ thể.
- Assertions: canvas count = 1; tier low không WebGL; không console error; CTA hiện ở mọi viewport; reduced parity; fps.
- Danh sách beat cần chụp + viewport matrix.

## 13. Risks

| Rủi ro | Mức | Cách giảm |
|---|---|---|
|  |  |  |
