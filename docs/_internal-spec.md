# SPEC NỘI BỘ — Hành trình Sao Kim (không publish)

> Tài liệu này là nguồn sự thật cho team build. Bản publish nằm ở `docs/00..10`. Nếu code và spec lệch nhau, Lead chốt theo spec này rồi cập nhật docs.

## 1. Sản phẩm

Game web 3D mobile-first cho Sao Kim Branding. CEO/chủ doanh nghiệp SME Việt nhập website → hệ thống crawl & dựng brand kit → chơi 5 trạm S–A–O–K–IM → nhận báo cáo “Bản đồ thương hiệu” + gói dịch vụ đề xuất. Mục tiêu cuối: lead chất lượng và lịch tư vấn.

- Tên: **HÀNH TRÌNH SAO KIM** — “5 trạm thắp sáng thương hiệu”
- Nhân vật dẫn: **KIM** (trợ lý AI), gọi người chơi bằng tên thương hiệu.
- Thời lượng: 7–10 phút (mục tiêu ~8).
- Ngôn ngữ: tiếng Việt. Không dùng ký hiệu `%` trong UI game; dùng X/10, số sao, “n/5 tín hiệu”.
- Không joystick. Mọi thao tác một ngón tay: tap, rê, kéo, giữ. Mọi thao tác kéo/rê có phương án tap.

## 2. Câu chuyện & ẩn dụ

Mỗi thương hiệu là một hành tinh đang ngủ, bị sương che, mang tên doanh nghiệp nhưng chưa có ánh sáng riêng. Sao Kim là ngôi sao 4 cánh cam–đỏ ở cuối hành trình. Người chơi lái tàu mang logo của mình qua 5 trạm; mỗi trạm trả lại một lớp sáng.

| Trạm | Thế giới | Ẩn dụ | Cơ chế | Lớp sáng |
|---|---|---|---|---|
| S | Tinh cầu Sương Mù | nhìn lại trước khi tin vào giả định | rê ngón tay quét sương 4 vùng, mở tín hiệu thật, chọn tác động kinh doanh | khí quyển |
| A | Đài Thiên Văn | chọn hướng, chấp nhận từ chối | nối chòm sao Sứ mệnh–Tầm nhìn–Giá trị; kéo logo lên bản đồ định vị 2 trục; chọn 2 tính cách | trục quay |
| O | Xưởng Chế Tác | hệ thống nhìn thấy được, không chỉ logo | 6 mockup gắn logo khách; tìm mockup sai màu/font trong 15s; test ghi nhớ màu 3s | bề mặt |
| K | Bệ Phóng | cất tiếng và đối mặt khủng hoảng | xếp 5 việc ra mắt; giữ nạp & phóng; khủng hoảng 30s chọn cách phản hồi | đèn thành phố + sóng |
| IM | Trạm Vận Hành | giữ lửa qua thời gian/con người/quy mô | tua 12 tháng, 4 sự kiện, đồng hồ “Độ nhất quán” | vệ tinh |
| Đích | Sao Kim | được nhìn thấy; vùng tối = bước chưa quyết | cinematic, báo cáo | hành tinh hoàn chỉnh |

## 3. Luồng

```
Landing → (crawl 3–8s | nhập tay) → Xác nhận brand + 2 câu (quy mô, vai trò)
 → Cất cánh → Bản đồ 5 trạm → S → A → O → K → IM
 → Cinematic Sao Kim → Báo cáo (ungated) → Lead gate → Báo cáo đầy đủ + gói + PDF
 → Đặt lịch / Nhận báo giá / Share 9:16 / Leaderboard
```

