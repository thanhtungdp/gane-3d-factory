# Run brief — Ca đầu tiên · Bánh mì Hạnh

## 1. Mode

- Mode: `design`
- Lý do: scenario 04 yêu cầu brief + story + tone + storyboard + sound + loop + cockpit + qa-plan; không cần code để chốt thiết kế. Không chọn `build`/`full` vì repo không dựng UI cho brand hư cấu này.
- Người duyệt: quản lý đào tạo + quản lý ca (`[cần xác nhận]` tên người).
- Đầu vào: `playbooks/scenarios/04-10min-internal-training.md` + `.dsh/skills/brand-game-factory/SKILL.md` + 6 skill con + `_shared/quality-gates.md` + `templates/run-brief.md`.

## 2. Inputs đã có

- Vấn đề: nhân viên mới làm đúng tuần đầu rồi lệch khi gặp tình huống ngoài kịch bản.
- Audience + insight: nhân viên 0–3 tháng, mobile; không sợ học, sợ làm sai trước mặt khách.
- Brand truth + proof: quy trình cửa hàng, bộ nhận diện, checklist mở/đóng ca (đều là tài liệu nội bộ; chưa có trích đoạn).
- Kênh/thời lượng/thiết bị: link nội bộ, 10 phút, mobile dọc, không 3D nặng.
- KPI + guardrail: hoàn thành / điểm kiểm tra / làm lại; không thu dữ liệu khách.
- Ràng buộc pháp lý: nội bộ, không chia sẻ ngoài, kết quả chỉ tới quản lý ca/team lead.

## 3. Điều còn thiếu

| Thiếu | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Trích đoạn `sop-content-approval`, `sop-customer-response`, `sop-pricing` | Decision chỉ hỏi *bước làm*, không hỏi con số quy định | Ghi `[cần xác nhận]` ở explain; không lên UI |
| Người duyệt nội dung (chức danh) | Act 2 chưa nêu đúng vai | Hỏi client; giữ câu "người có thẩm quyền theo quy trình" |
| Thời hạn hoàn thành | Không thể nhắc deadline trong game | Hỏi HR; hiện tại không có deadline trên UI |
| Baseline 3 KPI | Không đặt được mục tiêu số | Để trống baseline, không bịa |
| Ngưỡng đạt bài kiểm tra (n/3) | Report hiện n/3, không có pass/fail | Hỏi HR; không tự đặt ngưỡng |
| Ảnh nền cửa hàng có quyền dùng | Beat 1, 3 cần hình | Dùng lớp màu/hình khối nếu chưa có; ghi trong `qa-plan` low-tier |

## 4. Skill đã chọn

| Skill | Vì sao | Artifact |
|---|---|---|
| `brand-game-factory` | Điều phối, routing "Training nội bộ", gate | `run-brief.md` |
| `game-brief-for-brand` | Chốt vấn đề, proof, 1 hành động, 3 wow | `brief.md` |
| `game-narrative-and-tone` | Premise, ẩn dụ xưởng, guide, tone | `story-bible.md`, `tone-matrix.md` |
| `game-storyboard-and-sound` | 8 beat + cue sheet | `storyboard.md`, `sound-cue-sheet.md` |
| `brand-game-loop` | 4 act, 12 decision, scoring, audit | `loop.md`, `decisions.json`, `content-audit.out.md` |
| `mobile-game-cockpit` | Layout 320→1440, dock, sheet | `cockpit.md` |
| `game-qa-autopilot` | QA matrix + acceptance | `qa-plan.md` |

Đã load 6 skill con (`brief`, `narrative-tone`, `storyboard-sound`, `loop`, `cockpit`, `qa`); `qa-plan.md` có matrix + assertion + test ID. Cap 6 skill đã được ghi trong `_shared/skill-authoring.md`.

## 5. Artifact manifest

| File | Trạng thái | Người duyệt |
|---|---|---|
| `run-brief.md` | xong | quản lý đào tạo |
| `brief.md` | xong | quản lý đào tạo + brand |
| `story-bible.md` | xong | brand + quản lý ca |
| `tone-matrix.md` | xong | brand |
| `storyboard.md` | xong, chờ duyệt | design + dev |
| `sound-cue-sheet.md` | xong | dev + QA |
| `loop.md` | xong, chờ duyệt | design + quản lý đào tạo |
| `cockpit.md` | xong | design + QA |
| `qa-plan.md` | xong (plan, chưa chạy) | QA |
| `decisions.json`, `content-audit.out.md`, `_audit.mjs`, `_check.mjs` | xong (nguồn máy đọc + audit + kiểm chéo 6 mục) | QA |

## 6. Gate chưa đạt

- [x] Không lead gate, không offer/giá — không có trong bất kỳ màn nào.
- [x] Không tên khách thật, không dữ liệu khách — không có trường nhập nào ngoài mã nhân viên (tuỳ chọn).
- [x] Quy định lấy từ tài liệu nội bộ; chỗ chưa có ghi `[cần xác nhận]` và **không lên UI**.
- [x] Bài kiểm tra không skip; phần đọc có skip.
- [x] Có bản no-sound + reduced motion (spec); QA phủ mobile + desktop.
- [x] Kết quả gửi quản lý ca/team lead, không gửi marketing.
- [ ] **Chưa có bằng chứng chạy**: CTA 320×640, no-scroll, no-sound parity, reduced motion mới ở mức spec — cần build để chứng minh. Đây là lý do 2 tiêu chí dưới bị chấm 3.

