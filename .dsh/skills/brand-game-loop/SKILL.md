---
name: brand-game-loop
description: Use when designing a core loop for a brand game with 2–7 acts, decisions, feedback, scoring, progression, skip path, and report mapping.
---

# Brand Game Loop

Biến `brief.md` + `story-bible.md` thành vòng lặp chơi được: 2–7 act, mỗi act có mục tiêu, hành động, quyết định, hậu quả và tiến bộ. Skill này không viết story hay chọn visual; nó chốt cấu trúc chơi, luật nội dung và cách nối sang báo cáo.

## When to use

- Đã có brief/story direction, cần chốt loop để design và build.
- Cần biến brand truth thành 2–7 act có quyết định, scoring, skip/resume, report mapping.
- Cần audit content trước khi dựng UI hoặc trước launch.
- Không dùng khi chưa có audience/proof; khi đó quay lại `game-brief-for-brand`.

## Inputs

Lấy từ `brief.md`, `story-bible.md`, `tone-matrix.md`; chỉ hỏi thứ còn thiếu:

- {{brand}}: promise 1 câu + proof có thật, không bịa.
- {{audience}} + insight; hành động mong muốn sau khi chơi.
- {{world}} + luật thế giới; {{guide}} là ai, nói thế nào.
- {{acts}} đề xuất (2–7) hoặc để skill chọn; {{duration}} mục tiêu.
- Kênh/thiết bị/ngôn ngữ; dữ liệu cá nhân hoá có thể dùng; KPI + ràng buộc.
- Nguồn evidence (dữ liệu công khai, pre-scan, product fact) và fallback khi thiếu.

Ghi `[cần xác nhận]` thay vì tự đặt số/claim. Dừng nếu thiếu brand truth hoặc proof.

## Steps

1. **Chốt số act.** Chọn 2–7 act theo hành trình cảm xúc, không mặc định 5. Mỗi act điền đủ 5 trường trong [act-spec](templates/act-spec.md): mục tiêu người chơi thấy, hành động một ngón tay, quyết định, hậu quả nếu chọn 0, tiến bộ/thưởng. Act cuối phải trả lời promise của {{brand}}.
2. **Chọn pattern.** Đọc [loop-patterns](references/loop-patterns.md); chọn 1 pattern chính, tối đa 1 pattern phụ. Ghi lý do và rủi ro (chờ đợi, lặp, khó hiểu).
3. **Viết decision set.** Mỗi act 1–5 câu; dùng schema ở [decision-set](templates/decision-set.md): id, actId, kind (`knowledge|diagnosis|action|aesthetic`), scoring (`points|none`), prompt, 3 option, feedback, explain, evidenceKey tùy chọn. Lựa chọn thẩm mỹ dùng `scoring: none`, không ép 2/1/0. Câu hỏi chỉ mở khi hành động tới điểm neo; one-question popup: mỗi lần một câu, hàng đợi FIFO, ẩn được và mở lại; câu đã trả lời không tự mở lại; feedback là snapshot độc lập để đổi phase không mất.
4. **Chấm điểm generic.** Tách knowledge/diagnosis/action; mỗi act quy về 0–10 (chỉ tính decision có scoring=points), weight các act cộng 1; decision aesthetic không cộng điểm. Chỉ cộng bonus có trần (thời gian, độ nhất quán) và chỉ trừ khi evidence thật yếu. Không dùng `%`; hiển thị X/10, n/5, số sao.
5. **Thiết kế progression.** Mỗi act có trạng thái trước/đang/hoàn tất, mở act kế, lưu tổng; cho skip act sau intro và resume ván dở; bỏ qua vẫn đi tiếp, report ghi rõ đã bỏ qua và không chặn.
6. **Chốt report mapping sau khi chơi.** Điền [report-mapping](templates/report-mapping.md): điểm từng act, 2 vùng yếu + evidence + hệ quả, insight/đề xuất. Offer/giá chỉ sau lead gate, không xuất hiện trong loop.
7. **Audit content.** Chạy [content-audit](templates/content-audit.md) trước build: prompt 1 ý ≤85 ký tự; có đáp án đúng thì kết thúc `?`, aesthetic có thể là imperative; option song song 20–120, chênh lệch ≤55; không meta-answer; không template `[]`; không SLA/benchmark tự đặt; không `%`. Ghi rõ ngoại lệ và lý do nếu có.
8. **Walkthrough.** Chơi thử 320px một ngón tay: popup, skip, resume; mỗi act phải hoàn thành được dù chọn 0 điểm; không CTA bị chôn.

## Outputs

- `loop.md` theo [output contract](../_shared/output-contracts.md): số act + mục tiêu, decision set, scoring/progression, skip/resume, report mapping.
- Các template đã điền: [act-spec](templates/act-spec.md), [decision-set](templates/decision-set.md), [content-audit](templates/content-audit.md), [report-mapping](templates/report-mapping.md).
- Danh sách `[cần xác nhận]` và lỗi audit còn lại.

## Quality gates

Cứng:

- 2–7 act; mỗi act đủ mục tiêu/hành động/quyết định/hậu quả/progress; không copy một act cho mọi act.
- Đúng schema quyết định; 3 option; nếu `scoring=points` đúng một 2/1/0, nếu `none` không có đáp án đúng; option không đoán được bằng độ dài/format; feedback nói hậu quả/gu, không chỉ "đúng/sai".
- Không chặn người chơi: skip sau intro, resume, không bắt đăng ký trước khi chơi.
- Không bán hàng/không nhắc giá/gói trong lúc chơi; offer chỉ sau report + lead gate.
- Scoring tái lập được từ decision; evidenceKey chỉ trỏ dữ liệu thật; không bịa số/khách/đối thủ; UI không `%`.
- Content audit 0 fail; không meta-answer, không template `[]`, không SLA tự đặt.
- Một vùng cuộn, CTA ngoài vùng cuộn, popup một câu; xem [quality gates](../_shared/quality-gates.md).

Mềm: nhịp act, độ khó tăng dần, skip path được test; mỗi act có ít nhất một khoảnh khắc brand truth.

## Handoff

- Artifact: `loop.md` + 4 template đã điền + audit result.
- Tiếp theo: `mobile-game-cockpit` (layout/interaction), `brand-report-gate` (report/offer), `game-narrative-and-tone` (copy), `game-qa-autopilot` (test).
- Dừng nếu thiếu brief/proof/audience hoặc audit còn fail cứng; quay lại skill trước để bổ sung.

## References

- [templates/act-spec.md](templates/act-spec.md)
- [templates/decision-set.md](templates/decision-set.md)
- [templates/content-audit.md](templates/content-audit.md)
- [templates/report-mapping.md](templates/report-mapping.md)
- [references/loop-patterns.md](references/loop-patterns.md)
- [Shared quality gates](../_shared/quality-gates.md)
- [Shared output contracts](../_shared/output-contracts.md)
