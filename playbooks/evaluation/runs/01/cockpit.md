# Cockpit — Xưởng Gốm La · booth 90 giây

## 1. Màn hình và CTA

| Screen | Mục tiêu | CTA chính | Test ID |
|---|---|---|---|
| `attract` | Vòng hình im lặng khi chưa có người | "Chạm để bắt đầu" (dock) | `attract-cta` |
| `intro` | Chỉ lần đầu: 1 câu + luật một lần | "Vào xưởng" + "Bỏ qua" | `intro-cta`, `intro-skip` |
| `play` act 1 | Chọn men | "Chọn men" → sau đó "Đưa vào lò" | `act-1-glaze`, `dock-cta` |
| `play` act 2 | Giữ nắp | "Giữ nắp" (dock đổi nhãn khi đang giữ) | `hold-lid` |
| `play` act 3 | Mở lò, thấy vết men | "Mở lò" | `open-kiln` |
| `card` | Thiệp + QR | "Nhận thiệp" → "Lưu ảnh" | `claim-card`, `card-qr` |
| `lead` | Tuỳ chọn để lại Zalo/email | "Gửi" + "Để sau" | `lead-submit`, `lead-skip` |

Không có màn `report` và không có `unlock-report`: teaser không chấm điểm người chơi. Đây là lệch có chủ đích so với `cockpit-spec.md` §1 (xem `run-brief.md` §7 mục 5).

## 2. Layout theo breakpoint

| Breakpoint | Cách đặt | Chiều cao | Ghi chú |
|---|---|---|---|
| 320–699 | Stage trên, dock dưới, panel nội dung đè lên stage khi cần | Dock 88px + safe-area | Ưu tiên tuyệt đối cho bình và CTA; chữ mô tả men xuống 13px |
| 700–899 | Stage trên, panel đáy rộng, nội dung max 640px | Dock 84px | Tablet dọc và fold mở |
| 900–1199 | Stage trái, console phải 360px | Dock nằm trong console, luôn thấy | Màn booth 1024×600: console phải để QR không che bình |
| ≥1200 | Stage trái, console phải 420px | Dock trong console | Màn booth 1440×900 |
| Landscape thấp (<480px cao) | Console phải, không panel đáy | Dock trong console | Tránh panel 59dvh che hết stage |

## 3. Một vùng cuộn

- Scroller duy nhất: `#panel-scroll` — chỉ tồn tại ở `card` và `lead` (thiệp dài hơn màn 320×640).
- Header (`#hud`), dock (`#dock`), nút loa (`#audio-toggle`) nằm **ngoài** scroller, cố định.
- Stage 3D không cuộn; nếu nội dung cao hơn, cắt bớt chữ thay vì thêm scroller thứ hai.
- Không đặt CTA trong `#panel-scroll` ở bất kỳ màn nào.

## 4. Dock CTA

| Trạng thái | Nhãn | Hành vi |
|---|---|---|
| Chưa đủ điều kiện | "Chọn một men để tiếp tục" | Disabled nhưng vẫn đọc được; nói rõ cần làm gì |
| Sẵn sàng | "Đưa vào lò" / "Giữ nắp" / "Mở lò" / "Nhận thiệp" | Tap = hành động chính |
| Đang giữ | "Đang giữ… thả để mở" | Nhãn đổi theo trạng thái, không dùng icon-only |
| Thiệp đã mở | "Lưu ảnh" + "Nhận thiệp lần nữa"? | Không có nút thứ hai; chỉ "Lưu ảnh" và QR |

Dock luôn cao ≤96px và nằm trong safe-area bottom. Không có nút nào chỉ xuất hiện sau khi cuộn.

## 5. Lựa chọn inline thay cho question sheet

- Teaser không dùng modal câu hỏi. Ba lựa chọn nằm trong một hàng ngang ngay trên dock (`#choice-row`), mỗi lựa chọn là một card 44px+.
- Lý do: người đứng ở booth cần thấy lựa chọn và CTA trong cùng một khung nhìn; modal thêm một lớp bấm và làm mất 2–3 giây của 90 giây.
- Sau khi chọn: card đã chọn thu gọn còn 1 dòng, hai card còn lại mờ 40/100 nhưng vẫn bấm lại được cho tới khi đóng nắp; feedback hiện ngay dưới hàng lựa chọn.
- Không có nút ẩn/mở lại vì không có modal; nếu build cần modal cho màn 320, phải giữ footer thấy được và pill mở lại (`question-pill`).

## 6. Intro gate

- Chỉ hiện lần đầu trong phiên; lưu `localStorage` `xgl_intro_v1`.
- `?intro=1` buộc hiện, `?intro=0` bỏ qua — dùng cho QA và cho booth đã có người đứng sẵn.
- "Bỏ qua" luôn thấy trong 2 giây đầu; bỏ qua vào thẳng beat 2.
- Không có form, không có đăng ký trước khi chơi.

## 7. Quy tắc mobile

- Tap target ≥44×44px, kể cả card lựa chọn và nút loa.
- Safe-area top/bottom cho notch và thanh home; dock không bao giờ nằm dưới thanh home.
- Chữ nhỏ nhất 12px (nhãn phụ), nội dung chính 15–17px; không dùng chữ mảnh trên nền ảnh.
- Không hover-only, không tooltip làm tín hiệu duy nhất.
- Focus ring rõ cho bàn phím (màn booth có thể có trackpad).
- Motion nhẹ; `prefers-reduced-motion` thay bằng đổi màu/độ sáng, không mất thông tin.
- Xoay ngang: stage co theo chiều cao, dock vẫn thấy; không khoá orientation.

## 8. Test matrix

| Viewport | CTA thấy | Không tràn ngang | Thiệp không vỡ | Ghi chú |
|---|---|---|---|---|
| 320×640 | ☐ | ☐ | ☐ | Chuẩn tối thiểu; chữ mô tả men 13px |
| 344×882 | ☐ | ☐ | ☐ | Fold cover dọc |
| 390×844 | ☐ | ☐ | ☐ | iPhone phổ biến |
| 540×720 | ☐ | ☐ | ☐ | Fold cover |
| 725×870 | ☐ | ☐ | ☐ | Fold inner / tablet nhỏ |
| 884×1104 | ☐ | ☐ | ☐ | Fold/tablet lớn |
| 1024×600 | ☐ | ☐ | ☐ | Booth ngang thấp — console phải |
| 1440×900 | ☐ | ☐ | ☐ | Booth chính |

Danh sách này theo canonical 8 mốc trong `_shared/quality-gates.md`; scenario §7 yêu cầu tối thiểu 4 mốc chính, QA mở rộng đủ 8 trước launch.

## 9. Audio và reduced motion

- Nút loa trong `#hud`, 44px, trạng thái lưu `xgl_audio_v1`; mặc định bật nhưng chỉ phát sau tap đầu.
- Không có autoplay ở `attract`.
- Reduced motion: tắt xoay bàn, tắt rung nắp, bỏ camera lùi; thay bằng đổi màu và chữ. Không tắt `warn_net`.
- Audio không chặn thao tác: nếu AudioContext lỗi, game vẫn đi tiếp, không hiện dialog.

## 10. Ghi chú 3D (chờ `brand-3d-world`)

- Stage cần vùng nhìn cho bình (trái) và miệng lò (phải); trên 320×640 chỉ còn ~380px chiều cao sau dock.
- `[cần chốt]` camera, depth/occlusion, quality tier cho máy booth và điện thoại cũ; chưa chạy skill 3D ở lượt này.
- Fallback khi máy yếu: ảnh tĩnh của bình + chuyển màu, vẫn giữ đủ 7 beat.
