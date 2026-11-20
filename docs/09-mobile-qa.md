# 09 — Mobile QA

Tài liệu chốt ma trận thiết bị/trình duyệt/webview, tiêu chí đạt đo được, mức lỗi và checklist từng màn. Mục tiêu: **không có lỗi P0/P1** trên nhóm thiết bị chiếm phần lớn lưu lượng mobile Việt Nam, và trải nghiệm vẫn đủ tốt trong webview Zalo/Facebook. Ngân sách hiệu năng ở [07](07-architecture.md) §11; trạng thái ngoại lệ ở [05](05-user-flow.md) §6.

## 1. Nguyên tắc

1. **Test trên máy thật**, không chỉ DevTools. Tối thiểu 1 iPhone, 1 Samsung tầm trung, 1 Xiaomi/Redmi, 1 Pixel.
2. **Webview trước, browser sau** — phần lớn traffic từ link chia sẻ sẽ mở trong Zalo/Facebook.
3. **Mỗi lỗi có mức và điều kiện đóng**, không "thấy chậm chậm".
4. **Đo bằng số**: tải bao nhiêu MB, fps bao nhiêu, LCP bao nhiêu giây, tap target bao nhiêu px.
5. **Thiết bị yếu vẫn phải chơi hết** — tier low là đường bắt buộc, không phải tuỳ chọn.

## 2. Ma trận thiết bị

Viewport CSS xấp xỉ, đo lại bằng `window.innerWidth` trên máy thật vì một số máy có thanh điều hướng khác nhau. Desktop/tablet chạy thêm Playwright với viewport cố định; 1440 là mốc desktop chính, 1920 kiểm tra giãn nội dung.

| Thiết bị | Viewport CSS | DPR | Phân khúc | Tier kỳ vọng | Rủi ro chính | Ưu tiên |
|---|---|---|---|---|---|---|
| QA rất nhỏ | 320×640 | 2 | Biên dưới | low/mid | Intro CTA có thể rơi khỏi màn; chữ tràn; tap target | **P0 test intro** |
| iPhone SE (2/3) | 375×667 | 2 | Nhỏ nhất còn phổ biến | high/mid | Thiếu chỗ dọc; bàn phím che CTA; chữ tràn | **P0 test** |
| iPhone 13 | 390×844 | 3 | Phổ thông | high | Safari WebGL/audio; safe area tai thỏ | **P0 test** |
| iPhone 14 | 390×844 | 3 | Phổ thông | high | Như iPhone 13; Dynamic Island che header | P1 test |
| Samsung Galaxy A14 | 360×800 | ~2 | Tầm trung thấp | mid/low | GPU yếu, fps thấp, RAM 3–4GB | **P0 test** |
| Samsung Galaxy A34 | 384×854 | ~2,75 | Tầm trung | mid | Samsung Internet mặc định; WebGL ổn định | P1 test |
| Redmi Note 12 | 360×800 | ~3 | Tầm trung | mid | MIUI tắt animation/tiết kiệm pin; Chrome bị hạn chế | **P0 test** |
| Pixel 7 | 412×915 | ~2,6 | Cao | high | Gần như Chrome chuẩn; dùng làm baseline | P1 test |
| iPad 9 / tablet Android | 768×1024 | 2 | Tablet | mid/high | Layout vẫn một cột; popup là bottom sheet (< 900px); bàn phím che form | P1 test |
| Fold cover dọc | 344×882 | ~2,5 | Fold hẹp | mid/low | Hẹp nhất: chữ wrap, dock chiếm chỗ, CTA dễ bị đẩy | **P0 test fold** |
| Fold/duo dọc | 725×870 | 2 | Fold/duo | mid | Vẫn dưới 900px → panel đáy + bottom sheet | P1 test |
| Duo một màn | 540×720 | 2 | Duo | mid | Panel đáy; bàn phím và safe area; CTA trong tầm ngón | P1 test |
| Fold inner | 884×1104 | 2 | Fold mở | mid/high | Ngay dưới 900px → panel đáy cao; xoay ngang thành console phải | **P0 test fold** |
| Desktop Chrome 1440 | 1440×900 | 1 | QA desktop | high | Layout 2 cột, map orbit, panel trạm bên phải; hover/scroll | **P0 test desktop** |
| Desktop Chrome 1920 | 1920×1080 | 1 | QA desktop lớn | high | Nội dung bị kéo rộng, chữ dài, panel lệch | P1 test |

