# Loop — Bánh mì Hạnh · 10 phút

> Nguồn máy đọc: `decisions.json` (12 decision + 3 câu kiểm tra). Audit: `content-audit.out.md`. 4 act, 3 quyết định/act, điểm 2/1/0.

## 1. Act spec

| actId | Tên act | Mục tiêu người chơi thấy | Thời lượng | Hành động một ngón tay | Điểm neo mở câu hỏi | Hậu quả nếu chọn 0 | Tiến bộ / thưởng |
|---|---|---|---|---|---|---|---|
| `act-1-nhan-ca` | Nhận ca | Hiểu 3 bước kiểm trước khi mở cửa | 25–180s | Tap 3 mục checklist, tap đáp án | Sau khi chạm đủ 3 mục | Sổ ca trống, ca sau không có dữ liệu | Mốc 1 sáng + mở act 2 |
| `act-2-mo-cua` | Mở cửa | Giữ nhất quán nội dung, logo, giá | 180–250s | Tap đáp án, tap "Tiếp tục" | Sau mỗi panel hậu quả | Bài/giá lệch chuẩn vẫn hiển thị với khách | Mốc 2 sáng + huy hiệu "Đủ bước" |
| `act-3-gap-khach` | Gặp khách | Xử lý tình huống có người nhìn | 250–390s | Tap đáp án; tap "Dừng, hỏi quản lý ca" | Sau khi khách nói xong (600ms) | Khách thấy cửa hàng không nhận trách nhiệm | Mốc 3 sáng + khoảng nghỉ 600ms |
| `act-4-dong-ca` | Đóng ca | Khép ca bằng bản ghi, không bằng trí nhớ | 390–480s | Tap đáp án | Sau mỗi mục bàn giao | Việc còn mở trôi sang ca sau | Mốc 4 sáng + mở bài kiểm tra |

Số act = 4 theo 4 mốc ca làm của scenario; mỗi act có mục tiêu/hành động/quyết định/hậu quả/tiến bộ riêng, không copy.

## 2. Pattern

- Pattern chính: **checklist-gate + one-question popup** (mỗi act khoá tới khi bước kiểm xong).
- Pattern phụ: **consequence panel** (hậu quả nhìn thấy được, không có màn "game over").
- Rủi ro: (a) lặp nhịp tap 3 mục × 4 act → giảm bằng cách đổi vật thể kiểm mỗi act; (b) chờ đợi giữa câu hỏi và panel → giới hạn 600ms; (c) người chơi tưởng đây là bài thi nên sợ chọn → guide nói rõ "chọn sai vẫn đi tiếp" ở beat 2.

## 3. Decision set

