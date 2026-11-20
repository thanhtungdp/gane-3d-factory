---
name: game-narrative-and-tone
description: Use when shaping the premise, metaphor world, guide character, and tone of a brand game before storyboarding or coding.
---

# Narrative & Tone

Chốt "người chơi đang ở trong câu chuyện nào, nghe ai nói, và được phép tin điều gì" trước khi viết bất kỳ dòng copy nào.

## When to use

- Bắt đầu game thương hiệu mới, chưa có premise hoặc nhân vật dẫn.
- Đã có story nhưng mỗi màn một giọng, hoặc copy do nhiều người viết.
- Cần review narrative/tone trước khi khoá storyboard và loop.

Không dùng khi chỉ cần microcopy cho một màn hình, hoặc chưa có `brief.md`.

## Inputs

- `brief.md` theo `.dsh/skills/_shared/output-contracts.md`.
- Brand truth + proof có thật; chưa có thì ghi `[cần xác nhận]`, không tự bịa.
- `{{audience}}`, `{{duration}}`, số act dự kiến, kênh/thiết bị, ngôn ngữ.
- Ràng buộc pháp lý, claim được phép, asset/hình ảnh được dùng.
- Nếu thiếu audience hoặc proof: dừng ở bước brief, không sáng tác thay.

## Steps

1. **Chốt premise 1 câu.** Ai làm gì, vì sao bây giờ, cái gì đang cản. Viết lại đến khi đọc một hơi không cần giải thích.
2. **Chọn thế giới ẩn dụ** theo `references/metaphor-patterns.md`. Nêu lý do gắn với brand truth; không mặc định chọn hành trình, không gian hay số act cố định — số act suy ra từ `{{duration}}`.
3. **Định nghĩa luật thế giới.** Cái gì đúng, cái gì không thể, người chơi tác động bằng cách nào. Mỗi luật phải giải thích được một mechanic thật, không chỉ để đẹp.
4. **Chọn player role.** Người chơi có quyền gì, thiếu gì, thắng bằng gì. Không để người chơi là khán giả.
5. **Viết guide character.** Vai trò cụ thể (dẫn đường, phản biện, nhắc luật); guide **không phải chatbot**, không giải bài thay, không tự bán hàng.
6. **Dựng 3 hồi + emotional arc + ending.** Mỗi hồi đổi trạng thái người chơi. Kết thúc trả về brand truth, không phải "bạn thắng".
7. **Viết `story-bible.md`** theo `templates/story-bible.md`.
8. **Viết `tone-matrix.md`** theo `templates/tone-matrix.md`: 4 trục, đại từ, độ dài câu, jargon, humor, claim rules, 5 câu mẫu cho 5 thời điểm, từ cấm.
9. **Stress test 5 câu mẫu.** Đọc to; thay jargon bằng lời audience; kiểm mỗi câu có proof nếu là claim; kiểm câu sai không xúc phạm.
10. **Gate và handoff.** Nếu thiếu proof/audience, trả brief thay vì tự quyết.

## Outputs

- `story-bible.md`: premise, world + luật, player role, guide, 3 hồi, emotional arc, ending + brand truth, điều cấm.
- `tone-matrix.md`: 4 trục, đại từ, độ dài câu, jargon, humor, claim rules, 5 câu mẫu, từ cấm.
- Một đoạn "vì sao chọn ẩn dụ này" và danh sách điều không được làm.

Chưa tạo storyboard ở bước này; beat sẽ do skill `game-storyboard-and-sound` chốt.

## Quality gates

**Cứng**

- Không bịa số, khách, đối thủ, benchmark, giải thưởng, giá.
- Không bán hàng, không nhắc offer/giá trong lúc chơi.
- Guide không phải chatbot: không hội thoại tự do, không hứa điều ngoài kịch bản.
- Tone khớp `{{audience}}`; mỗi câu mẫu dùng được với người thật.
- Mỗi hồi có mục tiêu và thay đổi trạng thái người chơi.
- Brand truth xuất hiện ở ít nhất 2 khoảnh khắc; claim nào cũng có proof hoặc `[cần xác nhận]`.

**Mềm**

- Premise không cần đọc lại.
- Ẩn dụ không lấn át nhiệm vụ chính.
- 5 câu mẫu không thể thay bằng từ đồng nghĩa mà vẫn đúng.
- Không dùng từ cấm trong tone matrix.

## Handoff

- Artifact: `story-bible.md` + `tone-matrix.md`.
- Tiếp: `game-storyboard-and-sound` để chuyển thành beat; `brand-game-loop` dùng decision set.
- Dừng nếu chưa có `brief.md`, audience hoặc proof.

## References

- [templates/story-bible.md](templates/story-bible.md)
- [templates/tone-matrix.md](templates/tone-matrix.md)
- [references/metaphor-patterns.md](references/metaphor-patterns.md)
- [_shared/quality-gates.md](../_shared/quality-gates.md), [_shared/output-contracts.md](../_shared/output-contracts.md), [_shared/glossary.md](../_shared/glossary.md)
