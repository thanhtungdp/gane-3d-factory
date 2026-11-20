---
name: brand-game-factory
description: Use when planning a new brand game from a business goal, choosing which game-design skills to run, and gating brief, story, loop, storyboard, sound, mobile UX, QA, report, and launch readiness.
---

# Brand Game Factory

Skill điều phối. Không tự viết thay toàn bộ; nó chọn đúng skill con, kiểm tra thiếu input, và chốt artifact trước khi cho qua bước tiếp theo.

## When to use

- Có một mục tiêu kinh doanh và cần biến thành game thương hiệu.
- Cần chọn nhanh: làm bản 90 giây hay bản 5 phút; có crawl website hay không; có báo cáo/lead không.
- Cần kiểm tra một ý tưởng game đã đủ rõ để giao dev/design chưa.

Không dùng khi chỉ cần sửa một câu copy, một bug UI, hay một trang landing đơn lẻ.

## Inputs

Hỏi tối đa 5 câu, chỉ hỏi thứ chưa có:

1. Vấn đề kinh doanh / hành động mong muốn.
2. Audience chính và insight.
3. Brand truth + proof có thật (website, sản phẩm, khách).
4. Kênh, thời lượng, thiết bị, ngôn ngữ.
5. KPI chính + ràng buộc pháp lý/thương hiệu.

Nếu thiếu proof hoặc KPI: ghi `[cần xác nhận]`, không bịa.

## Modes

| Mode | Thời gian | Artifact tối thiểu | Dừng khi |
|---|---|---|---|
| `brief` | 15–30 phút | `brief.md`, 3 wow moments, story direction | Brief được duyệt |
| `design` | 1–2 giờ | brief + `story-bible.md`, `tone-matrix.md`, `storyboard.md`, `sound-cue-sheet.md`, `loop.md`, `cockpit.md`, `qa-plan.md` | Storyboard + loop + QA plan được duyệt |
| `build` | 1–3 ngày | design + kit mapping, implementation plan, test suite | QA gate xanh |
| `full` | theo scope | build + code + test + report | QA gate xanh |

Mặc định đề xuất `design` nếu người dùng chưa nói mode.

## Steps

1. **Phân loại**: xác định mode, thời lượng, có crawl không, có report/lead không, ngân sách kỹ thuật.
2. **Chọn skill tối thiểu** theo bảng routing; không load cả bộ.
3. **Chặn thiếu input**: nếu thiếu brand truth/proof, dừng ở brief; không tự sáng tác số liệu.
4. **Chạy theo thứ tự**:
   - `game-brief-for-brand`
   - `game-narrative-and-tone`
   - `game-storyboard-and-sound`
   - `brand-game-loop`
   - `mobile-game-cockpit`
   - `brand-crawl-to-kit` nếu cá nhân hoá
   - `brand-3d-world` nếu cần wow thị giác
   - `brand-report-gate` nếu có kết quả/lead
   - `game-qa-autopilot`
   - `game-launch-kpi`
5. **Ghi artifact manifest**: file nào đã tạo, còn thiếu gì, ai cần duyệt.
6. **Quality gate**: đọc `_shared/quality-gates.md`; nếu vi phạm cứng, dừng và đề xuất sửa.
7. **Handoff**: giao đúng file cho bước tiếp theo, không tóm tắt lại toàn bộ.

## Routing

| Mục tiêu | Skill bắt buộc | Skill tùy chọn |
|---|---|---|
| Teaser 60–90 giây, booth/QR | brief, narrative-tone, storyboard-sound, loop, mobile, qa | 3d-world, launch-kpi |
| Chẩn đoán thương hiệu 3–5 phút | brief, crawl, loop, mobile, report-gate, qa | narrative-tone, storyboard-sound, 3d-world |
| Product launch 5–8 phút | brief, narrative-tone, storyboard-sound, loop, mobile, report-gate | 3d-world, launch-kpi |
| Training nội bộ | brief, loop, mobile, qa | narrative-tone, storyboard-sound |
| Kiosk không thu dữ liệu | brief, storyboard-sound, loop, mobile, qa | 3d-world |

## Outputs

- `run-brief.md`: mode, inputs, thiếu gì, skill đã chọn.
- Artifact manifest theo mode.
- Danh sách gate chưa đạt.

Template: `templates/run-brief.md`.

## Quality gates

- Không tự bịa proof, số, khách, đối thủ, giải thưởng.
- Không bán hàng trong lúc chơi; offer chỉ sau report gate.
- Story/tone/storyboard/sound phải có trước khi code.
- Mobile cockpit phải có 320×640 và fold/duo. CTA có thể chỉ xuất hiện sau beat reveal ở teaser/intro, nhưng từ lúc xuất hiện phải luôn thấy và không cần cuộn; màn chơi chính luôn có CTA trong dock.
- Nếu không có thời gian làm đủ, cắt scope chứ không bỏ QA gate.

## Handoff

- Brief xong → `game-narrative-and-tone`.
- Story/tone xong → `game-storyboard-and-sound` + `brand-game-loop`.
- Loop xong → `mobile-game-cockpit`; nếu có 3D → `brand-3d-world`.
- Build xong → `game-qa-autopilot`.
- Report xong → `brand-report-gate` → `game-launch-kpi`.

Đọc thêm: [`_shared/quality-gates.md`](../_shared/quality-gates.md), [`_shared/output-contracts.md`](../_shared/output-contracts.md), [`SKILLS.md`](../../../SKILLS.md).
