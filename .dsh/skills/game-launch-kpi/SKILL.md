---
name: game-launch-kpi
description: Use when planning measurable launch analytics for a brand game, including event taxonomy, funnel, guardrails, experiment plan, and a no-fake-metrics reporting routine.
---

# Game Launch KPI

Chọn ít chỉ số đúng, đặt tên event rõ, và biết game có thật sự thu hút khách không.

## When to use

- Trước launch để chốt event.
- Sau launch khi cần đọc funnel.
- Khi cần A/B test intro, CTA, độ dài, report gate.

## Inputs

- Mục tiêu kinh doanh + hành động chính.
- Kênh traffic + UTM.
- Baseline nếu có.
- Công cụ analytics/CRM.
- Ràng buộc consent/privacy.

## Steps

1. Chọn **một North Star** (ví dụ: lead hợp lệ, share, hoàn thành game) + 2 guardrail.
2. Viết event taxonomy theo màn hình:
   - `game_view`, `intro_view`, `intro_complete`, `intro_skip`;
   - `start`, `step_complete`, `question_answer`;
   - `result_view`, `report_unlock`, `lead_submit`;
   - `share`, `audio_toggle`, `error`.
3. Vẽ funnel từ impression → start → completion → report/gate → lead/share.
4. Đặt guardrail: drop-off, thời gian, lỗi, mute, skip.
5. Viết 1–2 giả thuyết A/B có giả thuyết rõ, không test quá nhiều biến.
6. Ghi rõ baseline `[cần xác nhận]` nếu chưa có.
7. Đặt quy tắc báo cáo: không so sánh khập khiễng, không bịa uplift.

## Outputs

`kpi-plan.md` gồm:

- North Star + guardrail.
- Event table.
- Funnel.
- Experiment.
- Dashboard/alert.
- Privacy notes.

Template: `templates/kpi-plan.md`.

## Quality gates

- Mỗi event có mục đích; không tracking thừa.
- Không PII trong props.
- Không `%` trong UI; KPI dùng x/100.
- Không cam kết KPI khi chưa có baseline.
- Có cách đo skip/mute để kiểm tra trải nghiệm.
- Kết quả được đọc cùng guardrail, không chỉ conversion.

## Handoff

Nếu funnel yếu ở intro → quay lại `game-storyboard-and-sound`; ở popup → `mobile-game-cockpit`; ở report → `brand-report-gate`.