Ghi chú: Galaxy A14 4G bản 720p rất phổ biến ở Việt Nam — đây là mốc "phải chạy được", không phải mốc "chạy đẹp".

## 3. Ma trận trình duyệt & webview

| Môi trường | Engine | WebGL2 | PWA install | Web Share | Audio | Rủi ro chính |
|---|---|---|---|---|---|---|
| Safari iOS 16–18 | WebKit | Có (hạn chế) | Có (Add to Home) | Có | Cần gesture | AudioContext bị treo; 100vh; IndexedDB bị xoá khi hết dung lượng |
| Chrome Android | Chromium | Có | Có | Có | Cần gesture | Biến thể theo OEM |
| Samsung Internet | Chromium | Có | Có | Có | Cần gesture | Thanh địa chỉ động làm nhảy layout |
| Firefox Android | Gecko | Có | Không | Có | Cần gesture | WebAudio khác; share sheet khác |
| **Zalo in-app** | Chromium/WKWebView | Có (thường) | Không | Hạn chế | Cần gesture | Nút back đóng webview; tải PDF có thể bị chặn; storage bị dọn |
| **Facebook in-app** | Chromium/WKWebView | Có | Không | Hạn chế | Cần gesture | File download bị chặn; share không mở native sheet |
| **Messenger in-app** | Chromium/WKWebView | Có | Không | Hạn chế | Cần gesture | Như Facebook; đôi khi mở tab ngoài |
| **Instagram in-app** | Chromium/WKWebView | Có | Không | Hạn chế | Cần gesture | Không tải được file; link ngoài mở trình duyệt ngoài |
| TikTok in-app (tham chiếu) | Chromium | Có | Không | Hạn chế | Cần gesture | Nút "mở bằng trình duyệt" nên hiện khi cần |
| Chrome desktop 1440/1920 | Chromium | Có | Có | Có | Sau gesture | Layout desktop, orbit map, popup modal giữa |
| Safari desktop (macOS) | WebKit | Có | Có | Có | Sau gesture | Web Inspector; audio unlock giống iOS |

### 3.1 Checklist riêng cho webview

| Hạng mục | Kiểm tra | Cách xử lý nếu fail |
|---|---|---|
| Nút back của webview | Back giữa trạm không làm mất tiến độ | Lưu snapshot trước `pagehide`; hiện sheet xác nhận |
| Tải PDF | Bấm PDF có mở/tải được không | Nếu bị chặn: hiện "Mở trong trình duyệt" + gửi email |
| Share | `navigator.share` có tồn tại không | Fallback tải PNG trực tiếp; hướng dẫn nhấn giữ để lưu |
| Upload logo | Chọn ảnh từ thư viện/camera | Cho phép chụp ảnh; nếu bị chặn, dùng monogram |
| Bàn phím | Ô nhập không bị che, layout không nhảy | `visualViewport` + scroll vào ô |
| Chuyến bay | Bay 2,9s không giật; "Bỏ qua chuyến bay" hoạt động | Máy yếu → tier low tên lửa CSS; giữ skip |
| Popup câu hỏi | Mở/ẩn/mở lại được; không xếp 2 modal | Sheet dùng portal; kiểm tra `sheet__body` cuộn được |
| Storage | Resume sau khi đóng webview | Fallback localStorage; thông báo nếu không lưu được |
| PWA | Không bắt buộc cài trong webview | Ẩn banner cài nếu không phải trình duyệt đầy đủ |
| Safe area | Tai thỏ/thanh dưới không che nút | `env(safe-area-inset-*)` |
| Link ngoài | CTA đặt lịch mở đúng | `target="_blank"` + `rel="noopener"`, hoặc hướng dẫn mở trình duyệt |
| Âm thanh | Bật tiếng sau khi chạm | Chỉ init sau gesture; nhớ trạng thái |