## 7. Bước tiếp theo

- Skill: `game-qa-autopilot` (bản đầy đủ) + `game-launch-kpi` nếu cần event/funnel chi tiết → sau khi có build.
- Người nhận: dev dựng UI từ `cockpit.md` + `storyboard.md`, QA dựng test từ `qa-plan.md`.
- Trước khi build: xin 3 trích đoạn SOP + tên người duyệt + ngưỡng n/3.
- Deadline: `[cần xác nhận]`.

## 8. Tự chấm theo `playbooks/evaluation/rubric.md`

| Tiêu chí | Điểm | Bằng chứng | Ghi chú |
|---|---|---|---|
| Clarity | 4 | Beat 1–2, copy "10 phút để thử 4 tình huống" | Rõ ngay beat đầu; chưa test 3 người lạ → không 5 |
| Story | 4 | `story-bible.md` §1–7 | Premise + 4 act đổi trạng thái + kết gắn brand truth; guide còn mỏng |
| Tone | 4 | `tone-matrix.md` §7, 12 feedback | Câu thật, không từ cấm, claim có proof |
| Wow | 3 | `brief.md` §6 + `storyboard.md` beat 5 | 3 khoảnh khắc gắn proof nhưng **chưa có cảnh quay/ảnh chụp** — chưa đủ bằng chứng mức 4–5 |
| Loop | 4 | `loop.md` + `content-audit.out.md` (0 fail) | 12 decision đổi trạng thái, skip/resume, điểm tái lập được |
| One-finger | 4 | `cockpit.md` §4, §6 | Toàn tap, không kéo/rê; chưa quay 1 tay thực tế |
| Mobile | 4 | `cockpit.md` §2, §8 + `qa-plan.md` §1 | Phủ 320→1440, một scroller, CTA trong dock; chưa có screenshot |
| Evidence | 3 | `brief.md` §4 + `evidenceKey` trong `loop.md` | Nguồn đúng nhưng **chưa có trích đoạn**; 2 nguồn tin cậy thấp |
| Report | 4 | `loop.md` §7 | Điểm + 2 vùng yếu + hệ quả + bước tiếp; không offer (đúng scenario) |
| Measurement | 4 | `qa-plan.md` §5 | 6 event + funnel + guardrail + cách đọc; baseline trống |
| **Trung bình** | **3.8** | | 10 tiêu chí, không tiêu chí nào = 1 |

- Gate cứng: **không vi phạm ở mức spec** (không `%` trong copy, không offer, không audio-only, không bắt đăng ký, có skip đọc).
- Quyết định theo rubric: **fail mềm / revise** — trung bình 3.8 < 4.0. Hai tiêu chí ≤3 (Wow, Evidence) đều cần dữ liệu ngoài mode `design`: ảnh chụp sau build và trích đoạn SOP. Không sửa được trong lượt này.

## 9. Lỗi skill/template phát hiện (không tự sửa file)

1. **Scenario 04 tự mâu thuẫn về skip.** §4 ghi "chỉ skip phần đọc, không skip bài kiểm tra", nhưng bảng storyboard §5 đánh dấu beat 4 (Choice — nơi chứa cả 12 quyết định) là `Skip: Có`. Làm theo bảng thì mất toàn bộ điểm; làm theo §4 thì lệch bảng. Đã chọn §4 và ghi rõ trong `storyboard.md`.
2. **Bảng storyboard trong scenario từng thiếu cột.** `game-storyboard-and-sound` bắt buộc 10 cột gồm `Camera/Motion`; bảng §5 ban đầu chỉ có 9. Đã bổ sung cột này vào cả 5 scenario sau dry-run.
3. **Cue dùng nhưng không khai báo.** Storyboard §5 dùng `ui_confirm` (beat 2), `progress_tick` (beat 6), `silence` (beat 8); bảng cue §6 không có 3 id này. Đã bổ sung trong `sound-cue-sheet.md` và đánh dấu.
4. **Mode `design` vs output của scenario.** Factory: mode `design` dừng ở `cockpit.md`, `qa-plan.md` thuộc `build`. Scenario 04 lại yêu cầu `qa-plan.md` trong mode design. Đã tạo, nhưng đây là chỗ hai tài liệu không khớp.
5. **Rubric không có band cho mode `design`.** Tiêu chí Wow cần "cảnh quay", Mobile cần "screenshot", Measurement cần event đã chạy — design mode không thể có. Kết quả: một run design đúng chuẩn vẫn bị 3.8 và "revise". Đề xuất: thêm band riêng hoặc ghi rõ "chấm lại sau build".
6. **Tiêu chí Report giả định có report khách hàng + offer**, trong khi scenario này cấm offer và không chạy `brand-report-gate`; tiêu chí không có mô tả cho "bản ghi hoàn thành nội bộ".
7. **Catalog ban đầu thiếu `brand-game-loop`** dù factory routing gọi nó là bắt buộc. Đã đọc trực tiếp file theo `SKILLS.md` mục "Cách B"; sau đó catalog có lại. Không mất dữ liệu, nhưng là rủi ro khi chạy tự động.
