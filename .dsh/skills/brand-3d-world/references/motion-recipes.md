# Motion recipes — tham chiếu

Recipe generic cho camera/motion trong lớp không gian. Chọn theo **nghĩa** của beat, không theo trend. Mọi số là gợi ý; chốt lại trong scene brief.

## Token gợi ý

| Token | Giá trị gợi ý | Dùng cho |
|---|---|---|
| Easing chính | `cubic-bezier(0.22, 1, 0.36, 1)` | camera, panel, reveal |
| Easing vào | ease-out | element xuất hiện |
| Easing ra | ease-in | element rời |
| Fade chuyển cảnh | 300-500ms | giữa mode |
| Fade reduced | 200ms | thay dolly |
| Hero settle | 400-800ms | camera dừng, không nảy |
| Dolly intro | 5-10s | chậm, không giật |
| Shake | ≤ 0,4s, biên độ pixel nhỏ | chỉ khi có lý do vật lý |
| Parallax | 2-3 lớp, biên độ nhỏ | idle/hero |

## 1. Intro wake-up

- **Khi:** người chơi lần đầu vào, cần hiểu luật thế giới trước khi hành động.
- **Motion:** camera tiến chậm; các lớp nội dung bật theo thứ tự **lấy từ dữ liệu/act contract**, không phải hiệu ứng ngẫu nhiên; mỗi lớp có 1 dòng copy/feedback.
- **Params:** tổng 5-10s; mỗi lớp 0,8-1,5s; fade + dịch rất nhỏ; CTA chỉ hiện sau lớp cuối.
- **Skip:** luôn có; skip dừng timer + camera, chuyển ngay tới trạng thái cuối.
- **Reduced:** vào thẳng trạng thái cuối, hiện đủ copy, không dolly/đánh máy.
- **Test:** skip ở mọi thời điểm; CTA không bị che; không tự chuyển cảnh.

## 2. Act settle

- **Khi:** chuyển từ world/hero sang khu vực hành động của act.
- **Motion:** camera settle vào khung đã chốt (không cắt cảnh); UI/panel do DOM lo, canvas chỉ đổi khung.
- **Params:** 400-800ms; easing chính; nếu có panel mở thì panel 250-350ms, canvas không zoom thêm.
- **Reduced:** camera đứng yên, panel fade.
- **Test:** CTA vẫn thấy trong lúc settle; input không bị chặn.

## 3. Travel/transition (giữa hai không gian)

- **Khi:** cần tạo cảm giác khoảng cách giữa hai act/trạm/không gian.
- **Motion:** 3 pha generic — rời (0,6-1,2s, tăng tốc/thruster), di chuyển (1,2-2s, đường cong, đích lớn dần), tới (0,6-1,2s, giảm tốc, khớp tư thế mode đích để không nhảy hình).
- **Camera:** rộng hơn mode thường, tiến nhẹ về đích; không cắt cảnh.
- **Skip:** luôn hiện; skip vào đúng trạng thái mode đích, dừng audio/timer.
- **Reduced:** rút còn 0,5-1s, bỏ streak/shake, vẫn đủ 3 pha ở mức tối thiểu.
- **Test:** đổi mode không nhảy hình; skip không kẹt; audio không chồng.

## 4. Reveal/reward

- **Khi:** hé lộ kết quả/thành tựu.
- **Motion:** 1 pulse (scale/độ sáng) rồi giữ; tối đa 1-2 lần, không nhấp nháy nhanh.
- **Params:** 400-800ms; không strobe; không flash >3 lần/giây.
- **Reduced:** hiện tĩnh + fade; không pulse lặp.
- **Test:** ảnh chụp trạng thái cuối; thông tin quan trọng không phụ thuộc animation.

## 5. Idle/hover

- **Khi:** giữ cảm giác sống khi không tương tác.
- **Motion:** parallax 2-3 lớp rất nhỏ theo pointer/scroll; hero xoay/trôi chậm; không rung.
- **Params:** biên độ nhỏ; chu kỳ dài; tắt trên mobile yếu.
- **Reduced:** tắt hoàn toàn.
- **Test:** fps ổn định; không gây say; không cản tap.

## 6. Micro feedback (DOM)

- **Khi:** tap, gõ chữ, chọn đáp án, badge.
- **Motion:** DOM transition ngắn 80-200ms; không dùng canvas cho text/CTA.
- **Typewriter:** 16-38ms/ký tự; reduced hiện đủ câu.
- **Test:** no-sound/no-motion vẫn đủ thông tin.

## Quy tắc chống say

- Không rung quá 0,4s; không quay vòng liên tục; không zoom nhanh.
- Không parallax biên độ lớn ở near band.
- Không autoplay motion dài trước gesture đầu tiên.
- Mọi transition phải có bản reduced và bản skip.

## Test screenshot

- Frame đầu, giữa, cuối của mỗi recipe; reduced; tier low; viewport thấp nhất và fold.
- Xem thêm: `../SKILL.md`, `depth-and-occlusion.md`.
