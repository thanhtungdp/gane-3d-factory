# Brand Kit — {{brand_name}}

> Artifact của skill `brand-crawl-to-kit`. Chỉ chứa dữ liệu suy ra từ website/nhập tay; không dán HTML, không dán nội dung trang, không dán ảnh chụp.

## 1. Nguồn & độ tin cậy

| Trường | Giá trị |
|---|---|
| `scan_id` | `{{scan_id}}` |
| `source` | `{{url \| manual \| fallback}}` |
| `confidence` | `{{high \| medium \| low}}` |
| `fetched_at` | `{{iso_time}}` |
| `cached` | `{{true \| false}}` |

**Warnings:** {{liệt kê từng warning trên một dòng; rỗng thì ghi "không có"}}

## 2. Định danh

| Trường | Giá trị | Nguồn lấy |
|---|---|---|
| Tên | {{brand_name}} | {{schema / og:site_name / title / h1 / domain / manual}} |
| Domain | {{domain}} | {{url}} |
| Ngành | {{industry}} | {{từ điển keyword / người dùng chọn}} |
| Mô tả | {{description ≤280 ký tự}} | {{meta / schema / manual}} |
| Tagline | {{tagline ≤160 ký tự}} | {{schema / meta / hero / manual}} |

## 3. Logo

| Vai trò | `id` / URL | Kích thước | Nguồn | Quality | Monogram |
|---|---|---|---|---|---|
| Chính | `{{id}}` · `/assets/{{id}}` | {{w}}×{{h}} | {{header/schema/apple/manifest/og/favicon/manual}} | {{high/medium/low/none}} | {{true/false}} |
| Thay thế 1 | `{{...}}` | | | | |
| Thay thế 2 | `{{...}}` | | | | |

- Có cạnh ngắn ≥128px? {{có/không}}. Nếu không: warning "logo nhỏ hơn 128px — cần xác nhận ở màn confirm".
- File hiển thị là PNG same-origin; SVG đã được rasterize: {{có/không áp dụng}}.
- Nếu dùng monogram: lý do {{không tìm thấy logo / logo lỗi / người dùng chọn}}, chữ {{ký tự}}.

## 4. Palette

| Hex | Role | Source | Tương phản trên nền tối |
|---|---|---|---|
| `{{#hex}}` | primary | {{logo/theme/css/manual/fallback}} | {{ratio}}:1 |
| `{{#hex}}` | accent | {{...}} | {{ratio}}:1 |
| `{{#hex}}` | neutral | {{...}} | {{ratio}}:1 |

- Có `theme-color`? {{có/không}}.
- Palette lấy từ CSS? {{số file / số màu gộp}}; đã khử trùng OKLab: {{có}}.
- Người dùng đã sửa màu? {{có/không}} — nếu có, `source: "manual"`.

## 5. Kênh & mobile

| Kênh | URL |
|---|---|
| Facebook | {{url}} |
| Zalo | {{url}} |
| TikTok | {{url}} |
| LinkedIn | {{url}} |
| YouTube | {{url}} |

- Có meta viewport: {{có/không}}.
- Có CSS responsive đọc được: {{có/không}}.
- `mobileFriendly`: {{true/false}}.

## 6. Cần xác nhận ở màn confirm

- [ ] Tên đúng cách viết thương hiệu.
- [ ] Logo đúng (hoặc chọn từ `logoAlternatives`).
- [ ] Đủ 2–3 màu; role primary/accent hợp lý.
- [ ] Ngành đúng (người dùng sửa được).
- [ ] Social chỉ gồm kênh chính thức.

## 7. Kiểm tra trước handoff

- [ ] Không có trường nào bị bịa; trường thiếu đã ghi warning.
- [ ] Không còn HTML/DOM/text đầy đủ của trang trong artifact.
- [ ] `{{scan_id}}` còn hạn để report gate lấy lại pre-scan.
- [ ] Người dùng đã xác nhận ở màn confirm (hoặc chấp nhận nhập tay).
