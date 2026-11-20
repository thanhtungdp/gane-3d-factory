# QA plan — Xưởng Gốm La · booth 90 giây

> Mức spec: lượt chạy `design`; QA plan dựng từ `game-qa-autopilot`, `_shared/quality-gates.md`, `_shared/output-contracts.md` §`qa-plan.md` và acceptance của scenario §7. Khi build xong, thay bằng test thật.

## 1. Phạm vi

- Bản chơi: 3 act, 8 beat, 90 giây, một ngón, offline sau tải đầu.
- Ngoài phạm vi: không kiểm thanh toán, không kiểm backend CRM (chỉ kiểm payload gửi đi).
- Môi trường: Chrome/Safari iOS, Chrome Android 2 đời máy, màn booth 1024×600 và 1440×900, chế độ offline.

## 2. Viewport matrix

| Viewport | Loại | CTA thấy | Không tràn ngang | Chỉ 1 scroller | Thiệp đọc được |
|---|---|---|---|---|---|
| 320×640 | Mobile nhỏ | ☐ | ☐ | ☐ | ☐ |
| 344×882 | Fold cover dọc | ☐ | ☐ | ☐ | ☐ |
| 390×844 | iPhone | ☐ | ☐ | ☐ | ☐ |
| 540×720 | Fold cover | ☐ | ☐ | ☐ | ☐ |
| 725×870 | Fold inner | ☐ | ☐ | ☐ | ☐ |
| 884×1104 | Fold/tablet lớn | ☐ | ☐ | ☐ | ☐ |
| 1024×600 | Booth ngang thấp | ☐ | ☐ | ☐ | ☐ |
| 1440×900 | Booth chính | ☐ | ☐ | ☐ | ☐ |

Chuẩn: canonical 8 mốc trong `_shared/quality-gates.md`; scenario §7 yêu cầu tối thiểu 4 mốc chính, QA plan mở rộng đủ 8 trước launch.

## 3. Assertions — layout & CTA

- `dock` có `getBoundingClientRect().bottom ≤ viewport.height` ở mọi mốc, kể cả khi thanh công cụ Safari đổi chiều cao.
- Không phần tử nào trong `#panel-scroll` mang `data-cta="primary"`.
- `document.scrollingElement` không cuộn ở `play`; chỉ `#panel-scroll` cuộn được, và chỉ ở `card`/`lead`.
- Không `overflow-x`; không phần tử rộng quá viewport.
- Tap target thực tế ≥44×44px (đo cả padding, không chỉ box).
- Chữ ≥12px; không cắt chữ bằng `line-clamp` ở nhãn lựa chọn.
- Safe-area: dock không chồng thanh home (kiểm 390×844 notch và 320×640 không notch).

## 4. Assertions — copy

- Không có ký hiệu `%` trong DOM ở mọi màn (regex trên `#app.innerText`).
- Không có số tự đặt (số lô, số năm, số khách, số bình) — chỉ có số thuộc UI (1/3, 2 nhịp).
- Không có: giá, "đ", "miễn phí", "đặt hàng", "khuyến mãi", "độc nhất", "số 1", "hoàn hảo", "100%".
- Prompt 3 decision ≤85 ký tự, kết thúc `?`; option 20–120 ký tự, chênh ≤55; đúng một 2/1/0.
- Feedback không chứa "đúng", "sai", "kém", "thất bại".
- Câu dài nhất trong stage ≤24 từ; nhãn nút ≤6 từ.
- Guide chỉ có 3 câu trong `story-bible.md` §4, không sinh thêm.

## 5. Assertions — tương tác

- Kéo bình: kéo một ngón đi được; nút "Đưa vào lò" cho kết quả y hệt.
- Giữ nắp: giữ 2 nhịp (≈1,6s) → nhánh 2; thả sớm → nhánh 1; thả ngay → nhánh 0.
- Tap-tap thay thế: tap lần 1 bắt đầu giữ, tap lần 2 thả, cho cùng phân loại nhịp như giữ thật (sai số ±100ms).
- Không hành động nào cần hai ngón, kéo hai chiều, hay xoay máy.
- Skip ở beat 1, 2, 4, 5, 6 dẫn tới thiệp mặc định trong ≤2s.
- `idle_reset` sau 45s không tương tác đưa về `attract`, không mất CTA.
- Chọn 0 điểm cả ba act: vẫn tới `card`, QR vẫn hiện.

## 6. Audio & reduced motion

- 10 giây đầu sau tải trang: không cue nào phát, không AudioContext ở trạng thái `running` trước tap.
- Tap đầu → `amb_workshop` vào; nút loa tắt → tất cả cue im ngay; reload → vẫn tắt.
- Đi hết luồng với loa tắt: mỗi bước hiểu được bằng chữ + hình (no-sound parity).
- `prefers-reduced-motion: reduce`: không xoay, không rung, không camera lùi; nội dung và CTA không đổi.
- Không âm nào > −14 dB; `silence` 500ms trước QR không bị `reward` phủ.

## 7. Event cần bắn (đo lường)

