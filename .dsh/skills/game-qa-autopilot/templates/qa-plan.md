# QA plan — {{game}}

## 1. Matrix

| Viewport | Thiết bị đại diện | Gate |
|---|---|---|
| 320×640 | iPhone SE / fold cover nhỏ | P0 |
| 344×882 | fold cover dọc | P0 |
| 390×844 | iPhone phổ thông | P0 |
| 540×720 | duo một màn | P1 |
| 725×870 | fold inner dọc | P0 |
| 884×1104 | fold/tablet lớn | P1 |
| 1024×600 | landscape thấp | P1 |
| 1440×900 | desktop | P0 |

## 2. Assertions

- Primary CTA visible, `bottom <= viewportHeight + 1`.
- `scrollWidth - innerWidth <= 1`.
- `document.scrollingElement.scrollTop === 0` khi mở màn.
- Không có 2 scroller lồng nhau.
- Popup: `.sheet__body` `scrollHeight <= clientHeight + 1` sau khi chọn (mục tiêu 320×640).
- Tap target ≥44px.
- Audio toggle `aria-pressed` đúng; reload nhớ.
- Reduced motion CTA hiện ngay/không mất.

## 3. Test files

| File | Nội dung |
|---|---|
| `qa/viewport.spec.ts` | matrix + CTA |
| `qa/question.spec.ts` | one-question sheet |
| `qa/intro.spec.ts` | intro gate/skip/replay |
| `qa/content-copy.test.ts` | prompt/option limits |
| `qa/audio.spec.ts` | default/unlock/mute |

## 4. Screenshot list

- `intro-mobile`, `landing-mobile`, `play-mobile`, `question-mobile`, `result-mobile`
- `desktop-play`, `desktop-report`
- `fold-cover`, `fold-inner`, `duo`
- `low-tier`

## 5. Known risks

- Auto-downgrade quality làm mất hiệu ứng: kiểm tra low-tier fallback.
- iOS audio chưa unlock: kiểm tra sau gesture.
- Fold đổi kích thước giữa phiên.
- Nội dung dài làm CTA bị đẩy.
