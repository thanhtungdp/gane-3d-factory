---
name: game-brief-for-brand
description: Use when turning a business goal, audience, and brand truth into a one-page game brief with promise, proof, desired action, constraints, KPI, and the three emotional wow moments.
---

# Game Brief for Brand

Biến mục tiêu kinh doanh thành brief đủ rõ để thiết kế game, không phải một deck ý tưởng chung.

## When to use

- Bắt đầu dự án game mới.
- Có nhiều ý tưởng nhưng chưa biết ý nào đáng làm.
- Cần thống nhất giữa brand, sales, marketing và dev trước khi viết code.

Không dùng để viết storyboard hay chọn engine; đó là skill sau.

## Inputs

- Vấn đề kinh doanh (mất lead, khó giải thích giá, launch sản phẩm, training…).
- Audience chính: ai, đang nghĩ gì, sợ gì, muốn gì.
- Brand truth + proof có thật: sản phẩm, khách, quy trình, chứng nhận.
- Hành động mong muốn sau game.
- Kênh, thời lượng, thiết bị, ngôn ngữ.
- Ràng buộc: ngân sách, pháp lý, asset, thời gian.
- KPI chính + guardrail.

Nếu thiếu, hỏi tối đa 5 câu; phần còn lại ghi `[cần xác nhận]`.

## Steps

1. Viết **vấn đề** trong 1 câu, không dùng tính từ.
2. Viết **audience insight**: một câu họ tin/không tin.
3. Viết **promise** của game: người chơi sẽ thấy/hiểu gì.
4. Liệt kê **proof** có thật; gắn nhãn nguồn.
5. Chọn **một hành động chính**; bỏ các hành động phụ.
6. Đề xuất **3 wow moments** gắn với proof, không phải hiệu ứng chung.
7. Chọn format sơ bộ: 60–90 giây, 3–5 phút, 8–12 phút, hay kiosk.
8. Viết KPI: 1 chỉ số chính, 2 guardrail; nêu baseline nếu có.
9. Ghi rõ **không làm gì** để tránh scope creep.

## Outputs

`brief.md` theo `_shared/output-contracts.md`:

- Vấn đề, audience, insight.
- Promise, proof.
- Hành động chính.
- 3 wow moments.
- Format, kênh, thời lượng.
- KPI + guardrail.
- Ràng buộc và điều chưa biết.

Template: `templates/brief.md`.

## Quality gates

- Có đúng 1 hành động chính.
- Mọi proof có nguồn hoặc gắn `[cần xác nhận]`.
- Không có KPI bịa; baseline để trống nếu chưa đo.
- Wow moment phải dùng dữ liệu/sản phẩm thật của brand.
- Không bán hàng trong brief chơi.
- Brief đọc được trong 2 phút.

## Handoff

Sang `game-narrative-and-tone` với `brief.md`. Nếu brief chưa có proof, dừng và quay lại hỏi client.
