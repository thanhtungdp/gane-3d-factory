# 01 — Concept & câu chuyện

Tài liệu này chốt tên, câu chuyện, ẩn dụ, nhân vật dẫn và giọng điệu. Mọi câu chữ trong game, landing, báo cáo và ấn phẩm phải suy ra được từ đây. Các file liên quan: [03 Game Design](03-game-design.md), [05 User Flow](05-user-flow.md), [06 Storyboard](06-storyboard.md).

## 1. Tên & định vị

| Thành phần | Nội dung | Ghi chú |
|---|---|---|
| Tên đầy đủ | **HÀNH TRÌNH SAO KIM** | Viết hoa toàn bộ trên key art; viết thường "Hành trình Sao Kim" trong câu |
| Phụ đề | **5 trạm thắp sáng thương hiệu** | Luôn đi kèm tên ở landing, PWA, PDF |
| Tên nội bộ dự án | `hanh-trinh-sao-kim` | Trùng `package.json`, không đổi |
| Slug/URL | `/` (một trang), route nội bộ `/tram/suong-mu`, `/tram/dai-thien-van`, `/tram/xuong-che-tac`, `/tram/be-phong`, `/tram/tram-van-hanh` | Theo `PLANET_SLUGS` |
| Tên nói miệng | "Hành trình Sao Kim" / "game của Sao Kim" | Không gọi "minigame", "quiz", "khảo sát" |

Định vị một dòng: **không phải công cụ audit tự động, cũng không phải quiz marketing — là một trải nghiệm 8 phút để người đứng đầu doanh nghiệp tự thấy mình đang tối ở đâu.**

## 2. Logline

> Mỗi thương hiệu là một hành tinh đang ngủ. Bạn mang tên của nó qua 5 trạm, và mỗi quyết định đúng thắp thêm một lớp sáng.

**Trước khi vào game (chỉ lần đầu):** một intro 3D 10 giây cho hành tinh thức dậy theo 5 lớp, rail 5 trạm sáng dần và KIM dẫn 5 câu caption. CTA hiện ở 8,8 giây, người chơi có thể bỏ qua bất cứ lúc nào; intro không bán hàng, không nhắc gói/giá và không thay gameplay — xem xong vẫn vào landing như cũ.

**Pitch 10 giây:** "Nhập website của bạn. Chơi 8 phút. Nhận bản đồ thương hiệu của bạn đang sáng ở đâu, tối ở đâu."

**Pitch 30 giây:** "Một intro 6 giây cho hành tinh thức dậy, rồi Hành trình Sao Kim đưa website của bạn vào một hành tinh bị sương che. Bạn đi qua 5 trạm: nhìn lại tín hiệu thật, chọn hướng định vị, khoác hệ thống nhận diện, cất tiếng ra mắt, và giữ lửa trong 12 tháng. Kết thúc là báo cáo 1 trang: điểm từng lớp, hai bước yếu nhất kèm hệ quả kinh doanh, và gói phù hợp nếu bạn muốn đi tiếp cùng Sao Kim."

## 3. Câu chuyện xuyên suốt

Ba hồi, tổng 7–10 phút.

| Hồi | Tên | Thời lượng | Người chơi cảm thấy gì | Điều gì thật sự xảy ra |
|---|---|---|---|---|
| I — Hành tinh đang ngủ | Intro 10s (lần đầu) → landing → bản đồ 5 trạm | 1–2 phút | Tò mò, hơi bất ngờ vì website của mình hiện ra | Intro giới thiệu ẩn dụ 5 lớp sáng; hệ thống crawl website, dựng brand kit, cho sửa; hành tinh của họ đã có logo nhưng tối |
| II — Thắp từng lớp | S → A → O → K → IM | 6–7 phút | Được hỏi những câu khó, được nhìn thấy tiến bộ mỗi trạm | 18 quyết định; mỗi lựa chọn cộng một lớp sáng lên bản đồ |
| III — Được nhìn thấy | Cinematic Sao Kim → báo cáo | 1 phút | Được ghi nhận, thấy vùng tối rõ ràng | Ngôi sao 4 cánh xuất hiện; vùng tối = bước chưa quyết; báo cáo mở ra |

