# Loop patterns

Chọn **một pattern chính**, tối đa một pattern phụ. Ghi lý do chọn và rủi ro trong `loop.md`. Không dùng pattern chỉ vì “cho vui”; mỗi pattern phải phục vụ hành động/học tập của act.

## Linear

- **Dùng khi:** hành trình có thứ tự nhân quả; người chơi cần đi qua từng ý trước khi mở ý sau.
- **Cấu trúc:** act 1 → act 2 → …; mỗi act mở khi act trước hoàn tất (hoặc skip có ghi nhận).
- **Quyết định:** đặt ở điểm neo cuối mỗi hành động; không quay lại act trước.
- **Tiến bộ:** thanh act/checklist; trạng thái done rõ.
- **Rủi ro:** tuyến tính dễ nhàm; cần biến thiên hành động giữa các act.

## Hub

- **Dùng khi:** nhiều nhánh/chủ đề, người chơi nên tự chọn thứ tự khám phá.
- **Cấu trúc:** một màn trung tâm + các node; node mở dần theo tiến độ.
- **Quyết định:** mỗi node 1–3 câu; tránh bắt thứ tự cứng nếu không có lý do.
- **Tiến bộ:** node sáng/khóa, % hoàn thành dạng n/N; vẫn phải hoàn thành tối thiểu để report.
- **Rủi ro:** người chơi bỏ qua node quan trọng; cần khóa mềm và gợi ý.

## Timed

- **Dùng khi:** áp lực thời gian là một phần bài học (ra quyết định nhanh, xử lý khủng hoảng).
- **Cấu trúc:** hành động có đồng hồ; hết giờ vẫn đi tiếp, ghi nhận trạng thái.
- **Quyết định:** popup mở thì tạm dừng đồng hồ nếu người chơi cần đọc; không phạt vì đọc.
- **Tiến bộ:** bonus thời gian có trần, không dùng để chặn.
- **Rủi ro:** tạo lo âu/không công bằng trên mobile; cần test reduced motion, pause, skip.

## Resource

- **Dùng khi:** cần dạy trade-off, nhất quán, ngân sách, năng lượng hoặc độ tin cậy.
- **Cấu trúc:** một meter/resource 0–10 (hoặc 0–100 nội bộ); hành động/lựa chọn tiêu hao, thời gian cũng tiêu hao.
- **Quyết định:** feedback nói rõ mất/được bao nhiêu; meter không bao giờ âm; luôn có đường hồi.
- **Tiến bộ:** resource cuối map sang report như một tín hiệu, không phải hình phạt.
- **Rủi ro:** người chơi bị kẹt nếu resource cạn; cần floor/fallback.

## Conversation

- **Dùng khi:** học qua đối thoại, đặt câu hỏi, xử lý tình huống xã hội.
- **Cấu trúc:** lượt nói của {{guide}}/nhân vật + lựa chọn của người chơi; mỗi lượt 1–3 option.
- **Quyết định:** option thể hiện giá trị/thái độ; consequence thể hiện trong lời đáp hoặc trạng thái quan hệ.
- **Tiến bộ:** mở nhánh, mở act kế; tránh “đoán ý người viết”.
- **Rủi ro:** tone không đồng nhất, lời thoại dài; cần tone-matrix và test đọc.

## Construction

- **Dùng khi:** người chơi lắp/sắp xếp/bố cục để hiểu hệ thống hoặc quy trình.
- **Cấu trúc:** kéo/thả hoặc tap để đặt; có undo/reset; preset cho người không kéo được.
- **Quyết định:** chốt sau khi sắp xếp; feedback theo cấu trúc đã tạo, không chỉ đúng/sai.
- **Tiến bộ:** mở khóa mảnh tiếp theo; lưu cấu trúc.
- **Rủi ro:** khó trên màn nhỏ; luôn có tap alternative và không bắt thao tác chính xác.

## Kết hợp

- Chỉ dùng 1 pattern chính; pattern phụ không được làm rối luật chơi.
- Nếu kết hợp timed + resource: pause đồng hồ khi popup mở; bonus có trần.
- Nếu kết hợp conversation + hub: node trung tâm mở hội thoại, không cần đi lại.
- Ghi rõ pattern trong `loop.md` và testid hành động chính.