| id | kind | prompt (≤85) | Option 2 | Option 1 | Option 0 | evidenceKey |
|---|---|---|---|---|---|---|
| `act-1-nhan-ca/d1-uniform` | action | Đồng phục thiếu phù hiệu trước giờ mở cửa, bạn xử lý thế nào? | Lấy phù hiệu dự phòng theo checklist và ghi vào sổ ca. | Mở cửa trước, xin phù hiệu khi đã có khách vào. | Mặc áo khác và không ghi gì vào sổ ca. | `brand-vi` |
| `act-1-nhan-ca/d2-sign` | diagnosis | Bảng hiệu bị lệch trước giờ mở cửa, bạn làm gì? | Chụp ảnh, báo quản lý ca và ghi sự cố trước khi mở. | Tự nắn lại bảng hiệu rồi mở cửa như thường. | Mở cửa bình thường và để ca sau xử lý. | `checklist-open` |
| `act-1-nhan-ca/d3-pos` | action | Máy POS chưa lên sau khi bật, bạn làm gì? | Kiểm tra nguồn và dây theo checklist rồi báo quản lý ca. | Bật lại nhiều lần và chờ thêm trước khi báo. | Ghi đơn bằng tay và bỏ qua bước kiểm POS. | `checklist-open` |
| `act-2-mo-cua/d4-approve` | knowledge | Trước khi đăng bài khuyến mãi, bước nào là bắt buộc? | Lấy duyệt của người có thẩm quyền theo quy trình nội dung. | Đăng trước cho kịp giờ rồi báo quản lý ca sau. | Đăng bằng tài khoản cá nhân cho nhanh và tiện. | `sop-content-approval` |
| `act-2-mo-cua/d5-logo` | action | Đồng nghiệp mới đăng ảnh có logo sai, bạn làm gì? | Báo quản lý ca, gỡ bài và ghi lại lỗi nhận diện. | Nhắc riêng bạn đó và để bài tiếp tục hiển thị. | Tự sửa ảnh rồi đăng lại từ tài khoản của bạn. | `brand-vi` |
| `act-2-mo-cua/d6-price` | diagnosis | Giá trên bảng khác giá trên POS, bạn xử lý thế nào? | Dừng bán mức giá đó và báo quản lý ca đối chiếu. | Bán theo giá trên bảng vì khách đã nhìn thấy. | Bán theo POS và không nhắc khách về bảng giá. | `sop-pricing` |
| `act-3-gap-khach/d7-complain` | action | Khách phàn nàn món không đúng mô tả, bạn mở lời thế nào? | Xin lỗi, ghi nhận cụ thể và nêu bước xử lý trong quyền. | Giải thích do đông khách và đề nghị khách thông cảm. | Khẳng định bếp làm đúng và đề nghị khách chọn món khác. | `sop-customer-response` |
| `act-3-gap-khach/d8-discount` | action | Khách đòi giảm giá ngoài chương trình, bạn trả lời ra sao? | Mời khách dùng ưu đãi đang có và báo quản lý ca nếu cần. | Giảm một phần nhỏ để giữ khách rồi ghi vào sổ ca. | Từ chối thẳng và nói giá cửa hàng là cố định. | `sop-pricing` |
| `act-3-gap-khach/d9-video` | action | Khách quay video trong lúc bạn đang làm việc, bạn làm gì? | Chào, hỏi mục đích và báo quản lý ca theo quy trình. | Đứng ngoài khung hình và tiếp tục làm việc như thường. | Yêu cầu khách tắt máy ngay trước mặt người khác. | `sop-customer-response` |
| `act-4-dong-ca/d10-handover` | action | Bàn giao ca, bạn làm theo cách nào? | Đọc checklist bàn giao, ghi việc còn mở và xác nhận. | Kể miệng các việc còn lại cho người vào ca. | Chỉ ghi sự cố lớn, việc nhỏ để ca sau tự thấy. | `checklist-close` |
| `act-4-dong-ca/d11-incident` | action | Sự cố với khách chưa xử lý xong, bạn ghi ở đâu? | Ghi vào báo cáo sự cố theo mẫu và báo quản lý ca ngay. | Nhắn tin riêng cho quản lý ca sau khi đã tan ca. | Để ca sau tự phát hiện khi khách quay lại. | `sop-incident` |
| `act-4-dong-ca/d12-unsure` | knowledge | Khi không chắc một quy định, bạn làm gì? | Tra tài liệu nội bộ trước, không chắc thì hỏi quản lý ca. | Làm theo cách bạn từng được hướng dẫn ở nơi khác. | Tự chọn cách hợp lý nhất để khách không phải chờ. | `sop-store` |

## 4. Feedback + explain

