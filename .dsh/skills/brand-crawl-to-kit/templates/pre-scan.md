# Pre-scan — {{brand_name}}

> Artifact của skill `brand-crawl-to-kit`. Mọi `evidence` phải lấy từ dữ liệu thật của website hoặc nhập tay; không suy diễn, không bịa.

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| `scan_id` | `{{scan_id}}` |
| `source` | `{{url \| manual \| fallback}}` |
| `score` | {{score}}/10 (trung bình 5 tiêu chí) |
| `logoQuality` | {{high \| medium \| low \| none}} |
| `hasSlogan` | {{true/false}} |
| `socialCount` | {{n}} |
| `colorConsistency` | {{0–10}}/10 |
| `mobileFriendly` | {{true/false}} |

## 2. Năm tiêu chí

| Key | Score | Label | Positive | Evidence (dữ liệu thật) |
|---|---|---|---|---|
| logo | {{0–10}}/10 | {{Rõ ràng/Khá ổn/Cần củng cố/Còn thiếu}} | {{true/false}} | {{vd: "logo 480×160 từ header"}} |
| color | {{0–10}}/10 | {{...}} | {{true/false}} | {{vd: "3 màu: primary … từ logo; accent … từ CSS"}} |
| slogan | {{0–10}}/10 | {{...}} | {{true/false}} | {{vd: "Tìm thấy câu định vị: “…”" hoặc "Chưa thấy câu định vị riêng"}} |
| social | {{0–10}}/10 | {{...}} | {{true/false}} | {{vd: "2 kênh: Facebook, Zalo"}} |
| mobile | {{0–10}}/10 | {{...}} | {{true/false}} | {{vd: "viewport + CSS responsive" hoặc "thiếu viewport"}} |

Quy ước: `positive = score ≥ 6`; label theo mốc ≥8 / ≥6 / ≥4 / còn lại.

## 3. Signals

Tối thiểu 5, tối đa 8. Mỗi signal có zone (`internal`, `market`, `competitor`, `identity`), severity (`gap`, `watch`, `strength`) và evidence thật.

| ID | Zone | Severity | Criterion | Title | Evidence |
|---|---|---|---|---|---|
| {{id}} | {{zone}} | {{gap/watch/strength}} | {{logo/color/slogan/social/mobile}} | {{câu ngắn}} | {{evidence}} |
| {{id}} | {{...}} | {{...}} | {{...}} | {{...}} | {{...}} |

- Có signal vùng `competitor`? {{có/không}} — nếu không đủ dữ liệu khác biệt hoá, dùng tín hiệu "kiểm tra định kỳ" thay vì bịa đối thủ.
- Nếu mọi tiêu chí đều tốt: bổ sung 1–2 "kiểm tra định kỳ" để không báo cáo toàn màu hồng.

## 4. Dùng cho reality check

- Câu diagnosis "tôi đã có X chưa" map về tiêu chí: {{map evidence_key cho từng câu}}.
- Tiêu chí <6 → nếu người chơi chọn "đã có" (2 điểm), trừ điểm diagnosis theo luật của game; ghi rõ evidence dùng để trừ.
- Không dùng pre-scan để tính điểm act; chỉ làm bằng chứng.

## 5. Chất lượng dữ liệu & cảnh báo

- [ ] Mỗi evidence đều đọc được bởi người không kỹ thuật.
- [ ] Không có evidence nào là câu chung chung kiểu "cần cải thiện".
- [ ] Trường thiếu đã ghi warning tương ứng (logo nhỏ, không css, không social…).
- [ ] Fallback/neutral: mỗi tiêu chí 5/10, positive false, ghi rõ "chưa có dữ liệu quét".

## 6. Handoff

- Bản này đi cùng `brand-kit.md` tới `brand-game-loop` (chọn evidence key) và `brand-report-gate` (bằng chứng báo cáo).
- Nếu người dùng sửa logo/màu ở màn confirm: chấm lại tiêu chí liên quan, giữ nguyên evidence của tiêu chí không bị ảnh hưởng.
