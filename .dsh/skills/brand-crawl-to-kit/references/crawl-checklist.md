# Crawl checklist

Dùng như cổng review cho skill `brand-crawl-to-kit`. Mapping code cụ thể ở [reference map](../../../../kits/brand-crawl/reference-map.md).

## 1. Đầu vào & quyền

- [ ] Người dùng chủ động bắt đầu; privacy notice mở được trước khi quét.
- [ ] Có URL công khai hoặc đã chuyển sang nhánh nhập tay.
- [ ] Không yêu cầu đăng nhập/cookie phiên; không đọc dữ liệu sau paywall.
- [ ] Có config: UA scanner, timeout, giới hạn byte, TTL cache, data dir.

## 2. SSRF & mạng

- [ ] Chỉ `http/https`; tự thêm `https://` khi thiếu scheme.
- [ ] Chặn IP literal, localhost, `.local`, `.internal`, private/loopback/link-local/CGNAT, metadata `169.254.169.254`.
- [ ] Kiểm IP sau DNS resolve, không chỉ kiểm hostname.
- [ ] Redirect tối đa 3 hop; **mỗi hop kiểm lại** host + IP.
- [ ] Bỏ credentials khỏi URL; giới hạn port web; không log query string.

## 3. Fetch & parse

- [ ] robots.txt được đọc trước; `Disallow` → fallback, không bypass.
- [ ] Timeout tổng ≤8s; HTML ≤2MB; ảnh ≤ giới hạn riêng; manifest/CSS có giới hạn nhỏ hơn.
- [ ] Charset decode đúng (header/meta/iconv), không lỗi tiếng Việt.
- [ ] Chỉ tải CSS same-origin; tối đa 3 file; mỗi file ≤300KB.
- [ ] DOM/HTML không bị giữ lại sau parse; không ghi ra disk/log.

## 4. Logo

- [ ] Đủ thứ tự ưu tiên: header/nav → schema → apple-touch-icon → manifest → og:image → favicon → dịch vụ dự phòng.
- [ ] Tối đa 6 ứng viên, giới hạn tải song song; lỗi một ảnh không làm hỏng cả pipeline.
- [ ] Chấm điểm theo cạnh ngắn **gốc**; phạt ảnh nhỏ/tỉ lệ xấu; chọn ≥128px tốt nhất.
- [ ] SVG được rasterize; không serve SVG từ bên thứ ba; PNG same-origin.
- [ ] `quality` đúng high/medium/low; có `logoAlternatives` cho màn confirm.
- [ ] Không có logo → monogram từ tên, `isMonogram: true`, chữ tối đa 2 ký tự.

## 5. Palette

- [ ] Nguồn: pixel logo + theme-color + CSS; không chỉ lấy một nguồn.
- [ ] Gộp bằng OKLab; khử trùng; bỏ gần trắng/đen/xám khỏi primary.
- [ ] Tối đa 3 màu, role primary/accent/neutral, `source` trung thực.
- [ ] Primary ≥3,2:1; accent ≥3:1; neutral ≥4,5:1 trên nền tối.
- [ ] Không có dữ liệu → palette fallback rõ ràng, không giả là màu thương hiệu.

## 6. Trường & pre-scan

- [ ] Tên theo đúng thứ tự ưu tiên; tách hậu tố title hợp lý; ≥2 ký tự.
- [ ] Ngành dùng từ điển keyword, không dùng AI đoán; người dùng sửa được.
- [ ] Social khử trùng theo loại; chỉ kênh chính thức.
- [ ] 5 tiêu chí có score 0–10, label, evidence thật, positive = score ≥6.
- [ ] 5–8 signal, zone/severity hợp lệ; thiếu thì bổ sung "kiểm tra định kỳ".
- [ ] Pre-scan không được dùng để tính điểm act.

## 7. Fallback & lỗi

- [ ] Fallback cho: robots, HTTP 401/403/429/5xx, timeout, DNS, redirect loop, quá lớn, không phải HTML, SPA shell, logo lỗi, font/asset lỗi.
- [ ] Negative cache 10 phút cho host lỗi; không đập lại website.
- [ ] Invalid URL/SSRF trả lỗi đầu vào rõ ràng, không fetch.
- [ ] Nhập tay luôn mở; form điền sẵn domain/tên nếu có.
- [ ] Warning hiển thị dạng chip, không phải modal chặn.

## 8. Riêng tư

- [ ] Không lưu HTML, ảnh chụp trang, text đầy đủ.
- [ ] IP chỉ hash + salt; log domain + mã lỗi, không log query/PII.
- [ ] Asset có URL same-origin, cache immutable; có cơ chế xoá/ghi đè khi người dùng đổi logo.
- [ ] Thời hạn lưu scan/report/lead được ghi trong privacy và có đầu mối yêu cầu xoá.

## 9. Test tối thiểu

- [ ] SSRF: `127.0.0.1`, `169.254.169.254`, `10.0.0.1`, IPv6 loopback, redirect nội bộ.
- [ ] Fixtures: logo SVG header; chỉ favicon 32px; trang 403; SPA chỉ có meta; og:image tỉ lệ 6:1; CSS 5 màu gần giống; SVG có script; domain không tồn tại.
- [ ] Negative cache: gọi lần hai không fetch lại.
- [ ] Không trường nào trong output chứa HTML gốc.
- [ ] Latency p50 ≤4s, p95 ≤8s trên 5 domain thật.