**Nguyên tắc kể chuyện:** người chơi không bao giờ bị mắng. Vùng tối không phải "bạn yếu", mà là "bạn chưa quyết bước này". KIM đặt câu hỏi, không phán xét.

## 4. Ẩn dụ 5 trạm

| Trạm | Thế giới | Ẩn dụ | Điều người chơi học được | Lớp sáng | Vùng tối tương ứng trên hành tinh |
|---|---|---|---|---|---|
| **S** | Tinh cầu Sương Mù | Nhìn lại trước khi tin vào giả định | Website nói gì với khách, và khoảng trống giữa điều mình tin và điều khách thấy | Khí quyển | Lớp sương xám còn che logo, tên, tín hiệu |
| **A** | Đài Thiên Văn | Chọn hướng, chấp nhận từ chối | Định vị là chọn một hướng và bỏ các hướng khác; tính cách phải khớp vị trí | Trục quay | Trục quay nghiêng, chòm sao còn đứt đoạn |
| **O** | Xưởng Chế Tác | Hệ thống nhìn thấy được, không chỉ logo | Một hệ thống nhất quán trên 6 bề mặt, không phải một file logo | Bề mặt | Bề mặt lớn còn trơn, chưa có đèn thành phố |
| **K** | Bệ Phóng | Cất tiếng và đối mặt khủng hoảng | Ra mắt là một kế hoạch có thứ tự và có người phát ngôn | Đèn thành phố + sóng | Tín hiệu yếu, không có sóng phát đi |
| **IM** | Trạm Vận Hành | Giữ lửa qua thời gian, con người, quy mô | Nhất quán là việc của quy trình, không của trí nhớ | Vệ tinh | Không có vệ tinh, hành tinh đơn độc |

**Sao Kim** là đích: ngôi sao 4 cánh màu cam–đỏ ở góc phải trên, chỉ sáng hoàn toàn khi cả 5 lớp được thắp. Ý nghĩa chính thức của biểu tượng 4 cánh do brand team xác nhận `[cần xác nhận]`; trong game, 4 cánh được dùng như dấu hiệu kết thúc và điểm neo thị giác, không gán thêm nghĩa.

## 5. KIM — nhân vật dẫn

| Thuộc tính | Chốt |
|---|---|
| Là ai | Trợ lý AI của con tàu; giọng nữ, trung tính, không giả làm người thật |
| Nhiệm vụ | Dẫn đường, đặt câu hỏi, phản hồi ngắn sau mỗi lựa chọn, gọi tên thương hiệu |
| Xưng hô | "Mình" – "bạn"; gọi người chơi bằng tên thương hiệu, ví dụ "Chào An Phát" |
| Không làm | Không bán hàng, không nhắc tên gói, không doạ, không dùng từ "sai", "kém", "thất bại" |
| Độ dài câu | ≤ 22 từ cho thoại trong game; ≤ 8 từ cho nhãn nút |
| Khi không có tên thương hiệu | Gọi "bạn" và "thương hiệu của bạn" |
| Khi người chơi chọn đáp án 0 | "Đây là chỗ rất nhiều thương hiệu cũng đang đứng. Mình ghi lại." |
| Khi người chơi chọn đáp án 2 | "Đúng hướng. Lớp này sáng thêm một chút." |
| Khi hết giờ (trạm O, khủng hoảng K) | "Hết giờ — mình vẫn ghi nhận lựa chọn bạn đang có." |

**Mẫu thoại mở trạm:**

- S: "Sương dày quá. Rê tay để gạt từng vùng — mình sẽ đọc giúp bạn tín hiệu bên dưới."
- A: "Chọn hướng đi trước. Một thương hiệu không thể là tất cả mọi thứ."
- O: "Logo chỉ là một ô. Xưởng này kiểm tra 6 ô còn lại."
- K: "Đến lúc cất tiếng. Có kế hoạch thì phóng, không có thì nổ."
- IM: "Tháng thứ nhất dễ. Tháng thứ mười hai mới là câu chuyện."

