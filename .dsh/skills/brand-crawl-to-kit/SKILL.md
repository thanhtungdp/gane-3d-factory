---
name: brand-crawl-to-kit
description: Use when turning a public website or manual brand input into a brand kit and pre-scan evidence for a personalized game.
---

# Brand Crawl → Brand Kit

Chuyển một website công khai (hoặc thông tin nhập tay) thành **brand kit dùng được** và **pre-scan evidence** cho game cá nhân hoá. Kết quả phải có nguồn gốc rõ ràng, có cảnh báo khi thiếu, và luôn có đường dự phòng để người chơi không bị chặn.

Nguyên tắc: chỉ đọc dữ liệu công khai; mỗi bước có fallback riêng; không bịa dữ liệu; không lưu nội dung trang.

## When to use

- Game cần cá nhân hoá bằng dữ liệu thật của thương hiệu: tên, logo, màu, mô tả, ngành, social, mobile.
- Có URL website công khai, hoặc người dùng chọn nhập tay vì chưa có website.
- Cần pre-scan evidence cho màn xác nhận, cho reality check của phần chơi, hoặc cho báo cáo cuối.
- Cần dựng brand kit tối thiểu khi website chặn bot, lỗi mạng, hoặc là trang render client.

Không dùng khi: chỉ cần placeholder cho prototype; cần dữ liệu sau đăng nhập/paywall/nội bộ; hoặc cần chụp ảnh toàn trang.

## Inputs

| Input | Bắt buộc | Ghi chú |
|---|---|---|
| `{{brand_url}}` | Một trong hai | Chuẩn hoá trước khi dùng; bỏ tracking query |
| `{{brand_name}}` nhập tay | Một trong hai | Có thể kèm `{{industry}}` do người dùng chọn |
| `{{brand_logo}}` | Không | Upload ≤2MB; PNG/JPEG/WebP/SVG/GIF/AVIF |
| `{{target_criteria}}` | Không | Mặc định 5 tiêu chí: logo, color, slogan, social, mobile |
| `{{consent_privacy}}` | Có | Người dùng chủ động bắt đầu; link privacy hiển thị trước khi quét |
| `{{crawl_config}}` | Có | UA scanner, timeout 8s, HTML ≤2MB, cache TTL, data dir |

Nếu thiếu cả URL lẫn tên: dừng, xin tên tối thiểu. Nếu người dùng chưa đồng ý/không thấy privacy: không fetch.

## Steps

1. **Chuẩn hoá và guard.** Trim URL; thêm `https://` nếu thiếu scheme; lowercase host, bỏ `www`, punycode; bỏ credentials. Chặn scheme lạ, IP literal, localhost, `.local`/`.internal`, dải private/loopback/link-local/CGNAT và metadata. Giới hạn port web; resolve DNS và kiểm lại IP trước khi kết nối; redirect tối đa 3 hop và **kiểm SSRF lại từng hop**.
2. **Kiểm tra quyền đọc.** Fetch `robots.txt` bằng UA scanner. `Disallow` trang chủ → không fetch HTML, chuyển fallback/manual kèm warning. Không bypass, không đăng nhập, không dùng cookie phiên.
3. **Cache và ngân sách.** Key = URL đã chuẩn hoá; cache kết quả 24h trong memory + file; negative cache 10 phút cho host vừa lỗi. Fetch HTML timeout 8s, tối đa 2MB; decode charset từ header/meta bằng iconv; HTML lớn hơn ngưỡng → fallback.
4. **Parse.** Dùng cheerio đọc `<title>`, meta, JSON-LD schema, heading, `<link>` icon/manifest/stylesheet, `<img>`/`<svg>` trong header/nav, social link ở footer. Chỉ tải CSS same-origin (tối đa 3 file, mỗi file ≤300KB) và manifest nếu có. Không giữ DOM/HTML sau bước này.
5. **Trường thương hiệu.** `name`: schema → `og:site_name` → `application-name` → title (tách theo `|`, `–`, `—`, `-`, ưu tiên phần khớp domain) → `h1` → domain. `description`/`tagline`: schema/meta, cắt ngắn. `industry`: từ điển keyword tiếng Việt trên tên + title + mô tả + heading (không dùng AI đoán); người dùng sửa được. `socials`: facebook, zalo, tiktok, linkedin, youtube, khử trùng theo loại, tối đa 8. `mobile`: viewport + CSS responsive.
6. **Logo.** Thu ứng viên theo thứ tự: header/nav img-svg → schema logo → apple-touch-icon → manifest icons → `og:image` → favicon lớn nhất → dịch vụ favicon dự phòng. Tải tối đa 6 ứng viên, giới hạn song song 3. Chấm điểm theo nguồn, cạnh ngắn **kích thước gốc** (không bị upscale đánh lừa), tỉ lệ khung; chọn ảnh ≥128px tốt nhất. SVG phải rasterize qua sharp, không serve SVG bên thứ ba. Chuẩn hoá PNG cạnh dài 512, lưu same-origin `/assets/…`, giữ 2–3 `logoAlternatives`.
7. **Palette.** Lấy màu từ pixel logo (bỏ alpha thấp/trắng/đen), `theme-color`, CSS same-origin. Gộp trong **OKLab**, khử trùng, ưu tiên màu có sắc; trả tối đa 3 màu với `role` primary/accent/neutral và `source` (logo/theme/css/manual/fallback). Kiểm tương phản trên nền tối (primary ≥3,2:1; accent ≥3:1; neutral ≥4,5:1) và chỉnh nhẹ độ sáng nếu cần. Không có dữ liệu → palette fallback có chủ đích.
8. **Pre-scan.** Chấm 5 tiêu chí 0–10 kèm `label`, `evidence` lấy từ dữ liệu thật và `positive = score ≥ 6`. Sinh 5–8 signal với 4 zone (`internal`, `market`, `competitor`, `identity`) và 3 severity (`gap`, `watch`, `strength`); thiếu signal thì bổ sung bộ "kiểm tra định kỳ". Pre-scan **không** quyết định điểm act; nó chỉ làm evidence, reality check và chất liệu báo cáo.
9. **Fallback, cảnh báo, bàn giao.** Không logo ≥128px → monogram từ tên (tối đa 2 ký tự, bỏ dấu), `isMonogram: true`. Crawl lỗi/robots/HTTP 4xx-5xx → brand kit tối thiểu từ tên/domain + pre-scan trung tính + warning rõ, `source: "fallback"`. Nhập tay → `source: "manual"` và vẫn chấm pre-scan trên dữ liệu có. Luôn cho người dùng sửa ở màn xác nhận trước khi handoff.

