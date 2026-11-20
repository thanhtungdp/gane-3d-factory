# QA Playwright kit

Test mẫu cho game mobile-first. Copy, đổi `baseURL`, test ID, selector; không phụ thuộc story.

## Files

| File | Dùng cho |
|---|---|
| `templates/viewport-matrix.spec.ts.template` | CTA + overflow + no-scroll |
| `templates/cta-visible.spec.ts.template` | CTA trong viewport |
| `templates/no-scroll.spec.ts.template` | một vùng cuộn / body |
| `templates/content-copy.test.ts.template` | prompt/option limits |

## Nguyên tắc

- Không chụp ảnh làm bằng chứng duy nhất; assert số đo.
- Test phải chạy được không cần mạng ngoài (demo mode).
- Dùng `?intro=0` để bỏ intro trong test trừ test intro.
- Một test viewport loop qua danh sách, không copy 8 file.
- Test nội dung chạy ở unit, không cần browser.

## Lệnh

```bash
npx playwright test
npm test
```