**KIM không phải chatbot.** Không có ô nhập tự do ở trạm; chỉ có câu hỏi đóng, phản hồi mở. Nếu người chơi bỏ qua trạm, KIM không hỏi lại.

## 6. Giọng điệu

Năm nguyên tắc:

1. **Cụ thể hơn hay.** Thay "thương hiệu mạnh mẽ" bằng "khách nhớ màu và hình dạng trước khi nhớ tên".
2. **Nói về hậu quả kinh doanh, không nói về thẩm mỹ.** "Khách so sánh bạn bằng giá" thay vì "nhận diện chưa đẹp".
3. **Không hù, không tâng.** Không "thương hiệu của bạn đang chết", không "bạn sẽ bùng nổ".
4. **Câu ngắn cho màn hình nhỏ.** Một ý một câu; không quá 2 dòng trên iPhone SE.
5. **Số liệu chỉ khi có thật.** Không dùng số liệu ngành nếu chưa có nguồn; dùng cơ chế thay vì số.

| Nên viết | Không nên viết | Vì sao |
|---|---|---|
| "Khách so sánh bạn bằng giá" | "Định vị chưa đủ mạnh" | Cụ thể, kiểm chứng được |
| "Lớp này sáng thêm một chút." | "Tuyệt vời! Bạn quá xuất sắc!" | Không tâng, giữ nhịp |
| "Đây là chỗ nhiều thương hiệu cũng đang đứng." | "Bạn đã mắc lỗi cơ bản." | Không phán xét |
| "7,5/10 — Thương Hiệu Ngôi Sao Mới" | "75 phần trăm — Khá" | Quy ước không dùng ký hiệu phần trăm trong UI |
| "Bạn cần xác nhận trước khi gửi." | "Vui lòng xác nhận." | Gần gũi, rõ hành động |

## 7. Hình ảnh & art direction

- **Nền:** navy sâu `#050a24` (theme color, manifest), sao lấm tấm, không texture ảnh.
- **Màu từng trạm:** S `#7fb2c9`, A `#8b7cf6`, O `#f59e6b`, K `#ef4123`, IM `#4fd1c5` (nguồn `PLANET_META`).
- **Logo Sao Kim:** chỉ dùng file trong `public/brand/` (`logo-saokim-blue.svg`, `logo-saokim-white.svg`, `logo-saokim-star.svg`). Không dùng asset ngoài brand + procedural.
- **Logo người chơi:** lấy từ crawl (`/api/assets/...`, same-origin), hiển thị trên tàu dưới dạng decal; không có logo thì dùng monogram chữ cái đầu.
- **Ngôi sao 4 cánh:** shader SDF, cam–đỏ, chỉ ở finale và watermark nhẹ trên key art.
- **Ảnh tham chiếu framework:** `docs/assets/saokim-framework.jpg` — ảnh chính thức của SAOKIM Framework, dùng để đối chiếu nội dung 5 bước, **không ship vào game**. Bảng đối chiếu ở §8.
- **Chuyển động:** camera nội suy, không cắt cảnh đột ngột; mọi cinematic có nút bỏ qua hoặc tự bỏ qua sau 3 giây khi người chơi đã chạm.

## 8. Đối chiếu SAOKIM Framework (ảnh tham chiếu)

Ảnh framework mô tả 5 bước và các đầu việc. Game không thay thế quy trình tư vấn — nó là **cửa vào** của quy trình, nên tên và nghĩa từng trạm phải khớp:

