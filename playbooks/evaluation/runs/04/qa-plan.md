# QA plan — Ca đầu tiên · Bánh mì Hạnh

> Phạm vi: luồng "hoàn thành bài kiểm tra" + trạng thái lưu kết quả nội bộ (scenario §8). Chưa có build → đây là plan để chạy ở bước `build`; các mục ☐ chưa được thực thi.

## 1. Matrix viewport

| Viewport | Thiết bị đại diện | Gate |
|---|---|---|
| 320×640 | iPhone SE / fold cover nhỏ | P0 |
| 344×882 | fold cover dọc | P0 |
| 390×844 | iPhone phổ thông | P0 |
| 540×720 | duo một màn | P1 |
| 725×870 | fold inner dọc | P0 |
| 884×1104 | fold/tablet lớn | P1 |
| 1024×600 | landscape thấp | P1 |
| 1440×900 | desktop | P0 |

## 2. Assertions

**Layout / CTA**
- `continue` / `intro-cta` / `handover-confirm` visible, `bottom <= viewportHeight + 1`.
- `scrollWidth - innerWidth <= 1`; `document.scrollingElement.scrollTop === 0` khi mở màn.
- Chỉ 1 scroller `#stage`; `#hud` và `#dock` không nằm trong `#stage`.
- Popup: sau khi chọn, `.sheet__body` có `scrollHeight <= clientHeight + 1` tại 320×640.
- Tap target ≥44px (option, pill, nút loa, help).

**Luồng đào tạo (đặc thù scenario này)**
- Không thể vào `quiz` khi chưa `done` đủ 4 act; nút bị chặn có nhãn nói còn thiếu act nào.
- `quiz-submit` không có đường skip; back ra giữa bài giữ nguyên câu đang làm (resume).
- `question-modal` chỉ mở một câu tại một thời điểm; pill `question-pill` mở lại đúng câu đang chờ; câu đã trả lời không tự mở lại.
- Kết quả hiển thị X/10 + n/3 + 2 vùng yếu; tính lại từ `decisions.json` (không hardcode).
- `saved` chỉ hiện khi có `result_saved` thành công; lỗi mạng → `warn` + nút thử lại, không mất điểm.
- Không có form đăng ký/email trước khi chơi; không có trường dữ liệu khách.

**Nội dung / gate cứng**
- Không `%` trong DOM text (regex trên toàn bộ copy render).
- Không ngoặc vuông kiểu template, không placeholder hai ngoặc nhọn, không "đúng nhất".
- Copy sinh từ `decisions.json` khớp 100% với bản đã audit (snapshot test).
- Trên UI không xuất hiện chuỗi `[cần xác nhận]` (đây là nhãn nội bộ, không phải copy).
- Không có offer/giá/gói; không có xếp hạng giữa nhân viên.

**Audio / reduced motion / low-tier**
- Mặc định `aria-pressed="true"` nhưng không phát trước gesture; sau tap `intro-cta` mới có AudioContext.
- Tắt tiếng → reload vẫn tắt (`hanh-ca1-audio`); no-sound vẫn phân biệt được 2/1/0 điểm bằng nhãn chữ.
- `prefers-reduced-motion: reduce` → không trượt sheet, CTA vẫn hiện ngay, không mất mốc act.
- Low-tier (không ảnh nền): vẫn đọc được câu hỏi, vẫn thấy CTA.

## 3. Test files

| File | Nội dung |
|---|---|
| `qa/viewport.spec.ts` | 8 viewport + CTA + no-horizontal-scroll |
| `qa/question.spec.ts` | one-question sheet, ẩn/mở pill, FIFO |
| `qa/quiz.spec.ts` | chặn quiz khi thiếu act, resume, tính điểm, saved |
| `qa/content-copy.test.ts` | prompt ≤85, option 20–120, spread ≤55, 2/1/0, không `%`/`[]` |
| `qa/audio.spec.ts` | default/unlock/mute/reload nhớ |
| `qa/reduced.spec.ts` | reduced motion + low-tier |

## 4. Screenshot list

- `intro-mobile`, `checklist-mobile`, `question-mobile`, `consequence-mobile`
- `quiz-mobile`, `result-mobile`, `handover-mobile`, `saved-mobile`
- `desktop-result`, `fold-cover-question`, `fold-inner-play`, `duo-question`, `low-tier-question`

## 5. Đo lường (để chấm tiêu chí Measurement)

| Event | Khi nào | Thuộc tính | Dùng cho |
|---|---|---|---|
| `game_started` | Tap `intro-cta` | `intro_seen`, `viewport` | Funnel bước 1 |
| `act_completed` | Đóng act 1–4 | `actId`, `raw_score`, `skipped_read` | Tỉ lệ đi hết 4 act |
| `decision_answered` | Mỗi câu | `decisionId`, `optionId`, `points`, `ms_since_open` | Câu nào khó nhất |
| `quiz_submitted` | Nộp bài | `correct_n` (0–3), `retry_count` | Điểm kiểm tra |
| `result_saved` | Lưu thành công | `total_x10`, `weak_act_1`, `weak_act_2` | Ghi nhận hoàn thành |
| `result_save_failed` | Lỗi lưu | `reason` | Guardrail mất dữ liệu |

- Funnel: `game_started` → `act_completed` (4 lần) → `quiz_submitted` → `result_saved`.
- Guardrail: `result_save_failed` = 0; không event nào chứa tên/điện thoại khách; retake tăng đột biến sau 2 tuần = tín hiệu đề khó.
- Cách đọc: so tỉ lệ hoàn thành theo cửa hàng và theo tuần; không xếp hạng cá nhân. Baseline `[chưa đo]`.
- Không có `%` trong báo cáo gửi team lead; hiển thị n/4 act, X/10 điểm, n/3 câu.

## 6. Known risks

- Ảnh nền chưa có quyền dùng → low-tier fallback phải đẹp đủ, không để màn trống.
- iOS chưa unlock audio → kiểm sau gesture, không chặn thao tác.
- Fold đổi kích thước giữa phiên → giữ act hiện tại, không reset điểm.
- Nội dung dài ở act 3 đẩy CTA → kiểm popup 320×640 sau khi chọn.
- Lưu kết quả thất bại âm thầm → phải có `result_save_failed` + trạng thái thử lại.
- Nhầm "skip đọc" với "skip câu hỏi" → chỉ nút skip phần chữ; không có nút bỏ câu.

## 7. Kết quả chạy

- ☐ Chưa chạy (chưa có build). Toàn bộ mục trên là điều kiện để qua gate ở mode `build`/`full`.
- Gate cứng hiện đánh giá ở mức **spec**: CTA/no-scroll/không `%`/không audio-only/không offer đã được thiết kế đúng, chưa có bằng chứng chạy.