## 4. Tiêu chí đạt

| Hạng mục | Ngưỡng đạt | Cách đo | Mức nếu fail |
|---|---|---|---|
| Tổng tải lần đầu | **≤ 5MB** (không tính PDF) | DevTools Network, 4G throttle, cache trống | P1 |
| Shell (HTML+CSS+JS gzip) | ≤ 800KB | Build output | P2 |
| LCP | ≤ 2,5s trên 4G, máy tầm trung | Lighthouse mobile + máy thật | P1 |
| INP | ≤ 200ms | Web Vitals | P1 |
| FPS trong game | ≥ 30 (tier high mục tiêu 60) | rAF sampler, 10 giây mỗi trạm | P1 nếu < 20, P2 nếu 20–29 |
| Frame drop khi phóng tàu | Không dừng > 300ms | Quay màn hình | P2 |
| Tap target | ≥ 44×44px, cách ≥ 8px | DevTools inspect | P1 ở nút chính, P2 ở nút phụ |
| Chữ | ≥ 16px body; không cắt dấu tiếng Việt | Kiểm tra 375px và 360px | P1 nếu cắt chữ ở nút chính |
| Tương phản | ≥ 4,5:1 chữ thường | Contrast checker | P2 |
| Safe area | Không có nút/copy bị tai thỏ/thanh dưới che | Máy thật iPhone 13 | P0 nếu che CTA |
| Cuộn ngang | Không có (chênh ≤ 1px) | Kiểm tra mọi màn ở 375, 768, 1440, 1920 | P1 nếu ở màn chính |
| Chuyến bay | Hiện ≤ 3s, skip tới trạm ngay, không nhảy hình khi vào `planet` | Quay màn hình 1440 + iPhone | P1 |
| Popup câu hỏi | Chỉ 1 modal; Ẩn/X/Escape → pill; chạm pill mở lại đúng câu | Playwright + tay | P1 |
| CTA không cần cuộn | Dock CTA hiện đủ trong viewport ở mọi vị trí cuộn; chiều cao nút ≥ 50px | Đo `getBoundingClientRect` ở đầu/cuối vùng cuộn | P0 nếu CTA bị khuất |
| Một vùng cuộn | Chỉ `kim-game__body` cuộn; header HUD và dock đứng yên; trang không cuộn khi ở trạm | DevTools + Playwright | P1 |
| Popup không scroll | 1 câu + 3 đáp án vừa khung, `sheet__body.scrollHeight ≤ clientHeight + 2` ở 375×667 và 344×882 | Playwright đo | P1 |
| Sương che nội dung | Ô chưa mở: chữ mờ ≤ 35/100 và blur ≥ 4px; screen reader không đọc nội dung bị che | DevTools + VoiceOver/TalkBack | P1 |
| Map delay | Thả logo → đúng ~850ms mới mở câu (reduced motion 250ms); kéo lại trước hạn không mở | Playwright + bấm giờ | P1 |
| KIM reduced-motion | Không halo quét/typewriter; câu hiện đủ ngay; screen reader đọc một lần | `prefers-reduced-motion` | P2 |
| Intro CTA không scroll | Ở 320×640, CTA intro nằm trong viewport, không phải cuộn; chênh ngang ≤ 1px | Playwright `?intro=1` | P1 |
| Intro skip/seen | Bỏ qua được; xem xong reload không hiện lại; `?intro=0` bỏ, `?intro=1` ép | Playwright + localStorage | P1 |
| Intro reduced-motion | Vào nhịp cuối + CTA ngay (≤ 3s), 5 lớp đã sáng | `emulateMedia` | P2 |
| Intro low-tier | Không WebGL vẫn thấy poster + rail + CTA; không màn trắng | `?intro=1&quality=low` | P1 |
| Panel theo pha | Intro 62dvh, chơi 84dvh, kết quả 82dvh (máy thấp dùng mức cao hơn); console phải ở ≥ 900×640 | Đo chiều cao panel | P2 |
| Dock disabled | Nhãn đếm đúng ("Còn 4 vùng sương" / "Còn 4 câu hỏi"); nút chính disabled khi chưa đủ | Playwright testid `game-dock` | P2 |
| Khoá cuộn nền | `body overflow: hidden` khi popup mở; chỉ popup cuộn | DevTools | P2 |
| Panel trạm desktop | ≥ 1200px: panel phải thu gọn/mở lại được, không che CTA | 1440 + 1920 | P2 |
| Bàn phím | Tab focus đúng thứ tự trong popup; Esc đóng; focus trả về nút mở | Desktop keyboard | P2 |
| Map desktop | ≥ 1200px có orbit; chỉ trạm kế tiếp bấm được; chạm cây phát chuyến bay | 1440 | P2 |
| Audio | Bật/tắt được, nhớ trạng thái, không autoplay | iPhone + Android | P2 |
| Share | Tải được PNG 1080×1920 hoặc share sheet | Zalo/Chrome | P1 |
| PWA | Cài được, mở standalone, icon đúng | Chrome Android + Safari | P2 |
| Offline | Mất mạng vẫn chơi tiếp, không mất dữ liệu | Airplane mode giữa trạm | P0 |
| Resume | Đóng tab, mở lại < 7 ngày, đúng trạm | Safari + Chrome | P1 |
| Xoay ngang | Không vỡ layout, không reload | iPhone + Android | P2 |
| PDF | Mở được, đủ dấu, QR đúng | Zalo webview + Chrome | P1 |
| Console | Không lỗi JS, không warning WebGL | DevTools | P1 nếu lỗi chặn |
| Bộ nhớ | ≤ 300MB JS heap sau 3 trạm | DevTools memory | P2 |
| Pin/nóng máy | Không nóng bất thường sau 8 phút | Cảm nhận + Battery | P2 |

