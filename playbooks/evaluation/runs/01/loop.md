# Loop — Xưởng Gốm La · 90 giây

## 1. Cấu trúc

| Trường | Chốt |
|---|---|
| Số act | 3 |
| Tổng thời lượng | 90 giây |
| Số quyết định | 6 (2 mỗi act) |
| Hành động một ngón tay | 100/100 |
| Skip | Có; skip act nào cũng tới CTA |
| Resume | Không cần (90 giây); nếu rời giữa chừng, mở lại từ đầu |
| Report | Không có báo cáo; thiệp chia sẻ + QR là artifact cuối |

## 2. Act spec

| Act | Mục tiêu người chơi thấy | Hành động | Quyết định | Hậu quả nếu chọn 0 | Progress/reward |
|---|---|---|---|---|---|
| 1 · Chọn men | Hiểu mỗi lựa chọn để lại dấu vết | Kéo bình vào lò, chọn men | d1 (hiểu), d2 (chọn men) | Bình vẫn vào lò nhưng men mờ, vết loang nhiều; không chặn | Chấm 1/3 sáng |
| 2 · Giữ nhịp | Hiểu nhịp nung quan trọng như chọn men | Giữ nắp hoặc tap | d3 (giữ), d4 (vì sao) | Mở sớm: vết nứt ở miệng; vẫn đi tiếp | Chấm 2/3 sáng |
| 3 · Mở lò | Thấy vết men là dấu vết, không phải lỗi | Mở lò, chọn kiểu thiệp | d5 (hiểu), d6 (thiệp) | Thiệp mặc định; vẫn nhận được | Chấm 3/3 + thiệp |

## 3. Decision set

| id | act | kind | prompt (≤85) | 2 điểm | 1 điểm | 0 điểm | feedback | explain | evidence |
|---|---|---|---|---|---|---|---|---|---|
| d1 | 1 | knowledge | Điều gì làm mỗi chiếc bình khác nhau? | Men và nhịp giữ nắp của lần nung hôm đó. | Khuôn đúc giống nhau nên bình giống nhau. | Logo dán sau khi nung quyết định tất cả. | Mỗi lô là một mẻ men riêng. | Men phản ứng theo nhiệt và thời gian giữ nắp. | Ảnh lô `[cần xác nhận]` |
| d2 | 1 | action | Bạn chọn men nào cho bình dùng hằng ngày? | Men tro, vì dễ dùng và vết men dịu ở miệng. | Men đất, vì màu đậm và dễ thấy hơn. | Men mờ, vì trông lạ là đủ. | Men tro hợp bình dùng hằng ngày; vết men sẽ mờ dần ở miệng. | Chọn men theo cách dùng, không theo mốt. | Ảnh men tro `[cần xác nhận]` |
| d3 | 2 | action | Bạn giữ nắp lò trong bao lâu? | Giữ đủ nhịp đã hướng dẫn rồi mở. | Mở sớm một chút để xem men. | Mở ra mở vào liên tục cho chắc. | Đủ nhịp; men chảy đều xuống thân bình. | Nhịp giữ ảnh hưởng trực tiếp đến vết men. | Video ca nung `[cần xác nhận]` |
| d4 | 2 | knowledge | Vì sao không nên mở lò quá sớm? | Men sốc nhiệt nên nứt hoặc loang ở miệng. | Lò sẽ nguội và tốn thêm thời gian. | Không sao, mở sớm chỉ làm bình nhanh nguội. | Mở sớm làm men sốc; vết nứt nằm ở miệng bình. | Sốc nhiệt là nguyên nhân, không phải "xui". | Ảnh bình nứt `[cần xác nhận]` |
| d5 | 3 | knowledge | Vết men loang ở thân bình là gì? | Dấu vết của lần nung, không phải lỗi. | Lỗi cần bỏ và làm lại từ đầu. | Không quan trọng, che bằng nhãn là xong. | Vết này là của lần nung hôm nay. | Dấu vết là bằng chứng của quy trình. | Ảnh 2 bình cùng lô `[cần xác nhận]` |
| d6 | 3 | action | Bạn muốn nhận thiệp nào? | Ảnh bình, tên men và một câu về lần nung. | Chỉ ảnh bình, không cần thông tin thêm. | Chỉ tên xưởng và địa chỉ. | Thiệp có tên men giúp bạn kể lại lần chọn. | Thiệp là artifact mang về, không phải quảng cáo. | Ảnh bình thật `[cần xác nhận]` |