## Outputs

- `brand-kit.md` theo [contract brand-kit](../../../kits/brand-crawl/contracts/brand-kit.md), dùng [template brand-kit](templates/brand-kit.md).
- `pre-scan.md` theo [contract pre-scan](../../../kits/brand-crawl/contracts/pre-scan.md), dùng [template pre-scan](templates/pre-scan.md).
- Metadata trả về: `{{scan_id}}`, `source` (`url`/`manual`/`fallback`), `confidence` (`high`/`medium`/`low`), `warnings[]`, `cached`.
- Không output HTML, ảnh chụp trang, danh sách text đầy đủ hay bất kỳ nội dung nào của website.

## Quality gates

**Cứng — dừng nếu vi phạm:**

- SSRF guard, robots.txt, timeout 8s và giới hạn 2MB được enforce **trước** khi đọc nội dung; redirect kiểm lại từng hop.
- Không đăng nhập, không vượt paywall/robots, không dùng credential hay cookie của người dùng.
- Không lưu/không log secret, token, cookie hay header Authorization; URL log đã bỏ query string.
- Không bịa trường nào; thiếu dữ liệu thì ghi warning + fallback, không suy diễn thành "sự thật".
- Logo hiển thị phải là PNG same-origin; SVG được rasterize; ảnh <128px phải kèm warning.
- Không lưu nội dung trang/ảnh chụp; IP chỉ lưu dạng hash + salt; log không chứa query token, không log tên/liên hệ.
- Có consent trước khi quét; nêu rõ mục đích, thời hạn lưu và cách yêu cầu xoá.
- Mọi nhánh lỗi đều có đường ra: monogram, palette fallback, pre-scan trung tính, nhập tay.

**Mềm — review trước launch:**

- p50 ≤4s, p95 ≤8s; tỉ lệ có brand kit dùng được ≥80/100 domain phổ thông.
- Tên không rỗng, tối thiểu 2 màu, evidence đọc được bởi người không kỹ thuật.
- `confidence` phản ánh đúng nguồn: `high` = URL + logo chất lượng cao + ≥3 trường; `low` = fallback/monogram.

## Handoff

- `brand-kit.md` → `brand-3d-world` để dựng nhận diện/hình ảnh, và `brand-game-loop` để chọn evidence key cho câu diagnosis.
- `pre-scan.md` → `brand-report-gate` làm bằng chứng, reality check và chất liệu báo cáo.
- Màn xác nhận của game phải cho sửa toàn bộ; giữ `logoAlternatives` để người dùng đổi logo.
- Dừng nếu chưa có tên thương hiệu và chưa có URL; không handoff brand kit rỗng.

## References

- [Kit brand-crawl](../../../kits/brand-crawl/README.md) và [reference map](../../../kits/brand-crawl/reference-map.md).
- [Checklist crawl](references/crawl-checklist.md).
- [Shared quality gates](../_shared/quality-gates.md) và [output contracts](../_shared/output-contracts.md).
- [Glossary](../_shared/glossary.md) cho nghĩa pre-scan, evidence, lead gate.
