# 04 — Điểm & Gói dịch vụ

Tài liệu chốt công thức điểm (khớp `src/shared/scoring.ts`), cách quy đổi thành danh hiệu/báo cáo, và cách map sang catalog gói thật (`src/shared/offers.ts`). Nội dung quyết định ở [03](03-game-design.md); báo cáo và lead gate ở [05](05-user-flow.md); KPI ở [10](10-kpi.md).

## 1. Thang điểm

Mỗi trạm 0–10, một số lẻ. Hai thành phần:

- **K (knowledge)** — hiểu biết thể hiện qua lựa chọn: `K = 10 × Σ điểm knowledge / (2 × số câu knowledge)`.
- **D (diagnosis)** — tự soi thực trạng: `D = 10 × Σ điểm diagnosis / (2 × số câu diagnosis)`, sau đó trừ reality check.
- **M (meter)** — chỉ trạm IM: đồng hồ "Độ nhất quán" 0–10 do mini-game trả về.

Điểm từng trạm (clamp 0–10, làm tròn 1 số lẻ **sau** khi tính):

| Trạm | Công thức | Trọng số trong tổng |
|---|---|---|
| S | `0,6K + 0,4D` | 15/100 |
| A | `0,6K + 0,4D` | 20/100 |
| O | `0,7K + 0,3D` + time bonus (đã nằm trong K, xem §2) | 25/100 |
| K | `0,7K + 0,3D + 0,5 nếu crisisFast` | 20/100 |
| IM | `0,5K + 0,3D + 0,2M` | 20/100 |

**Tổng:** `0,15S + 0,20A + 0,25O + 0,20K + 0,20IM`, làm tròn 1 số lẻ. Trạm bị bỏ qua = 0 điểm và vẫn chiếm trọng số (bỏ trạm là mất điểm thật).

Thứ tự tính chuẩn (server dùng `scorePlanet`): cộng điểm thô knowledge (kể cả time bonus, tối đa +1) → chuẩn hoá K → tính D thô → trừ penalty → clamp từng thành phần → áp công thức trạm → clamp 0–10 → làm tròn 1 số lẻ.

## 2. Time bonus trạm O

- `timeBonus` 0–1 do mini-game trả: `0,7 × (thời gian còn lại / 15 giây)` nếu tìm đủ 2 mockup trong cửa sổ, cộng `0,3` nếu nhớ đúng màu chính; trượt hoặc không đủ 2 mockup → phần thời gian = 0 (vẫn có thể được 0,3 nếu nhớ đúng màu).
- Bonus được cộng vào **tổng điểm thô knowledge** trước khi chuẩn hoá, không cộng thẳng vào điểm trạm. Ví dụ: 3 điểm thô trên 4 tối đa = 7,5; cộng 0,8 → 3,8/4 = 9,5.
- Trần an toàn: K luôn clamp 0–10.

## 3. Reality check

Diagnosis là câu "tôi đã có X chưa". Nếu người chơi chọn **2 điểm** nhưng bằng chứng trên website cho thấy chưa có, điểm diagnosis bị trừ — để báo cáo không khen một điều không tồn tại.

| Điều kiện | Công thức | Ví dụ |
|---|---|---|
| Diagnosis chọn 2 điểm, `evidenceKey` có tiêu chí pre-scan < 6 | `D − 1` cho mỗi ca | `s-slogan-reality` chọn "có, ngay màn hình đầu" nhưng pre-scan slogan = 3 → D = 10 − 1 = 9 |
| Nhiều ca trong cùng trạm | Trừ tối đa 2 mỗi trạm | Trạm chỉ có 1 diagnosis nên thực tế tối đa −1 |
| IM | Không áp dụng | 2 diagnosis (`im-dealer`, `im-scale`) không có `evidenceKey` |
| Trạm O, K, A | Áp dụng nếu có bằng chứng | `o-guideline-reality` (color), `k-spokesperson` (social), `a-logo-premium` (logo) |

Bằng chứng dùng để trừ điểm cũng chính là bằng chứng hiển thị trong báo cáo (chip "từ website của bạn"). Không có bằng chứng thì không trừ.

## 4. Ví dụ tính tay

Một lượt chơi đầy đủ 5 trạm (18 quyết định), pre-scan slogan = 3, color = 8, social = 8, logo = 8, mobile = 7:

