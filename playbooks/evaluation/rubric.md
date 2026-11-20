# Evaluation rubric

Dùng để chấm một game/bản prototype sau khi chạy playbook. Thang 1–5 cho 10 tiêu chí; **pass khi trung bình ≥ 4 và không có tiêu chí nào = 1**. Vi phạm gate cứng trong `_shared/quality-gates.md` là fail ngay, không cần chấm điểm.

## Profile chấm

- **Full** (report + lead): chấm đủ 10 tiêu chí; tiêu chí 9 cần report đầy đủ, tiêu chí 10 cần event/funnel.
- **Artifact / teaser / drop** (không report dài): tiêu chí 9 chấm **artifact cuối** (thiệp/share card/QR) có giá trị và đọc được; tiêu chí 10 chấm **tối thiểu 1 chỉ số + 1 event + 1 guardrail**. Không bắt offer/report dài, nhưng vẫn phải đo được hành động chính.
- **Training nội bộ**: tiêu chí 9 chấm bản bàn giao/kết quả cho quản lý, không phải offer; tiêu chí 10 chấm điểm kiểm tra + tỉ lệ hoàn thành.

## Cách chấm

1. Hai người chấm độc lập (người thiết kế + người không làm dự án).
2. Chấm theo bằng chứng nhìn thấy/quay được, không theo cảm nhận.
3. Lệch > 1 điểm ở tiêu chí nào thì hội ý, ghi lý do; không lấy trung bình cộng mù.
4. Điểm 1 chỉ dùng khi tiêu chí không tồn tại, không phải khi "chưa hay".

## 10 tiêu chí

| # | Tiêu chí | 1 — không đạt | 3 — đạt một phần | 5 — đạt rõ | Bằng chứng cần có |
|---|---|---|---|---|---|
| 1 | **Clarity** | Người xem không biết phải làm gì trong 10 giây | Hiểu sau khi đọc hướng dẫn | Hiểu ngay từ beat đầu, không cần đọc thêm | Video 10 giây đầu; test 3 người lạ |
| 2 | **Story** | Không có premise; các màn rời rạc | Có premise nhưng hồi/act không đổi trạng thái | Có premise rõ, 3 hồi, kết gắn brand truth | `story-bible.md` + bản chơi |
| 3 | **Tone** | Giọng lệch giữa các màn, dùng từ cấm | Nhất quán nhưng còn sáo rỗng | Mỗi câu đúng audience, claim có proof | `tone-matrix.md` + copy thật |
| 4 | **Wow** | Chỉ hiệu ứng chung, không gắn brand | Có một khoảnh khắc gắn dữ liệu thật | ≥ 2 khoảnh khắc dùng proof, đáng kể lại | Danh sách wow + cảnh quay |
| 5 | **Loop** | Không có vòng lặp; chơi xong không hiểu vì sao | Có lựa chọn nhưng hậu quả mờ | Mỗi lựa chọn đổi trạng thái; loop rõ, có skip | `loop.md` + 1 lượt chơi |
| 6 | **One-finger** | Có hành động bắt buộc joystick/bàn phím | Làm được nhưng có thao tác khó | Mọi hành động cốt lõi tap/rê/kéo/giữ; kéo có tap | Quay 1 tay trên mobile |
| 7 | **Mobile** | Vỡ layout, CTA bị chôn, scroll lồng | Đạt mobile nhưng lỗi ở fold/desktop | Đạt 320×640 → 1440×900; một vùng cuộn; CTA luôn thấy | `qa-plan.md` + screenshot |
| 8 | **Evidence** | Không có dữ liệu thật, phản hồi chung chung | Có evidence nhưng không giải thích | Evidence thật, gắn đúng lựa chọn, có nguồn | `pre-scan`/ảnh + copy |
| 9 | **Report / artifact** | Không có kết quả, hoặc kết quả không hành động được | Có điểm/thiệp nhưng thiếu hệ quả | Điểm/thiệp + 2 vùng yếu/hệ quả + bước tiếp | Report hoặc thiệp/share card |
| 10 | **Measurement** | Không có event/KPI | Có KPI nhưng thiếu guardrail | Có event, funnel, guardrail, cách đọc | Kế hoạch đo + dashboard/SQL |

## Gate cứng (fail ngay)

- CTA không thấy ở 320×640 hoặc 390×844.
- Có scroll lồng nhau hoặc nút chính nằm trong vùng cuộn.
- Có ký hiệu phần trăm trong UI; số liệu/khách/đối thủ bịa.
- Bán hàng/offer/giá trong lúc chơi.
- Bắt đăng ký trước khi chơi, không có skip.
- Audio autoplay hoặc âm thanh là tín hiệu duy nhất.
- Reduced motion làm mất nội dung.

## Cách tính

- Điểm tổng = trung bình 10 tiêu chí, làm tròn 1 số lẻ.
- Pass: tổng ≥ 4,0 **và** không tiêu chí nào = 1 **và** không vi phạm gate cứng.
- Fail mềm (3,0–3,9): sửa các tiêu chí ≤ 3 rồi chấm lại.
- Fail cứng: dừng, ghi lỗi vào `run-log.md`, không release.

## Bảng chấm

| Tiêu chí | Điểm | Bằng chứng | Ghi chú |
|---|---|---|---|
| Clarity | | | |
| Story | | | |
| Tone | | | |
| Wow | | | |
| Loop | | | |
| One-finger | | | |
| Mobile | | | |
| Evidence | | | |
| Report | | | |
| Measurement | | | |
| **Trung bình** | | | |

## Quy ước ghi

- Ghi rõ phiên bản artifact (ngày/commit) khi chấm.
- Không chấm hai bản khác nhau trong cùng một dòng.
- Điểm thấp phải kèm việc sửa cụ thể, không ghi "cần cải thiện".
