# Reference map — report & lead gate kit

Nối từng khái niệm của kit/skill với file thật trong repo này. Đường dẫn tính từ `kits/report-lead/`.

## 1. Báo cáo & scoring

| Khái niệm | Code | Ghi chú |
|---|---|---|
| Tạo report server-side | [`server/report/build.ts`](../../server/report/build.ts) | recompute điểm, `weaknesses`, `recommendOffers`, insight |
| Nội dung act cho scoring | [`server/report/content.ts`](../../server/report/content.ts) | lấy content thật; fallback derive từ records khi dev |
| Công thức điểm / title / weak | [`src/shared/scoring.ts`](../../src/shared/scoring.ts) | `scorePlanet`, `buildRunResult`, `weaknessesFor`, reality check |
| Catalog + map offer | [`src/shared/offers.ts`](../../src/shared/offers.ts) | `SERVICE_PACKAGES`, `recommendOffers`, `why` |
| Insight contract + template | [`src/shared/insights.ts`](../../src/shared/insights.ts) | 3 insight deterministic, không %, không giá |
| Kiểu report | [`src/shared/types.ts`](../../src/shared/types.ts) — `Report`, `RunResult`, `WeakStep`, `Offer`, `AiInsight` | client ↔ server |
| Report contract | [contracts/report.md](contracts/report.md) | artifact-level |

## 2. Giao diện báo cáo & gate

| Khái niệm | Code | Ghi chú |
|---|---|---|
| Render báo cáo, ungated/gated | [`src/screens/ReportView.tsx`](../../src/screens/ReportView.tsx) | radar, weak, insight, offer khoá/mở |
| Luồng report → gate → PDF | [`src/screens/ReportScreen.tsx`](../../src/screens/ReportScreen.tsx) | `leadUnlocked`, `openPdf`, share, leaderboard opt-in |
| Form lead + consent | [`src/screens/LeadSheet.tsx`](../../src/screens/LeadSheet.tsx) | validate client, checkbox đại diện/consent/marketing |
| Báo cáo public từ link | [`src/screens/PublicReportScreen.tsx`](../../src/screens/PublicReportScreen.tsx) | fetch report id, không lộ PII |
| Leaderboard | [`src/screens/LeaderboardScreen.tsx`](../../src/screens/LeaderboardScreen.tsx) | alias, ẩn danh |
| Copy pháp lý/consent | [`src/config/legal.ts`](../../src/config/legal.ts) | privacy, consent label, đại diện |
| API client cho gate/PDF | [`src/lib/api.ts`](../../src/lib/api.ts) | `submitLead`, `pdfUrl`, `fetchReport` |
| Analytics funnel | [`src/lib/analytics.ts`](../../src/lib/analytics.ts) | event không PII |

## 3. Server: lead, PDF, CRM

| Khái niệm | Code | Ghi chú |
|---|---|---|
| API routes | [`server/app.ts`](../../server/app.ts) | `/api/reports`, `/api/leads`, `/api/reports/:id/pdf`, `/api/leaderboard`, `/api/events` |
| Validate lead | [`src/shared/api.ts`](../../src/shared/api.ts) — `leadSchema` | phone/email/honeypot/consent |
| PDF 3 trang + font | [`server/pdf/report.ts`](../../server/pdf/report.ts) | cover, radar, weak + offer + QR |
| Token PDF HMAC | [`server/pdf/token.ts`](../../server/pdf/token.ts) | issue/verify, TTL |
| Font tiếng Việt | [`server/pdf/fonts.ts`](../../server/pdf/fonts.ts) | vendor font + fallback |
| CRM outbox | [`server/crm/outbox.ts`](../../server/crm/outbox.ts) | HMAC, retry backoff, dead-letter, CSV escape |
| DB lead/report/event | [`server/db/index.ts`](../../server/db/index.ts) | `leads.status`, snapshot offer/overall/industry/size/role, IP hash |
| Insight AI/fallback | [`server/ai/insights.ts`](../../server/ai/insights.ts) | DeepSeek JSON mode, cache, template fallback |
| Lead gate contract | [contracts/lead-gate.md](contracts/lead-gate.md) | artifact-level |

## 4. Tài liệu case study

| Nội dung | Tài liệu |
|---|---|
| Công thức điểm, title, weak, offer map, insight, gate/PDF/share | [`docs/04-scoring-offers.md`](../../docs/04-scoring-offers.md) §1–§11 |
| Luồng report → gate → full report | [`docs/05-user-flow.md`](../../docs/05-user-flow.md) §4.9–§4.10, §6 |
| Mobile QA báo cáo/gate/PDF | [`docs/09-mobile-qa.md`](../../docs/09-mobile-qa.md) §6.10–§6.12, §8 |
| Event, phễu, trạng thái CRM, SLA | [`docs/10-kpi.md`](../../docs/10-kpi.md) §3, §6 |
| API/DB/schema đầy đủ | [`docs/07-architecture.md`](../../docs/07-architecture.md) §6–§7 |

## 5. Test mẫu

| Vùng | File |
|---|---|
| Scoring → report → offer | [`tests/server/report.test.ts`](../../tests/server/report.test.ts) |
| API flow session → report → lead → PDF | [`tests/server/api.test.ts`](../../tests/server/api.test.ts) |
| PDF buffer + token | [`tests/server/pdf.test.ts`](../../tests/server/pdf.test.ts) |
| CRM outbox + CSV escape | [`tests/server/crm.test.ts`](../../tests/server/crm.test.ts) |
| AI insight fallback/validation | [`tests/server/ai.test.ts`](../../tests/server/ai.test.ts) |
| Lead zod validation | [`tests/server/lead.test.ts`](../../tests/server/lead.test.ts) |

## 6. Skill & checklist

- [`brand-report-gate` SKILL.md](../../.dsh/skills/brand-report-gate/SKILL.md)
- [Lead gate checklist](../../.dsh/skills/brand-report-gate/references/lead-gate-checklist.md)
- [Report outline template](../../.dsh/skills/brand-report-gate/templates/report-outline.md)
- [Offer map template](../../.dsh/skills/brand-report-gate/templates/offer-map.md)
- [Shared quality gates](../../.dsh/skills/_shared/quality-gates.md), [output contracts](../../.dsh/skills/_shared/output-contracts.md)
- Skill kế tiếp: `game-launch-kpi`