| Trạm | Điểm thô knowledge | Bonus | K | Điểm diagnosis | Penalty | D | Công thức | Điểm trạm |
|---|---|---|---|---|---|---|---|---|
| S | 2+2+1 = 5 / 6 | 0 | 10×5/6 = 8,333 | 2 / 2 | −1 (slogan 3) | 9,0 | 0,6×8,333 + 0,4×9 | **8,6** |
| A | 2+1 = 3 / 4 | 0 | 7,5 | 1 / 2 | 0 | 5,0 | 0,6×7,5 + 0,4×5 | **6,5** |
| O | 2+1 = 3 / 4 | +0,7 | 10×3,7/4 = 9,25 | 2 / 2 | 0 (color 8) | 10,0 | 0,7×9,25 + 0,3×10 | **9,5** |
| K | 2+2+1 = 5 / 6 | 0 | 8,333 | 2 / 2 | 0 (social 8) | 10,0 | 0,7×8,333 + 0,3×10 + 0,5 | **9,3** |
| IM | 2+2 = 4 / 4 | 0 | 10,0 | 2+1 = 3 / 4 | — | 7,5 | 0,5×10 + 0,3×7,5 + 0,2×8,4 | **8,9** |

Tổng: `0,15×8,6 + 0,20×6,5 + 0,25×9,5 + 0,20×9,3 + 0,20×8,9 = 1,29 + 1,30 + 2,375 + 1,86 + 1,78 = 8,605` → **8,6/10**.

Kết quả: danh hiệu **"Ngôi Sao Đã Thắp Sáng"** (≥ 8), **4,5 sao**; huy hiệu bật ở S 8,6 · O 9,5 · K 9,3 · IM 8,9, còn A 6,5 < 6 nên A tối. Hai bước yếu: **A (6,5)** và **S (8,6)**; gói đề xuất: **Gói Nền tảng** (cặp S+A), lý do: "Điểm yếu nằm ở A — Chiến lược thương hiệu (6,5/10) và S — Kiểm toán thương hiệu (8,6/10). Bạn đang làm tốt O, K, IM — giữ nguyên phần đó."

Cột K trong bảng ghi giá trị thô dùng trong công thức; trường `knowledge` của kết quả được làm tròn 1 số lẻ khi trả về (9,25 → 9,3). Điểm trạm và tổng luôn làm tròn sau khi áp công thức.

**Ví dụ nhỏ — time bonus bị clamp:**

| Bước | Số |
|---|---|
| Knowledge O: 4/4 điểm thô | K = 10 |
| Cộng timeBonus 1,0 | Thô 5/4 → 12,5 → clamp **10** |
| Kết quả | Bonus không tăng thêm; chỉ giúp khi K < 10 |

**Ví dụ nhỏ — bỏ qua trạm:** bỏ K → K = 0; tổng giảm 0,2 × (điểm K nếu chơi) và `weak` có thể vẫn là 2 trạm khác. Không thể đạt danh hiệu cao nếu bỏ trạm vì điểm tổng mất 20/100.

## 5. Danh hiệu, sao, huy hiệu

| Tổng điểm | Danh hiệu | Blurb (nguyên văn trong code) |
|---|---|---|
| ≥ 8,0 | **Ngôi Sao Đã Thắp Sáng** | Thương hiệu của bạn có hệ thống, có tiếng nói và có người giữ lửa. |
| ≥ 7,0 | **Thương Hiệu Ngôi Sao Mới** | Bạn đã có nền móng tốt. Điều còn thiếu là một vài quyết định dứt khoát. |
| ≥ 5,0 | **Ngôi Sao Đang Lên** | Bạn đang đi đúng hướng, nhưng hệ thống chưa đủ chắc để đi nhanh. |
| < 5,0 | **Mầm Sao Đang Chờ** | Không phải thương hiệu yếu — mà là một thương hiệu chưa được đặt đúng chỗ. |

- **Sao:** `round((tổng/10) × 5 × 2) / 2` → bước 0,5; hiển thị tối đa 5 sao. 8,7 → 4,5 sao; 8,0 → 4,0; 5,0 → 2,5.
- **Huy hiệu:** bật khi điểm trạm ≥ 6 (`badges`), tối đa 5. Trạm tối = vùng tối trên hành tinh và dòng "chưa có" trong báo cáo.
- **Không dùng ký hiệu phần trăm**: mọi nơi hiển thị "8,6/10", "4,5 sao", "4/5 tín hiệu".

