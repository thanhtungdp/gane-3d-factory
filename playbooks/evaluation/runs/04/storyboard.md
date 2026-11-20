# Storyboard — Bánh mì Hạnh · 10 phút

> Bắt buộc duyệt trước khi code scene/UI. Không beat trang trí. Bảng dùng đủ 10 cột, gồm **Camera/Motion**; scenario đã được bổ sung cột này sau dry-run.

## Bảng beat

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Tạo liên quan trong 3 giây | Cửa cuộn còn đóng, một bóng người đứng trước, đèn đường còn bật; ảnh nội bộ hoặc lớp CSS | Tĩnh; chỉ 1 lớp sáng tăng nhẹ 400ms | Tap "Vào ca" (toàn màn hình bấm được) | "Ca đầu tiên của bạn bắt đầu." | `amb_shop` | 0–12s | Có |
| 2 | Promise | Nói rõ nhận gì, không hứa quá | 4 mốc ca làm xếp dọc, mốc 1 sáng | Fade 200ms, không parallax | Tap "Bắt đầu" | "10 phút để thử 4 tình huống trước khách thật." | `ui_confirm` | 12–25s | Có |
| 3 | First action | Dạy luật bằng hành động thật | Checklist mở ca 3 mục (phù hiệu, bảng hiệu, POS) dạng phiếu giấy | Tĩnh; mỗi mục tick đổi màu 120ms | Tap từng mục; nút "Tiếp tục" disabled tới khi đủ 3 | "Kiểm ba thứ trước khi mở cửa." | `ui_tap` | 25–90s | Không |
| 4 | Choice | Ra quyết định, một câu một lúc | Sheet câu hỏi từ đáy; phía sau là cảnh cửa hàng mờ | Sheet trượt 240ms; reduced-motion: hiện ngay | Tap 1 trong 3 option; nút phụ "Dừng, hỏi quản lý ca" | "Đồng phục thiếu phù hiệu trước giờ mở cửa, bạn xử lý thế nào?" (câu 1/12; 11 câu còn lại trong `loop.md`) | `ui_select` | 90–360s | Không (câu hỏi không skip) |
| 5 | Consequence | Cho thấy hậu quả, không phán xét | Panel hậu quả: đúng cảnh checklist/sổ ca mà tình huống chạm tới | Fade 200ms; không zoom, không rung | Tap "Tiếp tục" | "Ca mở đúng chuẩn nhận diện; sổ ca có dòng để ca sau đối chiếu." + 1 dòng explain | `confirm_partial` / `confirm_good` | 360–450s | Có (bỏ chữ, giữ nhãn) |
| 6 | Progress | Thấy tiến bộ và biết còn gì | 4 mốc sáng dần; mốc vừa xong có viền đậm | 1 lần đổi màu 300ms, không lặp | Không (chỉ đọc) | "Còn 1 act trước bài kiểm tra." | `progress_tick` | 450–480s | Có |
| 7 | Reveal | Kiểm tra thật, không trang trí | 3 câu kiểm tra, mỗi câu 3 đáp án; sau đó bảng kết quả X/10 | Không chuyển động ngoài highlight | Tap đáp án; không có nút bỏ qua | "Bài kiểm tra cuối ca." | `reward` | 480–560s | Không |
| 8 | CTA | Chốt hành động chính | Bản bàn giao ca đã điền + nút xác nhận | Tĩnh | Tap "Xác nhận" | "Gửi kết quả cho quản lý ca." | `silence` | 560–600s | Không |

## Nhịp bên trong beat 4–5 (12 quyết định)

| Đoạn | Thời gian | Nội dung |
|---|---|---|
| Act 1 · Nhận ca | 90–180s | 3 câu (checklist 3 mục mở đầu) |
| Act 2 · Mở cửa | 180–250s | 3 câu (nội dung, logo, giá) |
| Act 3 · Gặp khách | 250–390s | 3 câu (phàn nàn, giảm giá, quay video) — đoạn căng nhất, không dồn beat |
| Act 4 · Đóng ca | 390–450s | 3 câu (bàn giao, sự cố, không chắc quy định) |

## Ngân sách thời lượng

| Nhóm | Thời gian | Tỉ lệ | Ghi chú |
|---|---|---|---|
| Hook + Promise | 25s | khoảng 4/100 | Thấp hơn gợi ý 8–15/100: đây là link nội bộ, không cần thuyết phục như booth |
| Hành động + lựa chọn | 335s | khoảng 56/100 | Trong band 45–65/100 |
| Hậu quả + tiến bộ | 90s | khoảng 15/100 | Trong band 15–25/100 |
| Reveal + CTA | 120s | khoảng 20/100 | Đúng band; CTA nằm trong dock, không cần cuộn |

## Ghi chú beat

- Beat 3 và 7 là "Không skip" vì là hành động chính và bài kiểm tra. Beat 4 "Không skip" **khác bảng scenario** (scenario ghi "Có"): nếu skip câu hỏi thì không có điểm để ghi nhận hoàn thành. Đã ghi vào báo cáo chạy.
- Skip ở beat 1, 2, 5, 6 chỉ bỏ chữ dẫn/giải thích; nhãn hậu quả và trạng thái vẫn hiện.
- Beat 5 sau act 3 là chỗ nghỉ bắt buộc: không mở câu tiếp theo trong 600ms.
- Reduced motion: tắt trượt sheet, fade, và chuyển màu dần; thay bằng hiện tức thì. Không mất thông tin nào.
- No-sound: mọi phản hồi đúng/chưa khớp có nhãn chữ + đổi màu viền, không dựa vào `confirm_*`.
- Ảnh nền: chỉ dùng ảnh nội bộ đã được phép; nếu chưa có, dùng lớp màu + hình khối, không lấy ảnh ngoài.

## Beat / asset bị cắt và lý do

| Đã cân nhắc | Lý do cắt |
|---|---|
| Beat "giới thiệu thương hiệu" trước Hook | Không đổi trạng thái người chơi; 10 phút nội bộ không cần bán brand |
| Beat "chọn cửa hàng" | Không có dữ liệu cá nhân hoá; thêm bước thừa trước hành động chính |
| Màn "game over" khi chọn 0 điểm | Trái nguyên tắc "chọn sai vẫn đi tiếp"; hậu quả đã nằm ở beat 5 |
| Ảnh nền 3D cửa hàng | Brief ghi không cần 3D nặng; thay bằng lớp màu + vật thể phẳng |
| Hiệu ứng rung khi chọn sai | Reduced motion và tone không phán xét; đổi sang viền trung tính |

## Checklist duyệt

- [x] 8 beat, không beat trang trí; beat nào bỏ cũng mất thông tin.
- [x] Mỗi beat có Purpose + Interaction (hoặc ghi "chỉ đọc" ở beat 6).
- [x] Tổng duration 600s khớp 10 phút.
- [x] Mọi hành động một ngón tay: tap; không kéo/rê nên không cần phương án tap thay thế.
- [x] Beat CTA (8) tách khỏi gameplay, không bán gì.
- [x] Ghi chú reduced-motion cho beat có chuyển động (1, 2, 4, 5, 6).
- [x] Copy trong bảng là câu thật, đã qua `tone-matrix.md`.
