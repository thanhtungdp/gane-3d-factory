# Brief — Bánh mì Hạnh · ca đầu tiên

> Mode `design` · scenario `playbooks/scenarios/04-10min-internal-training.md` · brand hư cấu, mọi số liệu là ví dụ nội bộ.

## 1. Vấn đề kinh doanh

Nhân viên mới làm đúng trong tuần đầu nhưng lệch dần khi gặp tình huống ngoài kịch bản, và cửa hàng không có cách nào biết họ lệch ở bước nào trước khi khách phàn nàn.

## 2. Audience

- Chính: nhân viên cửa hàng mới, 0–3 tháng, dùng điện thoại, thường vào ca sáng.
- Insight: họ không sợ học; họ sợ làm sai trước mặt khách.
- Đang làm gì thay thế: học qua người kèm ca, hỏi miệng, đọc tài liệu rời rạc khi rảnh.
- Hệ quả của cách thay thế: mỗi người kèm dạy một kiểu; không có bản ghi ai đã hiểu bước nào.

## 3. Promise của game

10 phút để thử 4 tình huống thật của ca làm — chọn sai vẫn đi tiếp — trước khi gặp khách thật.

## 4. Proof có thật (theo scenario)

| Proof | Nguồn | Tin cậy | Dùng ở đâu |
|---|---|---|---|
| Quy trình vận hành cửa hàng | tài liệu nội bộ (`sop-store`) | trung bình — chưa có trích đoạn | explain + report mapping |
| Bộ nhận diện thương hiệu | tài liệu nội bộ (`brand-vi`) | trung bình | act 1–2, lỗi logo/phù hiệu |
| Checklist mở ca | `checklist-open` | trung bình | act 1, wow #1 |
| Checklist đóng ca + bàn giao | `checklist-close` | trung bình | act 4, wow #3 |
| Quy trình duyệt nội dung đăng kênh cửa hàng | `sop-content-approval` | thấp — **cần xác nhận ai duyệt** | act 2 |
| Quy trình xử lý phàn nàn / sự cố | `sop-customer-response`, `sop-incident` | thấp — **cần xác nhận câu chữ** | act 3–4 |
| Chuỗi 12 cửa hàng | scenario (số liệu hư cấu, ví dụ) | — | bối cảnh, không lên UI |

Nguyên tắc: chỗ chưa có trích đoạn thì decision chỉ hỏi **bước làm** (ai chốt, ghi ở đâu, dừng hay làm tiếp), không hỏi con số quy định. Không có proof thì ghi `[cần xác nhận]`, không bịa.

## 5. Hành động chính

- Một hành động: **hoàn thành bài kiểm tra cuối ca và xác nhận đã đọc quy trình**.
- Không làm: không thu lead, không đăng ký tài khoản, không bán gói đào tạo, không xếp hạng nhân viên, không chia sẻ ra ngoài.

## 6. Ba wow moments

1. **Hậu quả nhìn thấy được** — sau mỗi lựa chọn, panel hiện đúng trạng thái mà checklist mở ca sẽ ghi (phù hiệu, bảng hiệu, POS), không phải hình minh hoạ chung. Gắn proof `checklist-open`.
2. **Điểm soi được lỗ hổng** — kết quả không chỉ là X/10 mà chỉ ra 2 bước yếu nhất và bước đó nằm ở mục nào của quy trình. Gắn proof `sop-store`.
3. **Bàn giao đúng mẫu** — màn kết hiện bản bàn giao ca đã điền, giống biểu mẫu thật, để người chơi thấy việc học nối vào việc làm. Gắn proof `checklist-close`.

## 7. Format

- Kênh: link nội bộ, không QR công khai.
- Thời lượng: 10 phút (8 beat, 4 act, 12 quyết định, 3 câu kiểm tra).
- Thiết bị: mobile dọc là chính; desktop chỉ để xem lại kết quả.
- Ngôn ngữ: tiếng Việt, không 3D nặng, không asset ngoài quyền.
- Không cần crawl website, không cá nhân hoá theo hồ sơ.

## 8. KPI

| Loại | Chỉ số | Baseline | Mục tiêu |
|---|---|---|---|
| Chính | Tỉ lệ hoàn thành bài kiểm tra trong 14 ngày | `[chưa đo]` | `[cần xác nhận]` |
| Chính | Điểm kiểm tra trung bình (X/10) | `[chưa đo]` | `[cần xác nhận]` |
| Guardrail | Tỉ lệ làm lại (retake) — cao bất thường = đề khó hoặc copy tối nghĩa | `[chưa đo]` | không tăng sau 2 tuần |
| Guardrail | Không có dữ liệu khách trong bất kỳ log nào | 0 | 0 |

Không đặt số mục tiêu khi chưa có baseline; UI không hiển thị `%`.

## 9. Ràng buộc

- Pháp lý/consent: nội bộ; không thu dữ liệu khách; không dùng tên khách thật; kết quả chỉ tới quản lý ca/team lead, không tới marketing.
- Asset: chỉ ảnh/checklist nội bộ được phép dùng; không logo bên thứ ba.
- Kỹ thuật: mobile-first, một vùng cuộn, tap ≥44px, có bản no-sound và reduced motion, không cần 3D.
- Thời gian: thời hạn hoàn thành `[cần xác nhận]`.

## 10. Điều chưa biết

- [ ] Ai là người duyệt nội dung đăng kênh cửa hàng (chức danh cụ thể).
- [ ] Câu chữ quy trình xử lý phàn nàn và quay video.
- [ ] Thời hạn hoàn thành và ai xem kết quả (quản lý ca hay HR).
- [ ] Baseline của 3 chỉ số KPI.
- [ ] Có cần lưu kết quả vào hệ thống HR hay chỉ file nội bộ.
