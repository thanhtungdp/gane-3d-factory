# KPI plan — {{game}}

## 1. Mục tiêu

- North Star: {{metric}}
- Guardrail 1: {{metric}}
- Guardrail 2: {{metric}}
- Baseline: {{[cần xác nhận]}}

## 2. Event table

| Event | Khi nào | Props | Ghi chú |
|---|---|---|---|
| `game_view` | mở game | `source`, `device` | mốc đầu |
| `intro_view` | intro hiện | `replay`, `reduced` | chỉ lần đầu |
| `intro_complete` | CTA intro | `ms` | |
| `intro_skip` | bỏ qua | `ms` | |
| `start` | bắt đầu chơi | `mode` | |
| `step_complete` | xong một act | `actId`, `score` | |
| `question_answer` | chốt đáp án | `actId`, `points` | không ghi nội dung nhạy cảm |
| `result_view` | xem kết quả | `score` | |
| `report_unlock` | mở gate | `intent` | |
| `lead_submit` | gửi lead | `consent` | không PII trong analytics |
| `share` | chia sẻ | `channel` | |
| `audio_toggle` | bật/tắt | `enabled` | |
| `error` | lỗi | `code` | |

## 3. Funnel

```text
view → intro_complete/skip → start → step_complete ×N → result_view → report_unlock → lead_submit/share
```

## 4. Experiment

| Giả thuyết | Biến | Chỉ số | Thời gian |
|---|---|---|---|
| {{...}} | {{...}} | {{...}} | {{...}} |

## 5. Dashboard

- Funnel theo ngày.
- Drop-off theo act.
- Tỷ lệ mute, skip, replay.
- Lỗi theo code.

## 6. Privacy

- Không gửi tên/SĐT/email vào event.
- Consent trước lead.
- Retention theo policy.
