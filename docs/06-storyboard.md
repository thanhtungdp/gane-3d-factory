# 06 — Storyboard 8 khoảnh khắc

Tài liệu chốt 8 khoảnh khắc quyết định cảm xúc của trải nghiệm, cộng khoảnh khắc 0 (intro 10s trước landing): khung hình, chuyển động, camera, âm thanh, thời lượng, cách bỏ qua và phương án mobile. Đây là brief cho lớp 3D (`src/three/**`), không phải đặc tả shader. Câu chuyện ở [01](01-concept.md); nhịp gameplay ở [03](03-game-design.md); luồng màn hình ở [05](05-user-flow.md) §4.6; hiệu năng/fallback ở [07](07-architecture.md) §3.

## 1. Ngôn ngữ hình ảnh chung

| Thành phần | Chốt |
|---|---|
| Khung | Dọc 9:16, safe area trên/dưới; mọi chi tiết quan trọng nằm trong 1:1 giữa |
| Nền | Navy `#050a24` → `#0b1638`; sao lấm tấm, 2 lớp parallax rất chậm |
| Camera | Một camera duy nhất, nội suy vị trí/tiêu cự; không cắt cảnh; rung nhẹ chỉ khi phóng tàu |
| Chuyển cảnh | Crossfade 300–500ms hoặc camera dolly; không dùng wipe trừ khi có lý do |
| Ánh sáng | Luôn có 1 nguồn sáng chính từ sao Kim phía trên phải; vùng tối là vùng chưa quyết |
| Chuyển động | Easing `cubic-bezier(0.22, 1, 0.36, 1)`; không nảy, không rung màn hình quá 0,4s |
| Reduced motion | Tắt parallax, giảm biên độ camera, thay chuyển cảnh bằng fade 200ms; **không mất thông tin** |
| Tier low | Thay canvas bằng `PlanetPoster` (SVG/CSS gradient) + animation CSS; vẫn giữ thứ tự 8 khoảnh khắc |

## 2. Khoảnh khắc 0 — Giới thiệu 10 giây

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Lần đầu mở máy: hành tinh 3D đang ngủ thức dậy theo 5 lớp sáng; người chơi chưa nhập website |
| Khung hình | Overlay tối với copy "Mỗi doanh nghiệp là một hành tinh đang ngủ", 5 caption của KIM, rail 5 trạm S/A/O/K/IM; CTA chỉ hiện ở 8,8s; desktop rộng đặt copy và hành tinh 2 bên |
| Chuyển động | 5 nhịp ở 0 / 1,8 / 3,7 / 5,6 / 7,4 giây: mỗi nhịp bật thêm lớp (khí quyển → trục quay → bề mặt → tín hiệu → vệ tinh), rail sáng dần, caption chạy chữ; mobile/fold: tàu bay vòng quanh hành tinh thay vì đứng mép khung; không tự chuyển cảnh |
| Camera | Mode `intro`: camera gần `[0, 0.55, 10.2]`, target `[-0.15, 0.55, 0]`, fov 46; dolly chậm vào trong suốt 10 giây |
| Âm thanh | Nhạc nền thiên hà mặc định bật; AudioDirector đặt pad O cho intro, lần chạm/phím đầu tiên mở khoá AudioContext rồi pad chạy; pad sine êm + melody chậm, không SFX riêng |
| Thời lượng | 10 giây choreography; CTA hiện ở 8,8 giây; người chơi bấm "Bắt đầu hành trình" hoặc "Bỏ qua" để sang landing |
| Skip | Nút "Bỏ qua" ở header luôn hiện; skip ghi `intro_skip`, CTA ghi `intro_complete`; mở lại từ landing ghi `intro_replay` |
| Mobile | CTA trong màn hình ở 320×640; safe area trên/dưới; rail 5 trạm không tràn ngang |
| Low tier | Dùng poster 2.5D + rail CSS, không dựng WebGL; vẫn đủ 5 lớp sáng |
| Reduced motion | Vào thẳng nhịp cuối (5 lớp đã sáng) + CTA ngay, không dolly/không chạy chữ |

**Vì sao wow:** người chơi hiểu ẩn dụ "hành tinh đang ngủ" trước khi bị hỏi website — intro đặt khung cảm xúc cho cả hành trình mà không bán hàng.