## 4. Scoring (nội bộ)

- Mỗi quyết định: 2/1/0. Act score = `10 × tổng điểm act / (2 × số quyết định act)`.
- Tổng = `0,30 × act1 + 0,35 × act2 + 0,35 × act3`; làm tròn 1 số lẻ, 0–10.
- Không hiển thị điểm trong booth; chỉ dùng để chọn nhánh thiệp/copy nếu cần.
- Không cộng bonus; không dùng ký hiệu phần trăm; nếu cần hiển thị, dùng X/10 hoặc 3/3 act.
- Skip act: act đó 0 điểm, vẫn đi tiếp; không chặn CTA.

## 5. Progression

| Mốc | Trạng thái | Mở gì | Lưu gì |
|---|---|---|---|
| Vào game | Act 1 active | Chọn men | Không lưu (booth) |
| Hết act 1 | Chấm 1/3 | Act 2 | Không |
| Hết act 2 | Chấm 2/3 | Act 3 | Không |
| Hết act 3 | Chấm 3/3 | Thiệp + QR | Không lưu PII trước consent |

- Resume: không áp dụng; nếu màn hình booth bị chạm nhầm thoát, mở lại từ beat Hook.
- Retry: không có nút "làm lại" trong 90 giây; nhân viên booth có thể tải lại trang bằng phím cứng `[cần xác nhận thiết bị]`.

## 6. Skip

- Skip có ở beat 2 trở đi; skip act 1 dùng men tro mặc định; skip act 2 dùng "đủ nhịp"; skip act 3 dùng thiệp ảnh.
- Skip không hiện điểm, không hiện "bạn đã bỏ qua" trước CTA.
- Skip phải giữ nguyên CTA và QR.

## 7. Report mapping (thay bằng thiệp)

| Thành phần thiệp | Nguồn |
|---|---|
| Ảnh bình + vết men | Asset xưởng theo men đã chọn |
| Tên men | Lựa chọn d2 |
| Một câu về lần nung | Copy theo d3/d4 |
| Tên xưởng + QR | Brand |
| Không có giá/offer | Quy tắc |
| Không có PII | Chỉ thu ở form sau QR, có consent |

## 8. Content audit

| Kiểm | Kết quả |
|---|---|
| Prompt ≤85 ký tự, kết thúc `?` | Đạt (dài nhất 45) |
| Option 20–120 ký tự | Đạt (ngắn nhất 25, dài nhất 45) |
| Chênh lệch option trong câu ≤55 | Đạt |
| Không meta-answer "đúng nhất" | Đạt |
| Không template `[]` | Đạt |
| Không `%` trong UI | Đạt |
| Không SLA/benchmark tự đặt | Đạt |
| Feedback nói hậu quả, không "đúng/sai" | Đạt |

## 9. Walkthrough một ngón tay

1. Tap "Chọn men" → popup d1 → chọn → Tiếp tục.
2. Kéo bình hoặc tap "Đưa vào lò" → popup d2 → chọn → Tiếp tục.
3. Giữ nắp 2 giây hoặc tap → popup d3 → d4 → Tiếp tục.
4. Mở lò → popup d5 → d6 → Tiếp tục.
5. Thiệp + QR; hết 90 giây.

Không bước nào cần scroll để thấy nút; không bước nào cần hai ngón.
