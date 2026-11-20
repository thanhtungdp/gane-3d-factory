# Ví dụ điền sẵn: Trà Mộc

> Brand hư cấu dùng để minh hoạ cách điền artifact. Mọi số liệu/chứng nhận đều là ví dụ, không dùng làm proof thật.

## 0. Bối cảnh

**Trà Mộc** là thương hiệu trà Việt hư cấu, bán online và một cửa hàng nhỏ; thế mạnh là trà hái tay theo mùa, đóng gói nhỏ. Mục tiêu: khách hiểu vì sao mỗi mùa trà khác nhau và đăng ký nhận hộp trà mùa tới.

## 1. Brief

| Hạng mục | Nội dung |
|---|---|
| Vấn đề | Khách so sánh trà theo giá mỗi gam, không hiểu vì sao cùng loại trà lại khác mùa |
| Audience | Người 25–40 tuổi, uống trà tại nhà, thích sản phẩm có nguồn gốc rõ |
| Insight | Họ sợ mua phải trà "kể chuyện hay nhưng vị bình thường" |
| Promise | 3 phút để nếm thử ba mùa trà bằng lựa chọn của mình |
| Proof | Vườn trà, người hái, ngày hái, cách sao trà (ảnh/tài liệu thật) |
| Hành động chính | Đăng ký nhận hộp trà mùa tới |
| Kênh | Link social + QR tại cửa hàng; mobile dọc |
| KPI giả thuyết | Hoàn thành 3 act; tỉ lệ đăng ký nhận tin; tỉ lệ chia sẻ thẻ mùa trà |
| Guardrail | Không bịa chứng nhận hữu cơ; không hứa tốt cho sức khoẻ; không bán trong lúc chơi |
| Ràng buộc | Ảnh vườn trà có quyền dùng; CTA `[cần xác nhận link]` |

## 2. Story bible (rút gọn)

- **Premise:** Một người uống trà muốn chọn hộp trà cho tháng này, nhưng mỗi mùa chỉ có một lần hái.
- **Ẩn dụ:** Workshop (xưởng trà). Luật: mỗi mùa có một cửa sổ hái; bỏ lỡ phải chờ mùa sau.
- **Player role:** người chọn trà cho gia đình; quyền chọn mùa, không quyền đổi ngày hái.
- **Guide:** người sao trà ({{guide}}), nói ngắn, không bán.
- **3 hồi:** Mở (mở hộp trà trống) → Thử thách (chọn mùa, ngửi, so sánh) → Hé lộ (hộp trà của bạn + câu chuyện mùa).
- **Emotional arc:** tò mò → tập trung → thấy được chọn đúng.
- **Ending + brand truth:** "Mỗi mùa có một vị riêng; bạn chọn mùa, không chọn giá."
- **Điều cấm:** không claim sức khoẻ, không bịa vườn trà, không dùng từ "thượng hạng" nếu chưa có chứng nhận.

## 3. Tone matrix (rút gọn)

| Trục | Chọn | Lý do |
|---|---|---|
| Trang trọng ↔ Thân mật | 3 | Gần gũi nhưng không suồng sã |
| Điềm tĩnh ↔ Hào hứng | 2 | Trà cần nhịp chậm |
| Cụ thể ↔ Ẩn dụ | 2 | Cụ thể về mùa/vị, ẩn dụ vừa phải |
| Khiêm tốn ↔ Tự tin | 3 | Tự tin về quy trình, không khoe |

- Đại từ: "bạn" – "Trà Mộc".
- Câu mẫu:
  - Mở: "Mùa này, lá trà dày hơn một chút."
  - Hướng dẫn: "Chọn mùa bạn muốn thử trước."
  - Đúng: "Vị này hợp với cách bạn pha buổi sáng."
  - Chưa khớp: "Mùa này hơi gắt; người mới thường chọn mùa trước."
  - Kết: "Hộp trà của bạn đã có tên mùa."