## 3. Khoảnh khắc 1 — Hạ cánh (landing)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Không gian tối, một hành tinh lớn ẩn dưới sương ở 2/3 dưới màn hình; ngôi sao 4 cánh nhỏ ở góc trên phải |
| Khung hình | Logo Sao Kim trên trái (cố định), khối chữ + ô nhập ở giữa dưới; hành tinh chiếm 45/100 chiều cao |
| Chuyển động | Tàu nhỏ bay từ ngoài phải vào, dừng lơ lửng; sương trôi ngang rất chậm; logo người chơi chưa xuất hiện |
| Camera | Tĩnh, tiêu cự 35mm, rung 0 (không gây say) |
| Âm thanh | Pad hợp âm trầm (Am add9), tiếng gió sao rất nhẹ; **mặc định bật**, lần chạm đầu mở khoá; nút loa tắt/bật và nhớ lựa chọn |
| Thời lượng | Vòng lặp vô hạn; chuyển cảnh khi bắt đầu crawl |
| Skip | Không cần; người chơi rời đi bất cứ lúc nào |
| Mobile | Ô nhập cách đáy 120px (tránh bàn phím); CTA nằm trong tầm ngón cái; hành tinh không che chữ |
| Low tier | Poster tĩnh + 2 lớp sao CSS; giữ đúng bố cục |

**Vì sao wow:** người chơi thấy sản phẩm thật của mình sắp được đưa vào một thế giới khác, không phải một landing bán hàng.

## 4. Khoảnh khắc 2 — Chuyến bay giữa trạm

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Tàu rời trạm vừa xong, bay qua vùng tối giữa hai hành tinh; hành tinh đích lớn dần rồi hạ cánh |
| Khung hình | Full-screen; HUD gồm route "Quỹ đạo khởi hành → {thế giới}", pha hiện tại, thanh tiến độ, đồng hồ T+; tàu ở 1/3 dưới |
| Chuyển động | Takeoff 0,7s: tàu rung, thruster tăng; cruise 1,4s: vệt sao (star streaks), hành tinh đích lớn dần; landing 0,7s: giảm tốc, hành tinh phủ nền, tàu vào đúng tư thế của mode `planet` để không nhảy hình |
| Camera | Camera rộng fov 58 → 55, dolly nhẹ về phía đích; không cắt cảnh |
| Âm thanh | Ambience tắt; SFX `launch` → `warp` (sau 650ms) → `landing` (cuối chuyến); haptic khi cất cánh |
| Thời lượng | 2,9s (0,7 + 1,4 + 0,7); reduced motion 0,65s, bỏ vệt sao |
| Skip | Nút "Bỏ qua chuyến bay" luôn hiện, hit area 44px; chạm ghi `flight_skip` và tới trạm ngay |
| Mobile | HUD trong safe area; route tối đa 2 dòng; nút skip ở đáy, không che hành tinh; tier low dùng tên lửa CSS |
| Low tier | Tên lửa CSS + logo + flame, nền `PlanetBackdrop` mode flight; không tạo WebGL context |
| Reduced motion | Chuyến bay rút còn 0,65s, không rung, không streak; vẫn đủ 3 pha ở mức tối thiểu |

**Vì sao wow:** chuyến bay tạo cảm giác khoảng cách và chuyển cảnh có trọng lượng — hành trình là bay giữa các trạm, không phải chuyển tab.