| id | Feedback 2 | Feedback 1 | Feedback 0 | Explain |
|---|---|---|---|---|
| `d1-uniform` | Ca mở đúng chuẩn nhận diện; sổ ca có dòng để ca sau đối chiếu. | Khách đầu tiên thấy nhân viên chưa đủ nhận diện; ca sau không biết vì sao thiếu. | Cửa hàng lệch chuẩn nhận diện mà không ai có dữ liệu để sửa. | Nhận diện là bước kiểm trước khi mở cửa; thiếu thì bổ sung theo checklist rồi ghi lại. |
| `d2-sign` | Sự cố có ảnh và người nhận; quản lý ca quyết định sửa trong ngày. | Bảng có thể tạm thẳng nhưng không ai biết mối nối đã hỏng. | Khách thấy bảng lệch suốt ca; ca sau nhận việc không có ghi chú. | Sự cố nhận diện cần ảnh và người chịu trách nhiệm; nhân viên mới ghi nhận, không tự sửa. |
| `d3-pos` | Lỗi được khoanh vùng trong vài phút; quản lý ca có thông tin để gọi hỗ trợ. | Giờ mở cửa bị trễ; không ai biết máy đã lỗi từ lúc nào. | Đơn không vào hệ thống, cuối ca phải dò lại tay và dễ lệch doanh thu. | Checklist mở ca là ranh giới giữa "chưa lên" và "đã hỏng"; vượt bước kiểm là mất dấu lỗi. |
| `d4-approve` | Bài lên đúng người duyệt; nếu sai sót, có đầu mối để sửa. | Bài đã tiếp cận khách trước khi ai kiểm nội dung. | Nội dung thương hiệu ra khỏi kênh chính thức, không thu hồi được. | Nội dung ra ngoài là cam kết của cửa hàng; chỉ người có thẩm quyền chốt. |
| `d5-logo` | Bài sai được gỡ sớm; lỗi vào danh sách để đào tạo lại. | Bạn đó biết lỗi nhưng khách vẫn thấy logo sai trên kênh. | Hai bản ảnh cùng tồn tại; không rõ bản nào là bản chuẩn. | Logo sai là lỗi nhận diện, cần gỡ và ghi nhận; sửa lén tạo thêm bản không kiểm soát. |
| `d6-price` | Không ai bị thu sai; quản lý ca chốt giá đúng trước khi bán tiếp. | Khách không bị sốc giá, nhưng hệ thống ghi nhận một mức khác. | Khách phát hiện lệch giá tại quầy và mất tin vào bảng giá. | Chênh giá là sự cố cần người có thẩm quyền chốt; nhân viên dừng bán và báo. |
| `d7-complain` | Khách thấy được lắng nghe và biết ai sẽ làm gì tiếp theo. | Khách hiểu lý do nhưng vẫn chưa biết món của mình được xử lý ra sao. | Khách thấy bị phủ nhận; sự việc leo thang trước người khác. | Phản hồi phải nói điều xảy ra tiếp theo, không phán xét khách. |
| `d8-discount` | Khách có lựa chọn thật; cửa hàng không tự mở mức giá mới. | Khách hài lòng tại chỗ nhưng mức giá không ai có thẩm quyền chốt. | Khách bị chặn mà không có lựa chọn nào khác để ở lại. | Nhân viên không có quyền đổi giá; phần ngoài ưu đãi thì chuyển quản lý ca. |
| `d9-video` | Cửa hàng biết việc quay đang diễn ra; không ai bị bất ngờ. | Bạn tránh được khung hình nhưng cửa hàng vẫn không biết. | Tình huống căng lên và có thể bị ghi lại thành nội dung xấu. | Nguyên tắc là hỏi mục đích và để quản lý ca xử lý; câu chữ ghi `[cần xác nhận]`. |
| `d10-handover` | Ca sau nhận đúng trạng thái; việc còn mở không phụ thuộc trí nhớ. | Ca sau nắm được phần lớn việc nhưng không có bản ghi để đối chiếu. | Việc nhỏ dồn sang ca sau và dễ thành phàn nàn của khách. | Bàn giao là bước kiểm cuối ca; checklist giữ được chi tiết mà lời nói làm rơi. |
| `d11-incident` | Sự cố có người nhận trong ca; khách quay lại thì có hồ sơ. | Quản lý ca biết muộn; nếu khách quay lại trước đó thì không ai nắm. | Khách gặp người không biết sự việc; cửa hàng phải xin lỗi lần hai. | Sự cố chưa đóng phải vào báo cáo và tới người chịu trách nhiệm trong ca đó. |
| `d12-unsure` | Câu trả lời có nguồn; người chơi không tự tạo quy định mới. | Cách làm có thể đúng ở nơi khác nhưng lệch quy trình cửa hàng này. | Quy định thành do suy đoán; cùng câu hỏi sẽ có nhiều đáp án khác nhau. | Quyền hỏi và quyền dừng là phần của vai trò; làm nhanh không thay được nguồn đúng. |

## 5. Scoring

