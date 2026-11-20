# Playbook scenarios

5 tình huống mẫu để chạy thử bộ skill. Mỗi file là một **brief generic** có placeholder và brand hư cấu; không dùng số liệu khách hàng, đối thủ hay benchmark thật.

## Khi nào dùng

- Cần kiểm tra bộ skill có dẫn được từ mục tiêu kinh doanh → brief → story/tone → storyboard/sound → loop/QA không.
- Cần so sánh nhanh hai format (teaser, diagnostic, launch, training, drop).
- Cần đào tạo người mới cách đọc artifact.

Không dùng làm template cho khách hàng thật mà không thay brand truth/proof; mọi `{{placeholder}}` phải được điền.

## Matrix

| Scenario | Thời lượng | Mục tiêu chính | Skill chạy | Artifact tối thiểu |
|---|---|---|---|---|
| [90 giây · booth teaser](01-90s-booth-teaser.md) | 90 giây | Dừng chân, để lại liên hệ/QR | brief, narrative-tone, storyboard-sound, loop, cockpit, 3d, QA | brief, story-bible, tone-matrix, storyboard, sound, loop, cockpit, qa |
| [4 phút · brand diagnostic](02-4min-brand-diagnostic.md) | 4 phút | Chẩn đoán cá nhân hoá, lead | brief, crawl-to-kit, narrative-tone, storyboard-sound, loop, cockpit, report-gate, QA | + report-outline |
| [7 phút · product launch](03-7min-product-launch.md) | 7 phút | Hiểu sản phẩm, chọn cấu hình, đặt trải nghiệm | brief, narrative-tone, storyboard-sound, loop, cockpit, 3d, report-gate, launch-kpi, QA | + report-outline |
| [10 phút · internal training](04-10min-internal-training.md) | 10 phút | Hiểu quy tắc, xử lý tình huống, kiểm tra nội bộ | brief, narrative-tone, storyboard-sound, loop, cockpit, QA | không report-offer |
| [3 phút · fashion drop](05-3min-fashion-drop.md) | 3 phút | Chọn phong cách, chia sẻ, đăng ký nhận tin | brief, narrative-tone, storyboard-sound, loop, cockpit, 3d, launch-kpi, QA | không report dài |

## Quy ước chung

- **Brand hư cấu:** mọi thông tin sản phẩm/khách trong file là ví dụ; ghi rõ khi cần.
- **Placeholder:** `{{brand}}`, `{{audience}}`, `{{guide}}`, `{{duration}}`, `{{prompt}}`, `{{feedback}}`, `{{cta}}` phải được điền trước khi dựng.
- **Không số liệu thật:** KPI chỉ ghi tên chỉ số và giả thuyết, baseline để trống.
- **Một hành động chính:** mỗi scenario chỉ một CTA chính; CTA phụ ghi rõ là phụ.
- **Không bán trong lúc chơi:** offer/giá chỉ sau báo cáo và lead gate (nếu có).
- **Storyboard trước code:** không dựng scene/UI trước khi `storyboard.md` được duyệt.

## Thứ tự chạy

1. `game-brief-for-brand` → `brief.md`.
2. `game-narrative-and-tone` → `story-bible.md`, `tone-matrix.md`.
3. `game-storyboard-and-sound` → `storyboard.md`, `sound-cue-sheet.md`.
4. `brand-game-loop` → `loop.md`.
5. `mobile-game-cockpit` → `cockpit.md`.
6. `brand-crawl-to-kit` / `brand-3d-world` / `brand-report-gate` nếu scenario cần.
7. `game-qa-autopilot` → `qa-plan.md`.
8. Chấm bằng [`../evaluation/rubric.md`](../evaluation/rubric.md), ghi vào [`../evaluation/run-log.md`](../evaluation/run-log.md).

## Liên quan

- Ví dụ điền sẵn: [`../examples/tea-house.md`](../examples/tea-house.md).
- Case study hiện tại (chỉ để học, không copy): [`../case-saokim.md`](../case-saokim.md).
- Gate dùng chung: `../../.dsh/skills/_shared/quality-gates.md`.
