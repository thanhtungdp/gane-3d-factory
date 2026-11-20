# Reference map — game shell

Implementation đầy đủ trong repo hiện tại (đọc để tham khảo, không copy nguyên story):

| Pattern | File |
|---|---|
| Screen flow | `src/app/App.tsx` |
| Intro gate | `src/lib/intro.ts`, `src/screens/IntroScreen.tsx` |
| Audio sau gesture | `src/app/AudioDirector.tsx`, `src/lib/audio.ts`, `src/lib/audioPrefs.ts` |
| Dock CTA | `src/game/components/GameDock.tsx`, `src/game/PlanetGame.tsx` |
| One-scroll cockpit | `src/screens/PlanetHostScreen.tsx`, `src/styles/app.css` |
| Question sheet | `src/game/components/QuestionFlow.tsx`, `src/ui/Sheet.tsx` |
| Viewports | `src/lib/useViewport.ts`, `src/styles/app.css` |
| QA matrix | `tests/e2e/station-ux.spec.ts`, `tests/e2e/intro.spec.ts` |

Thay `{{...}}` trước khi dùng. Không copy tên biến brand-specific.
