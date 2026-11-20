# Sound cue sheet — {{brand}}

> Âm thanh là lớp phụ trợ, không phải tín hiệu duy nhất. Mặc định bật nhưng chỉ phát sau gesture đầu tiên; tắt được và nhớ lựa chọn.

## Cột bắt buộc

`Cue | Trigger | Intent | Texture/Synth | Duration | Level | Fallback`

- **Cue:** id kebab-case, ổn định để code và QA gọi.
- **Trigger:** sự kiện chính xác (tap, mở popup, chọn đáp án, hoàn thành act…).
- **Intent:** âm này để người chơi hiểu/hành động gì, không phải "cho hay".
- **Texture/Synth:** mô tả chất liệu hoặc synth (sine, noise, pad, click…), không dùng file nếu brief cấm.
- **Duration:** ms/giây; SFX ≤ 1s trừ ambience.
- **Level:** dB hoặc mức tương đối; master thấp; không chói.
- **Fallback:** khi không phát được, thiết bị cấm audio, hoặc no-sound.

## Taxonomy

| Nhóm | Dùng khi | Ví dụ cue | Ghi chú |
|---|---|---|---|
| `ambience` | Nền dài theo act | `amb_act1` | Loop được, crossfade khi đổi act, dừng khi tab ẩn |
| `transition` | Chuyển màn/act | `tr_enter`, `tr_exit` | Ngắn, không phủ lên lời |
| `ui` | Tap, mở/đóng sheet, chọn | `ui_tap`, `ui_sheet` | Không lặp dày; có thể tắt ở chế độ reduced |
| `confirm` | Chốt đáp án/hành động | `confirm_good`, `confirm_partial` | Khác nhau về sắc thái, không phán xét |
| `progress` | Tăng tiến độ | `progress_tick` | Không dùng để báo sai |
| `reward` | Huy hiệu/kết thúc tốt | `reward` | Ngắn, không chói, không lặp |
| `warn` | Cảnh báo thật, hết giờ | `warn` | Không dùng để trấn an giả |
| `typing` | Guide đang nói/chạy chữ | `type_tick` | Rất nhỏ, có thể tắt; không lặp gây mệt |
| `silence` | Chủ ý im | `silence` | Dùng trước reveal hoặc sau cao trào |

## Quy tắc mix

- Master ≤ mức cho phép của brief; ambience thấp hơn SFX; SFX thấp hơn giọng nói nếu có VO.
- Không tần số cao gắt kéo dài; không tiếng báo sai liên tục; không dùng âm lượng để gây sợ.
- Tab ẩn: dừng ambience và suspend context; quay lại khôi phục nếu người chơi đang bật.
- iOS/thiết bị cần gesture: chỉ tạo AudioContext sau tap đầu tiên; nếu resume thất bại, thử lại ở gesture kế.
- No-sound parity: mọi thông tin quan trọng (đúng/sai, hết giờ, hoàn thành) phải có hình + chữ; âm thanh chỉ nhấn.
- Reduced motion: tắt chuyển động không tắt thông tin; SFX có thể giảm, không được mất cảnh báo.

## Bảng cue

| Cue | Trigger | Intent | Texture/Synth | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_act1` | Vào act 1 | Tạo không gian, không gây chú ý | Pad hợp âm, lọc thấp | Loop | −24 dB | Im lặng; vẫn đủ copy |
| `tr_enter` | Chuyển act | Báo đổi chương | Whoosh lọc | 300–500 ms | −18 dB | Fade hình 200 ms |
| `ui_tap` | Tap nút phụ | Phản hồi chạm | Click ngắn | 60–90 ms | −20 dB | Đổi trạng thái nút |
| `ui_sheet` | Mở/đóng sheet | Báo lớp mới | Noise nhẹ + pitch nhỏ | 150–250 ms | −20 dB | Animation mở |
| `confirm_good` | Chọn đáp án tốt | Xác nhận không tự mãn | Chuông 2 nốt | 400 ms | −16 dB | Nhãn + đổi màu |
| `confirm_partial` | Chọn đáp án một phần | Ghi nhận, không phán xét | Chuông 1 nốt trầm | 350 ms | −18 dB | Nhãn + explain |
| `progress_tick` | Tăng tiến độ | Cho thấy đã đi tiếp | Tick gỗ | 80 ms | −22 dB | Thanh tiến độ đổi |
| `reward` | Nhận huy hiệu/kết thúc | Ghi nhận thành quả | Pad dâng + chuông | 1.2 s | −14 dB | Huy hiệu hiện + copy |
| `warn` | Hết giờ/cảnh báo thật | Báo cần chú ý | Pulse trung tính | 500 ms | −16 dB | Chữ cảnh báo + màu |
| `type_tick` | Guide chạy chữ | Nhịp nói | Tick rất nhỏ | 20–30 ms | −30 dB | Hiện đủ câu (reduced) |
| `silence` | Trước reveal | Tạo khoảng lặng có chủ đích | Không | 400–800 ms | — | Không cần |

## Checklist duyệt

- [ ] Mỗi cue có trigger, intent, level, fallback.
- [ ] Phủ đủ taxonomy; không có cue "trang trí" không mục đích.
- [ ] Audio chỉ sau gesture; mute nhớ; no-sound parity.
- [ ] Không autoplay; tab ẩn dừng ambience.
- [ ] Không âm cao gắt kéo dài; master thấp.
- [ ] Có ít nhất một khoảng silence có chủ đích.
- [ ] Mọi cảnh báo quan trọng có bản thay thế bằng hình + chữ.
