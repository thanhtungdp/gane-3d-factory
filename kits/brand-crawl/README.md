# Kit — Brand Crawl → Brand Kit

Kit triển khai cho skill [`brand-crawl-to-kit`](../../.dsh/skills/brand-crawl-to-kit/SKILL.md): biến một website công khai (hoặc thông tin nhập tay) thành brand kit + pre-scan evidence có bằng chứng thật, dùng được cho game thương hiệu.

Kit **không** chứa dữ liệu của một thương hiệu cụ thể. Nó chứa hợp đồng dữ liệu, luật chất lượng và bản đồ nối tới code mẫu trong repo này.

## Nội dung

| File | Dùng để |
|---|---|
| [contracts/brand-kit.md](contracts/brand-kit.md) | Hợp đồng dữ liệu cho brand kit (field, kiểu, ràng buộc, provenance) |
| [contracts/pre-scan.md](contracts/pre-scan.md) | Hợp đồng pre-scan: 5 tiêu chí, evidence, signal, reality check |
| [reference-map.md](reference-map.md) | Map khái niệm → file code/docs/test cụ thể trong repo |
| [skill SKILL.md](../../.dsh/skills/brand-crawl-to-kit/SKILL.md) | Quy trình 9 bước và quality gates |
| [templates/brand-kit.md](../../.dsh/skills/brand-crawl-to-kit/templates/brand-kit.md) | Mẫu artifact để điền |
| [templates/pre-scan.md](../../.dsh/skills/brand-crawl-to-kit/templates/pre-scan.md) | Mẫu artifact pre-scan |

## Khi nào dùng kit này

- Cần cá nhân hoá game bằng dữ liệu thật của thương hiệu.
- Có URL công khai hoặc người dùng chọn nhập tay.
- Cần pre-scan evidence cho reality check, tín hiệu mở đầu và báo cáo cuối.
- Cần một pipeline có SSRF guard, robots, cache, fallback và giới hạn tài nguyên rõ ràng.

Không dùng khi: chỉ cần placeholder cho prototype; cần dữ liệu sau đăng nhập/paywall; hoặc muốn chụp ảnh toàn trang.

## Cách dùng

1. Đọc [skill](../../.dsh/skills/brand-crawl-to-kit/SKILL.md) + [crawl checklist](../../.dsh/skills/brand-crawl-to-kit/references/crawl-checklist.md).
2. Chọn implementation theo [reference-map.md](reference-map.md); nếu repo khác, giữ nguyên contract và thay lớp adapter crawl.
3. Điền [brand-kit](../../.dsh/skills/brand-crawl-to-kit/templates/brand-kit.md) + [pre-scan](../../.dsh/skills/brand-crawl-to-kit/templates/pre-scan.md).
4. Chạy quality gates ở skill. Không handoff nếu thiếu tên hoặc không có ít nhất một màu.
5. Bàn giao brand kit cho `brand-3d-world` / `brand-game-loop`, pre-scan cho `brand-report-gate`.

## Placeholder dùng trong kit

`{{brand_url}}`, `{{brand_name}}`, `{{brand_logo}}`, `{{industry}}`, `{{target_criteria}}`, `{{scan_id}}`, `{{confidence}}`, `{{data_dir}}`. Không hardcode tên thương hiệu, màu, trạm/act hay nhân vật của một game cụ thể.

## Nguyên tắc bất biến

- Chỉ đọc dữ liệu công khai; tôn trọng robots.txt; không đăng nhập, không vượt paywall.
- Mỗi bước có fallback riêng; lỗi logo không làm hỏng crawl; lỗi crawl không chặn người chơi.
- Không bịa trường/evidence; thiếu thì warning + fallback.
- Không lưu nội dung trang, ảnh chụp trang hay text đầy đủ; IP chỉ hash.
- Logo hiển thị là PNG same-origin; SVG được rasterize.
- Pre-scan không quyết định điểm act; chỉ làm evidence/reality check.
- Người dùng luôn sửa được brand kit ở màn xác nhận.

## Kiểm tra nhanh trước handoff

- [ ] Có `brand-kit.md` + `pre-scan.md` đúng contract.
- [ ] Mỗi trường có nguồn; warning cho phần thiếu.
- [ ] Không có HTML/DOM/text trang trong artifact.
- [ ] Pre-scan có 5 tiêu chí + 5–8 signal; evidence đọc được.
- [ ] Logo ≥128px hoặc có warning monogram; palette tối thiểu 2 màu và tương phản.
