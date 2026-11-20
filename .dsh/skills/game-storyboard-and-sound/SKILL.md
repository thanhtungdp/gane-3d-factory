---
name: game-storyboard-and-sound
description: Use when turning story and tone into a beat-by-beat storyboard and sound cue sheet before UI or scene implementation.
---

# Storyboard & Sound

Chốt nhịp, hình, tương tác, copy và âm thanh của từng khoảnh khắc. **Storyboard là bắt buộc trước khi code.** Không có storyboard thì không bắt đầu dựng scene, animation hay UI.

## When to use

- Đã có `story-bible.md` + `tone-matrix.md`, cần chuyển thành beat cụ thể.
- Cần review nhịp trước khi giao dev/design.
- Cần thêm lớp âm thanh cho game đã có storyboard nhưng chưa có cue sheet.

Không dùng khi chưa có story/tone, hoặc chỉ cần sửa một animation lẻ.

## Inputs

- `story-bible.md`, `tone-matrix.md` (bắt buộc).
- `brief.md`: hành động chính, kênh, `{{duration}}`, ràng buộc kỹ thuật.
- Loop/decision set nếu đã có: số lựa chọn, điểm, feedback.
- Ràng buộc âm thanh: có được dùng file không, WebAudio/synth, mức master, thiết bị đích.
- Ràng buộc hình ảnh: asset có quyền, tier thấp, reduced motion.

## Steps

1. **Khoá khung beat.** Chọn 6–8 beat theo mẫu Hook → Promise → First action → Choice → Consequence → Progress → Reveal → CTA. Gộp hoặc cắt beat nếu `{{duration}}` không đủ; không thêm beat trang trí.
2. **Mỗi beat phải có mục đích.** Nếu bỏ beat mà câu chuyện vẫn hiểu, cắt.
3. **Điền `templates/storyboard.md`.** Đủ cột `# | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip`.
4. **Gán tương tác một ngón tay** cho mọi beat có hành động: tap / rê / kéo / giữ; mọi thao tác kéo có phương án tap.
5. **Tính tổng thời lượng** theo `{{duration}}`; beat nào vượt ngân sách thì cắt hoặc chuyển thành skip.
6. **Viết `templates/sound-cue-sheet.md`.** Mỗi cue có `Cue | Trigger | Intent | Texture/Synth | Duration | Level | Fallback`; phủ taxonomy: ambience, transition, UI, confirm, progress, reward, warn, typing, silence.
7. **Áp audio rules.** Mặc định bật nhưng chỉ chạy sau gesture đầu tiên; tắt được và nhớ lựa chọn; reduced motion và no-sound vẫn đủ thông tin; không autoplay; không âm cao gắt kéo dài; master thấp hơn giọng nói (nếu có VO).
8. **Review fallback.** Mỗi cue phải có fallback khi không phát được hoặc thiết bị cấm audio; cảnh báo quan trọng không phụ thuộc âm thanh.
9. **Gate + handoff.**

## Outputs

- `storyboard.md`: 6–8 beat, đủ 10 cột, tổng thời lượng khớp `{{duration}}`.
- `sound-cue-sheet.md`: cue theo taxonomy, có trigger, intent, texture, level, fallback.
- Danh sách beat/asset bị cắt và lý do.

## Quality gates

**Cứng**

- Có storyboard được duyệt **trước** khi code bất kỳ scene/UI nào.
- Mỗi beat có mục đích và interaction (hoặc ghi rõ beat chỉ đọc).
- Mọi hành động cốt lõi một ngón tay; kéo/rê có tap thay thế.
- Không autoplay audio; audio chỉ sau gesture; mute nhớ; no-sound parity.
- Không âm thanh cao gắt kéo dài; level không chói; không dùng âm thanh làm tín hiệu duy nhất.
- Reduced motion: không mất nội dung, không rung/zoom mạnh.
- Không bịa số/không bán hàng trong beat chơi; CTA/offer chỉ sau report gate. CTA có thể xuất hiện sau Reveal ở teaser/intro, nhưng từ lúc xuất hiện phải thấy và không cần cuộn.

**Mềm**

- Beat nào cũng có copy thật, không phải "text ở đây".
- Nhịp có chỗ nghỉ sau beat căng; không dồn 3 beat quyết định liên tiếp.
- Cue sheet có silence có chủ đích; typing cue không lặp gây mệt.
- Storyboard đọc được bởi người không biết code.

## Handoff

- Artifact: `storyboard.md` + `sound-cue-sheet.md`.
- Tiếp: `mobile-game-cockpit` để dựng layout; `brand-game-loop` để chốt decision set khớp beat; sau đó `game-qa-autopilot`.
- Quay lại `game-narrative-and-tone` nếu beat lộ lỗ hổng story/tone.
- Dừng nếu chưa có story-bible/tone-matrix hoặc chưa chốt `{{duration}}`.

## References

- [templates/storyboard.md](templates/storyboard.md)
- [templates/sound-cue-sheet.md](templates/sound-cue-sheet.md)
- [_shared/quality-gates.md](../_shared/quality-gates.md), [_shared/output-contracts.md](../_shared/output-contracts.md), [_shared/glossary.md](../_shared/glossary.md)