- Mỗi act: 3 câu × tối đa 2 điểm = raw 0–6 → chuẩn hoá `round(raw / 6 × 10)` = **X/10**.
- Tổng: trung bình 4 act, weight 0.25 mỗi act (chia đều; không act nào nặng hơn vì 4 act cùng thuộc một ca).
- Bonus: không có. Không cộng điểm cho act bỏ qua, không cộng cho tốc độ (game nội bộ, thưởng nhanh sẽ dạy sai), không trừ khi chọn "dừng và hỏi".
- Không trừ điểm vì chọn "Dừng, hỏi quản lý ca" — đó là hành vi đúng, không phải bỏ cuộc.
- Bài kiểm tra cuối (3 câu, `decisions.json.quiz`): hiển thị **n/3** riêng, không cộng vào X/10; không đặt ngưỡng đạt/không đạt vì HR chưa chốt `[cần xác nhận]`.
- Không `%` trong UI. Điểm hiển thị X/10; huy hiệu dùng n/5 sao.

## 6. Progression · skip · resume

- Trạng thái act: `locked` → `active` → `done`; tổng lưu ở `localStorage` key `hanh-ca1-progress`.
- Skip: sau intro, beat 1/2/5/6 bỏ được phần chữ; **không skip 12 câu quyết định và bài kiểm tra** (nếu skip thì không có dữ liệu ghi nhận hoàn thành). Ghi rõ trong báo cáo chạy — khác gợi ý "skip act" của skill.
- Resume: mở lại đúng act + câu đang dở; câu đã trả lời không mở lại, có pill "Câu hỏi X/N đang chờ".
- Chọn 0 điểm vẫn đi tiếp; không dead-end, không bắt chơi lại.
- Thoát giữa ca: giữ tiến độ, không mất điểm đã có.

## 7. Report mapping (gửi team lead, không phải offer)

| actId | Tên trên report | Weight | Điểm | Ngưỡng yếu | Evidence | Hệ quả viết cho report |
|---|---|---|---|---|---|---|
| `act-1-nhan-ca` | Nhận ca | 0.25 | X/10 | < 6 | `checklist-open`, `brand-vi` | Mở cửa bằng trí nhớ thay vì checklist; lỗi nhận diện không có ảnh/ghi chú |
| `act-2-mo-cua` | Mở cửa | 0.25 | X/10 | < 6 | `sop-content-approval`, `sop-pricing` | Nội dung/giá ra khách trước khi có người chốt |
| `act-3-gap-khach` | Gặp khách | 0.25 | X/10 | < 6 | `sop-customer-response`, `sop-pricing` | Khách gặp phản hồi không nói bước tiếp theo; sự việc dễ leo thang |
| `act-4-dong-ca` | Đóng ca | 0.25 | X/10 | < 6 | `checklist-close`, `sop-incident` | Việc còn mở trôi sang ca sau; sự cố không có hồ sơ |

- Báo cáo gồm: điểm X/10, n/3 câu kiểm tra, 2 vùng yếu nhất (act + bước + evidence), act đã bỏ qua (nếu có), thời điểm hoàn thành, mã nhân viên nội bộ.
- Không có offer, không giá, không xếp hạng giữa nhân viên, không gửi marketing.
- 2 vùng yếu tính lại được từ decision + scoring, không hardcode.

## 8. Content audit

- Kết quả: **PASS**, 0 lỗi cứng trên 12 decision (`content-audit.out.md`).
- Prompt dài nhất 61/85; option 38–58 ký tự (min 20, max 120); spread lớn nhất 16/55; đúng 3 option và một 2/1/0 ở 12/12; không `%`, không `[]`, không "đúng nhất", không từ cấm.
- `evidenceKey` chỉ trỏ 8 nguồn nội bộ đã khai trong `brief.md` mục 4; hai nguồn tin cậy thấp (`sop-content-approval`, `sop-customer-response`) đã ghi `[cần xác nhận]` ở explain.

## 9. Còn mở

- [ ] Trích đoạn thật của `sop-content-approval`, `sop-customer-response`, `sop-pricing` — nếu câu chữ khác, sửa explain và feedback, giữ nguyên id/kind/points.
- [ ] Ngưỡng đạt bài kiểm tra (n/3) do HR chốt.
- [ ] Có lưu kết quả vào hệ thống HR hay chỉ file nội bộ.
