# Brief — Xưởng Gốm La

> Brand hư cấu trong scenario test. Proof là giả định theo scenario; mọi số liệu/chứng nhận để trống hoặc `[cần xác nhận]`.

## 1. Vấn đề (1 câu)

Khách đi ngang quầy không nhìn ra vì sao một chiếc bình gốm thủ công lại khác một chiếc bình công nghiệp trông giống nó.

- Kiểm: không tính từ, không nhắc "thương hiệu mạnh".

## 2. Audience + insight

- **Audience:** người mua đồ gia dụng cho nhà mới, thích sản phẩm có câu chuyện, dùng điện thoại tại hội chợ.
- **Insight:** họ không sợ trả thêm; họ sợ trả thêm rồi nhận món giống hệt món rẻ hơn.
- **Điều họ tin:** "thủ công" phải nhìn thấy được bằng mắt, không cần đọc giải thích dài.
- **Điều họ không tin:** lời hứa "mỗi chiếc một kiểu" nếu không có bằng chứng.

## 3. Promise

Trong 90 giây, khách tự tay chọn men và tự thấy chiếc bình của mình khác những chiếc khác ở đâu.

## 4. Proof (có thật hoặc cần xác nhận)

| Proof | Nguồn | Trạng thái |
|---|---|---|
| Quy trình nung theo lô, mỗi lô một mẻ men | Xưởng Gốm La cung cấp | `[cần xác nhận tài liệu]` |
| Vết men không lặp giữa các lô | Ảnh xưởng được cấp | `[cần xác nhận file]` |
| Nghệ nhân đứng lò trong ca nung | Ảnh/video xưởng | `[cần xác nhận quyền dùng]` |
| Không có chứng nhận hữu cơ/giải thưởng | — | Không dùng |

Quy tắc: mỗi proof phải có file/người xác nhận trước khi lên UI. Không dùng số lô, số khách, số năm kinh nghiệm nếu chưa có nguồn.

## 5. Hành động chính

**Quét QR nhận thiệp ảnh bình + để lại Zalo/email.**

- Một hành động duy nhất; bỏ "mua ngay", "nhận mã giảm giá", "theo dõi ngay".
- QR chỉ hiện ở beat cuối; trong game không có giá, không có offer.

## 6. Ba wow moments (gắn proof)

| # | Wow | Proof dùng | Cách thể hiện |
|---|---|---|---|
| 1 | Bình đổi vết men theo lựa chọn của khách | Ảnh men thật theo lô | Vết men hiện dần khi mở lò |
| 2 | "Không lô nào giống lô nào" nhìn thấy được | Ảnh 2 bình cùng lô | So sánh cạnh nhau ở beat Reveal |
| 3 | Thiệp có tên men + ảnh bình của khách | Ảnh bình vừa "ra lò" | Thiệp 9:16 + QR |

Không dùng: hiệu ứng hạt, ánh sáng chung, "câu chuyện cảm động" không có proof.

## 7. Format & kênh

| Trường | Chốt |
|---|---|
| Format | Teaser 90 giây, 3 act |
| Kênh | Màn hình tại booth + QR; mobile dọc |
| Ngôn ngữ | Tiếng Việt |
| Thiết bị | Tablet dọc/ngang tại booth; dự phòng điện thoại |
| Offline | Chạy sau lần tải đầu; nếu mất mạng, game vẫn hết 90 giây, QR hiện link dự phòng |
| Âm thanh | Mặc định bật sau tap đầu; có nút tắt; no-sound vẫn hiểu |

## 8. KPI + guardrail

| Loại | Chỉ số | Baseline |
|---|---|---|
| Chính | Tỉ lệ hoàn thành 90 giây | `[chưa đo]` |
| Phụ | Tỉ lệ bấm "Nhận thiệp" và quét QR | `[chưa đo]` |
| Guardrail | Tỉ lệ bỏ ở beat 1–2 (hook/promise) | `[chưa đo]` |
| Guardrail | Không có sự cố CTA bị che/không bấm được | 0 |

Không đặt số mục tiêu khi chưa có baseline; ghi giả thuyết trong kế hoạch đo, không ghi vào UI.

## 9. Ràng buộc

- Chỉ dùng ảnh xưởng được cấp; không stock ảnh, không font ngoài brand.
- Không claim "độc nhất", "không đụng hàng", "tốt nhất", "bền vĩnh viễn".
- Thu Zalo/email phải có consent; nội dung consent `[cần xác nhận]`.
- Booth có thể không có Wi-Fi; game phải chạy offline sau lần tải đầu.
- Màn hình booth có thể là tablet cá nhân; cần khóa chế độ thoát/kiosk `[cần xác nhận]`.

## 10. Điều chưa biết / cần xác nhận

| # | Điều cần xác nhận | Ai xác nhận |
|---|---|---|
| 1 | Danh sách ảnh xưởng + quyền dùng | Brand |
| 2 | Link QR + form nhận thiệp | Marketing |
| 3 | Câu consent + pháp nhân/DPO | Pháp chế |
| 4 | Thiết bị booth (dọc/ngang, kích thước) | Vận hành sự kiện |
| 5 | Có cho phép lưu ảnh bình của khách không | Brand + pháp chế |

## 11. Không làm gì

- Không làm báo cáo dài, không lead gate trong game, không bán hàng.
- Không dạy lịch sử gốm, không nhồi 5+ act.
- Không dùng 3D WebGL cho bản booth này.
- Không thêm mini-game thứ hai trong 90 giây.

## 12. Checklist duyệt brief

- [ ] Vấn đề 1 câu, không tính từ.
- [ ] Audience + insight viết được thành lời của họ.
- [ ] Promise đo được bằng hành vi trong 90 giây.
- [ ] Proof có nguồn hoặc `[cần xác nhận]`.
- [ ] Đúng 1 hành động chính.
- [ ] 3 wow moments gắn proof.
- [ ] KPI có baseline trống, guardrail rõ.
- [ ] Danh sách "không làm" đã ghi.
