# Decision set

Schema tối thiểu để gameplay, scoring và test dùng chung. Mỗi decision thuộc đúng một act; mỗi act có 1–5 decision.

## Schema

```ts
interface BrandDecision {
  id: string;                 // "{{actId}}-{{slug}}" — duy nhất, ổn định
  actId: string;              // trùng act-spec
  kind: "knowledge" | "diagnosis" | "action" | "aesthetic";
  scoring: "points" | "none";  // aesthetic thường "none"; knowledge/diagnosis/action thường "points"
  prompt: string;             // 1 ý, ≤85 ký tự; "?" nếu có đáp án đúng, lựa chọn thẩm mỹ có thể là imperative
  options: [
    { id: string; label: string; points?: 0 | 1 | 2; feedback: string },
    { id: string; label: string; points?: 0 | 1 | 2; feedback: string },
    { id: string; label: string; points?: 0 | 1 | 2; feedback: string },
  ];
  explain: string;            // vì sao, không lặp feedback
  evidenceKey?: string;       // chỉ khi có nguồn dữ liệu thật; diagnosis dùng để tự soi
}
```

- `kind`: `knowledge` = hiểu biết chung; `diagnosis` = tự soi hiện trạng, có thể gắn `evidenceKey`; `action` = lựa chọn trong mô phỏng; `aesthetic` = chọn gu/phong cách, **không có đáp án đúng**.
- `scoring: "none"` dùng cho lựa chọn thẩm mỹ: không 2/1/0, không feedback đúng/sai, chỉ ghi nhận sở thích để cá nhân hoá; `scoring: "points"` mới cần đúng một 2/1/0.
- `evidenceKey` tùy chọn, phải trỏ nguồn đã kiểm (pre-scan/product fact/CRM). Không có nguồn thì bỏ trống; không bịa.
- Giữ `id`, `kind`, `points`, `actId` khi copy pass; chỉ đổi prompt/label khi có audit.

## One-question popup

- Một câu mở tại một thời điểm; hàng đợi FIFO theo thứ tự đăng ký.
- Câu đã trả lời không tự mở lại; ẩn được và mở lại từ pill “Câu hỏi X/N đang chờ”.
- Feedback + explain là snapshot độc lập: đổi phase/unmount không mất popup.
- Không mở quiz rời; câu hỏi gắn với điểm neo hành động trong act.

## Bảng decision theo act

| actId | decision id | kind | scoring | prompt (≤85) | option 2 | option 1 | option 0 | evidenceKey | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| {{actId}} | | | | | | | | | |
| {{actId}} | | | | | | | | | |

## Quy tắc viết

- Prompt nêu đúng 1 ý, xưng hô thống nhất, kết thúc bằng `?`; không có “đáp án đúng nhất”.
- Ba option song song ngữ pháp, cùng độ dài tương đối; không dùng ngoặc vuông template `[]`.
- Nếu `scoring: "points"`: `points` 2 = tốt nhất, 1 = một phần, 0 = chưa có/sai; đúng một option mỗi mức. Nếu `none`: bỏ `points`, feedback nói điều lựa chọn thể hiện, không phán xét.
- `feedback` nói **hậu quả** với thương hiệu/người chơi, không chỉ “đúng/sai”.
- `explain` nói lý do/nguyên tắc, không lặp nguyên feedback.
- Không đưa giá, tên gói, số liệu bịa, benchmark hay SLA tự đặt vào decision.
- Không để độ dài/format option đoán được đáp án.

## Checklist

- [ ] Mọi decision đúng schema, id duy nhất, thuộc act hiện tại.
- [ ] 3 option; nếu `scoring: points` đúng một 2/1/0; nếu `none` không có points/đáp án đúng; option song song, không meta-answer.
- [ ] Prompt ≤85; option 20–120; chênh lệch ≤55; không `%`/`[]`.
- [ ] `evidenceKey` chỉ có khi nguồn thật, có fallback khi thiếu dữ liệu.
- [ ] Mỗi act có đủ decision để hoàn thành mục tiêu; không câu nào thừa.
- [ ] Đã chạy [content-audit](content-audit.md) và ghi kết quả.