## 5. Mức lỗi

| Mức | Định nghĩa | Ví dụ | SLA đóng |
|---|---|---|---|
| **P0** | Không chơi được hoặc mất dữ liệu/consent | Crash khi vào trạm; không qua được gate dù hợp lệ; mất tiến độ; consent không lưu; trang trắng | Chặn release, sửa ngay |
| **P1** | Chức năng chính hỏng trên một nhóm thiết bị/browser | Không tải PDF trên Zalo; không share được; fps < 20 trên A14; không resume; tap target chính < 44px che CTA | Sửa trước release |
| **P2** | Lỗi hiển thị/trải nghiệm nhỏ, có workaround | Chữ xuống dòng xấu; animation lệch 1px; âm thanh nhỏ; icon lệch | Sửa trong 2 tuần sau release |
| **P3** | Đề xuất cải tiến | Muốn thêm hiệu ứng | Backlog |

Bug report gồm: thiết bị + OS + browser/webview, URL/trạm, bước tái hiện, ảnh/quay màn hình, log console, tần suất (luôn/đôi khi), mức lỗi đề xuất.

## 6. Checklist theo màn

### 6.0 Intro

- [ ] Lần đầu (localStorage trống): intro hiện; xem xong reload không hiện lại.
- [ ] `?intro=0` bỏ qua; `?intro=1` ép xem; nút "Xem lại intro" ở header landing mở lại.
- [ ] 5 nhịp caption + rail sáng dần đúng thứ tự; CTA chỉ hiện sau ~8,8s.
- [ ] Mobile/fold: tàu 3D bay vòng quanh hành tinh, luôn ở phía trước hành tinh, không bị cắt mép hay lỗi đè; desktop giữ tư thế tĩnh.
- [ ] Tier low vẫn có rocket 2D bay vòng quanh; không mất tàu khi SceneCanvas fallback.
- [ ] Âm thanh nền bật mặc định; lần chạm đầu vào intro mở khoá AudioContext; nút loa tắt/bật được.
- [ ] CTA và "Bỏ qua" đều sang landing; không auto chuyển.
- [ ] 320×640: CTA trong viewport, không tràn ngang; 1440×900: bố cục rộng không lệch.
- [ ] Reduced motion: vào nhịp cuối + CTA ngay, không dolly/typewriter.
- [ ] Tier low (`?quality=low`): poster 2.5D + rail CSS, không màn trắng.

