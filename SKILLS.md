# SKILLS — Brand Game Factory

Bộ skill để làm game thương hiệu mới mà không bắt đầu lại từ đầu. Skill nằm trong `.dsh/skills/`, được DSH quét tự động; kit nằm trong `kits/`; kịch bản test nằm trong `playbooks/`.

> Nguyên tắc: skill **phổ quát**, không khóa vào câu chuyện hiện tại. Story hiện tại chỉ là case study ở cuối tài liệu.

## 1. Dùng nhanh

**Cách A — gọi skill trong DSH:**

Gọi tool `skill` với `name: brand-game-factory`, rồi gửi prompt:

```text
mode: design
scenario: playbooks/scenarios/02-4min-brand-diagnostic.md
```

**Cách B — nếu catalog chưa hiện skill**, đọc trực tiếp:

```text
Đọc .dsh/skills/brand-game-factory/SKILL.md và làm theo.
Sau đó đọc các skill con được nhắc tới; không đọc cả bộ.
```

> `.dsh/skills` được watch; skill mới thường có ở lượt kế tiếp. Nếu chưa, dùng Cách B.

**Prompt đầy đủ để test:**

```text
Đọc .dsh/skills/brand-game-factory/SKILL.md.
Chạy mode=design với playbooks/scenarios/02-4min-brand-diagnostic.md.
Chỉ load các skill cần thiết; xuất artifact vào playbooks/evaluation/runs/02/.
Không dùng story hiện tại; tự chọn ẩn dụ từ brand truth.
Trước khi viết, hỏi tối đa 5 câu nếu thiếu input.
```

## 2. Bốn mode

| Mode | Khi dùng | Artifact tối thiểu |
|---|---|---|
| `brief` | 15–30 phút, cần chốt ý tưởng | `brief.md`, 3 wow moments, story direction |
| `design` | 1–2 giờ, cần spec trước khi code | brief + story bible + tone matrix + storyboard + sound cue sheet + loop + cockpit |
| `build` | Cần kế hoạch dựng | design + kit mapping + `qa-plan.md` |
| `full` | Cần code và QA | build + code + test + report |

Mặc định dùng `design` nếu chưa rõ.

## 3. 11 skill

| Skill | Dùng khi | Output |
|---|---|---|
| [`brand-game-factory`](.dsh/skills/brand-game-factory/SKILL.md) | Điểm vào cho game mới | Mode, routing, artifact manifest |
| [`game-brief-for-brand`](.dsh/skills/game-brief-for-brand/SKILL.md) | Chốt mục tiêu, audience, proof | `brief.md` |
| [`game-narrative-and-tone`](.dsh/skills/game-narrative-and-tone/SKILL.md) | Cần story, ẩn dụ, giọng điệu | `story-bible.md`, `tone-matrix.md` |
| [`game-storyboard-and-sound`](.dsh/skills/game-storyboard-and-sound/SKILL.md) | Cần nhìn thấy trải nghiệm + âm thanh | `storyboard.md`, `sound-cue-sheet.md` |
| [`brand-game-loop`](.dsh/skills/brand-game-loop/SKILL.md) | Thiết kế act, câu hỏi, điểm, skip | `loop.md`, decision set |
| [`mobile-game-cockpit`](.dsh/skills/mobile-game-cockpit/SKILL.md) | Dựng UI mobile/fold | `cockpit.md` |
| [`brand-crawl-to-kit`](.dsh/skills/brand-crawl-to-kit/SKILL.md) | Cá nhân hoá theo website | `brand-kit.md`, `pre-scan.md` |
| [`brand-3d-world`](.dsh/skills/brand-3d-world/SKILL.md) | Cần 3D/2.5D, camera, quality tier | `scene-brief.md` |
| [`brand-report-gate`](.dsh/skills/brand-report-gate/SKILL.md) | Báo cáo, offer, consent gate | `report-outline.md`, `offer-map.md` |
| [`game-qa-autopilot`](.dsh/skills/game-qa-autopilot/SKILL.md) | Test viewport/CTA/no-scroll | `qa-plan.md` |
| [`game-launch-kpi`](.dsh/skills/game-launch-kpi/SKILL.md) | Đo funnel, A/B | `kpi-plan.md` |

## 4. Story, tone, storyboard, sound ở đâu

Đây là các phần trước đây dễ bị bỏ qua; giờ là **bắt buộc** trong mode `design`.

| Thành phần | Template | Skill |
|---|---|---|
| Câu chuyện, ẩn dụ, 3 hồi | [story-bible.md](.dsh/skills/game-narrative-and-tone/templates/story-bible.md) | `game-narrative-and-tone` |
| Giọng điệu, đại từ, câu mẫu | [tone-matrix.md](.dsh/skills/game-narrative-and-tone/templates/tone-matrix.md) | `game-narrative-and-tone` |
| Storyboard 6–8 beat | [storyboard.md](.dsh/skills/game-storyboard-and-sound/templates/storyboard.md) | `game-storyboard-and-sound` |
| Sound cue + mix | [sound-cue-sheet.md](.dsh/skills/game-storyboard-and-sound/templates/sound-cue-sheet.md) | `game-storyboard-and-sound` |
| Pattern ẩn dụ | [metaphor-patterns.md](.dsh/skills/game-narrative-and-tone/references/metaphor-patterns.md) | `game-narrative-and-tone` |
| Cue taxonomy + kit audio | [kits/audio](kits/audio/README.md) | `game-storyboard-and-sound` |