## 5. Khoảnh khắc 3 — Quét sương (trạm S)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Panel trạm đang ở pha chơi (84dvh), hành tinh 3D phía trên; 4 ô sương 2×2 che nội dung thật của website |
| Khung hình | Grid 2×2 trong vùng cuộn của cockpit; mỗi ô tối thiểu 220px cao; nội dung bên dưới sương bị mờ (blur 5px, mờ 30/100) không đọc được |
| Chuyển động | Chạm mở 1 ô; rê ngón đánh dấu viền amber nhiều ô rồi thả tay để mở cùng lúc; sương tan 260ms (reduced 80ms) bằng mask + 3 blob trôi chậm |
| Camera | Không camera riêng: cockpit đứng yên, chỉ panel trượt theo pha; hành tinh 3D phía sau giữ chuyển động nhẹ |
| Âm thanh | Tiếng "whoosh" mềm khi mở ô, chuông nhỏ khi tín hiệu lộ ra; không lặp khó chịu |
| Thời lượng | 90 giây; mở 4 vùng rồi trả lời 4 câu, mỗi câu mở sau khi sương tan |
| Skip | Không còn "Mở tất cả": dock chỉ mở CTA khi đủ 4 vùng + 4 câu; muốn bỏ trạm dùng pause sheet |
| Mobile | Grid 2×2, ô ≥ 44px; chạm từng ô thay vì rê; không cần giữ ngón; chữ tín hiệu clamp 2 dòng |
| Low tier | Sương là lớp phẳng (không backdrop-filter, không blob), vẫn giữ hiệu ứng mờ nội dung và thứ tự mở |

**Vì sao wow:** thao tác vật lý đơn giản (rê tay) tạo cảm giác "tôi đang tự khám phá ra vấn đề của mình", không phải được kể.

## 6. Khoảnh khắc 4 — Nối sao (trạm A)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Đài thiên văn trong cockpit; 3 icon chòm sao (cờ Sứ mệnh, kính Tầm nhìn, đá Giá trị), chip horizon 1/3/5 năm và bản đồ định vị 2 trục |
| Khung hình | Stage chòm sao nửa trên (icon 52px + nhãn + đường nối), chip horizon 3 ô, bản đồ vuông 2 trục (cao cấp ↔ bình dân, gần gũi ↔ chuyên sâu) với logo người chơi |
| Chuyển động | Chạm icon theo thứ tự làm icon sáng + đường nối vẽ dần; nối xong Tầm nhìn thì chip horizon trượt vào; thả logo → "Đang chốt vị trí…" **850ms** rồi logo settle vào đúng mức (preset chốt ngay) |
| Camera | Không cắt cảnh: panel giữ nguyên, stage tự đổi từ chòm sao sang bản đồ; hiệu ứng nghiêng nhẹ 8° chỉ ở tier cao, tắt khi reduced motion |
| Âm thanh | Tiếng dây đàn khi nối đúng thứ tự; "clack" khi logo chốt; không có tiếng sai |
| Thời lượng | 100 giây; nối sao ≤ 20 giây, kéo lại trước 850ms huỷ hẹn chốt, đổi horizon bất cứ lúc nào trước khi chốt |
| Skip | Kéo là tuỳ chọn: 3 preset "Mức cao cấp / Mức vừa / Mức bình dân" chốt ngay; nối sai không phạt, chỉ nối lại |
| Mobile | Icon và preset ≥ 44px; bản đồ vuông vừa vùng cuộn, không bị bàn tay che; dock luôn hiện nhãn bước kế |
| Low tier | SVG chòm sao + bản đồ CSS, logo `<img>`; không particle, không nghiêng 3D |

**Vì sao wow:** mâu thuẫn "định vị cao cấp nhưng tính cách bình dân" được chỉ ra ngay trên hình — người chơi tự thấy, KIM chỉ xác nhận.

## 7. Khoảnh khắc 5 — Mockup (trạm O)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Xưởng chế tác: 6 bề mặt (danh thiếp, biển hiệu, túi giấy, áo, bài social, hoá đơn) treo trên bàn sáng |
| Khung hình | Lưới 2×3, mỗi mockup có logo thật của người chơi; 2 mockup sai màu/font nằm trong đó |
| Chuyển động | Mockup xoay nhẹ khi chạm (như nhấc lên xem); mockup sai rung 1 lần và viền đỏ khi chọn đúng; đèn xưởng sáng dần theo số mockup đã kiểm |
| Camera | Góc nhìn từ trên xuống 15°, zoom nhẹ vào mockup được chọn |
| Âm thanh | Tiếng giấy/da khi chạm; tiếng "đinh" khi tìm đúng; hết 15 giây có tiếng thở nhẹ, không tiếng báo sai |
| Thời lượng | 110 giây; thử thách 15 giây, sau đó vẫn cho chọn tiếp không giới hạn để hoàn thành quyết định |
| Skip | Nút "Xem đáp án" sau khi hết 15 giây (mất time bonus); luôn có "Tiếp tục" |
| Mobile | Mockup là nút thật ≥ 44px; không cần zoom; ảnh logo 512 đủ nét |
| Low tier | Ảnh mockup là CSS card + logo; không dùng texture 3D |

