# audio kit

Kit contract cho âm thanh của một brand game: **cue taxonomy**, mixing, lifecycle, parity và reference map. Kit **không chứa file âm thanh**, không chứa chord cố định, không copy track nào — dự án tự tổng hợp (synth) hoặc dùng asset có giấy phép.

## Khi nào dùng

- Đã có storyboard beat và cần gắn cue âm thanh cho từng beat/trạng thái.
- Cần thống nhất: khi nào mở khoá audio, âm lượng, mute memory, hành vi khi tắt tiếng/reduced motion.
- Cần handoff cho dev/QA để test "no-sound" và "first gesture".

## Files

| File | Dùng để |
|---|---|
| [`contracts/sound-cues.md`](contracts/sound-cues.md) | Contract cue sheet: taxonomy, cột bắt buộc, mix, lifecycle, parity, acceptance |
| [`reference-map.md`](reference-map.md) | Map khái niệm → API/file trong dự án tham chiếu (case study) |

Skill liên quan: [`game-storyboard-and-sound`](../../.dsh/skills/game-storyboard-and-sound/SKILL.md) (tạo cue sheet gốc); gate chung: [`_shared/quality-gates.md`](../../.dsh/skills/_shared/quality-gates.md); kit world: [`three-world`](../three-world/README.md).

## Nguyên tắc

- **Không autoplay trước gesture:** AudioContext chỉ khởi tạo/resume trong tap/phím đầu tiên; trạng thái bật/tắt được nhớ.
- **Mute memory:** lựa chọn của người chơi được lưu và khôi phục; nút loa luôn tìm thấy.
- **No-sound parity:** tắt tiếng hoặc thiết bị không có audio vẫn đủ thông tin (copy, trạng thái, feedback hình ảnh).
- **Reduced-motion parity:** giảm chuyển động không làm mất cue quan trọng; cue dài/loop giảm hoặc tắt cùng motion.
- **Soft mix:** không chói, không high-gắt kéo dài; 1 ambience bed + cue ngắn; fade khi tab ẩn/unmount.
- **Không asset ngoài:** synth procedural hoặc asset có giấy phép rõ ràng; không nhạc/tiếng lấy từ nguồn không phép.
- **Không fixed chords:** kit chỉ taxonomy; mỗi brand tự chọn texture/hợp âm/melody.

## Cách dùng

1. Điền `contracts/sound-cues.md` cho từng beat/trạng thái; ghi trigger, intent, texture, duration, level, fallback.
2. Chốt mix (ambience/SFX/ducking) và lifecycle (unlock, hidden tab, unmount).
3. Chốt parity: no-sound và reduced-motion hiển thị thay thế gì.
4. Map sang implementation bằng `reference-map.md` (thay path thật của dự án).
5. QA: first gesture, mute memory, tab hidden, no-sound, reduced motion, không console error.

## Case study

[`src/lib/audio.ts`](../../src/lib/audio.ts) (WebAudio synth, unlock, ambience, SFX, visibility/dispose) và [`src/lib/audioPrefs.ts`](../../src/lib/audioPrefs.ts) (mute memory). Âm nhạc trong case study là **synth pad tham chiếu**; không copy chord/melody/fixed cue list sang dự án mới. Beat/sound trong [`docs/06-storyboard.md`](../../docs/06-storyboard.md) cũng chỉ là ví dụ cấu trúc.
