# Sound cue sheet — Xưởng Gốm La

> Âm thanh là lớp phụ trợ, không phải tín hiệu duy nhất. Không autoplay: toàn bộ cue chỉ chạy sau gesture đầu tiên. Tắt được, nhớ lựa chọn, no-sound vẫn đủ thông tin.

## Bảng cue

| Cue | Trigger | Intent | Texture/Synth | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_workshop` | Gesture đầu tiên ở beat 1 và người chơi chưa tắt tiếng | Tạo không gian xưởng, không gây chú ý | Pad trầm + noise nhẹ (lọc thấp) | Loop | −26 dB | Im lặng; beat 1 vẫn đủ chữ |
| `tr_act` | Chuyển act 1 → 2 → 3 | Báo đổi chương, không phủ lời | Whoosh lọc | 300–500 ms | −20 dB | Fade hình 200 ms |
| `ui_tap` | Tap nút phụ ("Chọn men", "Đưa vào lò") | Phản hồi chạm | Click gỗ | 80 ms | −20 dB | Nút đổi màu + nhãn |
| `ui_select` | Tap một hũ men | Xác nhận đã chọn, không tự mãn | Tick gỗ + một nốt thấp | 120 ms | −20 dB | Viền hũ sáng + bình đổi màu |
| `ui_hold` | Bắt đầu giữ nắp lò | Cho biết đang giữ, không hối | Hơi trầm dâng rất nhẹ | 400 ms | −24 dB | Vòng tiến độ quanh nắp |
| `confirm_partial` | Kết thúc giữ nắp (mọi nhịp) | Ghi nhận, không phán xét | Chuông trầm một nốt | 350 ms | −18 dB | Feedback chữ ngay dưới bình |
| `progress_tick` | Bình sáng 1/3 → 2/3 → 3/3 | Cho thấy đã đi tiếp | Tick gỗ | 80 ms | −22 dB | HUD đổi độ sáng |
| `reward` | Mở lò thành công | Ghi nhận thành phẩm, không chói | Pad dâng + chuông | 1.2 s | −14 dB | Ảnh bình + dòng proof |
| `warn_net` | Thiệp/ảnh không tải được | Báo cần chú ý thật | Pulse trung tính | 500 ms | −16 dB | Banner chữ + thiệp lưu sẵn |
| `silence` | Trước khi hiện QR (beat 7) | Tạo khoảng lặng để đọc QR | Không | 500 ms | — | Không cần |

Master: −14 dB; không cue nào vượt −14 dB. Ambience luôn thấp hơn SFX.

## Taxonomy — phủ và thiếu

| Nhóm | Cue | Trạng thái |
|---|---|---|
| ambience | `amb_workshop` | Có |
| transition | `tr_act` | Có |
| ui | `ui_tap`, `ui_select`, `ui_hold` | Có |
| confirm | `confirm_partial` | Có (chỉ một mức; xem ghi chú) |
| progress | `progress_tick` | Có |
| reward | `reward` | Có |
| warn | `warn_net` | Có |
| typing | — | **Không dùng**: guide hiện nguyên câu, không chạy chữ. Ở booth, chạy chữ chậm hơn đọc và làm câu 7 từ thành 3 giây |
| silence | `silence` | Có |

Ghi chú `confirm_partial`: teaser không có "đáp án tốt/xấu", nên không tạo `confirm_good` để tránh hai âm thanh ngụ ý đúng/sai. Mọi lựa chọn dùng chung một âm ghi nhận; khác biệt nằm ở hình và chữ.

## Quy tắc mix

- Chỉ tạo AudioContext sau tap đầu tiên; nếu `resume()` thất bại, thử lại ở gesture kế, không báo lỗi cho người chơi.
- Chế độ thu hút tại booth (trước khi có người chạm): chạy vòng hình im lặng, **không** phát `amb_workshop`. Đây là lý do không có autoplay dù màn hình luôn bật.
- Tab ẩn: dừng ambience, suspend context; quay lại khôi phục nếu người chơi đang bật.
- Nút loa nằm trong header, ngoài vùng cuộn; trạng thái lưu ở `localStorage` key `xgl_audio_v1`.
- No-sound parity: mọi thông báo (đã chọn men, nắp đã đóng, hậu quả, mở lò, thiệp sẵn sàng) đều có chữ + đổi hình; âm thanh chỉ nhấn.
- Reduced motion: giữ cue, giảm `reward` xuống −18 dB; không tắt `warn_net` vì đây là cảnh báo thật.
- Không tần số cao gắt kéo dài; không lặp `progress_tick` quá 3 lần; không dùng âm lượng để tạo sợ.

## Fallback theo thiết bị

| Tình huống | Hành vi |
|---|---|
| Booth tắt loa | Toàn bộ luồng vẫn đi hết; CTA và QR không phụ thuộc âm |
| iOS khoá âm lượng | Cue im, không có thông báo lỗi; chữ đã đủ |
| Tai nghe rút giữa lượt | Tiếp tục im, không pause game |
| Offline, ảnh thiệp lỗi | `warn_net` + banner "Thiệp đã lưu trên máy" + QR vẫn hiện |

## Kiểm khi build

- [ ] Không cue nào phát trước tap đầu tiên (quay màn hình 10 giây đầu, kiểm tra waveform im).
- [ ] Tắt tiếng rồi tải lại: vẫn im, nút loa hiện đúng trạng thái.
- [ ] Đi hết luồng với loa tắt: mọi bước hiểu được chỉ bằng chữ + hình.
- [ ] Không có file âm thanh ngoài gói tải trước (offline).
- [ ] `silence` 500ms trước QR có thật, không bị `reward` phủ lên.