**Vì sao wow:** lần đầu người chơi thấy logo của mình trên vật thể thật — và thấy nó sai ở đâu.

## 8. Khoảnh khắc 6 — Phóng tàu & khủng hoảng (trạm K)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Bệ phóng đêm, đèn thành phố dưới chân; tàu mang logo người chơi; sau khi phóng là màn "sóng truyền thông" với 4 lựa chọn khủng hoảng |
| Khung hình | Phóng: tàu chiếm 1/3 dưới, khói chiếm 1/3 giữa, sao Kim 1/3 trên. Khủng hoảng: feed bình luận chạy bên phải, 4 lựa chọn bên dưới |
| Chuyển động | Đếm 3-2-1 bằng chữ lớn (không cần giọng đọc); tàu rung 0,4s rồi phóng; camera theo tàu lên 2 giây; khói và tia lửa có giới hạn hạt theo tier |
| Camera | Rung nhẹ khi phóng (biên độ 2px), sau đó ổn định; không xoay |
| Âm thanh | Tiếng nạp tăng dần theo thời gian giữ; tiếng nổ 1 lần; sau đó là tiếng thông báo/náo loạn mờ cho khủng hoảng |
| Thời lượng | 120 giây; giữ nạp 3 giây; khủng hoảng 30 giây (không bắt buộc trả lời trong 10 giây để có bonus) |
| Skip | Nút "Bỏ qua phóng" sau 2 giây; khủng hoảng không được skip nhưng hết 30 giây tự ghi nhận lựa chọn đang trỏ |
| Mobile | Nút giữ nạp toàn chiều ngang đáy màn hình; rung haptic mỗi 0,5 giây khi giữ (Android); iOS thay bằng vòng sáng |
| Low tier | Tàu là sprite SVG, khói là gradient; âm thanh vẫn đầy đủ nếu đã bật |

**Vì sao wow:** khoảnh khắc "cất tiếng" có sức nặng vật lý; khủng hoảng 30 giây tạo áp lực thật nhưng không trừng phạt.

## 9. Khoảnh khắc 7 — Vệ tinh (trạm IM)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Hành tinh đã có đèn thành phố; một vệ tinh nhỏ quay quanh, mỗi vòng là một tháng |
| Khung hình | Hành tinh 2/3 dưới, vệ tinh quỹ đạo ellipse; đồng hồ "Độ nhất quán" dạng vòng cung 0–10 ở trên |
| Chuyển động | Tua 12 tháng: vệ tinh quay 12 vòng, mỗi sự kiện dừng lại; đồng hồ tăng/giảm mượt 300ms, có dấu +/− |
| Camera | Rất chậm, không cắt; chỉ zoom 1,05 lần khi sự kiện quan trọng |
| Âm thanh | Tick đồng hồ rất nhỏ mỗi tháng; tiếng "ting" khi đồng hồ tăng; tiếng trầm khi giảm; nhạc nền giữ nhịp đều |
| Thời lượng | 100 giây; 12 tháng mô phỏng, 4 sự kiện cần quyết |
| Skip | Nút "Tua nhanh" tăng tốc 2×; không bỏ qua sự kiện |
| Mobile | Vòng đồng hồ ở trên, không bị tay che; nút sự kiện trong tầm ngón cái |
| Low tier | Vệ tinh là SVG quay bằng CSS; đồng hồ là SVG stroke-dasharray |

**Vì sao wow:** người chơi thấy hậu quả tích luỹ — thứ mà một buổi tư vấn thường chỉ nói được bằng lời.

