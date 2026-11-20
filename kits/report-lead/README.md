# Kit — Report & Lead Gate

Kit triển khai cho skill [`brand-report-gate`](../../.dsh/skills/brand-report-gate/SKILL.md): báo cáo cá nhân hoá sau khi chơi, map offer, lead gate có consent, PDF/share và bàn giao CRM/KPI.

Kit **không** chứa dữ liệu hay giá của một thương hiệu cụ thể. Offer catalog, consent text và ngưỡng KPI là input; kit cung cấp hợp đồng dữ liệu, luật gate và bản đồ nối tới code mẫu.

## Nội dung

| File | Dùng để |
|---|---|
| [contracts/report.md](contracts/report.md) | Hợp đồng object `report` (ungated/gated), scoring, insight, offer |
| [contracts/lead-gate.md](contracts/lead-gate.md) | Hợp đồng form consent/lead, validation, lưu trữ, token PDF, CRM |
| [reference-map.md](reference-map.md) | Map khái niệm → file code/docs/test cụ thể trong repo |
| [skill SKILL.md](../../.dsh/skills/brand-report-gate/SKILL.md) | Quy trình 8 bước và quality gates |
| [templates/report-outline.md](../../.dsh/skills/brand-report-gate/templates/report-outline.md) | Mẫu artifact báo cáo |
| [templates/offer-map.md](../../.dsh/skills/brand-report-gate/templates/offer-map.md) | Mẫu luật map điểm yếu → offer |

## Khi nào dùng kit này

- Đã có kết quả chơi (điểm act, overall, weak acts) và pre-scan evidence.
- Cần quyết định phần nào ungated, phần nào gated, và CTA sau báo cáo.
- Cần lead gate đúng luật (consent + đại diện), PDF token, share, leaderboard, CRM.
- Cần review luồng cuối trước launch để không bán hàng quá sớm hoặc thu dữ liệu thừa.

Không dùng khi: chưa có gameplay/scoring; chưa có catalog offer; chưa có consent text/privacy.

## Cách dùng

1. Đọc [skill](../../.dsh/skills/brand-report-gate/SKILL.md) + [lead gate checklist](../../.dsh/skills/brand-report-gate/references/lead-gate-checklist.md).
2. Chốt `report.md` contract + `offer-map` theo catalog thật.
3. Dựng ungated report trước; chỉ mở gated sau khi gate hợp lệ (xem contract lead gate).
4. Nối PDF/share/CRM theo [reference-map.md](reference-map.md).
5. Chạy quality gates; handoff funnel/CRM cho `game-launch-kpi`.

## Placeholder dùng trong kit

`{{game_title}}`, `{{brand_name}}`, `{{overall}}`, `{{weak_act}}`, `{{offer_code}}`, `{{offer_name}}`, `{{price_range}}`, `{{consent_version}}`, `{{privacy_url}}`, `{{report_id}}`, `{{booking_url}}`. Không hardcode tên thương hiệu, gói hay giá của một dự án cụ thể.

## Nguyên tắc bất biến

- **Giá trị trước:** báo cáo ungated luôn có trước; form không chặn người chơi.
- **Offer sau gate:** không offer/giá/CTA mua trước khi lead hợp lệ.
- **Consent thật:** checkbox chủ động, mặc định tắt; lưu version + thời điểm; marketing tách riêng.
- **Không bịa:** không metric/khách/đối thủ/benchmark/giá; không ký hiệu phần trăm.
- **Không PII** trong share/PDF công khai/leaderboard/analytics/log.
- **Server tính lại điểm**, không tin điểm client; PDF token HMAC có hạn.
- **CRM có trạng thái + retry**, không mất lead khi webhook lỗi.

## Kiểm tra nhanh trước handoff

- [ ] Ungated đủ giá trị, không có giá/form; gate mở bằng hành động chủ động.
- [ ] Consent + đại diện bắt buộc; marketing tuỳ chọn; honeypot hoạt động.
- [ ] Insight 3 cái, không bịa, có evidence + action.
- [ ] Offer tối đa 2, map đúng luật, chỉ hiện sau gate.
- [ ] PDF 3 trang font tiếng Việt; share không PII; token hết hạn.
- [ ] CRM payload đủ status/snapshot; event funnel đầy đủ.