- Landing: 1 ô “Nhập website doanh nghiệp của bạn”; link phụ “Chưa có website?” → nhập tên + upload logo.
- Crawl: radar + checklist; tối thiểu 3s; lỗi → nhập tay với domain điền sẵn.
- Xác nhận: logo (kèm lựa chọn thay thế), tên, 2–3 màu, mô tả/ngành/social, chip tín hiệu; sửa được tất cả.
- Báo cáo ungated: tổng X/10, danh hiệu, radar, 2 bước yếu + hệ quả, 5 huy hiệu, teaser gói.
- Gated: 3 insight AI, gói + khoảng giá, PDF, form tư vấn.
- Không bán hàng trong lúc chơi. KIM không nhắc tên gói.

## 4. Điểm & gói

- Lựa chọn: 2/1/0. Planet:
  - `K = 10 * sum(knowledge points) / (2 * nKnowledge)`
  - `D = 10 * sum(diagnosis points) / (2 * nDiagnosis)`
  - Reality check: diagnosis chọn 2 nhưng pre-scan tiêu chí < 6 → D −1 mỗi ca, tối đa −2.
  - S/A: `0.6K + 0.4D`; O: `0.7K + 0.3D` (+tối đa 1 vào K nếu tìm đúng nhanh); K: `0.7K + 0.3D` (+0.5 nếu phản hồi <10s); IM: `0.5K + 0.3D + 0.2M` với M = đồng hồ nhất quán 0–10. Clamp 0–10, 1 số lẻ.
- Tổng = `0.15S + 0.20A + 0.25O + 0.20K + 0.20IM`.
- Danh hiệu: ≥8 “Ngôi Sao Đã Thắp Sáng”; ≥7 “Thương Hiệu Ngôi Sao Mới”; ≥5 “Ngôi Sao Đang Lên”; <5 “Mầm Sao Đang Chờ”.
- Huy hiệu khi điểm trạm ≥6.
- Bước yếu: 2 điểm thấp nhất, tie-break S→A→O→K→IM.

Gói thật (từ seed saokim-os): Brand audit 25–50tr · Chiến lược thương hiệu 120–300tr · Nhận diện thương hiệu 80–200tr · Brand guideline 40–80tr · Marcom theo chiến dịch · Profile/Brochure 30–70tr · Design request 8–20tr/tháng · Website care 3–8tr/tháng.

Map gói: S/A → Gói Nền tảng (audit + strategy); O → Gói Nhận diện (identity + guideline); K → Gói Ra mắt (marcom + profile); IM → Gói Vận hành (guideline + design + care); K+IM → Gói Ra mắt & Vận hành; O+K → Gói Tăng tốc; ≥3 yếu hoặc tổng <5 → Gói Trọn bộ; tất cả ≥8 → Gói Đồng hành.

## 5. Crawl (tóm tắt)

- SSRF guard, robots.txt, cache 24h, UA `SaoKimBrandScanner/1.0`, timeout 8s, HTML tối đa 2MB.
- Logo ưu tiên: header SVG/PNG → schema logo → apple-touch-icon → manifest → og:image → favicon → Google/DuckDuckGo; chọn ảnh ≥128px tốt nhất, chuyển PNG 512, same-origin.
- Không có logo → monogram từ tên + palette; cho upload (<2MB).
- Màu: pixel logo + theme-color + CSS tần suất; khử trùng OKLab; đảm bảo tương phản trên navy.
- Tên: schema → og:site_name → title → h1 → domain.
- Pre-scan 5 tiêu chí: logo, màu, slogan, social, mobile; sinh tín hiệu + bằng chứng thật.
- Pre-scan **không** quyết định điểm trạm; chỉ làm bằng chứng/reality check/báo cáo.

## 6. Nội dung 5 trạm

Mỗi trạm 3–5 quyết định (khoảng 20 tổng), mỗi quyết định 3 lựa chọn, có:
`id`, `kind` (knowledge/diagnosis), `prompt`, 3 options (2/1/0 + feedback), `explain`, `evidenceKey` (diagnosis).
Quyết định nằm trong hành động, không màn quiz riêng; sau mỗi chọn KIM phản hồi ngắn.