## 10. Khoảnh khắc 8 — Sao Kim (finale)

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Hành tinh hoàn chỉnh, 5 lớp sáng, sao 4 cánh cam–đỏ xuất hiện phía trên; tên thương hiệu hiện thành chữ phát sáng |
| Khung hình | Hành tinh 60/100 chiều cao; sao 4 cánh 30/100; chữ tên thương hiệu giữa dưới; nút "Xem báo cáo" dưới cùng |
| Chuyển động | Camera lùi từ mặt hành tinh ra toàn cảnh trong 4 giây; 5 lớp sáng bật lần lượt theo thứ tự S→A→O→K→IM (nếu trạm nào tối, lớp đó không bật); sao loé 1 nhịp rồi giữ |
| Camera | Dolly out + tilt nhẹ lên; kết ở góc nhìn 3/4 |
| Âm thanh | Pad hợp âm trưởng dâng lên; 5 nốt tương ứng 5 lớp; im lặng 400ms trước khi hiện điểm |
| Thời lượng | 8–12 giây; nút "Bỏ qua" xuất hiện sau 2 giây |
| Skip | Bỏ qua → nhảy đến báo cáo, **vẫn giữ** hiệu ứng poster tĩnh |
| Mobile | Chữ tên thương hiệu tự co theo độ dài (tối đa 2 dòng, ellipsis); không rung màn hình |
| Low tier | Poster hành tinh đầy đủ (SVG) + fade từng lớp; sao 4 cánh là SVG có glow |

**Vì sao wow:** đây là phần thưởng duy nhất không thể mua bằng lời quảng cáo — nó là hình ảnh của chính thương hiệu người chơi, đã sáng.

## 11. Cockpit & KIM

| Trường | Đặc tả |
|---|---|
| Bối cảnh | Hành tinh 3D phía trên, panel trạm phía dưới; panel là "buồng lái" chứa toàn bộ nội dung trạm |
| Khung hình | Panel đáy 62dvh (intro) → 84dvh (chơi) → 82dvh (kết quả); HUD KIM 2 dòng trên cùng, một vùng cuộn, dock CTA đáy |
| Chuyển động | Panel mở rộng/thu theo pha bằng transition 300ms; intro chuyển sang chơi bằng thay nội dung, không đổi camera |
| Camera | Không có camera riêng cho cockpit; hành tinh phía sau vẫn xoay chậm, giữ cảm giác đang ở trên quỹ đạo |
| Âm thanh | Không thêm nhạc nền riêng; giữ ambience trạm + SFX mở ô/chốt vị trí |
| Thời lượng | Cùng nhịp trạm (90–120 giây); không có timer tổng |
| Skip | Dock đổi nhãn theo bước; pause sheet là nơi bỏ trạm; không có nút "bỏ qua" nào đè lên CTA chính |
| Mobile | Safe area trên/dưới; dock cao ≥ 50px; không CTA nào nằm trong vùng cuộn |
| Low tier | Panel và dock là CSS thuần; không phụ thuộc WebGL để chơi |
| Reduced motion | Panel đổi bằng fade 200ms; không trượt; typewriter của KIM hiện đủ câu ngay |

**KIM.** KIM là mặt hologram SVG + CSS 3D (không WebGL), 4 mood: `idle`, `happy`, `thinking`, `curious`; miệng mở/khép khi nói.

| Thời điểm | Hình ảnh | Lời |
|---|---|---|
| Intro trạm | Mặt KIM 62px, halo + vành quét, đang nói | 2 câu intro, có tên thương hiệu |
| Sau mỗi câu | Mặt nhỏ 30px trong popup, mood theo tone (2 → happy, 1 → thinking, 0 → curious) | Feedback + explain ngay trong popup |
| HUD khi chơi | Mặt 34px + bubble 2 dòng, tự chạy chữ 16–38ms/ký tự; mỗi 4 ký tự có tick gõ rất nhẹ | Reaction 1 câu theo điểm (2/1/0) |
| Kết quả trạm | Mặt 46px, mood theo mức điểm (≥ 8 happy, ≥ 5 thinking, < 5 curious) | 1 câu chốt theo mức điểm, có tên thương hiệu |
| Reduced motion | Không halo quét, không typewriter | Hiện đủ câu ngay; screen reader đọc một lần |

**Vì sao wow:** KIM không phải chatbot trong khung chat mà là người dẫn có mặt, có cảm xúc và có nhịp — mỗi câu trả lời đều được phản hồi ngay trong cockpit.

## 12. Chuyển cảnh & nhịp

