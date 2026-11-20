# Sound cue sheet — Bánh mì Hạnh

> Âm thanh là lớp phụ trợ, không phải tín hiệu duy nhất. Mặc định bật nhưng chỉ phát sau gesture đầu tiên; tắt được và nhớ lựa chọn. Mức mix giữ nguyên theo scenario §6.

## Bảng cue

| Cue | Trigger | Intent | Texture/Synth | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_shop` | Vào game (sau tap đầu) | Không gian cửa hàng sáng sớm, không gây chú ý | Pad ấm + noise nhẹ, lọc thấp | Loop, crossfade 800ms khi đổi act | −28 dB | Im lặng; vẫn đủ copy và hình |
| `tr_enter` | Chuyển act (sau beat 6) | Báo đổi chương, không phủ lên lời | Whoosh lọc, không cao | 300ms | −22 dB | Fade hình 200ms |
| `ui_tap` | Tap một mục checklist | Phản hồi chạm | Click gỗ nhẹ | 70 ms | −22 dB | Ô tick đổi màu + viền |
| `ui_select` | Chọn một đáp án | Xác nhận đã chọn, chưa phán xét | 2 nốt ngắn, sine | 220 ms | −20 dB | Nút pressed + viền |
| `ui_confirm` | Mở/đóng sheet câu hỏi | Báo lớp mới, không giật mình | Noise nhẹ + pitch nhỏ | 180 ms | −22 dB | Sheet hiện tức thì |
| `confirm_good` | Chọn đáp án 2 điểm | Ghi nhận, không tự mãn | Chuông 2 nốt | 400 ms | −18 dB | Nhãn chữ + viền xanh |
| `confirm_partial` | Chọn đáp án 1 hoặc 0 điểm | Không phán xét; đây là cue chính của beat 5 | Chuông trầm 1 nốt | 300 ms | −18 dB | Feedback chữ + viền trung tính |
| `progress_tick` | Đóng act, mốc sáng lên | Cho thấy đã đi tiếp | Tick gỗ | 80 ms | −22 dB | Mốc đổi màu + số act |
| `warn` | Lỗi quy trình cần chú ý (hết quyền chọn, mất kết nối khi gửi kết quả) | Cảnh báo thật, không doạ | Pulse trung tính | 400 ms | −18 dB | Chữ cảnh báo + màu + nút thử lại |
| `reward` | Hoàn thành bài kiểm tra | Ghi nhận thành quả | Pad dâng + 1 chuông | 1 s | −15 dB | Bảng kết quả hiện + nhãn "Hoàn thành" |
| `silence` | Trước khi gửi kết quả (beat 8) | Khoảng lặng có chủ đích trước hành động chính | Không | 600 ms | — | Không cần; UI đứng yên |

## Phủ taxonomy

| Nhóm | Cue đã có | Ghi chú |
|---|---|---|
| `ambience` | `amb_shop` | Dừng khi tab ẩn; khôi phục nếu người chơi đang bật |
| `transition` | `tr_enter` | **Bổ sung** — scenario dùng ý chuyển act nhưng không có cue |
| `ui` | `ui_tap`, `ui_select`, `ui_confirm` | `ui_confirm` **bổ sung** — beat 2 dùng nhưng scenario §6 không khai báo |
| `confirm` | `confirm_good`, `confirm_partial` | `confirm_good` **bổ sung** — beat 5 có 2 sắc thái |
| `progress` | `progress_tick` | **Bổ sung** — beat 6 dùng nhưng scenario §6 không khai báo |
| `reward` | `reward` | Ngắn, không lặp |
| `warn` | `warn` | Chỉ dùng cho lỗi thật, không dùng để trấn an giả |
| `typing` | — (cố ý không có) | Guide nói một dòng, không chạy chữ; thêm `type_tick` sẽ gây mệt |
| `silence` | `silence` | **Bổ sung** — beat 8 dùng nhưng scenario §6 không khai báo |

## Quy tắc mix

- Master −15 dB; ambience thấp hơn SFX; không có VO nên không cần hạ cho giọng nói.
- Chỉ tạo AudioContext sau tap đầu tiên ("Vào ca"); nếu resume thất bại, thử lại ở tap kế.
- Không tần số cao gắt kéo dài; `confirm_*` và `reward` ngắn, không lặp.
- Tab ẩn: dừng `amb_shop`, suspend context; quay lại khôi phục đúng trạng thái đã chọn.
- Nút loa trong dock: `aria-pressed` đúng, nhớ qua `localStorage` key `hanh-ca1-audio`.
- Reduced motion: giảm `tr_enter`, không tắt `warn`; thông tin cảnh báo luôn có chữ.
- No-sound parity: đúng/chưa khớp, hoàn thành act, kết quả kiểm tra đều có nhãn chữ; âm thanh chỉ nhấn.

## Thiết bị & nguồn âm

- Toàn bộ cue là **synth/WebAudio dựng tại chỗ**; không dùng file âm thanh thương mại, không tải asset ngoài (khớp ràng buộc brief §9).
- Master −15 dB, không nén gắt; kiểm trên loa điện thoại (không tai nghe) để chắc tiếng tick còn nghe được ở −22 dB.
- iOS: `AudioContext` tạo sau tap "Vào ca"; nếu `resume()` reject, thử lại ở tap kế và ghi cờ để không chặn thao tác.
- Android/Chrome: dừng `amb_shop` khi `visibilitychange` = hidden; không để pad chạy nền.
- Không có VO trong bản này → không cần duck; nếu thêm VO sau, hạ ambience xuống −32 dB.

## Checklist duyệt

- [x] Mỗi cue có trigger, intent, texture/synth, level, fallback.
- [x] Phủ 8/9 nhóm taxonomy; `typing` bỏ có lý do ghi rõ.
- [x] Audio chỉ sau gesture; mute nhớ; no-sound parity.
- [x] Không autoplay; tab ẩn dừng ambience.
- [x] Không âm cao gắt kéo dài; master thấp (−15 dB).
- [x] Có ít nhất một khoảng `silence` có chủ đích (beat 8).
- [x] Mọi cảnh báo quan trọng có bản thay thế bằng hình + chữ.