### 6.1 Landing

- [ ] Nhập URL có/không `https://`, có `www`, có dấu cách → chuẩn hoá đúng.
- [ ] Bàn phím mở không che ô nhập và CTA (iPhone SE).
- [ ] Banner resume hiện đúng khi có bản lưu; "Bắt đầu mới" xoá đúng.
- [ ] Nút âm thanh: mặc định bật; lần chạm đầu mở khoá; tắt rồi tải lại vẫn nhớ (localStorage).
- [ ] Nhạc nền êm, không chói; KIM gõ chữ có tick nhẹ; chốt đáp án quiz có chuông mềm; tắt tiếng thì mọi SFX im.
- [ ] Link privacy mở được trong webview, có đường quay lại.
- [ ] Reduced motion bật ở OS → không parallax.

### 6.2 Scanning

- [ ] Radar chạy mượt; text checklist hiện dần không nhảy layout.
- [ ] Chờ > 8 giây hiện gợi ý nhập tay.
- [ ] Bấm "Nhập tay" huỷ request và mở form đúng.
- [ ] Mất mạng giữa scan → thông báo rõ, không treo.

### 6.3 Confirm

- [ ] Logo hiển thị đúng (không vỡ, không méo) ở mọi kích thước.
- [ ] Đổi logo giữa 8 phương án + upload hoạt động.
- [ ] Sửa tên/màu/ngành lưu đúng.
- [ ] Hai câu hỏi quy mô/vai trò có lựa chọn mặc định hợp lý.
- [ ] Chip cảnh báo pre-scan không che CTA.

### 6.4 Launch, Map & Flight

- [ ] Bỏ qua cinematic hoạt động; chạm đúp không làm nhảy 2 lần.
- [ ] Map hiện đúng 5 trạm, trạm đã xong có X/10; desktop ≥ 1200px có orbit.
- [ ] Chọn trạm phát chuyến bay; HUD hiện đúng route và 3 pha.
- [ ] "Bỏ qua chuyến bay" tới trạm ngay, không kẹt ở màn hình trung gian.
- [ ] Hết chuyến bay tự hạ cánh, vào intro trạm, không nhảy hình.
- [ ] Pause sheet mở từ trạm; "Về bản đồ" giữ tiến độ; "Bỏ qua trạm" xác nhận rõ.
- [ ] Reduced motion: chuyến bay rút ngắn, không rung/streak.

### 6.5 Trạm S

- [ ] Nội dung dưới sương bị che thật (mờ + blur), không đọc được trước khi mở.
- [ ] Chạm mở 1 ô; rê đánh dấu nhiều ô rồi thả tay mở cùng lúc; sương tan ~260ms.
- [ ] 4 tín hiệu hiển thị đúng nội dung pre-scan (hoặc bộ định kỳ khi nhập tay), clamp 2 dòng.
- [ ] Dock đếm "Còn 4 vùng sương" → "Còn 4 câu hỏi" → "Hoàn tất trạm S"; CTA không bị khuất.
- [ ] 4 quyết định mở đúng thứ tự FIFO, chọn xong có feedback + KIM.
- [ ] Không còn panel tín hiệu dài chiếm chỗ cuộn.
- [ ] Reduced motion: sương tan nhanh, không blob.

### 6.6 Trạm A

- [ ] 3 icon chòm sao (cờ Sứ mệnh, kính Tầm nhìn, đá Giá trị) hiện đúng, ≥ 44px.
- [ ] Nối đúng thứ tự; sai không phạt, nối lại được.
- [ ] Sau khi nối Tầm nhìn hiện chip horizon 1/3/5 năm, đổi được trước khi chốt.
- [ ] Thả logo → "Đang chốt vị trí…" ~850ms rồi mới mở câu; kéo lại trước hạn huỷ hẹn.
- [ ] 3 preset vị trí chốt ngay; chọn đủ 2 tính cách mới cho đi tiếp.
- [ ] Mâu thuẫn vị trí/tính cách được chỉ ra rõ; dock đổi nhãn đúng bước.

