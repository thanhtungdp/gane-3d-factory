# Storyboard — Xưởng Gốm La · 90 giây

> Booth teaser. Storyboard duyệt trước khi dựng UI. Tổng 90 giây; CTA luôn thấy từ beat 7 nhưng không bấm được trước khi hết Reveal.

## Bảng beat

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Dừng mắt trong 3 giây | Bình trống trên bàn xoay, một vệt sáng chéo | Tĩnh, không zoom | Không | "Chiếc bình này chưa có men." | `amb_workshop` | 0–5s | Có |
| 2 | Promise | Nói rõ khách nhận gì | Ba hũ men mở nắp, mỗi hũ một tông | Fade 200ms | Tap "Chọn men" | "Bạn chọn men. Lò kể phần còn lại." | `ui_tap` | 5–13s | Có |
| 3 | First action | Dạy luật bằng hành động thật | Bình trượt vào lò; cửa lò mở | Theo thao tác, không rung | Kéo bình hoặc tap "Đưa vào lò" | "Đưa bình vào lò trước khi cửa đóng." | `ui_tap` | 13–31s | Không |
| 4 | Choice | Quyết định chính (men) | 3 hũ men + mô tả ngắn, một hũ highlight | Ổn định, highlight theo chạm | Tap 1 hũ | "Chọn một men cho chiếc bình này." | `ui_select` | 31–51s | Có, mặc định men tro |
| 5 | Consequence | Thấy hậu quả, không phán xét | Lò nung; men chảy; một vết nứt hoặc vết loang | 1 lần zoom nhẹ 4/100 | Tap "Giữ nắp" | `{{feedback}}` theo men | `confirm_partial` | 51–66s | Có |
| 6 | Progress | Cho thấy đã đi được 2/3 | Bình sáng dần; thanh 3 chấm | Không chuyển động nền | Không | "Còn một bước: mở lò." | `progress_tick` | 66–72s | Có |
| 7 | Reveal | Trả proof và wow | Mở lò; bình có vết men riêng; so sánh 2 bình cùng lô | Dolly nhẹ 300ms | Tap "Mở lò" | "Không lô nào giống lô nào." | `reward` | 72–84s | Có |
| 8 | CTA | Mang thiệp về | Thiệp 9:16 với tên men + ảnh bình | Tĩnh | Tap "Nhận thiệp" | "Nhận ảnh bình của bạn." | `silence` | 84–90s | Không |

## Ngân sách thời lượng

| Nhóm | Beat | Giây | Tỉ lệ gợi ý | Ghi chú |
|---|---|---|---|---|
| Hook + Promise | 1–2 | 13 | 8–15/100 của 90s | Không quá 15 giây trước hành động đầu |
| Hành động + lựa chọn | 3–4 | 38 | 45–65/100 | Phần lớn thời lượng; không timer |
| Hậu quả + tiến bộ | 5–6 | 21 | 15–25/100 | Không dồn 3 beat căng |
| Reveal + CTA | 7–8 | 18 | 10–20/100 | CTA thấy rõ, không cần cuộn |

## Ghi chú từng beat

- **Beat 1:** không logo lớn, không auto-play tiếng trước tap. Nếu màn hình booth đang ở chế độ chờ, loop 3 giây đầu lặp lại nhưng không tự vào game.
- **Beat 2:** ba hũ men phải khác nhau bằng hình, không chỉ bằng tên; người mù màu vẫn phân biệt được nhờ nhãn.
- **Beat 3:** kéo bình là tuỳ chọn; nút tap luôn hiện; không yêu cầu giữ ngón.
- **Beat 4:** popup câu hỏi có footer luôn thấy; chọn xong thu gọn 3 đáp án còn 1 dòng + feedback; nút "Tiếp tục" trong footer.
- **Beat 5:** phản hồi nói điều xảy ra với chiếc bình, không nói "sai". Nếu người chơi không chọn, mặc định men tro sau 20 giây nhưng ghi nhận là "không chọn".
- **Beat 6:** thanh 3 chấm đổi màu; không dùng ký hiệu phần trăm; chữ "2/3" được.
- **Beat 7:** so sánh hai bình cùng lô là điểm wow chính; ảnh phải là ảnh thật `[cần xác nhận file]`; nếu thiếu ảnh, dùng mô tả bằng hình vẽ procedural và ghi rõ.
- **Beat 8:** QR chỉ hiện ở beat này; nếu offline, QR hiện link dạng text và nút "Nhờ nhân viên" thay vì mở trình duyệt lỗi.
- **Skip:** beat 3, 4, 5, 6, 7 có skip; skip nhảy tới CTA, ghi `skipped` trong loop; không hiện điểm.
- **Reduced motion:** bỏ zoom beat 5, bỏ dolly beat 7, fade 150ms; vẫn đủ 8 beat và CTA.
- **Low-tier:** chỉ dùng CSS/ảnh tĩnh, không canvas; thứ tự beat không đổi.

## Copy theo trạng thái

| Trạng thái | Câu |
|---|---|
| Chưa chọn men | "Chọn một men cho chiếc bình này." |
| Đã chọn, đang nung | "Lò đang giữ men ở nhiệt độ của ca này." |
| Mở sớm | "Mở sớm làm men sốc; vết nứt nằm ở miệng bình." |
| Giữ đủ nhịp | "Đủ nhịp; men chảy đều xuống thân bình." |
| Reveal | "Vết này là của lần nung hôm nay." |
| CTA | "Nhận ảnh bình của bạn." |

## Checklist duyệt storyboard

- [ ] Đúng 8 beat; mỗi beat có purpose và interaction hoặc ghi "không".
- [ ] Tổng 90 giây; CTA thấy ở beat 8, không cần scroll.
- [ ] Mọi hành động một ngón tay; kéo có tap.
- [ ] Popup câu hỏi chỉ một câu; footer luôn thấy.
- [ ] Không bán hàng/không giá trong beat 1–7.
- [ ] Có ghi chú reduced-motion và low-tier.
- [ ] Copy trong bảng là câu thật, đã qua tone-matrix.
- [ ] Không có beat trang trí không mục đích.
