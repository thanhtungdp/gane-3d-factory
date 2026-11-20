# Reference map — brand-crawl kit

Nối từng khái niệm của kit/skill với file thật trong repo này. Đường dẫn tính từ `kits/brand-crawl/`.

## 1. Pipeline

| Khái niệm | Code | Ghi chú |
|---|---|---|
| Orchestrator scan → brand kit | [`server/crawl/index.ts`](../../server/crawl/index.ts) | cache, manual/fallback, warnings, gọi logo + palette + pre-scan |
| Chuẩn hoá URL + SSRF guard | [`server/crawl/ssrf.ts`](../../server/crawl/ssrf.ts) | IP literal/dải private, DNS lookup guard, port, credentials |
| Fetch an toàn | [`server/crawl/fetch.ts`](../../server/crawl/fetch.ts) | timeout 8s, giới hạn byte, redirect từng hop, charset iconv |
| robots.txt | [`server/crawl/robots.ts`](../../server/crawl/robots.ts) | UA scanner; disallow → fallback |
| Parse HTML | [`server/crawl/parse.ts`](../../server/crawl/parse.ts) | cheerio, schema.org, meta, icon, social, mobile, title/name |
| Logo pipeline | [`server/crawl/logo.ts`](../../server/crawl/logo.ts) | priority 8 nguồn, chấm điểm, chọn ≥128px, alternatives |
| Palette OKLab | [`server/crawl/palette.ts`](../../server/crawl/palette.ts) | gộp màu, khử trùng, tương phản nền tối |
| Pre-scan + signal | [`server/crawl/prescan.ts`](../../server/crawl/prescan.ts) | 5 criteria, 4 zone, 3 severity, periodic fallback |
| Monogram fallback | [`server/crawl/monogram.ts`](../../server/crawl/monogram.ts) | SVG → PNG; initials từ tên |
| Cache 24h / negative 10m | [`server/crawl/cache.ts`](../../server/crawl/cache.ts) | memory + file, getById cho report |
| Nhận diện ngành | [`server/crawl/industry.ts`](../../server/crawl/industry.ts) | từ điển keyword tiếng Việt |
| Lưu asset PNG | [`server/storage/assets.ts`](../../server/storage/assets.ts) | hash id, URL `/api/assets/{{id}}` immutable |
| Config env/limit | [`server/config.ts`](../../server/config.ts) | timeout, byte limit, TTL, UA, data dir |
| API scan/logo | [`server/app.ts`](../../server/app.ts) | `POST /api/scan`, `POST /api/logo`, `GET /api/assets/:id` |

## 2. Hợp đồng dữ liệu

| Contract | Nguồn thật | Ghi chú |
|---|---|---|
| Brand kit | [`src/shared/types.ts`](../../src/shared/types.ts) — `BrandProfile`, `BrandLogo`, `BrandColor`, `SocialLink` | client ↔ server |
| Scan result | [`src/shared/types.ts`](../../src/shared/types.ts) — `ScanResult`, `ScanRequest`, `ScanSource` | `source` url/manual/fallback |
| Pre-scan | [`src/shared/types.ts`](../../src/shared/types.ts) — `PreScan`, `PreScanCriterion`, `ScanSignal` | criteria/signals/evidence |
| Request validation | [`src/shared/api.ts`](../../src/shared/api.ts) — `scanRequestSchema`, `createSessionSchema` | zod; palette 1–5 màu |
| Brand kit contract | [contracts/brand-kit.md](contracts/brand-kit.md) | artifact-level |
| Pre-scan contract | [contracts/pre-scan.md](contracts/pre-scan.md) | artifact-level |
| Người dùng sửa brand | [`src/screens/ConfirmScreen.tsx`](../../src/screens/ConfirmScreen.tsx) | đổi tên/logo/màu/ngành/social |

## 3. Tài liệu case study

| Nội dung | Tài liệu |
|---|---|
| Luồng, mục tiêu, latency | [`docs/02-crawl.md`](../../docs/02-crawl.md) §1–§2, §9 |
| SSRF, robots, giới hạn | [`docs/02-crawl.md`](../../docs/02-crawl.md) §3 |
| Logo priority + xử lý ảnh | [`docs/02-crawl.md`](../../docs/02-crawl.md) §4 |
| Thuật toán màu OKLab | [`docs/02-crawl.md`](../../docs/02-crawl.md) §5 |
| Tên/ngành/slogan/social/mobile | [`docs/02-crawl.md`](../../docs/02-crawl.md) §6 |
| Pre-scan 5 tiêu chí + signal | [`docs/02-crawl.md`](../../docs/02-crawl.md) §7 |
| Bảng lỗi – fallback | [`docs/02-crawl.md`](../../docs/02-crawl.md) §8 |
| Cache + riêng tư | [`docs/02-crawl.md`](../../docs/02-crawl.md) §10–§11 |
| Nhập tay | [`docs/02-crawl.md`](../../docs/02-crawl.md) §12 |
| Kiểm thử & fixtures | [`docs/02-crawl.md`](../../docs/02-crawl.md) §13 |

## 4. Test mẫu

| Vùng | File |
|---|---|
| SSRF + redirect | [`tests/server/ssrf.test.ts`](../../tests/server/ssrf.test.ts) |
| robots.txt | [`tests/server/robots.test.ts`](../../tests/server/robots.test.ts) |
| Parse HTML/meta/schema | [`tests/server/parse.test.ts`](../../tests/server/parse.test.ts) |
| Logo priority/SVG/fallback | [`tests/server/logo.test.ts`](../../tests/server/logo.test.ts) |
| Palette OKLab/contrast | [`tests/server/palette.test.ts`](../../tests/server/palette.test.ts) |
| Pre-scan/signal | [`tests/server/prescan.test.ts`](../../tests/server/prescan.test.ts) |
| Crawl end-to-end fixture | [`tests/server/crawl.test.ts`](../../tests/server/crawl.test.ts) |
| API scan → session → report | [`tests/server/api.test.ts`](../../tests/server/api.test.ts) |
| Fixtures HTML/CSS/logo/robots | [`tests/fixtures/`](../../tests/fixtures/) |

## 5. Skill & checklist

- [`brand-crawl-to-kit` SKILL.md](../../.dsh/skills/brand-crawl-to-kit/SKILL.md)
- [Crawl checklist](../../.dsh/skills/brand-crawl-to-kit/references/crawl-checklist.md)
- [Brand kit template](../../.dsh/skills/brand-crawl-to-kit/templates/brand-kit.md)
- [Pre-scan template](../../.dsh/skills/brand-crawl-to-kit/templates/pre-scan.md)
- [Shared quality gates](../../.dsh/skills/_shared/quality-gates.md)
