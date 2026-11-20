# Contract — `pre-scan.md`

Hợp đồng dữ liệu pre-scan: bằng chứng công khai trước khi chơi, dùng cho màn xác nhận, reality check và báo cáo cuối. Artifact theo mẫu [pre-scan template](../../../.dsh/skills/brand-crawl-to-kit/templates/pre-scan.md).

## Cấu trúc

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `scan_id` | string | Có | Khớp brand kit; còn hạn để report gate đọc lại |
| `source` | `url` \| `manual` \| `fallback` | Có | Cho biết dữ liệu đến từ đâu |
| `score` | number 0–10 | Có | Trung bình 5 tiêu chí, làm tròn 1 số lẻ |
| `criteria` | map 5 key | Có | Mỗi key: logo, color, slogan, social, mobile |
| `signals` | array | Có | 5–8 phần tử |
| `mobileFriendly` | boolean | Có | Viewport + CSS responsive |
| `hasSlogan` | boolean | Có | Có câu định vị ≥12 ký tự, không trùng tên |
| `socialCount` | number | Có | Số kênh đã khử trùng |
| `colorConsistency` | number 0–10 | Có | Độ nhất quán palette |
| `logoQuality` | `high` \| `medium` \| `low` \| `none` | Có | Khớp brand kit |

### `criteria[key]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `key` | string | Một trong 5 tiêu chí |
| `score` | number 0–10 | Theo bảng cho điểm của skill |
| `label` | string | Rõ ràng / Khá ổn / Cần củng cố / Còn thiếu |
| `evidence` | string | **Dữ liệu thật**, đọc được bởi người không kỹ thuật; không câu chung chung |
| `positive` | boolean | `score ≥ 6` |

### `signals[]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `id` | string | Ổn định trong một lần quét |
| `zone` | `internal` \| `market` \| `competitor` \| `identity` | 4 vùng cố định |
| `severity` | `gap` \| `watch` \| `strength` | gap <6, watch 6–7 hoặc định kỳ, strength ≥8 |
| `criterion` | string | Tiêu chí nguồn |
| `title` | string | Ngắn, không giật tít |
| `evidence` | string | Phải nối được với dữ liệu thật |

## Luật cho điểm (generic)

| Tiêu chí | Quy tắc |
|---|---|
| logo | Monogram 2; low 4; medium 7; high 9; +1 nếu nguồn header/SVG; không có 1 |
| color | Bắt đầu từ `colorConsistency`; +0,5 nếu ≥2 màu; +0,5 nếu có theme; chỉ fallback → 2 |
| slogan | Có câu 8–90 ký tự → 9; có dấu hiệu nhưng thiếu câu → 7; không có → 2 |
| social | 0→1; 1→4; 2→6; 3→8; ≥4→9 |
| mobile | viewport + responsive → 9; chỉ viewport → 7; chỉ CSS → 4; không có → 2 |

Nếu implementation chốt công thức khác, cập nhật contract + tài liệu kèm theo; **không tự đổi ở từng game**.

## Tín hiệu tối thiểu

- Mỗi tiêu chí sinh tối đa 1 tín hiệu + thêm tối đa 1 tín hiệu vùng `competitor` dựa trên khác biệt hoá thật.
- Nếu mọi tiêu chí đều tốt: bổ sung 1–2 tín hiệu "kiểm tra định kỳ" thay vì chỉ toàn `strength`.
- Nếu thiếu dữ liệu: dùng bộ "kiểm tra định kỳ" chuẩn; không bịa đối thủ/benchmark.

## Reality check

- Câu diagnosis "tôi đã có X chưa" map tới một tiêu chí qua `evidenceKey`.
- Người chơi chọn "đã có" (2 điểm) nhưng tiêu chí <6 → trừ điểm diagnosis theo luật game; tối đa 2 mỗi act.
- Không có evidenceKey thì không trừ (tránh phạt oan).
- Pre-scan **không** quyết định điểm act; chỉ làm bằng chứng.

## Fallback trung tính

Khi không quét được: mỗi tiêu chí `score: 5`, `positive: false`, `evidence` ghi rõ "chưa có dữ liệu quét website"; `signals` đủ 5 với severity `watch`; báo cáo phải nói rõ dữ liệu này không phải kết luận về thương hiệu.

## Validation

- [ ] Đủ 5 criteria đúng key; score/label/positive nhất quán.
- [ ] Evidence không rỗng, không lặp y nguyên giữa các tiêu chí.
- [ ] 5–8 signals; zone/severity thuộc enum; có evidence thật.
- [ ] `score` bằng trung bình criteria (sai số ≤0,1).
- [ ] Không chứa HTML/text đầy đủ; không có PII.
- [ ] Nếu `source = fallback/manual`: vẫn có warning tương ứng và evidence trung thực.
