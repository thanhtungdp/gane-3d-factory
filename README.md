# Hành trình Sao Kim

Game web 3D mobile-first cho **Sao Kim Branding**: chủ doanh nghiệp nhập website, hệ thống quét brand kit, người chơi đi qua 5 trạm **S – A – O – K – IM** để thắp sáng “hành tinh thương hiệu” của mình, rồi nhận **Bản đồ thương hiệu** + gói dịch vụ đề xuất.

> Ẩn dụ: mỗi thương hiệu là một hành tinh đang ngủ. 5 trạm trả lại 5 lớp sáng: khí quyển, trục quay, bề mặt, tín hiệu, vệ tinh. Đích đến là ngôi sao 4 cánh **Sao Kim**.

## Ảnh prototype

**Desktop 1440×900** — landing 2 cột, bản đồ quỹ đạo, chuyến bay 3D, popup một câu, báo cáo 2 cột:

| Landing | Bản đồ | Chuyến bay | Popup câu hỏi |
|---|---|---|---|
| ![Landing](docs/assets/screens/desktop-landing.jpg) | ![Bản đồ](docs/assets/screens/desktop-map.jpg) | ![Chuyến bay](docs/assets/screens/desktop-flight.jpg) | ![Câu hỏi](docs/assets/screens/desktop-question.jpg) |

| Trạm (console phải) | Báo cáo | Chuyến bay tới Sao Kim | 1920×1080 |
|---|---|---|---|
| ![Trạm](docs/assets/screens/desktop-planet.jpg) | ![Báo cáo](docs/assets/screens/desktop-report.jpg) | ![Sao Kim](docs/assets/screens/desktop-venus-flight.jpg) | ![Wide](docs/assets/screens/wide-landing.jpg) |

**Mobile 390×844** — vẫn là bố cục chính, chuyến bay và popup một câu:

| Landing | Bản đồ | Chuyến bay | Popup câu hỏi |
|---|---|---|---|
| ![Landing](docs/assets/screens/landing.jpg) | ![Bản đồ](docs/assets/screens/ban-do.jpg) | ![Chuyến bay](docs/assets/screens/mobile-flight.jpg) | ![Câu hỏi](docs/assets/screens/mobile-question.jpg) |

**Intro 3D** — chỉ lần đầu, 10 giây, CTA ở 8,8 giây:

| Intro mobile 390×844 | Intro desktop 1440×900 |
|---|---|
| ![Intro mobile](docs/assets/screens/intro.jpg) | ![Intro desktop](docs/assets/screens/desktop-intro.jpg) |

**Trạm 2.0** — sương thật, icon chòm sao, dock CTA cố định, KIM có mặt:

| Trạm S | Trạm A | Trạm O | Trạm K | Trạm IM |
|---|---|---|---|---|
| ![S](docs/assets/screens/tram-s.jpg) | ![A](docs/assets/screens/tram-a.jpg) | ![O](docs/assets/screens/tram-o.jpg) | ![K](docs/assets/screens/tram-k.jpg) | ![IM](docs/assets/screens/tram-im.jpg) |

**Fold / duo dọc** — cùng một cockpit, không cắt CTA:

| Fold cover 344×882 | Fold inner 725×870 | Duo 540×720 | Fold large 884×1104 |
|---|---|---|---|
| ![Fold cover](docs/assets/screens/fold-cover.jpg) | ![Fold inner](docs/assets/screens/fold-inner.jpg) | ![Duo](docs/assets/screens/duo.jpg) | ![Fold large](docs/assets/screens/fold-large.jpg) |

Thêm ảnh gói đề xuất, thẻ chia sẻ, low-tier 2.5D trong [`docs/assets/screens/`](docs/assets/screens/).

## Chạy nhanh

```bash
npm install
cp .env.example .env.local          # tùy chọn: điền DeepSeek/CRM/booking
npm run dev                         # web :5173 + api :8788
```

Mở http://127.0.0.1:5173.

- `npm run dev:web` — chỉ Vite.
- `npm run dev:api` — chỉ Hono (port 8788).
- `npm run build` — build client vào `dist/`.
- `npm start` — chạy server production (serve `dist/` + API).
- `npm run typecheck` / `npm test` / `npm run test:e2e` / `npm run shots` / `npm run lint`.

