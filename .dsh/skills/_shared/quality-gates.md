# Shared quality gates

Các cổng này áp dụng cho mọi game sinh ra từ bộ skill. Skill có thể siết thêm, không được nới.

## Canonical viewport matrix

Dùng đủ 8 mốc cho QA build: **320×640 · 344×882 · 390×844 · 540×720 · 725×870 · 884×1104 · 1024×600 · 1440×900**. Scenario có thể yêu cầu tối thiểu 4 mốc, nhưng QA plan phải mở rộng đủ 8 trước launch. 320×640 là gate cứng.

## Cứng — không được launch nếu vi phạm

1. **Một ngón tay:** mọi hành động cốt lõi làm được bằng tap / rê / kéo / giữ; không joystick, không bắt buộc bàn phím.
2. **CTA không bị chôn:** ở màn chơi, hành động chính luôn nhìn thấy ở canonical matrix: 320×640, 344×882, 390×844, 540×720, 725×870, 884×1104, 1024×600, 1440×900. Ở teaser/intro, CTA có thể xuất hiện sau beat reveal, nhưng từ lúc xuất hiện phải luôn thấy, không cần cuộn; nếu CTA chỉ ở cuối, phải có hành động phụ/QR thay thế luôn thấy.
3. **Một vùng cuộn:** không có scroll lồng nhau; nút chính nằm ngoài vùng nội dung cuộn.
4. **Không `%` trong UI:** dùng X/10, n/5, x/100 cho KPI; số sao; mốc thời gian.
5. **Không bịa số:** không bịa khách hàng, đối thủ, benchmark, hiệu quả, chứng nhận, giá.
6. **Không bán hàng trong lúc chơi:** offer/giá chỉ xuất hiện sau báo cáo và sau lead gate.
7. **Không chặn người chơi:** có skip, có resume nếu dài, không bắt đăng ký trước khi chơi.
8. **Âm thanh không bắt buộc:** mặc định bật nhưng chỉ chạy sau gesture; tắt được; nhớ lựa chọn; no-sound vẫn đủ thông tin.
9. **Reduced motion:** không mất nội dung, không rung/zoom mạnh, không autoplay animation dài.
10. **Dữ liệu:** chỉ đọc thông tin công khai; có consent khi thu lead; không lưu nội dung trang.
11. **Brand truth:** mỗi khoảnh khắc “wow” phải gắn với dữ liệu/sản phẩm thật của brand, không chỉ hiệu ứng chung.

## Mềm — phải review

- Story có 3 hồi hoặc một arc rõ; guide character không phải chatbot.
- Tone matrix có ví dụ câu thật, không chỉ tính từ.
- Storyboard có interaction ở mỗi beat; beat nào không có mục đích thì cắt.
- Sound cue sheet có fallback và mức mix; không có âm thanh cao gắt kéo dài.
- Option quiz song song ngữ pháp; đáp án đúng không dài bất thường; không meta-answer.
- Report có evidence và hệ quả kinh doanh, không chỉ điểm.
- KPI có guardrail, không chỉ conversion.

## Rubric 1–5

Xem `playbooks/evaluation/rubric.md`. Pass khi trung bình ≥ 4 và không có điểm 1 ở gate cứng.
