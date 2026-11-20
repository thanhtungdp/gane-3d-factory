# Lead gate checklist

Dùng như cổng review cho skill `brand-report-gate`. Mapping code cụ thể ở [reference map](../../../../kits/report-lead/reference-map.md).

## 1. Giá trị trước, dữ liệu sau

- [ ] Báo cáo ungated hiển thị đủ: overall, danh hiệu, sao, radar, 2 act yếu + evidence + hệ quả, badge, teaser offer (không giá).
- [ ] Người chơi **chủ động** bấm mở khoá sau khi đã thấy báo cáo; không auto-popup.
- [ ] Có "Để sau"; đóng gate vẫn xem được bản ungated và share.
- [ ] Không có offer/giá/CTA mua nào trong lúc chơi hoặc trước gate.

## 2. Form tối thiểu

- [ ] Tên (bắt buộc, ≥2 ký tự, có thông báo lỗi tại trường).
- [ ] Ít nhất một trong SĐT/email; validate định dạng phía client **và** server.
- [ ] SĐT chấp nhận định dạng nội địa/quốc tế, có dấu cách/chấm; chuẩn hoá trước khi lưu.
- [ ] Email regex hợp lý; không chấp nhận chuỗi rỗng.
- [ ] Honeypot ẩn phải rỗng; nếu bị điền → từ chối im lặng (không báo lỗi gợi ý).
- [ ] Không bắt địa chỉ, công ty, ngân sách, chức danh nếu không dùng ngay.

## 3. Consent & pháp lý

- [ ] Checkbox "tôi là đại diện thương hiệu" bắt buộc, mặc định tắt.
- [ ] Checkbox consent xử lý dữ liệu bắt buộc, mặc định tắt, có link privacy mở được.
- [ ] Marketing là checkbox riêng, mặc định tắt, không bắt buộc.
- [ ] Consent version + thời điểm được lưu cùng lead.
- [ ] Privacy nêu mục đích, thời hạn lưu, quyền yêu cầu xoá, đầu mối liên hệ.
- [ ] Không dark pattern: không tick sẵn, không đổi nhãn nút, không làm nút từ chối khó thấy.

## 4. Server & dữ liệu

- [ ] Server validate lại toàn bộ; không tin client.
- [ ] Chỉ lưu trường cần; PII không nằm trong log, analytics, share card, leaderboard.
- [ ] IP chỉ hash + salt; rate limit form; chống spam.
- [ ] Lead mới có `status` mặc định, snapshot offer/điểm/ngành/quy mô/vai trò để đo CRM.
- [ ] Outbox có chữ ký HMAC, retry backoff, dead-letter; CSV export escape đúng.
- [ ] Token PDF là HMAC, gắn report id, có hạn; không đoán được; route kiểm token trước khi render.

## 5. PDF & share

- [ ] PDF 3 trang, font tiếng Việt đủ dấu; lỗi font vẫn tạo file.
- [ ] QR trỏ đúng link CTA; link có fallback nếu QR lỗi.
- [ ] PDF không chứa PII ngoài tên người nhận (nếu có).
- [ ] Share 9:16 chỉ có brand/điểm/danh hiệu; không SĐT/email/report nội bộ.
- [ ] Retry PDF 1 lần; vẫn lỗi → hẹn gửi qua email và ghi outbox.

## 6. Trải nghiệm mobile

- [ ] Form đọc được ở 320px; CTA dock luôn thấy; một vùng cuộn.
- [ ] Bàn phím không che nút submit; safe area đúng.
- [ ] Lỗi tại trường, không dùng alert; giữ dữ liệu khi submit lỗi/mất mạng.
- [ ] Submit xong mở khoá ngay, không reload; có thông báo rõ.
- [ ] Reduced motion: không có animation chặn thao tác.
- [ ] Tap target ≥44px; không yêu cầu nhập hai lần.

## 7. Analytics & CRM

- [ ] Event đủ: `report_view`, `gate_view`, `lead_submit`, `lead_fail`, `lead_success`, `pdf_download`, `booking_click`, `share_click`, `leaderboard_submit`.
- [ ] Event không chứa tên/SĐT/email/domain đầy đủ.
- [ ] CRM nhận lead trong SLA; trạng thái `new → contacted → qualified → booked → booking_confirmed` có người chịu trách nhiệm.
- [ ] Có ngưỡng cảnh báo cho lead capture/qualified và fallback rate.