| Bước trong ảnh | Trạm trong game | Đầu việc trong ảnh | Cách game chạm tới |
|---|---|---|---|
| SCAN BRAND — Kiểm toán thương hiệu | S | Khảo sát 360°, phân tích thị trường, so sánh đối thủ, kiểm tra nhận diện | Quét 4 vùng sương; tín hiệu lấy từ website; không hứa khảo sát thị trường thật |
| ALIGN STRATEGY — Chiến lược thương hiệu | A | Sứ mệnh–tầm nhìn–giá trị, bản đồ định vị, kiến trúc thương hiệu, tính cách–tuyên ngôn | Nối chòm sao 3 điểm, kéo logo lên bản đồ 2 trục, chọn 2 tính cách |
| OPTIMIZE IDENTITY — Thiết kế thương hiệu | O | Logo–màu–font, bộ nhận diện đa kênh, brand guidelines, UX/UI số hoá | 6 mockup, tìm 2 lỗi màu/font, test ghi nhớ màu |
| KICKOFF COMMUNICATION — Ra mắt & truyền thông | K | Kế hoạch ra mắt, câu chuyện thương hiệu, video–social–PR, kích hoạt nội bộ | Xếp 5 việc, giữ nạp phóng, khủng hoảng 30 giây |
| IMPLEMENT CONSISTENCY — Vận hành & phát triển | IM | Tích hợp vận hành, đào tạo đội ngũ, đánh giá định kỳ, cập nhật linh hoạt | Tua 12 tháng, 4 sự kiện, đồng hồ nhất quán |

Ảnh framework có câu "Từ hơn 10.000 dự án đã triển khai". Đây là tuyên bố của Sao Kim trên ấn phẩm chính thức; **chỉ dùng lại khi Marketing xác nhận có tài liệu chứng minh** `[cần xác nhận]`. Game không dùng con số này trong copy.

## 9. Tên phương án dự phòng

Tên chính đã chốt. Các phương án dưới đây dùng khi: kiểm tra nhãn hiệu/SEO phát hiện trùng, hoặc A/B test cho thấy tên chính khó nhớ.

| Phương án | Câu dẫn | Khi dùng | Lưu ý |
|---|---|---|---|
| **Bản đồ Sao Kim** | "8 phút để thấy thương hiệu của bạn đang ở đâu" | Khi cần nhấn vào kết quả (báo cáo) hơn là hành trình | Trùng tên báo cáo "Bản đồ thương hiệu"; chỉ dùng làm tên phụ |
| **5 trạm Sao Kim** | "Năm trạm, năm lớp sáng" | Khi cần tên ngắn cho quảng cáo | Mất yếu tố "hành trình" |
| **Thắp sáng hành tinh của bạn** | "Website của bạn là một hành tinh đang ngủ" | Khi chạy social video | Dài, không thành thương hiệu riêng |
| **Hành tinh chưa sáng** | "Thương hiệu chưa sáng không phải thương hiệu yếu" | Khi làm series nội dung | Hơi tiêu cực nếu đứng một mình |
| **Sao Kim: Khởi hành** | "Từ website đến bản đồ thương hiệu" | Khi cần tên dạng phim/series | Cần kiểm tra nhãn hiệu |

Mọi phương án thay thế phải kiểm tra trùng lặp nhãn hiệu trước khi dùng ra ngoài `[cần xác nhận]`. Không tự đổi tên trong code; tên game nằm ở `src/config/site.ts`.

## 10. Điều không làm

- Không biến Sao Kim thành nhân vật biết tuốt hoặc ra lệnh cho người chơi.
- Không dùng nỗi sợ ("đối thủ đang vượt bạn") làm đòn bẩy.
- Không dùng từ ngữ chuyên môn mà không giải thích ngay trong câu: brand guideline, định vị, touchpoint.
- Không so sánh trực tiếp với agency/đối thủ nào.
- Không dùng ký hiệu phần trăm trong bất kỳ chuỗi UI nào; không dùng sao đánh giá 5 điểm lẫn với thang 10.
- Không mô tả kết quả kinh doanh cụ thể (tăng doanh thu, tăng nhận biết) khi chưa có dữ liệu.

## 11. Liên kết

- Nội dung từng trạm và quyết định: [03 Game Design](03-game-design.md).
- Hình ảnh 8 khoảnh khắc: [06 Storyboard](06-storyboard.md).
- Copy từng màn hình: [05 User Flow](05-user-flow.md).
- Cách 5 lớp sáng quy đổi thành điểm và gói: [04 Điểm & Gói](04-scoring-offers.md).
