# Depth & occlusion — checklist

Quy tắc để world 3D không che UI, không che hero, không che CTA. Áp dụng trước khi code và kiểm lại bằng screenshot.

## 1. Ba dải depth

| Dải | Ví dụ nội dung | Chuyển động | Có được che UI? |
|---|---|---|---|
| far | nền, trời, texture tĩnh | chậm nhất | có |
| mid | hero, vật thể chính, guide | trung bình | **không** |
| near | particle, foreground, khung | nhanh, biên độ nhỏ | **không** |

Hero phải nằm trong vùng nhìn thấy ở viewport thấp nhất, không bị panel/overlay/dock cắt mất phần nhận diện.

## 2. Thứ tự layer

1. Background CSS (màu, gradient).
2. Canvas full-screen: `position: fixed; inset: 0; pointer-events: none; z-index: 0`.
3. Scrim chữ (nếu cần) — DOM, nằm giữa canvas và nội dung.
4. Nội dung/HUD/panel — DOM, trên canvas.
5. Dock/CTA/Sheet/modal — DOM, trên cùng, không bao giờ nằm dưới canvas.

Canvas không nhận pointer event; mọi thao tác đi qua DOM. Không đặt CTA trong canvas.

## 3. Vùng an toàn

- Safe area top/bottom theo thiết bị; không đặt hero/chữ quan trọng dưới notch hoặc thanh gesture.
- CTA/dock: vùng cố định đáy; hero path không đi qua vùng này.
- Panel/HUD: nếu panel che 55-85 phần trăm chiều cao (theo pha), phần còn lại phải đủ thấy hero/khung chính.
- Fold/duo: kiểm ở cover và inner; hero không bị gập cắt qua mặt/logo.

## 4. Hero path

- Đường bay/di chuyển của hero/vehicle không cắt qua vùng dock, CTA, panel đang mở.
- Điểm dừng của hero không nằm sau overlay/scrim; nếu nằm sau, phải có bản đổi khung.
- Occlusion do world object khác: object near không được che hero ở beat quan trọng; nếu cần, đổi depth hoặc ẩn bớt.

## 5. Scrim & tương phản

- Chữ trên world cần scrim DOM hoặc nền bán trong suốt đủ tương phản; scrim không được che CTA.
- Gradient scrim phải kết thúc trước vùng CTA.
- Không dựa vào màu world để đảm bảo contrast; kiểm bằng ảnh grayscale.

## 6. Kiểm overlap

| Viewport | Kiểm gì |
|---|---|
| 320×640 | CTA hiện, hero không bị cắt mất nhận diện, panel không che CTA |
| 390×844 | mobile chuẩn; safe area |
| 540×720 | duo/fold hẹp; HUD không tràn |
| 725×870 | fold inner; panel + dock |
| 1024×600 | landscape thấp; hero + CTA cùng thấy |
| 1440×900 | desktop; canvas không phủ CTA |

Assert: canvas count = 1; CTA visible và bấm được; hero bounding box không giao với dock/panel/CTA; không scroll body khi modal mở.

## 7. Lifecycle & cleanup

- Dừng RAF/loop khi tab ẩn hoặc unmount; remove listener.
- Dispose geometry/material/texture tự tạo; canvas remove khỏi DOM.
- Không tạo canvas thứ hai khi đổi mode/tier; fallback dùng DOM.
- Xem thêm: `../SKILL.md`, `scene-brief.md`.