## 6. Bước yếu

- Lấy 2 trạm điểm thấp nhất trong 5 trạm đã chơi (`weak`).
- **Tie-break:** điểm bằng nhau → trạm đứng trước theo thứ tự S → A → O → K → IM (đúng thứ tự trong code).
- Mỗi bước yếu kèm: hệ quả kinh doanh (bảng dưới), bằng chứng pre-scan, gói gợi ý.

| Trạm | Hệ quả (nguyên văn `scoring.ts`) | Bằng chứng báo cáo | Gói gợi ý |
|---|---|---|---|
| S | Bạn đang chi tiền cho những giả định chưa được kiểm chứng. Ngân sách marketing chảy vào thông điệp mà khách không cần. | `logo` | Brand audit |
| A | Mỗi kênh nói một kiểu. Khách không hiểu vì sao nên chọn bạn thay vì một lựa chọn rẻ hơn. | `slogan` | Chiến lược thương hiệu |
| O | Nhận diện thiếu nhất quán khiến bạn trả tiền quảng cáo để khách nhớ một thương hiệu mờ nhạt. | `color` | Nhận diện thương hiệu |
| K | Ra mắt không có kịch bản, đối thủ chiếm chỗ trong tâm trí khách trước khi bạn kịp cất tiếng. | `social` | Marcom |
| IM | Thương hiệu mạnh lúc ra mắt nhưng mai một dần vì mỗi người làm một kiểu. | `mobile` | Brand guideline + Design request |

> **Đã đồng bộ:** báo cáo và diagnosis dùng cùng mapping S→`slogan`, A→`logo`, O→`color`, K→`social`, IM→`mobile` (theo `weaknessesFor` + `evidenceKey`). Một nguồn bằng chứng duy nhất cho mỗi trạm.

## 7. Catalog gói thật

Giá là **khoảng tham khảo**, không phải báo giá; mọi báo giá phải qua sales. Nguồn: `SERVICE_PACKAGES`.

| Key | Tên | Giá |
|---|---|---|
| `brand_audit` | Brand audit | 25–50 triệu |
| `brand_strategy` | Chiến lược thương hiệu | 120–300 triệu |
| `brand_identity` | Nhận diện thương hiệu | 80–200 triệu |
| `brand_guideline` | Brand guideline | 40–80 triệu |
| `marcom` | Marcom | Theo chiến dịch |
| `profile` | Profile / Brochure | 30–70 triệu |
| `design_request` | Design request | 8–20 triệu/tháng |
| `website_care` | Website care | 3–8 triệu/tháng |

### 7.1 Gói đóng gói sẵn

| Mã | Tên | Tagline | Thành phần | Dòng giá |
|---|---|---|---|---|
| `foundation` | Gói Nền tảng | Xây trên sự thật, không trên giả định | audit + strategy | 25–50 triệu · 120–300 triệu |
| `identity` | Gói Nhận diện | Một hệ thống nhìn thấy được, dùng được | identity + guideline | 80–200 triệu · 40–80 triệu |
| `launch` | Gói Ra mắt | Ra mắt như một sự kiện, không như một thông báo | marcom + profile | Theo chiến dịch · 30–70 triệu |
| `operate` | Gói Vận hành | Giữ lửa sau ngày ra mắt | guideline + design + care | 40–80 triệu · 8–20 triệu/tháng · 3–8 triệu/tháng |
| `launch_operate` | Gói Ra mắt & Vận hành | Từ ngày cất tiếng đến nhịp chạy đều | marcom + guideline + design + care | Theo chiến dịch · 40–80 triệu · 8–20 triệu/tháng · 3–8 triệu/tháng |
| `accelerate` | Gói Tăng tốc | Nhìn đúng và nói đúng, cùng một lúc | identity + guideline + marcom + profile | 80–200 triệu · 40–80 triệu · theo chiến dịch · 30–70 triệu |
| `full` | Gói Trọn bộ SAOKIM | Đi trọn 5 trạm với một đội | cả 8 hạng mục | Tổng 8 dòng giá của catalog |
| `companion` | Gói Đồng hành | Thương hiệu đã sáng — giữ cho nó không tối đi | guideline + design + care | 40–80 triệu · 8–20 triệu/tháng · 3–8 triệu/tháng |