Ví dụ đã chốt:
- **S**: tín hiệu “không tìm thấy slogan” → tác động: khách so sánh bằng giá (2) / tin hơn vì gọn (0) / gọi ngay (1). Diagnosis: “Website có câu nói rõ bạn khác ở đâu?” (evidenceKey slogan).
- **A**: đặt logo ô cao cấp nhưng chọn tính cách bình dân → mâu thuẫn; 2 knowledge + 1 diagnosis; 3 đối thủ mô tả (không bịa tên).
- **O**: tìm 2 mockup sai trong 15s; test ghi nhớ màu; diagnosis “đã có brand guideline chính thức?” (evidenceKey color).
- **K**: thứ tự mục tiêu/thông điệp → nội dung → kích hoạt nội bộ → ra mắt → đo lường; crisis chọn phản hồi công khai bằng dữ kiện + khắc phục (2), trả lời riêng (1), im lặng/xoá/đổ lỗi (0). Diagnosis “đã có người phát ngôn chính thức?” (evidenceKey social).
- **IM**: 4 sự kiện; “nhân viên mới sai logo” → gửi template + nhắc 5 phút (2) / nhắc riêng (1) / bỏ qua (0). Diagnosis “có quy trình duyệt nội dung trước khi đăng?” (evidenceKey mobile? — dùng mobile làm evidence cho “thiếu quy trình” là sai; dùng criterion social hoặc bỏ evidenceKey).

**Sửa quan trọng:** IM không có tiêu chí pre-scan tương ứng trực tiếp → diagnosis IM không set `evidenceKey` (tránh reality check sai). K dùng `social`, O dùng `color`, S dùng `slogan`/`logo`, A dùng `slogan`/`logo`.

Insight “Bạn có biết…” mỗi trạm, không số liệu bịa.

## 7. Kiến trúc & stack

- Vite 8 + React 19.3 + TS 5.9 + Tailwind 4 + R3F 9 + three 0.187 + zustand + Hono 4 + node:sqlite + sharp + zod + pdfkit + qrcode.
- `src/three`: SceneCanvas (landing/launch/planet/finale), PlanetPoster (2.5D/share/map), shader hành tinh, sao 4 cánh, tàu, camera, quality tier, audio synth.
- `src/game`: content + 5 mini-game + PlanetGame host interface.
- Lead: app shell, screens, report, share, PWA, persistence.
- Server: crawl, API, DB, AI, CRM.

Interface chốt:
```ts
// src/game/types.ts
interface PlanetGameProps {
  planet: PlanetId; brand: BrandProfile; preScan: PreScan; answers: ProfileAnswers;
  onDecision(record: DecisionRecord): void;
  onComplete(payload: { meter?: number; timeBonus?: number; crisisFast?: boolean; skipped?: boolean }): void;
  onGuide?(text: string): void;
}
// src/three/index.tsx
<SceneCanvas /> // fixed full-screen, đọc useScene
<PlanetPoster planet lit size className />
```

## 8. Tài liệu publish

`docs/00-tom-tat.md`, `01-concept.md`, `02-crawl.md`, `03-game-design.md`, `04-scoring-offers.md`, `05-user-flow.md`, `06-storyboard.md`, `07-architecture.md`, `08-roadmap.md`, `09-mobile-qa.md`, `10-kpi.md`.
Tiếng Việt, cụ thể, có bảng. 03 phải có đủ 20 quyết định; 04 có bảng map gói; 07 có API/schema; 08 có MVP 4–6 tuần + Phase 2; 09 có ma trận thiết bị; 10 có phễu + event + mục tiêu x/100.

## 9. Không được làm

- Không `%` trong UI. Không joystick. Không chặn lead từ đầu. Không bịa số liệu/khách hàng/đối thủ/giá. Không dùng ảnh/asset ngoài brand Sao Kim + procedural.
- Không sửa ngoài write scope của mình. Không commit. Không deploy.