- Từ cấm: "thượng hạng", "tốt nhất", "chữa", "giảm cân", "số 1".

## 4. Storyboard (3 phút)

| # | Beat | Purpose | Visual | Camera/Motion | Interaction | Copy | Sound | Duration | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook | Dừng mắt | Hộp trà mở, hơi nước | Tĩnh | Tap "Mở hộp" | "Mùa này, lá trà dày hơn một chút." | `amb_tea` | 0–8s | Có |
| 2 | Promise | Nói rõ nhận gì | Ba hộp trà theo mùa | Fade 200ms | Tap "Bắt đầu" | "3 phút để chọn mùa trà của bạn." | `ui_confirm` | 8–18s | Có |
| 3 | First action | Dạy luật | Ba mùa: xuân, hạ, thu | Theo thao tác | Tap mùa | "Chọn mùa bạn muốn thử trước." | `ui_tap` | 18–60s | Không |
| 4 | Choice | Quyết định | Popup một câu về cách pha | Ổn định | Tap đáp án | "{{prompt}}" | `ui_select` | 60–120s | Có |
| 5 | Consequence | Hậu quả | Hộp trà đổi màu/hơi nước | Fade nhẹ | Tap "Tiếp tục" | "{{feedback}}" | `confirm_partial` | 120–150s | Có |
| 6 | Reveal | Trả brand truth | Hộp trà có tên mùa + câu chuyện hái | Một lần | Tap "Xem hộp" | "Hộp trà của bạn đã có tên mùa." | `reward` | 150–175s | Có |
| 7 | CTA | Hành động | QR/đăng ký nhận hộp mùa tới | Tĩnh | Tap "Nhận tin" | "Mùa tới: nhận tin trước." | `silence` | 175–180s | Không |

## 5. Sound cue

| Cue | Trigger | Intent | Texture | Duration | Level | Fallback |
|---|---|---|---|---|---|---|
| `amb_tea` | Vào game | Không gian ấm | Pad trầm + noise nhẹ | Loop | −28 dB | Im lặng |
| `ui_tap` | Chọn mùa | Phản hồi | Click gỗ nhẹ | 80 ms | −22 dB | Hộp đổi màu |
| `confirm_partial` | Phản hồi | Không phán xét | Chuông trầm | 300 ms | −18 dB | Feedback chữ |
| `reward` | Mở hộp | Ghi nhận | Pad dâng + chuông | 1 s | −15 dB | Hộp hiện |
| `silence` | Trước CTA | Tập trung | Không | 400 ms | — | — |

## 6. Loop ngắn

3 act, 6 quyết định (2/2/2), 2/1/0.

| Act | Quyết định | Đáp án 2 | Đáp án 1 | Đáp án 0 |
|---|---|---|---|---|
| 1 | "Bạn pha trà lúc nào?" | "Sáng, một mình" | "Chiều, cùng người khác" | "Không nhớ" |
| 2 | "Mùa này hơi gắt. Bạn chọn?" | "Pha nhanh, nước nguội hơn" | "Thêm đá" | "Bỏ hộp, chọn mùa khác" |
| 3 | "Bạn muốn nhận gì mùa tới?" | "Hộp nhỏ theo mùa" | "Hộp quà" | "Chỉ xem trước" |

- Progress: 3 mảnh hộp sáng dần.
- Skip: có; skip dùng mùa mặc định, vẫn ra thẻ.
- Report/CTA: không report dài; CTA đăng ký nhận tin.

## 7. Acceptance

- [ ] 3 phút; CTA trong màn hình 320×640; một vùng cuộn.
- [ ] Không claim sức khoẻ/chứng nhận; proof là ảnh vườn trà được duyệt.
- [ ] Mọi thao tác một ngón tay; no-sound vẫn hiểu.
- [ ] Thẻ chia sẻ không lộ PII; consent khi đăng ký.
- [ ] Chấm bằng `../evaluation/rubric.md`; pass ≥ 4 và không điểm 1.