Cột "Dòng giá" lược tên hạng mục cho gọn; chuỗi hiển thị thực tế trong code gồm cả tên hạng mục (ví dụ "Brand audit: 25–50 triệu · Chiến lược thương hiệu: 120–300 triệu").

## 8. Map điểm → gói (thứ tự ưu tiên)

Đúng thứ tự trong `recommendOffers`; dừng ở điều kiện đầu tiên khớp, trả tối đa 2 gói.

| Ưu tiên | Điều kiện | Gói trả về | Vì sao |
|---|---|---|---|
| 1 | `weakCount ≥ 3` **hoặc** tổng < 5 | Gói Trọn bộ SAOKIM | Quá nhiều lỗ hổng; làm từng phần sẽ đứt đoạn |
| 2 | Cả 5 trạm ≥ 8 | Gói Đồng hành | Nền đã vững; cần giữ nhịp và cập nhật |
| 3 | 2 bước yếu là **S + A** | Gói Nền tảng | Cả hai là gốc chiến lược |
| 4 | 2 bước yếu là **O + K** | Gói Tăng tốc | Nhìn đúng và nói đúng cùng lúc |
| 5 | 2 bước yếu là **K + IM** | Gói Ra mắt & Vận hành | Từ ra mắt đến nhịp chạy đều |
| 6 | Các cặp còn lại | Gói đơn theo từng trạm, khử trùng | Mỗi trạm một gói: S/A→Nền tảng, O→Nhận diện, K→Ra mắt, IM→Vận hành |

Thực tế khi đủ 5 trạm, `weakCount` luôn = 2, nên điều kiện 1 chỉ xảy ra khi tổng < 5. Nếu bỏ trạm, trạm bỏ qua = 0 kéo tổng xuống, thường rơi vào Gói Trọn bộ.

Bảng cặp → gói:

| Cặp yếu | Gói chính | Gói phụ (nếu có) |
|---|---|---|
| S + A | Nền tảng | — |
| O + K | Tăng tốc | — |
| K + IM | Ra mắt & Vận hành | — |
| S + O | Nền tảng | Nhận diện |
| S + K | Nền tảng | Ra mắt |
| S + IM | Nền tảng | Vận hành |
| A + O | Nền tảng | Nhận diện |
| A + K | Nền tảng | Ra mắt |
| A + IM | Nền tảng | Vận hành |
| O + IM | Nhận diện | Vận hành |
| ≥ 3 yếu / tổng < 5 | Trọn bộ SAOKIM | — |
| Tất cả ≥ 8 | Đồng hành | — |

`why` (câu "vì sao gói này") sinh tự động: liệt kê 2 bước yếu kèm điểm X/10, liệt kê trạm mạnh (≥ 7), và một câu kết. Không viết tay, không nhắc số liệu ngoài.

## 9. Hợp đồng AI insight

Báo cáo gated có 3 insight. Hợp đồng: `AiInsight { title, body, evidence, action }`.

| Trường | Giới hạn | Nguồn được phép |
|---|---|---|
| `title` | ≤ 70 ký tự, tiếng Việt, không giật tít | Điểm yếu hoặc điểm mạnh của chính người chơi |
| `body` | ≤ 2 câu, ≤ 220 ký tự | Giải thích cơ chế, không số liệu |
| `evidence` | ≤ 160 ký tự | Trích `preScan.criteria[*].evidence` hoặc điểm trạm X/10 |
| `action` | 1 việc làm được trong 30 ngày, ≤ 120 ký tự | Không nhắc tên gói, không hứa kết quả |

**Ràng buộc prompt:** không bịa số liệu/khách hàng/đối thủ/benchmark; không dùng ký hiệu phần trăm; không nhắc tên gói; không hứa tăng doanh thu; giọng theo [01](01-concept.md) §6; trả JSON đúng schema, không markdown.

**Vận hành:** timeout 8 giây, 1 lần retry, cache theo hash `(tên brand + 5 điểm + weak)`. Nếu không có `DEEPSEEK_API_KEY`, lỗi, timeout hoặc JSON sai schema → dùng **3 template deterministic** dưới đây; `aiSource = "template"` thay vì `"ai"`. Không bao giờ để báo cáo trống insight.

