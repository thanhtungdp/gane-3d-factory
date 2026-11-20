# Act spec

Dùng cho **2–7 act**, không mặc định số act. Mỗi act là một đơn vị chơi có mở/đóng rõ ràng; không copy nguyên một act cho act khác.

## Cách dùng

1. Nhân bản bảng dưới cho từng act.
2. Điền `{{actId}}`, `{{duration}}`, `{{world}}`, `{{guide}}` theo brief/story.
3. Mỗi act phải trả lời được: người chơi làm gì, quyết định gì, hậu quả gì, tiến bộ gì.
4. Đánh dấu `[cần xác nhận]` cho dữ liệu chưa có; không tự đặt số.

## Bảng act

| Trường | Nội dung | Ghi chú |
|---|---|---|
| `actId` | `act-{{n}}-{{slug}}` | Duy nhất, ổn định cho test/report |
| Tên act | {{actName}} | Ngắn, người chơi hiểu |
| Mục tiêu người chơi thấy | {{goal}} | 1 câu, không lộ đáp án |
| Thời lượng mục tiêu | {{duration}} | Trần thiết kế, không phải đồng hồ đếm ngược trừ khi pattern timed |
| Hành động một ngón tay | {{action}} | Tap/rê/kéo/giữ; luôn có phương án tap |
| Điểm neo mở câu hỏi | {{anchor}} | Hành động nào vừa xong thì mở popup |
| Quyết định | `decision-{{actId}}-*` | 1–5 câu; xem [decision-set](decision-set.md) |
| Hậu quả nếu chọn 0 | {{consequence}} | Nói điều xảy ra với thương hiệu/người chơi, không phán xét |
| Tiến bộ / thưởng | {{progress}} | Trạng thái, lớp sáng, huy hiệu, mở act kế |
| Evidence dùng | {{evidenceSource}} | Dữ liệu thật + fallback; có thể trống |
| Skip / resume | {{skipResume}} | Skip sau intro; resume lưu act + decision đã chốt |
| Test IDs | `act-{{actId}}`, `decision-{{id}}`, `option-{{id}}`, `continue` | `skip`, `resume` ở shell |

## Ví dụ cấu trúc (placeholder, không phải story hiện tại)

| Trường | Nội dung |
|---|---|
| `actId` | `act-1-{{slug}}` |
| Tên act | {{actName}} |
| Mục tiêu người chơi thấy | Hiểu {{vấn đề}} bằng một hành động cụ thể |
| Thời lượng mục tiêu | {{duration}} |
| Hành động một ngón tay | Chạm các mục để mở thông tin, không cần kéo |
| Điểm neo | Sau khi mở đủ {{n}} mục |
| Quyết định | 1–5 câu theo schema decision-set |
| Hậu quả nếu chọn 0 | {{consequence}} |
| Tiến bộ | Mở act kế + ghi trạng thái `done` |
| Evidence | {{evidenceSource}} hoặc fallback minh bạch |
| Skip / resume | Skip ngay cuối intro; resume giữ act hiện tại |

## Checklist trước khi qua act kế

- [ ] Act có đủ 5 trường: mục tiêu, hành động, quyết định, hậu quả, tiến bộ.
- [ ] Hành động chính làm được bằng một ngón tay; có tap alternative.
- [ ] Câu hỏi xuất hiện sau hành động, không mở màn quiz rời.
- [ ] Chọn 0 điểm vẫn đi tiếp; không dead-end, không bắt chơi lại.
- [ ] Act có ít nhất một chi tiết lấy từ brand truth/proof.
- [ ] Test id ổn định, không đổi theo bản copy.
