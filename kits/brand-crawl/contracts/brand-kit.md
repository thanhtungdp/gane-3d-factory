# Contract — `brand-kit.md`

Hợp đồng dữ liệu giữa bước crawl/nhập tay và các bước dùng brand kit (3D, game loop, report gate). Artifact theo mẫu [brand-kit template](../../../.dsh/skills/brand-crawl-to-kit/templates/brand-kit.md).

## Cấu trúc

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `scan_id` | string | Có | ID tra cứu pre-scan/report; không tái sử dụng giữa các lần quét |
| `source` | `url` \| `manual` \| `fallback` | Có | Cho biết dữ liệu đến từ đâu |
| `confidence` | `high` \| `medium` \| `low` | Có | `high`: URL + logo chất lượng cao + ≥3 trường; `low`: fallback/monogram |
| `fetched_at` | ISO-8601 | Có | Thời điểm quét/ghi nhận |
| `cached` | boolean | Có | `true` khi trả từ cache TTL |
| `warnings` | string[] | Có | Rỗng nếu không có; mỗi warning nói rõ người chơi nên làm gì |
| `brand.name` | string | Có | 2–120 ký tự; theo thứ tự ưu tiên tên |
| `brand.domain` | string | Không | Host đã bỏ `www`; có thể rỗng với nhập tay |
| `brand.description` | string | Không | ≤280 ký tự; lấy từ meta/schema, không tự viết |
| `brand.tagline` | string | Không | ≤160 ký tự; không trùng tên |
| `brand.industry` | string | Không | Ngành người dùng sửa được; không dùng AI đoán |
| `brand.logo` | object \| null | Có | Logo chính; `null` chỉ khi không tạo được cả monogram |
| `brand.logoAlternatives` | object[] | Có | 0–3 logo thay thế cho màn confirm |
| `brand.palette` | object[] | Có | 1–5 màu; UI dùng 3; role primary/accent/neutral |
| `brand.socials` | object[] | Có | 0–8 kênh; khử trùng theo loại |

### `logo`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `id` | string | ID asset; URL same-origin `/assets/{{id}}` |
| `url` | string | Same-origin; không hotlink; PNG (SVG đã rasterize) |
| `width`, `height` | number | Kích thước PNG sau chuẩn hoá |
| `source` | string | Nguồn: header/schema/apple/manifest/og/favicon/manual |
| `quality` | `high` \| `medium` \| `low` \| `none` | high ≥256, medium ≥128, low <128, none = monogram |
| `isMonogram` | boolean? | `true` khi là monogram từ tên |

### `palette[]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `hex` | `#rrggbb` | Hợp lệ; đã chỉnh tương phản trên nền tối |
| `role` | `primary` \| `accent` \| `neutral` | Primary/accent phải đủ tương phản ≥3:1; neutral ≥4,5:1 |
| `source` | `logo` \| `css` \| `theme` \| `manual` \| `fallback` | Trung thực; `manual` khi người dùng sửa |

### `socials[]`

| Field | Kiểu | Ràng buộc |
|---|---|---|
| `type` | `facebook` \| `zalo` \| `tiktok` \| `linkedin` \| `youtube` \| `other` | Mỗi loại tối đa 1 link đại diện |
| `url` | string | `http(s)`, URL tuyệt đối, đã bỏ tracking nếu cần |

## Bất biến

1. Không có HTML, DOM, ảnh chụp trang hay text đầy đủ của website trong artifact hoặc log.
2. Mọi trường phải có nguồn thật; trường thiếu ghi `warnings`, không suy diễn thành sự thật.
3. Logo hiển thị luôn là asset same-origin; không serve SVG bên thứ ba.
4. Không lưu thông tin đăng nhập/cookie/IP thô; IP chỉ hash + salt.
5. Brand kit là dữ liệu **có thể sửa**; màn confirm cho phép đổi tên, logo, màu, ngành, social.
6. Cache key là URL đã chuẩn hoá; cache không chứa nội dung trang.

## Ví dụ tối thiểu (generic)

```yaml
scan_id: "{{scan_id}}"
source: url
confidence: medium
fetched_at: "{{iso_time}}"
cached: false
warnings:
  - "Logo tìm thấy nhỏ hơn 128px — cần xác nhận ở màn confirm."
brand:
  name: "{{brand_name}}"
  domain: "{{domain}}"
  description: "{{description}}"
  industry: "{{industry}}"
  logo:
    id: "{{asset_id}}"
    url: "/assets/{{asset_id}}"
    width: 512
    height: 171
    source: header
    quality: medium
  logoAlternatives: []
  palette:
    - { hex: "#1f4fa0", role: primary, source: logo }
    - { hex: "#f2a33c", role: accent, source: css }
  socials:
    - { type: facebook, url: "https://facebook.com/{{page}}" }
```

## Validation

- [ ] Đủ field bắt buộc; đúng kiểu; `hex` hợp lệ; `logo.url` same-origin.
- [ ] `quality` khớp kích thước; monogram có `isMonogram: true`.
- [ ] Palette 1–5 màu; role/source thuộc enum.
- [ ] `warnings` phản ánh đúng phần thiếu.
- [ ] Không có chuỗi HTML (`<div`, `<script`, `<!doctype`) trong bất kỳ field nào.
- [ ] Nếu `source` là `fallback`: brand tối thiểu + pre-scan trung tính được tham chiếu.
