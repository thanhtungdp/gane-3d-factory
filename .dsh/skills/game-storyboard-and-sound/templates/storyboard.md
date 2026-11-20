# Storyboard — {{brand}} · {{duration}}

> Bắt buộc duyệt trước khi code scene/UI. Mỗi beat một dòng; không có beat trang trí. Beat không có mục đích thì cắt.

## Khung beat mặc định

Hook → Promise → First action → Choice → Consequence → Progress → Reveal → CTA. Dùng 6–8 beat; gộp/cắt theo `{{duration}}`.

## Bảng beat

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Gây chú ý trong 3 giây đầu | `{{visual_hook}}` | Tĩnh hoặc 1 chuyển động nhẹ | Không (hoặc tap để bắt đầu) | `{{hook_copy}}` | `amb_main` | 0–{{t1}} | Có |
| 2 | Promise | Nói rõ người chơi sẽ nhận gì | `{{visual_promise}}` | Dolly/fade ngắn | Tap "Bắt đầu" | `{{promise_copy}}` | `ui_confirm` | {{t1}}–{{t2}} | Có |
| 3 | First action | Dạy luật bằng một hành động thật | `{{visual_action}}` | Theo thao tác, không rung | Tap/rê/kéo/giữ | `{{action_copy}}` | `ui_tap` | {{t2}}–{{t3}} | Không (bắt buộc) |
| 4 | Choice | Ra quyết định đầu tiên | `{{visual_choice}}` | Ổn định, chỉ highlight lựa chọn | Chọn 1 trong 3 | `{{choice_copy}}` | `ui_select` | {{t3}}–{{t4}} | Có (chọn mặc định) |
| 5 | Consequence | Cho thấy hậu quả, không phán xét | `{{visual_consequence}}` | Fade/zoom nhẹ | Tap "Tiếp tục" | `{{feedback_copy}}` | `confirm_good` / `confirm_partial` | {{t4}}–{{t5}} | Có |
| 6 | Progress | Cho thấy đã đi được bao xa | `{{visual_progress}}` | Một lần, không lặp | Không | `{{progress_copy}}` | `progress` | {{t5}}–{{t6}} | Có |
| 7 | Reveal | Trả brand truth bằng hình ảnh/dữ liệu thật | `{{visual_reveal}}` | Camera lùi hoặc mở khung | Tap "Xem" | `{{reveal_copy}}` | `reward` | {{t6}}–{{t7}} | Có |
| 8 | CTA | Hành động tiếp theo ngoài game | `{{visual_cta}}` | Tĩnh | Tap CTA | `{{cta_copy}}` | `silence` hoặc `reward_tail` | {{t7}}–{{duration}} | Không |

## Quy tắc điền

- **Purpose:** một câu, bắt đầu bằng động từ (gây chú ý, dạy luật, cho thấy hậu quả…).
- **Visual:** mô tả thứ nhìn thấy, không mô tả cảm xúc. Ghi rõ asset procedural hay có sẵn.
- **Camera/Motion:** ghi rõ có chuyển động hay không; beat nào cần reduced-motion thay thế.
- **Interaction:** tap / rê / kéo / giữ; nếu kéo/rê, ghi phương án tap.
- **Copy:** câu thật theo tone-matrix, không placeholder trong bản duyệt.
- **Sound:** id từ `sound-cue-sheet.md`, không mô tả bằng cảm xúc.
- **Duration:** thay `{{t1}}…{{t7}}` bằng mốc tăng dần; tổng phải khớp `{{duration}}` ± 10/100. Teaser 90 giây có thể đặt CTA ở 80–90 giây.
- **Skip:** Có / Không; beat "Không" phải giải thích vì sao bắt buộc.

## Ngân sách thời lượng

| Nhóm | Tỉ lệ gợi ý | Ghi chú |
|---|---|---|
| Hook + Promise | 8–15/100 | Không quá 2 beat trước hành động đầu tiên |
| Hành động + lựa chọn | 45–65/100 | Phần lớn thời lượng |
| Hậu quả + tiến bộ | 15–25/100 | Không dồn 3 beat căng liên tiếp |
| Reveal + CTA | 10–20/100 | Với teaser, CTA có thể ở cuối; từ lúc hiện phải thấy, không cần cuộn |

## Checklist duyệt

- [ ] 6–8 beat, không beat trang trí.
- [ ] Mỗi beat có Purpose + Interaction (hoặc ghi "chỉ đọc").
- [ ] Tổng duration khớp `{{duration}}`.
- [ ] Mọi hành động một ngón tay; kéo/rê có tap.
- [ ] Beat CTA tách khỏi gameplay, không bán trong lúc chơi.
- [ ] Có ghi chú reduced-motion cho beat có chuyển động.
- [ ] Copy trong bảng là câu thật, đã qua tone-matrix.