Case study hiện tại: [playbooks/case-saokim.md](playbooks/case-saokim.md) — chỉ đọc để tham khảo, **không copy story**.

## 5. Năm kịch bản test

| # | Kịch bản | Thời lượng | Trọng tâm |
|---|---|---|---|
| 01 | [Booth teaser](playbooks/scenarios/01-90s-booth-teaser.md) | 90 giây | Một wow, QR, không crawl, không lead |
| 02 | [Brand diagnostic](playbooks/scenarios/02-4min-brand-diagnostic.md) | 4 phút | Crawl, 3–4 act, report + lead gate |
| 03 | [Product launch](playbooks/scenarios/03-7min-product-launch.md) | 7 phút | Story world, share/leaderboard |
| 04 | [Internal training](playbooks/scenarios/04-10min-internal-training.md) | 10 phút | Knowledge score, không thu lead |
| 05 | [Fashion drop](playbooks/scenarios/05-3min-fashion-drop.md) | 3 phút | Mobile, share card, 3 act |

Mỗi file có frontmatter `skills:` và `outputs:`; `playbooks/scenarios/README.md` có matrix.

## 6. Cách chấm một lần chạy

1. Mở [rubric](playbooks/evaluation/rubric.md).
2. Chấm 10 tiêu chí 1–5: clarity, story, tone, wow, loop, one-finger, mobile, evidence, report, measurement.
3. Pass: trung bình ≥ 4 và không điểm 1. Với teaser/drop không có report, dùng profile **artifact**: Report = thiệp/share card, Measurement = tối thiểu 1 chỉ số + 1 event + 1 guardrail.
4. Ghi vào [run-log](playbooks/evaluation/run-log.md): scenario, skill đã dùng, output, điểm, lỗi.
5. Nếu fail ở story/tone → sửa skill `game-narrative-and-tone`; nếu fail mobile → `mobile-game-cockpit`; nếu fail report → `brand-report-gate`.

Bản chạy mẫu (spec draft, chưa có asset/SOP thật): [run 01](playbooks/evaluation/runs/01/run-brief.md) · [run 04](playbooks/evaluation/runs/04/run-brief.md). Cả hai đang `revise` vì Wow/Evidence cần ảnh/SOP thật — đúng như rubric yêu cầu.

## 7. Kit

| Kit | Dùng cho |
|---|---|
| [`game-shell`](kits/game-shell/README.md) | screen flow, intro gate, audio director, dock, viewport |
| [`mobile-cockpit`](kits/mobile-cockpit/README.md) | one-question sheet, cockpit CSS |
| [`qa-playwright`](kits/qa-playwright/README.md) | viewport/CTA/no-scroll/copy tests |
| [`brand-crawl`](kits/brand-crawl/README.md) | brand kit + pre-scan contract |
| [`three-world`](kits/three-world/README.md) | scene brief, quality tier, motion |
| [`audio`](kits/audio/README.md) | sound cue taxonomy, mix, reference map |
| [`report-lead`](kits/report-lead/README.md) | report, lead gate, offer map |

Kit là template/reference; copy file `.template` rồi bỏ hậu tố. Không copy story/asset hiện tại.

## 8. Thêm skill mới

1. Tạo `.dsh/skills/<name>/SKILL.md`.
2. Frontmatter:

```yaml
---
name: kebab-case
description: Use when ...
---
```

3. Đủ heading: `When to use`, `Inputs`, `Steps`, `Outputs`, `Quality gates`, `Handoff`.
4. Giữ ≤ 7500 ký tự; chi tiết đưa vào `references/` hoặc `templates/`.
5. Không hardcode brand/story hiện tại.
6. Chạy:

```bash
npm run skills:check
npm test
```

Validator kiểm tra frontmatter, heading, link, kích thước, scenario, kit và brand-hardcode. Nếu skill mới ngoài danh sách chuẩn, cập nhật `EXPECTED_SKILLS` trong `scripts/validate-skills.mjs` và bảng ở trên.

## 9. Ghi chú vận hành

- DSH tự watch `.dsh/skills`; skill mới thường xuất hiện ở lượt kế tiếp. Nếu chưa thấy, đọc trực tiếp file.
- `.dsh`, `kits`, `playbooks` không được ship vào production image.
- Không đưa API key, dữ liệu khách, asset độc quyền vào skill/template.
- Âm thanh trong kit là hướng dẫn + synth reference, không kèm file thương mại.
- Mọi game mới vẫn phải qua [quality gates](.dsh/skills/_shared/quality-gates.md).
