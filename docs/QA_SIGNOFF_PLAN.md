# THE TREASURE — QA Release Sign-off Plan

**Purpose:** Release decisions are evidence-based. A green CI build is necessary, but it is not a gameplay sign-off.

## Current gate status (2026-10-10)

- [x] Playwright browser smoke suite passed on GitHub Actions run 38054227064.
- [x] Android debug APK, unsigned release APK, and unsigned AAB built and uploaded from branch `qa/playwright-allure-ci`.
- [x] Playwright/Allure evidence artifact uploaded.
- [ ] Full chapter-by-chapter functional regression with evidence.
- [ ] Real Android device validation (including POCO M2 Pro).
- [ ] Audio/music and interruption/resume checks on device.
- [ ] Final visual approval of immersive bars, HUD, dialogs, controls, and chapter transitions.
- [ ] Signed release build and Play Console test-track verification.

**Decision: NOT SIGNED OFF FOR PRODUCTION.** Current CI proves the browser smoke suite and build pipeline pass. It does not prove every gameplay objective, smooth frame pacing, physical-device touch behavior, audio, or Play Store readiness.

## Release-blocking acceptance criteria

### 1. Chapter-by-chapter gameplay

Repeat for Chapters 1, 2, 3, and 4 independently. Capture a screenshot/video at start, during play, at the objective/transition, and at the chapter end.

- [ ] Chapter loads offline from the packaged assets; no blank/black/frozen frame.
- [ ] Objective and next action are understandable without external instructions.
- [ ] Movement is continuous and predictable; diagonal movement is not faster unless intentional.
- [ ] Interact triggers the correct nearby object/action and does not trigger unrelated objects.
- [ ] Objectives, collectibles, health, checkpoints, and progression update correctly.
- [ ] Failure/restart and recovery do not soft-lock the chapter.
- [ ] Chapter completion and next-chapter transition happen once, without duplicate overlays.
- [ ] No console errors, uncaught exceptions, broken assets, or dead-end progression.
- [ ] Chapter 4 ending is reachable and the game provides a clear completion state.

### 2. Immersive layout and overlays

- [ ] Landscape is stable; content respects cutouts and safe areas.
- [ ] During gameplay, shell navigation/header/footer bars are hidden as intended.
- [ ] Top and bottom in-chapter HUD/control rows are compact and do not consume excessive play area.
- [ ] Canvas/game world uses the available viewport without letterboxing caused by CSS or accidental black bars.
- [ ] HUD, labels, controls, and menu remain inside the visible screen at 16:9, 20:9, and short landscape heights.
- [ ] No overlapping, clipped, off-screen, or unreachable buttons.
- [ ] Intro, chapter transition, pause/menu, and ending overlays appear only when expected and can be dismissed/recovered from.
- [ ] No recurring/intrusive pop-ups during active play; no invisible overlay intercepts touch input.
- [ ] Menu can be opened, chapter changed, resumed, and dismissed without losing progression unexpectedly.

### 3. Touch controls and interaction

- [ ] Every movement button responds on touch-down and stops reliably on touch-up/cancel.
- [ ] Multi-touch (move + interact) is tested where supported.
- [ ] Buttons have adequate spacing and hit targets; controls do not obscure nearby objectives.
- [ ] No stuck movement after app backgrounding, orientation/system interruption, or pointer cancellation.
- [ ] Interact works at the intended range and provides feedback when too far away.
- [ ] Restart and chapter switching require deliberate input and do not fire on accidental touches.

### 4. Audio and device lifecycle

- [ ] Music is audible at a comfortable level; MUSIC ON/OFF state matches actual audio.
- [ ] Audio starts/resumes under Android WebView autoplay restrictions using a user gesture where needed.
- [ ] No doubled music after restart or chapter switch; audio does not unexpectedly continue after leaving gameplay.
- [ ] Home/resume, notification shade, incoming interruption, lock/unlock, and app background/foreground are checked.
- [ ] No crash, blank WebView, lost input, or broken audio after resume.

### 5. Performance, reliability, and regression

- [ ] Cold launch and each chapter transition complete without a prolonged unresponsive state.
- [ ] No reproducible freeze, runaway CPU, memory growth, or severe frame drops during a 10-minute play session.
- [ ] Repeated chapter switches and restarts do not accumulate duplicate event handlers, overlays, or audio.
- [ ] Playwright Chromium desktop and mobile-sized projects pass.
- [ ] Android build, available unit tests, and static asset/API checks pass.
- [ ] Test artifacts include HTML report, Allure report/results, screenshots, videos, traces, and JUnit output.

## Required evidence and defect handling

For every failure, record: build/commit SHA, device + Android version, chapter, exact reproduction steps, expected vs actual behavior, severity, screenshot/video, and Playwright trace/log where applicable. Fix root cause, rerun the failing test, then run the regression suite.

- **P0 / Critical:** crash, data loss, install/launch failure, progression impossible — release blocked.
- **P1 / High:** chapter cannot be completed, core controls fail, intrusive overlay blocks gameplay, severe layout/audio failure — release blocked.
- **P2 / Medium:** visible clipping, inconsistent controls, repeatable performance issue, misleading objective — release blocked unless explicitly waived with documented rationale.
- **P3 / Low:** cosmetic issue with no meaningful gameplay impact — document and prioritize.

## Final sign-off record

- Build/version and commit:
- QA run URL:
- Device(s) and Android versions:
- Chapter 1 result / evidence:
- Chapter 2 result / evidence:
- Chapter 3 result / evidence:
- Chapter 4 result / evidence:
- Immersive layout/control result:
- Audio/lifecycle result:
- Open P0/P1/P2 defects:
- QA decision: **PASS / FAIL / NOT TESTED**
- Reviewer and date:

A production PASS requires all release-blocking items to pass, no open P0/P1 defects, real-device checks completed, and a signed build verified through the intended Play Console test track.

## External design references (reviewed 2026-10-10)

These are design-quality references, not a request to copy their art, branding, or proprietary content.

- Google Play India’s live Games landing page: https://play.google.com/store/games?gl=in — current surfaced categories include casual, action, racing, adventure, and puzzle titles. Use the page for a fresh market scan before release; rankings vary by user and date.
- Google Play India Best of 2025: https://blog.google/intl/en-in/products/platforms/google-play-best-apps-and-games-of-2025/ — CookieRun India: Running Game was named Best Game in India for 2025. Useful reminder: culturally resonant presentation and strong audience connection matter alongside technical correctness.
- Google Play Best Games of 2025 editorial page: https://play.google.com/store/apps/editorial?hl=en_IN&id=mc_games_cmp_bestof2025_fcp — Pokémon TCG Pocket was highlighted for tactile, satisfying interactions; Disney Speedstorm for responsive controls and cross-device optimization. Transferable principles for THE TREASURE: clear touch feedback, deliberate transitions, responsive controls, and a coherent experience across screen sizes.

Benchmark focus for THE TREASURE: use a clean, low-distraction gameplay viewport; keep critical controls visible and predictable; use short, skippable transitions; make objectives and interactable objects legible; avoid decorative UI that competes with the game world. Do not add features merely because competitors have them—prioritize fixing current core gameplay and presentation.