### 6.7 Trạm O

- [ ] 6 mockup hiển thị logo thật, không vỡ ảnh.
- [ ] Đếm 15 giây dừng khi tab ẩn.
- [ ] Trượt 15 giây vẫn chọn tiếp được.
- [ ] Test ghi nhớ màu 3 giây có phương án không phân biệt màu (có nhãn chữ).

### 6.8 Trạm K

- [ ] Xếp 5 card bằng tap; kéo (nếu có) không bắt buộc.
- [ ] Giữ nạp 3 giây có phản hồi rung/ánh sáng; iOS có vòng sáng thay rung.
- [ ] Khủng hoảng 30 giây: chọn được, hết giờ ghi nhận lựa chọn đang trỏ.
- [ ] `crisisFast` đúng ngưỡng 10 giây (kiểm tra bằng log).

### 6.9 Trạm IM

- [ ] Tua 12 tháng không bỏ sót sự kiện.
- [ ] Đồng hồ nhất quán cập nhật đúng, có dấu +/−.
- [ ] Phải chọn đủ 4 sự kiện mới hoàn thành.
- [ ] `meter` gửi về đúng (kiểm tra bằng log).

### 6.10 Finale & báo cáo

- [ ] Finale bỏ qua được, vẫn giữ poster.
- [ ] Poster hiển thị tên thương hiệu dài không tràn.
- [ ] Điểm, sao, danh hiệu, 5 chấm đúng.
- [ ] Radar vẽ đúng 5 trạm; trạm tối khác trạm sáng.
- [ ] 2 bước yếu + hệ quả đọc được trên 360px.
- [ ] Teaser gói không làm lộ giá khi `VITE_SHOW_PRICE=0`.

### 6.11 Lead gate

- [ ] Thiếu tên/SĐT/email → lỗi tại trường, không alert.
- [ ] Thiếu consent/đại diện → không submit.
- [ ] Honeypot điền → bị từ chối im lặng.
- [ ] SĐT `+84`, có dấu cách/chấm → chấp nhận đúng.
- [ ] Submit thành công → mở khoá ngay, không reload.
- [ ] Mất mạng khi submit → giữ dữ liệu form, cho thử lại.

### 6.12 Báo cáo đầy đủ, share, leaderboard

- [ ] 3 insight hiển thị (AI hoặc template), không rỗng.
- [ ] Bảng gói đúng catalog + giá; PDF tải được.
- [ ] PDF: font tiếng Việt đủ dấu, QR mở đúng URL.
- [ ] Share PNG 1080×1920, không lỗi font, không lộ PII.
- [ ] Leaderboard: top 20, alias, ẩn danh mặc định, không lộ SĐT.
- [ ] Đặt lịch `VITE_BOOKING_URL` mở đúng `[cần xác nhận]`.

### 6.13 Flight & popup (kiểm tra chéo mọi trạm)

- [ ] Mỗi điểm neo mở đúng 1 popup, không xếp 2 modal.
- [ ] Trả lời → feedback + explain + "Tiếp tục"; đáp án khoá sau khi chọn.
- [ ] Ẩn bằng nút Ẩn, X, Escape, chạm nền → pill "Câu hỏi X/N đang chờ".
- [ ] Chạm pill mở lại đúng câu, không mất đáp án đang chọn.
- [ ] Trong lúc popup mở/ẩn chờ, IM không trừ "Độ nhất quán".
- [ ] Cuộn chỉ trong popup; nền game không cuộn.
- [ ] Popup dưới 900px là bottom sheet, từ 900px là modal giữa.
- [ ] Không tràn ngang ở 375, 768, 1440, 1920.

### 6.14 Desktop & tablet