| Từ → đến | Kiểu | Thời lượng | Ghi chú |
|---|---|---|---|
| Landing → Scanning | Camera vào gần hành tinh + radar overlay | 600ms | Không chặn input |
| Scanning → Confirm | Crossfade + hành tinh tiến lại | 400ms | Brand kit hiện dần từng dòng |
| Intro → Landing | Overlay mờ dần, camera về mode landing | 500ms | CTA/skip đều dùng chung |
| Confirm → Launch | Camera lùi xuống bệ phóng | 400ms | Khớp nhạc |
| Map → Flight | Dolly vào quỹ đạo, tàu hiện ra | 300ms | Không chặn |
| Flight → Planet | Hạ cánh + crossfade sang intro trạm | 700ms | Khớp pha landing, trùng tư thế tàu |
| Intro → Playing | Panel mở 62dvh → 84dvh, đổi nội dung | 300ms | Dock xuất hiện cùng lúc |
| Câu hỏi mở/đóng | Bottom sheet (mobile) hoặc modal (≥ 900px) | 240–300ms | Nền khoá cuộn, không đổi camera |
| Trạm → Flight | Camera lùi khỏi bề mặt, tàu cất cánh | 400ms | Bắt đầu chuyến bay |
| Launch → Map | Dolly out toàn cảnh hệ 5 trạm | 800ms | Có thể bỏ qua |
| Trạm → Flight | Camera lùi khỏi bề mặt, tàu vào quỹ đạo | 500ms | Hiện X/10 trước khi cất cánh |
| Trạm 5 → Flight → Finale | Chuyến bay tới Sao Kim rồi vào finale | 700ms + 1000ms | Không bỏ qua 0,5s đầu của finale |
| Finale → Report | Hành tinh thu thành poster | 500ms | Poster = ảnh share |

## 13. Âm thanh

- **Toàn bộ bằng WebAudio synth**, không file audio, để giữ bundle nhỏ và tránh bản quyền.
- Mặc định **tắt tiếng**; nút loa ở landing và trong game; trạng thái nhớ theo thiết bị (localStorage).
- iOS: chỉ khởi tạo AudioContext sau gesture đầu tiên; nếu bị treo, hiện icon gạch chéo và không báo lỗi.
- Mỗi trạm một pad hợp âm riêng: S (Dm add9, lạnh), A (Fmaj7, mở), O (Gm7, ấm), K (Am, căng), IM (Cmaj7, ổn định).
- SFX: `tap`, `correct`, `wrong`, `scan`, `launch`, `warp`, `landing`, `ignite`, `badge`; âm lượng chuẩn hoá, không bao giờ to hơn giọng người (khi có VO ở Phase 2). Chuyến bay tắt ambience, phát launch → warp → landing.
- Intro không phát SFX; nhạc/ambience chỉ bắt đầu sau gesture ở landing. Không có nhạc nền phát liên tục ở báo cáo; tắt sau finale để giảm pin.

## 14. Rủi ro hình ảnh

| Rủi ro | Đối sách |
|---|---|
| Máy yếu tụt fps ở trạm K (nhiều hạt) | Giới hạn hạt theo tier; tier thấp bỏ khói, giữ tàu |
| Người chơi bỏ qua toàn bộ cinematic | Mọi thông tin quan trọng vẫn nằm trong UI tĩnh; cinematic chỉ trang trí |
| Màn hình rất nhỏ (iPhone SE) | Bố cục 1:1 cho chi tiết; CTA luôn trong 60/100 dưới |
| Ánh sáng cam–đỏ chói trên OLED | Giới hạn độ sáng glow; không dùng trắng tinh |
| Reduced motion | Fade thay camera; không parallax; vẫn đủ 8 khoảnh khắc |
| Logo người chơi màu trắng trên nền sáng | Tự thêm nền tối mờ phía sau logo (scrim) |

## 15. Liên kết

- Bố cục từng màn: [05 User Flow](05-user-flow.md) §4.
- Gameplay dưới mỗi cảnh: [03 Game Design](03-game-design.md).
- Tier, fallback 2.5D, audio API: [07 Kiến trúc](07-architecture.md) §3.
- Đo fps, thiết bị: [09 Mobile QA](09-mobile-qa.md).