| Event | Khi nào | Payload tối thiểu |
|---|---|---|
| `teaser_start` | Chạm ở `attract` | viewport, audio_on |
| `intro_skip` | Bấm bỏ qua intro | — |
| `glaze_select` | Chọn men | `glaze_id` (không ghi điểm ra UI) |
| `hold_end` | Kết thúc giữ nắp | `hold_ms`, `bin` |
| `card_choice` | Chọn biến thể thiệp | `card_variant` |
| `card_open` | Thiệp hiện | `variant`, `skip_path` |
| `qr_scan` | QR được mở/chạm | `variant` |
| `photo_save` | Bấm lưu ảnh | — |
| `lead_submit` / `lead_skip` | Sau thiệp | `channel` (zalo/email), không ghi giá trị liên hệ vào analytics |
| `skip_at` | Skip ở beat nào | `beat` |
| `idle_reset` | 45s không tương tác | `last_beat` |
| `asset_error` | Ảnh/cue không tải | `asset_id`, `offline` |

Không ghi PII vào event. Baseline 3 KPI để trống `[cần xác nhận]` — không tự đặt mục tiêu.

## 8. Offline & thiết bị booth

- Tải một lần, sau đó chuyển máy sang airplane mode, reload: chơi hết 90 giây, `card` mở, QR hiện.
- Không request mạng nào ngoài gói tải trước (kiểm Network: 0 request ngoài origin/cache).
- QR trỏ tới thiệp (asset cục bộ hoặc URL đã cache), không trỏ trang bán hàng.
- Màn booth: khoá sleep trong lúc chơi, trả `attract` sau 45s; nếu trình duyệt chặn `localStorage`, intro hiện lại mỗi lượt nhưng không crash.

## 9. Screenshot list

1. `attract` — 1440×900, 1024×600.
2. Beat 1 hook — 320×640, 390×844.
3. Act 1 với 3 lựa chọn — 320×640 (case chật nhất).
4. Act 2 đang giữ — 390×844.
5. Act 3 reveal — 390×844, 1440×900.
6. `card` cuộn hết — 320×640 (CTA vẫn thấy).
7. `card` reduced motion — 390×844.
8. Loa tắt, chơi tới `card` — 390×844.
9. Offline reload → `card` — 1024×600.
10. Focus ring bàn phím — 1440×900.

## 10. Failure mode đã biết

| Mã | Mô tả | Cách phát hiện | Xử lý |
|---|---|---|---|
| `CTA-320` | Dock bị safe-area đẩy khỏi màn 320×640 / Safari toolbar | Đo `bottom` với toolbar mở và đóng | Dock dùng `dvh` + padding safe-area; test cả 2 trạng thái |
| `SCROLL-LONG` | Thiệp cuộn trong khi stage cũng cuộn | Đếm scroller bằng JS | Chỉ `#panel-scroll`, stage `overflow:hidden` |
| `PERCENT-UI` | Lọt `%` từ copy KPI | Regex DOM | Đổi n/100 hoặc bỏ |
| `SELL-IN-GAME` | Lọt giá/nút mua vào `card` | Rà text + ảnh | Chỉ ảnh, dòng lô, QR |
| `AUDIO-ONLY` | Hậu quả chỉ báo bằng âm | Chạy loa tắt | Luôn có feedback chữ |
| `HOLD-RACE` | Tap-tap và hold thật chồng nhau ở mép 1,6s | Test 1,5s / 1,6s / 1,7s | Chốt ngưỡng, ghi trong test |
| `AUTO-DEFAULT` | Tự chọn men ở 50s khi người chơi đang đọc | Quay video 3 người | Chỉ auto khi không có tương tác 8s liền |
| `OFFLINE-ASSET` | Font/ảnh thiếu sau reload offline | Airplane mode reload | Precache đủ; fallback font hệ thống |
| `LS-BLOCKED` | Kiosk private mode chặn localStorage | Chạy private mode | try/catch, intro vẫn dùng được |
| `TIME-DRIFT` | Nhịp theo sự kiện làm tổng >90s | Đo 20 lượt | Cap cứng 90s, CTA theo wall-clock |

## 11. Gate đối chiếu rubric

- CTA không thấy ở 320×640 hoặc 390×844 → **fail cứng**.
- Scroll lồng hoặc CTA trong vùng cuộn → **fail cứng**.
- `%` trong UI, số liệu bịa → **fail cứng**.
- Bán hàng/giá trong lúc chơi → **fail cứng**.
- Bắt đăng ký trước khi chơi → **fail cứng**.
- Audio autoplay hoặc âm thanh là tín hiệu duy nhất → **fail cứng**.
- Reduced motion làm mất nội dung → **fail cứng**.

## 12. Sign-off

- [ ] 6 viewport × screenshot §9 đã có.
- [ ] Offline pass trên máy booth thật.
- [ ] No-sound và reduced-motion pass.
- [ ] Event §7 bắn đúng, không PII.
- [ ] Người duyệt QA + người vận hành booth ký; chưa có thì chưa release.