- [ ] 1440×900: landing 2 cột, map orbit, panel trạm phải, report 2 cột.
- [ ] 1920×1080: nội dung không giãn quá giới hạn; chữ không quá dài.
- [ ] 768×1024: một cột, bottom sheet; bàn phím không che form.
- [ ] Panel trạm thu gọn → nút mở lại hiện đúng chỗ; trạng thái không mất.
- [ ] Keyboard: Tab/Escape hoạt động trong popup và pause sheet.

### 6.15 Cockpit, dock, KIM, fold/duo

- [ ] Dock CTA hiện đủ ở đầu và cuối vùng cuộn trên 344×882, 540×720, 725×870, 884×1104.
- [ ] Chỉ một vùng cuộn; header KIM và dock không trôi theo nội dung.
- [ ] Panel đổi chiều cao theo pha intro → chơi → kết quả, không nhảy layout.
- [ ] 900×640 và 900×900: panel thành console phải; 899px: panel đáy.
- [ ] KIM hiện mặt, đổi mood sau mỗi câu; typewriter chỉ chạy khi không reduced-motion.
- [ ] Popup compact: sau khi chọn, 3 đáp án thu còn 1 dòng + feedback; footer đổi "Chọn một đáp án" → "Tiếp tục".
- [ ] Xoay/resize giữa trạm: giữ pha, câu đang mở, dock và vị trí cuộn.

## 7. Cách chạy

- **Playwright** cho 4 profile: iPhone SE, iPhone 13, Pixel 7, Galaxy A14 (`devices[...]`); chạy smoke: landing → confirm (mock scan) → đủ 5 trạm → report → gate.
- **Lighthouse mobile** trước mỗi release: performance, accessibility, best practices, PWA.
- **Máy thật:** Safari Web Inspector (iPhone), Chrome Remote Debugging (Android), Zalo/Facebook/Messenger/Instagram share link vào chính mình để mở webview.
- **Ghi hình** 30 giây mỗi trạm khi test cảm xúc/nhịp; đối chiếu [06](06-storyboard.md).
- **Viewport fold/duo:** chạy Playwright với `{ width: 344, height: 882 }`, `{ width: 725, height: 870 }`, `{ width: 540, height: 720 }`, `{ width: 884, height: 1104 }`; kiểm tra overflow, CTA, popup không scroll.
- **Intro:** e2e dùng `/` (lần đầu) hoặc `/?intro=1`; test bỏ qua bằng `/?intro=0`; xoá `saokim:intro:v1` trong localStorage giữa các lần chạy.
- **Lệnh nhanh:** `npm run typecheck` → `npm test -- tests/game/intro.test.ts tests/game/content-copy.test.ts` → `npm run test:e2e` → `npm run shots`.
- **Đo fps:** sampler trong code (dev only) hoặc `chrome://inspect` + Performance.

## 8. Điều kiện sign-off

1. Không còn P0; P1 = 0 hoặc có quyết định chấp nhận rủi ro bằng văn bản của Lead.
2. Bảng tiêu chí §4 đạt trên 4 thiết bị P0 test, desktop 1440 và 2 viewport fold P0 (344×882, 884×1104).
3. Smoke Playwright xanh trên 4 profile mobile + 2 viewport desktop (1440, 1920).
4. Webview Zalo và Facebook: chơi hết 5 trạm, gate, tải PDF (hoặc fallback email) đều chạy.
4b. Intro: CTA 320×640 không scroll, skip/seen/replay đúng, reduced-motion và tier low đạt.
5. Consent/privacy kiểm tra được bằng mắt trên gate.
6. Chuyến bay, popup ẩn/mở, panel thu gọn và khoá cuộn nền đã được kiểm tra bằng tay trên 1440.
7. Biên bản test có ảnh/quay màn hình cho từng P0/P1 đã đóng.

## 9. Liên kết

- Ngân sách hiệu năng & tier: [07](07-architecture.md) §3, §11.
- Trạng thái lỗi/resume/offline: [05](05-user-flow.md) §6.
- Khoảnh khắc cần quay: [06](06-storyboard.md).
- Sự kiện cần kiểm tra trong QA: [10](10-kpi.md) §3.
