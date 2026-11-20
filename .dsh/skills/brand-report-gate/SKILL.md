---
name: brand-report-gate
description: Use when designing the personalized end report, offer mapping, consent/lead gate, PDF/share, and CRM handoff for a brand game.
---

# Brand Report & Lead Gate

Thiết kế phần kết của game: báo cáo cá nhân hoá từ kết quả chơi + evidence, map sang offer, lead gate có consent, PDF/share và bàn giao CRM. Nguyên tắc xuyên suốt: **đưa giá trị trước, xin dữ liệu sau, chỉ bán sau khi có consent**.

## When to use

- Game đã có kết quả act, điểm tổng, evidence pre-scan và cần báo cáo cuối cho người chơi.
- Cần quyết định phần nào mở miễn phí, phần nào khoá sau gate, và map điểm yếu sang offer.
- Cần thiết kế form consent/lead, PDF, thẻ share, leaderboard và payload CRM.
- Cần review luồng cuối trước launch để tránh bán hàng quá sớm hoặc thu dữ liệu thừa.

Không dùng khi: chưa có gameplay/scoring (quay lại `brand-game-loop`); chưa có catalog offer hoặc chưa có văn bản pháp lý/consent.

## Inputs

| Input | Bắt buộc | Ghi chú |
|---|---|---|
| `{{game_result}}` | Có | Điểm từng act, overall 0–10, title, stars, badge, weak acts, meter/bonus |
| `{{pre_scan}}` | Có | Evidence thật cho từng tiêu chí; dùng làm bằng chứng báo cáo + reality check |
| `{{profile_answers}}` | Có | Quy mô doanh nghiệp, vai trò người chơi (để chọn insight/CTA) |
| `{{offer_catalog}}` | Có | Mã, tên, outcome, khoảng giá tham khảo, điều kiện hiển thị giá |
| `{{offer_rules}}` | Có | Thứ tự ưu tiên map điểm yếu → offer; tối đa 2 offer |
| `{{legal_consent}}` | Có | Phiên bản privacy, câu consent, đại diện hợp pháp, thời hạn lưu, đầu mối xoá dữ liệu |
| `{{channels}}` | Có | Mobile 320px, PDF, thẻ share 9:16, leaderboard (nếu bật) |

Nếu thiếu offer catalog hoặc consent: dừng phần gated, chỉ xuất báo cáo ungated; không tự bịa giá hay điều khoản.

## Steps

1. **Chốt data contract.** Báo cáo là một object `report` gồm: `brand`, `pre_scan`, `answers`, `result`, `weaknesses`, `insights`, `ai_source`, `offers`, `teaser_offer`, `industry_rank` (tuỳ chọn). Server phải tính lại điểm từ quyết định + pre-scan, chỉ giữ điểm client gửi nếu nằm trong ngưỡng bonus hợp lệ. Dùng [contract report](../../../kits/report-lead/contracts/report.md).
2. **Báo cáo ungated — trả giá trị trước.** Hiển thị: overall X/10, danh hiệu + một câu blurb, số sao, radar theo act, 2 act yếu nhất kèm evidence + hệ quả kinh doanh + tên offer gợi ý (không giá), badge đã đạt, và CTA "Mở khoá bản đầy đủ" + share. Không form, không giá, không insight dài, không chặn.
3. **Báo cáo gated — chỉ sau gate.** Gồm 3 insight (`title`, `body`, `evidence`, `action`), 1–2 offer map theo luật ưu tiên, bảng thành phần + khoảng giá tham khảo, PDF, đặt lịch/nhận báo giá, leaderboard. Insight lấy từ AI JSON mode hoặc 3 template deterministic; `aiSource` cho biết nguồn. Không số liệu bịa, không hứa kết quả, không ký hiệu phần trăm, không nhắc giá trong body insight.
4. **Map offer bằng luật, không bằng cảm tính.** Dùng bảng ưu tiên: (1) quá nhiều act yếu hoặc tổng <5 → offer trọn bộ; (2) mọi act ≥8 → offer đồng hành/duy trì; (3) cặp act yếu cụ thể → offer theo cặp; (4) còn lại → offer đơn theo từng act, khử trùng, tối đa 2. Câu `why` sinh tự động từ 2 act yếu + act mạnh, không viết tay số liệu. Ghi luật ở [template offer-map](templates/offer-map.md).
5. **Thiết kế gate theo giá trị + consent.** Người chơi phải đã thấy báo cáo ungated và chủ động bấm mở khoá. Form tối thiểu: tên, ít nhất một trong SĐT/email, checkbox bắt buộc "tôi là đại diện thương hiệu", checkbox bắt buộc consent xử lý dữ liệu theo luật hiện hành, checkbox marketing **tuỳ chọn và mặc định tắt**. Luôn có "Để sau" để quay lại bản ungated; không dùng dark pattern.
6. **Validate và lưu tối thiểu.** Chuẩn hoá SĐT/email phía server; honeypot phải rỗng; lưu `consent_version`, thời điểm consent, `marketing_opt_in` riêng. Chỉ lưu trường cần cho mục đích đã nêu; IP chỉ hash; không log PII. Trả `offer_unlocked` + link PDF có token HMAC hết hạn (mặc định 7 ngày) ngay sau khi lead hợp lệ.
7. **PDF, share, leaderboard.** PDF 3 trang: bìa + overall/title; radar + điểm từng act + 2 act yếu; insight + offer + CTA + QR. Font tiếng Việt đủ dấu, fallback font nếu lỗi nhưng vẫn tạo file. Token HMAC gắn report, không lộ PII. Ảnh share 9:16 chỉ có thương hiệu, điểm, danh hiệu, không SĐT/email. Leaderboard dùng alias, mặc định ẩn danh, không hiện PII.
8. **Bàn giao CRM + analytics.** Lead mới có `status` mặc định (ví dụ `new`) kèm snapshot `offer_code`, `offer_name`, `overall`, `industry`, `company_size`, `role`. Đẩy qua outbox có chữ ký HMAC, retry backoff, dead-letter; export CSV escape đúng. Event: `report_view`, `gate_view`, `lead_submit`, `lead_fail`, `lead_success`, `pdf_download`, `booking_click`, `share_click`, `leaderboard_submit` — không chứa PII.