| # | Điều kiện | Title template | Body | Action |
|---|---|---|---|---|
| 1 | weak[0] | "Điểm nghẽn lớn nhất: {tên trạm}" | "{Hệ quả của trạm weak[0]}. Đây là chỗ nên sửa trước vì nó ảnh hưởng các lớp còn lại." | "Chọn một việc nhỏ liên quan đến {trạm} và làm trong 30 ngày tới." |
| 2 | weak[1] | "Bước tiếp theo: {tên trạm}" | "{Hệ quả của trạm weak[1]}. Sửa sau khi điểm nghẽn đầu tiên đã có tiến bộ." | "Đặt một mốc kiểm tra sau 30 ngày cho bước này." |
| 3 | trạm mạnh nhất | "Điểm tựa của bạn: {tên trạm} ({X}/10)" | "Đây là lớp đang sáng nhất. Dùng nó làm chuẩn khi sửa các lớp còn lại." | "Ghi lại 3 điều đang làm đúng ở {trạm} để giữ nguyên." |

## 10. Lead gate, PDF, share, leaderboard

**Ungated (không cần thông tin):** tổng X/10, danh hiệu, sao, radar 5 trạm, 2 bước yếu + hệ quả, 5 huy hiệu, teaser tên gói chính + 1 câu `why`.

**Gated:** 3 insight, bảng gói + khoảng giá, PDF, form tư vấn, đặt lịch, leaderboard.

| Hạng mục | Quy tắc |
|---|---|
| Trường bắt buộc | `name`, `isRepresentative = true`, `consent = true`, ít nhất `phone` hoặc `email` |
| Validate | SĐT Việt Nam `0/+84` + 9–10 số; email regex; honeypot `website` phải rỗng |
| Consent | `CONSENT_VERSION = "2026-11-v1"`; lưu version + thời điểm; marketing là tuỳ chọn riêng |
| PDF | 3 trang: tổng quan + 5 lớp; 2 bước yếu + insight; gói + CTA + QR; token HMAC hết hạn 7 ngày |
| Share 9:16 | Poster + X/10 + danh hiệu + 5 chấm trạm + logo Sao Kim; không chứa SĐT/email |
| Leaderboard | Alias tự đặt, mặc định ẩn danh; theo ngành; top 20 + hạng của mình; không hiện PII; cờ `VITE_ENABLE_LEADERBOARD` |
| Pdf fail | Thử lại 1 lần; vẫn lỗi → "Sẽ gửi PDF qua email" và ghi vào outbox |

## 11. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Bỏ qua trạm | Điểm 0; vẫn có trong tổng; `skipped: true`; báo cáo ghi "chưa quyết" thay vì "yếu" |
| Chưa chơi đủ 5 trạm mà tạo báo cáo | UI chỉ mở finale khi đủ 5; `POST /api/reports` nhận 1–5 trạm, trạm thiếu tính 0 và không có trong `planets` — đây là đường dự phòng, không phải luồng thường |
| Trùng quyết định (chọn lại) | `recordDecision` ghi đè theo `decisionId`; điểm dùng bản mới nhất |
| Client gửi điểm sai | Server luôn tính lại từ `decisions` + `preScan`; chỉ giữ điểm client nếu nằm trong [điểm tính lại − 0,05, + trần bonus của trạm] (O +2, K +3, còn lại +0,05), ngoài khoảng thì dùng điểm server |
| Tất cả 0 điểm | Tổng 0, "Mầm Sao Đang Chờ", Gói Trọn bộ, 2 bước yếu tie-break S rồi A |
| Tất cả 10 điểm | Tổng 10, 5 sao, Gói Đồng hành (all ≥ 8) |
| Hai trạm cùng điểm thấp | Tie-break S→A→O→K→IM; gói theo cặp |
| pre-scan lỗi hoàn toàn | Server dùng `neutralPreScan`: mỗi tiêu chí 5 điểm (< 6) → diagnosis chọn 2 vẫn bị trừ 1; báo cáo ghi rõ "chưa có dữ liệu quét website" |

## 12. Liên kết

- Nội dung 18 quyết định & payload mini-game: [03](03-game-design.md) §5, §8.
> **Copy pass 11/2026:** chỉ đổi prompt/nhãn/feedback trong `src/game/content/index.ts` (17/18 câu; `k-one-line` giữ nguyên). Công thức điểm, reality check, danh hiệu và catalog gói **không đổi**.

- Luồng gate, copy form: [05](05-user-flow.md) §4.10.
- DB lead/CRM, PDF: [07](07-architecture.md) §6–§7.
- Đo hiệu quả gói/lead: [10](10-kpi.md).
