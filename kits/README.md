# Kits

Kit là template/reference copy được cho dự án game mới. Không phải package npm, không chứa story hiện tại.

| Kit | Dùng cho | Trạng thái |
|---|---|---|
| `game-shell` | screen flow, intro gate, audio director, dock, viewport | Thin templates |
| `mobile-cockpit` | one-question sheet, cockpit CSS, UX checklist | Thin templates |
| `qa-playwright` | viewport/CTA/no-scroll/copy tests | Test templates |
| `brand-crawl` | brand kit + pre-scan contract | Contract + map |
| `three-world` | scene brief, quality tiers, motion | Contract + map |
| `audio` | sound cue taxonomy, mix rules, reference map | Contract + map |
| `report-lead` | report outline, lead gate, offer mapping | Contract + map |

## Cách dùng

1. Đọc `SKILL.md` tương ứng trong `.dsh/skills/`.
2. Copy template cần thiết, bỏ hậu tố `.template`.
3. Thay placeholder; giữ contract.
4. Chạy `npm run skills:check` và `npm test` của dự án mới.

## Không copy

- Nội dung/story hiện tại.
- Asset/khách hàng/API key.
- Logic scoring/report đặc thù nếu dự án mới có thang khác.