## Outputs

- `report-outline.md` theo [template report-outline](templates/report-outline.md) và [_shared/output-contracts.md](../_shared/output-contracts.md).
- `offer-map.md` theo [template offer-map](templates/offer-map.md), dùng catalog `{{offer_catalog}}`.
- `lead-gate.md` theo [contract lead-gate](../../../kits/report-lead/contracts/lead-gate.md).
- Hợp đồng dữ liệu: [report contract](../../../kits/report-lead/contracts/report.md); mapping code: [reference map](../../../kits/report-lead/reference-map.md).
- Payload CRM + danh sách event + điều kiện PDF/share.

## Quality gates

**Cứng — không launch nếu vi phạm:**

- Không bán hàng, không giá, không CTA mua trong lúc chơi; offer/gia chỉ xuất hiện sau báo cáo và **sau lead gate hợp lệ**.
- Không gate trước khi người chơi nhận được giá trị ungated; luôn có "Để sau".
- Consent là hành động chủ động (checkbox mặc định tắt), lưu version + thời điểm; marketing tách riêng.
- Form chỉ thu dữ liệu tối thiểu; không bắt địa chỉ/công ty/ngân sách nếu không dùng ngay.
- Không bịa metric, khách hàng, đối thủ, benchmark, chứng nhận, giá; không dùng ký hiệu phần trăm trong UI (dùng X/10, n/5, x/100).
- Không PII trong PDF công khai, ảnh share, leaderboard, analytics hay log server.
- Báo cáo đọc được ở 320px; CTA dock luôn thấy; một vùng cuộn; không mất nội dung khi reduced motion.
- PDF có font tiếng Việt; lỗi font/QR vẫn tạo được file; token PDF có hạn và không đoán được.

**Mềm — review trước launch:**

- 2 act yếu có evidence cụ thể và hệ quả kinh doanh, không chỉ điểm.
- Insight có `action` làm được trong 30 ngày, không nhắc tên offer.
- Offer `why` giải thích được bằng chính dữ liệu người chơi vừa tạo ra.
- Tỉ lệ lead capture đo được; lead `qualified` ≥ ngưỡng đã đặt; SLA sales rõ ngày/giờ.

## Handoff

- `report-outline.md` + `offer-map.md` + `lead-gate.md` → `game-launch-kpi` để chốt phễu, event, trạng thái CRM và ngưỡng cảnh báo.
- Trước launch, chuyển checklist gate/PDF/share cho `game-qa-autopilot` kiểm tự động.
- Dừng nếu chưa có offer catalog, chưa có văn bản consent hoặc chưa có evidence pre-scan; không launch báo cáo bịa.

## References

- [Kit report-lead](../../../kits/report-lead/README.md) và [reference map](../../../kits/report-lead/reference-map.md).
- [Checklist lead gate](references/lead-gate-checklist.md).
- [Shared quality gates](../_shared/quality-gates.md) và [glossary](../_shared/glossary.md).
- [Shared output contracts](../_shared/output-contracts.md) — mục `report-outline.md`.
