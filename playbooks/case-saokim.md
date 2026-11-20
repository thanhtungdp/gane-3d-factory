# Case study: một game thương hiệu đã triển khai

> Đây là **case study**, không phải template. Chỉ dùng để học cách nối brief → narrative → storyboard → cockpit → QA. Không copy premise, tên nhân vật, số act, bộ quyết định, thang điểm hay tên cue của case này vào dự án khác.

## Đọc gì

| File | Đọc để hiểu |
|---|---|
| [docs/01-concept.md](../docs/01-concept.md) | Cách chốt tên, logline, premise, nhân vật dẫn, tone và điều cấm |
| [docs/06-storyboard.md](../docs/06-storyboard.md) | Cách chuyển story thành beat có hình, nhịp, copy, âm thanh và skip |
| [docs/03-game-design.md](../docs/03-game-design.md) | Cách gắn quyết định vào hành động, thang điểm, hậu quả và báo cáo |
| [docs/09-mobile-qa.md](../docs/09-mobile-qa.md) | Cách chốt viewport, CTA, một vùng cuộn, audio/reduced-motion |
| [src/lib/audio.ts](../src/lib/audio.ts) | Cách triển khai audio synth: mặc định bật, chạy sau gesture, nhớ mute, ambience theo act |

## Vì sao là case study tốt

- Story và cơ chế khớp nhau: mỗi act trả một lớp thông tin, không phải mini-game rời.
- Quyết định nằm trong hành động; không có màn quiz tách rời.
- Kết quả cuối gắn dữ liệu thật của thương hiệu (brand kit, pre-scan), không chỉ điểm số.
- Có skip, có resume, có bản không âm thanh và bản 2.5D; CTA luôn ngoài vùng cuộn.
- Tone và copy được kiểm tự động (giới hạn ký tự, từ cấm, template, số liệu).

## Bài học chuyển hoá được

1. **Chọn ẩn dụ theo brand truth**, không theo hình ảnh đẹp. Case này chọn một ẩn dụ có luật rõ; dự án khác có thể chọn pattern khác trong `references/metaphor-patterns.md` của skill narrative.
2. **Guide có giới hạn.** Guide dẫn và phản hồi ngắn, không hội thoại tự do, không bán.
3. **Mỗi beat có mục đích.** Beat không đổi trạng thái người chơi đều bị cắt.
4. **Storyboard trước code.** Case này khoá storyboard và cue sheet trước khi dựng scene/UI.
5. **Đo bằng event đã định nghĩa trước**, không thêm event sau khi thấy số.
6. **QA theo viewport thật**, không chỉ desktop.

## Không copy gì

- Premise, thế giới, tên nhân vật dẫn, tên act, số act.
- Bộ quyết định, đáp án, thang điểm, ngưỡng danh hiệu.
- Tên cue, nhạc nền, màu, logo, asset.
- Câu copy mẫu; chỉ dùng để hiểu chuẩn độ dài/giọng.

## Cách dùng đúng

1. Chạy `game-brief-for-brand` cho dự án mới; không mở case này khi chưa có brief.
2. Chạy `game-narrative-and-tone`; chọn pattern từ `references/metaphor-patterns.md`, không dựa vào case.
3. Khi bí ở một bước, mở đúng file trong bảng "Đọc gì" để xem **cách làm**, rồi viết lại bằng brand truth của dự án.
4. Nếu một chi tiết trong case không giải thích được bằng brand truth của dự án mới, bỏ nó.
