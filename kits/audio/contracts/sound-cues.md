# Contract — Sound cues

Cue sheet bắt buộc trước khi code âm thanh. Mỗi dòng là một cue; không copy chord/melody cố định — chỉ chốt **hành vi và mức mix**.

## Cột bắt buộc

| Cột | Ý nghĩa |
|---|---|
| `id` | kebab-case, ổn định để test/debug |
| `family` | ambience / transition / ui / typing / answer / progress / reward / warn / silence |
| `trigger` | sự kiện/điều kiện chính xác |
| `intent` | cue để người chơi hiểu/cảm gì |
| `texture/synth` | mô tả synth (sine/triangle/noise/bell…) hoặc file + license; **không** ghi chord cố định |
| `duration` | ngắn/dài, có loop không |
| `level` | mức tương đối so với master (dBFS hoặc thang nội bộ) |
| `fallback` | khi không có audio / tắt tiếng / reduced motion |
| `test` | testid/attribute/assertion |

## Taxonomy tối thiểu

| Family | Dùng khi | Ghi chú |
|---|---|---|
| `ambience` | nền theo mode/act | tối đa 1 bed; crossfade; không lặp gắt |
| `transition` | đổi scene/mode | ngắn; khớp motion; có bản reduced |
| `ui` | tap/hover/đóng/mở | rất ngắn, không chói |
| `typing` | chữ chạy/guide nói | nhẹ, có thể tắt; không đè cue chính |
| `answer` | đúng / một phần / chưa đúng | feedback ngay, không phán xét |
| `progress` | tăng tiến trình/hoàn thành bước | 1 lần, không lặp |
| `reward` | mở khoá/badge/reveal | ngắn, không strobe |
| `warn` | lỗi/khủng hoảng | không gắt; kèm hình ảnh |
| `silence` | nghỉ có chủ đích | dùng trước reveal/khủng hoảng |

## Mức tham chiếu

Calibrate theo thiết bị thật; các mức dưới là điểm khởi đầu, không phải giá trị tuyệt đối.

| Bus | Mức tham chiếu | Ghi chú |
|---|---|---|
| Master | khoảng −12 dBFS khi bật | có mute/fade, không clip |
| Ambience bed | khoảng −24 đến −18 dBFS | thấp hơn SFX, crossfade |
| SFX one-shot | đỉnh khoảng −6 dBFS | attack/release ngắn, không chói |
| Typing cue | khoảng −30 đến −24 dBFS | có thể tắt, không đè lời |
| Ducking | giảm bed 6-12 dB khi cue quan trọng | fade 100-200ms |

## Mix & lifecycle

- Master mặc định vừa phải; ambience bed thấp hơn SFX; 1-shot có attack/release ngắn, không high-gắt kéo dài.
- Giới hạn số cue đồng thời; duck ambience khi cue quan trọng bật.
- Không autoplay trước gesture; unlock trong tap/phím đầu tiên; iOS cần resume trong gesture.
- Lưu mute; nút loa hiện ở mọi màn cần thiết; tắt = fade nhanh, không cắt sốc.
- Tab ẩn/unmount: dừng ambience + suspend/close; hiện lại: khôi phục nếu đang bật.
- Dispose node/buffer; không rò listener.

## No-sound & reduced-motion parity

- No-sound: mọi cue có fallback hình ảnh/copy tương đương; người chơi không mất thông tin.
- Reduced motion: cue transition dài/loop tắt hoặc giảm; typing có thể tắt; cue quan trọng giữ bản ngắn.
- Không phụ thuộc audio để hiểu trạng thái game.

## Asset & license

- [ ] Chỉ synth procedural hoặc asset có license ghi trong cue sheet.
- [ ] Không nhạc/tiếng/voice lấy từ nguồn không có quyền.
- [ ] Không file audio nặng trong initial chunk.
- [ ] Có fallback khi trình duyệt chặn audio.

## Acceptance

- First gesture mở khoá đúng; không tiếng trước gesture.
- Tắt/bật nhớ qua reload (cùng profile); nút loa bấm được.
- Tab ẩn dừng; quay lại không chồng nhạc.
- No-sound + reduced motion: đủ thông tin, không lỗi console.
- QA map cue id → test; xem [`reference-map.md`](../reference-map.md).