Chế độ xem trước không cần mạng: mở `/?demo=1&intro=0` rồi bấm **Dùng dữ liệu mẫu**. Intro 3D chỉ hiện ở lần mở đầu tiên (hoặc khi ép `?intro=1`); `?intro=0` bỏ qua intro khi test. Chất lượng hình ảnh có thể ép bằng `?quality=low|mid|high`.

## Tính năng đã có

- **Intro 3D 10 giây (chỉ lần đầu)**: hành tinh thức dậy theo 5 lớp, rail 5 trạm S–A–O–K–IM và 5 caption của KIM; CTA hiện ở 8,8 giây, bỏ qua được; không bán hàng, không thay gameplay. Đã xem thì lần sau vào thẳng landing; nút **Xem lại intro** nằm ở header landing.
- **Copy pass 18 câu**: prompt ≤ 85 ký tự, nhãn đáp án 20–120 ký tự (3 ngoại lệ ngắn chốt nguyên văn), không còn template `[...]`, không tự đặt SLA; 17/18 câu đổi, `k-one-line` giữ nguyên.
- **Onboarding**: một ô nhập website; crawl server-side (SSRF guard, robots.txt, cache 24h), thứ tự logo header → schema → apple-touch-icon → manifest → og:image → favicon → third-party; trích palette OKLab; tên/mô tả/ngành/slogan/socials/mobile; monogram + upload thủ công khi lỗi.
- **Cinematic cất cánh**: logo dán lên tàu, màu brand thành động cơ, hành tinh xám mang tên khách.
- **Bản đồ 5 trạm** + sức khoẻ thương hiệu X/10, lưu tiến trình theo domain; desktop có sân khấu quỹ đạo, mobile giữ danh sách dọc.
- **Chuyến bay 3D giữa mọi trạm**: hoàn thành trạm → tên lửa cất cánh, bay theo cung, hạ cánh xuống trạm kế rồi mới mở nội dung; trạm cuối bay tới Sao Kim. Có skip, reduced-motion và bản 2.5D.
- **Trạm 2.0 — cockpit một vùng cuộn**: panel trạm đổi chiều cao theo pha intro/chơi/kết quả; HUD KIM 2 dòng; **dock CTA cố định đáy** nên nút chính không bao giờ bị nội dung đẩy khuất; hỗ trợ fold/duo và console phải từ 900px.
- **Popup một câu compact**: sau khi chọn, 3 đáp án thu gọn còn 1 dòng, feedback có mặt KIM + giải thích; footer dính đổi "Chọn một đáp án" → "Tiếp tục"; queue FIFO, ẩn thành pill và mở lại.
- **KIM có mặt trong suốt trạm**: mặt hologram SVG/CSS 4 mood, nói typewriter (reduced-motion hiện đủ câu), phản hồi sau mỗi câu và một câu chốt theo điểm trạm; khung KIM là live region cho screen reader.
- **Sương thật ở trạm S**: 4 ô 2×2 che nội dung website bằng blur + chữ mờ; chạm mở một ô hoặc rê đánh dấu nhiều ô rồi thả tay; sương tan trước khi câu hỏi mở.
- **Trạm A có nhịp chốt**: 3 icon chòm sao (Sứ mệnh/Tầm nhìn/Giá trị), chip horizon 1/3/5 năm, đặt logo lên bản đồ 2 trục rồi chờ 850ms mới chốt (preset chốt ngay).
- **5 mini-game** một ngón tay, quyết định nằm trong hành động: quét sương thật, nối chòm sao + horizon + bản đồ định vị, tìm mockup sai + test ghi nhớ, sắp kế hoạch + khủng hoảng 30 giây, tua 12 tháng giữ nhất quán.
- **Chấm điểm** 0–10 mỗi trạm + “reality check” khi lời tự chẩn đoán không khớp website.
- **Báo cáo**: radar 5 trục, 2 vùng tối + hệ quả, 3 insight (DeepSeek nếu có key, template nếu không), map sang **catalog gói thật**, lead gate, PDF, thẻ chia sẻ 9:16, leaderboard opt-in.
- **Mobile-first + fold/duo + desktop lớn**: breakpoint 900 (console phải) / 1200 / 1600, landing 2 cột, map orbit stage, console trạm thu gọn được, report 2 cột; viewport fold/duo 344×882, 725×870, 540×720, 884×1104; safe area, tap ≥44px, 2.5D fallback, PWA, resume offline.
- **Âm thanh nền mặc định bật**: pad thiên hà êm (sine, ít hài, có melody chậm) đổi theo màn hình/trạm, lần chạm đầu mở khoá, nút loa tắt/bật và nhớ lựa chọn; SFX gõ chữ khi KIM nói và chuông nhẹ khi chốt đáp án quiz; intro mobile cho tàu bay vòng quanh hành tinh để không bị cắt ở mép.

