# Content audit

Audit trước khi build hoặc trước khi freeze copy. Mọi decision phải qua bảng này; lỗi cứng thì không qua gate.

## Quy chuẩn

| Hạng mục | Quy chuẩn | Cách kiểm |
|---|---|---|
| Prompt | 1 ý, ≤85 ký tự; có đáp án đúng thì kết thúc `?`, aesthetic có thể imperative | `trim().length`, ký tự cuối |
| Meta-answer | Không chứa “đúng nhất” (case-insensitive) | regex |
| Option | 20–120 ký tự; ngoại lệ phải ghi lý do + allowlist trong test | độ dài từng nhãn |
| Cân độ dài | Nhãn dài nhất − ngắn nhất trong cùng decision ≤55 | max/min |
| Template | Không có `[` hoặc `]` trong nhãn | regex |
| Cấu trúc | Đúng 3 option; nếu `scoring=points` đúng một 2/1/0; nếu `none` không có points | đếm points/scoring |
| Song song | Cùng ngữ pháp/thì/độ trang trọng; không một option dài bất thường để lộ đáp án | đọc thủ công |
| SLA/benchmark | Không tự đặt con số hiệu quả, thời gian, thị phần | rà từ khóa |
| `%` | Không xuất hiện trong copy UI; dùng X/10, n/5 | regex |
| Feedback | Nói hậu quả/thay đổi, không chỉ “đúng/sai” | đọc thủ công |
| Explain | Giải thích lý do, không lặp feedback | đọc thủ công |
| Evidence | `evidenceKey` chỉ trỏ dữ liệu/source đã kiểm; không có thì bỏ | đối chiếu input |

## Bảng audit

| actId | decision id | kind | scoring | prompt len | option lens | spread | Meta | `[]` | SLA | `%` | evidenceKey | Kết quả | Ghi chú |
|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| {{actId}} | {{decisionId}} | | | | | | | | | | | PASS/FAIL | |

## Lệnh gợi ý

```bash
# chạy test schema nếu repo đã có
npx vitest run <path-to-content-copy-test>
```

Nếu project khác, viết script đọc mảng decision và lặp đúng các kiểm tra trên; lưu output cạnh `loop.md`.

## Gate

- **PASS** khi 0 lỗi cứng; mọi ngoại lệ ngắn có allowlist + lý do trong test.
- **FAIL** nếu còn meta-answer, template `[]`, SLA tự đặt, `%`, sai cấu trúc points (khi scoring=points), hoặc option lộ đáp án bằng độ dài.
- Ghi rõ exception và người duyệt; không tự nới ngưỡng mà không có lý do.