## Kiến trúc

```
src/
  app/        App shell, routing, persistence
  screens/    Landing → Scan → Confirm → Launch → Map → Planet → Finale → Report
  ui/         primitives + poster/orb + radar/starfield
  game/       content 18 quyết định + 5 mini-game + components (GameDock, KIM, QuestionFlow)
  three/      SceneCanvas (lazy) + Poster 2.5D (không kéo three)
  shared/     types, api schema, scoring, offers, insights, planets
  styles/     token + Tailwind 4
server/
  crawl/      fetch, SSRF, robots, parse, logo, palette, pre-scan
  routes/     API Hono
  db/         node:sqlite
  ai/         DeepSeek + template
  crm/        outbox webhook
  assets/     font cho PDF
docs/         bộ 11 tài liệu thiết kế (00–10) + spec nội bộ
```

- Client: Vite 8 + React 19 + R3F 9 + three 0.187 + Tailwind 4 + zustand.
- Server: Hono + `node:sqlite` + sharp + cheerio + pdfkit.
- Ba chunk: UI/landing ban đầu, chunk three chỉ tải sau khi bắt đầu quét, chunk từng mini-game.

## Biến môi trường

Xem `.env.example`. Quan trọng:

| Biến | Ý nghĩa |
|---|---|
| `PORT` / `HOST` | port API/server (mặc định 8788) và bind host (`127.0.0.1` dev, `0.0.0.0` trong Docker) |
| `DATA_DIR` | nơi lưu SQLite/cache/asset (`./.data`) |
| `IP_HASH_SALT` | salt hash IP — **đổi ở production** |
| `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` | tùy chọn; thiếu → insight template |
| `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` | tùy chọn; thiếu → CSV + outbox |
| `ADMIN_TOKEN` | bảo vệ `/api/admin/leads.csv` |
| `VITE_BOOKING_URL` | link đặt lịch; trống → mở form lead |
| `VITE_SHOW_PRICE` | `0` để ẩn khoảng giá trong báo cáo |

## Kiểm thử & QA

```bash
npm run typecheck
npm test               # unit: scoring/offers/content/crawl
npm run test:e2e       # Playwright 390×844 + desktop 1440, flow demo
npm test -- tests/game/flows.test.tsx   # dock, popup, sương, delay 850ms, KIM
npm test -- tests/game/intro.test.ts tests/game/content-copy.test.ts   # intro flag + quy chuẩn copy
npm run shots          # ảnh chụp các màn chính vào shots/
```

Ma trận thiết bị/webview và tiêu chí đạt nằm ở [docs/09-mobile-qa.md](docs/09-mobile-qa.md).

## Làm game mới với bộ skill

Repo có bộ **skill + kit + playbook** để tái sử dụng quy trình làm game cho brand khác, không khóa vào câu chuyện hiện tại:

- Hướng dẫn & prompt test: [SKILLS.md](SKILLS.md)
- Skill generic: [.dsh/skills](.dsh/skills)
- Kit copy được: [kits](kits/README.md)
- 5 kịch bản test: [playbooks/scenarios](playbooks/scenarios/README.md)
- Case study hiện tại: [playbooks/case-saokim.md](playbooks/case-saokim.md)

```bash
npm run skills:check
```

## Tài liệu

Bắt đầu ở [docs/README.md](docs/README.md). Tóm tắt một trang: [docs/00-tom-tat.md](docs/00-tom-tat.md).

## Giới hạn của bản này

- Chưa deploy public; Dockerfile + compose chỉ là artifact.
- Chưa đấu nối CRM thật (webhook/outbox/CSV).
- Chưa có voice-over; KIM là mặt SVG + text + synth. Chưa test trên thiết bị Zalo/Facebook thật (đã có checklist).
- AI insight cần `DEEPSEEK_API_KEY`; không có key vẫn đủ 3 insight template.
- Thông tin pháp nhân/DPO/booking còn placeholder — xem `src/config/site.ts`, `src/config/legal.ts`.

## Ghi chú thương hiệu

Logo, màu và font thuộc Sao Kim Branding. Ảnh tham chiếu framework: [docs/assets/saokim-framework.jpg](docs/assets/saokim-framework.jpg). Không dùng asset ngoài brand trừ khi có quyền.
