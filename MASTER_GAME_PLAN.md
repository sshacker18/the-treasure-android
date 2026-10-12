# THE TREASURE — Master Game Expansion Plan (32 Levels)

**This is the living operating plan for every AI agent working on this repository. Read it before every task, inspect the real code and CI, then update it when the facts or plan change.** This document describes intended work, not proof that features already exist.

## 0. Mandatory AI protocol — every task

Before writing code:
1. Read this file and inspect the current branch, working tree, latest commit, open PRs, and relevant CI runs.
2. Inspect actual code for the Android host/WebView, shell, level loading, movement/collision, interactions, HUD, audio, persistence, assets, tests, and workflows relevant to the task. Do not assume this plan describes the current implementation.
3. Map the task to screenplay pages/character beats below. Classify each relevant feature as implemented, partial, broken, or proposed, with file/function/test evidence.
4. State goal, scope, exclusions, affected files, dependencies, acceptance criteria, tests, and rollback risk before making large changes.
5. Prefer one coherent, reversible, reviewable increment. Split large work into sequential non-conflicting PRs; never build all 32 levels in one giant commit.
6. Run fast checks, then relevant full CI. Inspect logs and screenshots. Separate stale test selectors/environment failures from real defects.
7. Update this plan when the level map, architecture, controls, assets, data model, acceptance criteria, or release gates change.
8. Report exact commit SHA, changed files, workflow URLs/status, test failures, artifact status, known issues, and physical-device checks still outstanding.
9. Never say “passed” for a running/missing workflow; never equate browser testing with device validation, build success with a playable game, or unsigned APK with a production release.
10. Do not merge, release, delete artifacts, or change signing credentials without authorization. If code and plan disagree, verify current intent and update this document; do not blindly revert working code.

**Required task summary:** Current state verified · screenplay beats · scope/out of scope · files/components · acceptance criteria · tests/evidence · risks/rollback · results/next step.

## 1. Product goal and principles

Build a polished, offline-first, landscape Android adventure with **32 meaningful playable entries** grounded in the uploaded *THE TREASURE — 120-Page Screenplay / Camera Technique Plan*. The game should feel authored and human: readable characters, deliberate pacing, environmental storytelling, cinematic reveals, emotional consequences, varied objectives, coherent art direction and sound—not 32 reskinned rooms or repetitive fetch quests.

Preserve Arbaaz, Sameer, Mahesh, the map/geometric symbol, Raghu and the key, tiger Raju, the Guardian, the treasure as a mechanical seal, friendship, loss, restitution, and the final unresolved metallic sound. Game-only puzzles and optional content may expand the experience but must not contradict the story's moral/emotional logic. Sameer’s and Mahesh’s deaths are narrative turning points, not cheap random fail states.

Keep gameplay offline and bundle local assets/audio. Track asset source, author, license, attribution, modifications and path. Design for touch and common phone aspect ratios; verify on the POCO M2 Pro / Android 15 LineageOS where available. Keep navigation obvious, goals explicit, feedback immediate, and failures recoverable. Translate screenplay camera techniques into feasible game composition, lighting, reveal timing, movement, sound and player agency—not literal film camera simulation.

## 2. Screenplay spine — source-grounded narrative

The screenplay contains 120 story beats and a camera-technique appendix. Preserve this progression:

- **Pages 1–15 — Return/discovery:** Arbaaz returns to the village, studies the hidden map, reconnects with Sameer, prepares, follows a symbol, finds engineered ruins.
- **16–25 — Key/warning:** inscriptions explain the locked door; the map leads to a waterfall cave; Raghu gives Arbaaz the key and warns them not to enter.
- **26–36 — Forest/descent:** campfire friendship, tiger chase, Mahesh and Raju reveal, door mechanism solved, group descends underground.
- **37–49 — Guardian/treasure:** Guardian fight; friends coordinate the chamber mechanism; Guardian yields; they take only limited treasure.
- **50–63 — Reward/false ending:** return, legitimate sale of limited gold, improved lives, Arbaaz keeps one coin in a box marked “OUR TREASURE.”
- **64–70 — Consequence:** ordinary chain reaction causes Sameer’s fatal accident; grief and the coin prompt the realization that the warning concerned removing what was sealed.
- **71–86 — Restitution/loss:** friends decide to return the gold, sell possessions and recover what they can; Mahesh dies saving the gold; Arbaaz reconstructs “THREE ENTERED. NONE SHALL CARRY WHAT WAS SEALED.”
- **87–101 — Sacrifice/escape:** Arbaaz returns the gold, realizes it is the weight of a mechanical seal, restores the pattern, places the final coin and escapes through a maintenance passage as the chamber seals.
- **102–120 — Quiet resolution/mystery:** Arbaaz returns alone, values ordinary life over wealth, helps the village, discourages another treasure hunt; one final metallic vibration leaves the mystery unresolved.

## 3. Proposed 32-level map

This is a **proposal to review**, not a claim that these levels exist. The screenplay’s 120 pages are beats, not 120 playable levels.

| # | Working title | Script beats | Gameplay intent |
|---:|---|---|---|
| 01 | Back to the Village | 1–4 | Learn movement/interact; explore village, hear rumor, notice symbol |
| 02 | The Hidden Map | 5–11 | Inspect map, reconnect with Sameer, reveal route |
| 03 | Ready for the Forest | 12–15 | Prepare supplies, learn objective markers, reach ruins |
| 04 | The Dust-Covered Plate | 16–18 | Explore ruins, reveal inscription, learn door is locked |
| 05 | Trail of Water | 19–21 | Follow markings and stream to waterfall/cave |
| 06 | Raghu’s Warning | 22–25 | Find Raghu, receive key, inspect damaged warning, choose to continue |
| 07 | Campfire Stories | 26–27 | Character dialogue, audio clues, night tension |
| 08 | Raju in the Dark | 28–32 | Chase/avoidance, reveal Mahesh and tiger, learn safe-distance cues |
| 09 | The Door Mechanism | 33–36 | Align grooves, use key, descend underground |
| 10 | The Suspended Chest | 37–38 | Explore hall, establish Guardian and chamber layout |
| 11 | The Guardian’s Trial | 39–42 | Read attack tells, evade, regroup with companions/Raju |
| 12 | Three Work as One | 43–46 | Find symbol, coordinate mechanisms, survive encounter |
| 13 | The Treasure Chamber | 47–49 | Open chest, inspect treasure, take only a limited portion |
| 14 | A Different Life | 50–56 | Return and aftermath through short interactive vignettes |
| 15 | What Wealth Changes | 57–63 | Friends’ changed lives, village improvements, keep one coin |
| 16 | The Ordinary Accident | 64–67 | Readable environmental chain reaction; no visible supernatural culprit |
| 17 | The Empty Hospital | 68–70 | Grief, inspect coin/inscriptions, infer seal was disturbed |
| 18 | Give It Back | 71–75 | Plan restitution, recover original pieces through grounded sequence |
| 19 | Return to the Forest | 76–78 | Night traversal, vibration clue, Raju follows, build dread |
| 20 | The Broken Bridge | 79–82 | Traversal/rescue; Mahesh’s death is authored narrative, not cheap fail |
| 21 | Alone with the Gold | 83–86 | Arbaaz alone; reconstruct warning in Raghu’s cave |
| 22 | The Ruins Again | 87–90 | Reopen route, empty Guardian hall, failing suspended chest |
| 23 | Pieces Out of Place | 91–93 | Pattern puzzle using gold and map symbol; teach seal logic |
| 24 | The Last Coin | 94–96 | Restore mechanism, surrender personal coin, begin sealing |
| 25 | Collapse | 97–100 | Readable timed escape and secret maintenance passage |
| 26 | The Door Closes | 101–104 | Reach surface, seal chamber, farewell at ruins/waterfall |
| 27 | The Empty Chair | 105–109 | Return alone; tea stall, empty chair, photograph, reflection |
| 28 | A Useful Life | 110–112 | Help repair village infrastructure; choose service over wealth |
| 29 | The Child’s Question | 113–118 | Answer without encouraging danger; look toward forest |
| 30 | The Final Vibration | 119–120 | Sound-led ending, ambiguity, credits |
| 31 | The Map’s Memory | Optional | Non-canonical replayable landmark/story archive |
| 32 | Relic Archive | Optional | Non-canonical unlocked puzzle/collectible replay mode |

**Levels 31–32 are proposed optional, non-canonical post-game modes** so the screenplay ending is not stretched or contradicted. If all 32 must be canonical story levels, review and approve a revised story map before implementation.

## 4. Level design contract

Before implementation, each level needs a record containing:
- Narrative: title, script pages, emotional beat, characters, start/end state.
- Primary objective, up to three optional objectives, completion condition, fail/retry rules.
- Space: boundaries, entry/exit, landmarks, hazards, traversal and phone-size readability.
- Interactions: movement, auto-interact range, puzzle rules, companion behavior, checkpoints.
- Feedback: objective marker, hints, state changes, VFX/animation, sound, success/failure response.
- Art: palette, focal point, silhouettes, props, character poses, lighting and asset list.
- Audio: ambience, music, one-shots, silence moments and license metadata.
- Performance: asset/memory budget, load time, cleanup and low-end device risks.
- QA: happy path, invalid actions, retry, pause/resume, transitions, touch targets, viewport matrix and screenshots.

A level is not done because it loads. Its objective must be completable, state/transition must work, visuals must be legible, audio must be appropriate, and required checks must pass.

## 5. Architecture — inspect before deciding

Prefer a data-driven level registry and reusable mechanics over 32 copies of bespoke shell logic, but **inspect current code before selecting an architecture**. Conceptual boundaries:
- Android host: lifecycle, immersive landscape, WebView, local asset loading, back handling.
- Shell: title, level selection, pause/resume, loading/error states, accessibility.
- Level registry: stable ID/title/story beat/assets/initial state/objective/exit/unlock.
- Reusable systems: movement, collision, interaction, objectives, puzzles, hazards, dialogue, checkpoints, saves, audio/effects.
- Content/assets: environments, sprites, props, sound/music, fonts, dialogue, license manifest.
- QA contracts: stable selectors, per-level smoke, critical path and screenshots.

Possible schema only if it fits the inspected engine:
```json
{
  "id": "level-01",
  "title": "Back to the Village",
  "storyPages": [1, 4],
  "environment": "village-morning",
  "spawn": "village-entry",
  "objectives": [{"id": "inspect-symbol", "type": "interact", "target": "stone-symbol", "required": true}],
  "checkpoint": "village-entry",
  "nextLevel": "level-02",
  "audio": {"ambience": "village-morning", "music": "exploration-soft"}
}
```
Do not implement this schema blindly. Avoid indefinitely growing one HTML blob if safe local modules/data files are feasible. Extraction must preserve Android asset loading, relative paths, WebView restrictions, offline behavior and packaging; migrate incrementally with parity tests.

## 6. Art direction and human-feeling UX

Visual progression: village—warm clay/dusty greens/lived-in props; forest—layered foliage and dappled light with readable paths; ruins—geometric stone, carved symbols and flashlight pools; waterfall/cave—cool mist and reflected light; underground—monumental scale, suspended chest and brass/stone machinery; consequence—muted palette/negative space; final seal—near-black, restrained motion and sound-led suspense.

Art rules:
- Use original or properly licensed art; document source, creator, license, attribution, edits and path.
- Never stretch assets or bundle replacements before auditing current assets/style/size budget.
- Establish distinct silhouettes and readable emotions for Arbaaz, Sameer, Mahesh, Raghu and Guardian; avoid UI emoji as final art.
- Animate meaningful feedback, not constant decoration. Respect reduced motion and avoid flashing.
- Distinguish interactable objects from decoration; never obscure paths or objectives with atmosphere.
- Provide clear tap destination feedback, blocked-path feedback, objective marker and reliable auto-interact. Prevent duplicate triggers.
- Keep targets readable at small landscape resolutions. Pause/resume must not unexpectedly reset a level.
- Show honest locked/unlocked/completed states, loading errors, retry/checkpoint behavior and activity pause/resume handling.
- Persist progress/settings only after inspecting current storage; define migration before changing saved state.
- Settings controls must work end-to-end; no dead music toggles. Dialogue should be skippable where appropriate and story context recoverable.
- Do not communicate puzzle state by color alone.

## 7. Audio

Build a cue map for village, forest, stream/waterfall, cave, footsteps, relic pickup, mechanisms, tiger warning/chase, Guardian, treasure reveal, grief, return, collapse and final metallic vibration. All audio must work offline, be locally bundled, and have license metadata. A candidate CC0 bundle mentioned in README is only a source to review; it does not mean a track has been selected or bundled.

Check autoplay/user-gesture restrictions, mixing, clipping, dialogue priority, pause/resume, focus loss, level transitions, mute, repeated loads and cleanup. File presence is not proof that music works. Silence can be a deliberate narrative tool.

## 8. QA and evidence gates

Per-level automated checks:
- Level loads without uncaught JS errors, blank canvas, permanent loader or failed local asset requests.
- Expected scene/HUD/objective appears; player moves/interacts; objective is completable.
- Correct next level and saved progress; pause/resume/restart behave.
- Critical touch targets work at small landscape sizes; no unintended shell overflow.
- Capture title, level start, key reveal/puzzle, completion and transition screenshots.

Test layers:
1. Static/content validation: unique IDs, references valid, assets exist, audio/license manifest complete.
2. Fast web smoke: title, registry, overlays, navigation.
3. Per-level smoke and critical path through all 32 entries.
4. Android build and artifact inspection.
5. Manual install/play on real devices.
6. Signing/store/Play Console tests only after prior gates pass.

Evidence standards: report exact commit SHA, workflow URL/status/conclusion, failed test names and screenshot/log review. Running or missing runs are not passes. Browser checks are not device checks. Never call unsigned artifacts production-ready. If Playwright destabilizes Android builds, keep browser QA in a separate workflow after inspecting the actual pipeline.

## 9. Delivery roadmap — do not skip gates

**Phase 0: Audit/stabilize.** Inspect repository, PRs, current four chapters, code/assets/tests/workflows and baseline defects. Fix launch/pause/transition/audio blockers. Approve level map.

**Phase 1: Foundation.** Define IDs, progression/save rules and reusable objective interface. Add content/asset validation and registry tests. Prove adding a level does not duplicate shell logic. Deliver a small PR/artifact.

**Phase 2: Vertical slice.** One polished level from title through objective, sound, checkpoint, completion and next-level transition. Verify touch, art, performance and device install before scaling.

**Phase 3: Levels 1–8.** Village/map/ruins/waterfall/key/campfire/tiger/Mahesh; add checkpoints and distinct environments; run smoke and device regression.

**Phase 4: Levels 9–13.** Door, Guardian, cooperative mechanism and treasure decision; reusable puzzle/encounter systems; validate fairness/completion.

**Phase 5: Levels 14–18.** Return, changed lives, Sameer’s accident, grief and restitution; deliberate, respectful pacing.

**Phase 6: Levels 19–26.** Return to forest, bridge loss, warning reconstruction, final mechanism, last coin and escape; clear routes/checkpoints/audio/performance.

**Phase 7: Levels 27–30.** Empty chair, village work, child’s question and final sound. Add 31–32 as labeled optional non-canonical modes unless story map is revised.

**Phase 8: Polish/release.** Optimize art/audio, accessibility and device regression; signing, store assets/listing and Play Console testing. Release only with all applicable gates green and explicit approval.

End every phase with evidence-based review and a proceed/revise/stop decision.

## 10. PR/change control

One coherent goal per PR. Keep content, engine refactor, art import and workflow changes separate where practical. PR description includes narrative beat, UX changes, files, tests, screenshots/artifacts, limitations and rollback. Never merge solely because Android build passes. Do not commit build outputs, secrets, keystores, tokens or unrelated artifacts. Update this plan in the same PR when decisions change and explain why.

## 11. Definition of done

The 32-entry game is done only when:
- 32 entries exist: 30 canonical story levels plus two clearly labeled optional modes, unless a revised canonical story is approved.
- Each has a design record, unique purpose, appropriate environment/audio, objective, completion state and transition.
- All can be reached, completed, saved/unlocked, paused and resumed as designed.
- No critical launch/navigation/input/objective/progression/audio blockers remain.
- Asset/license manifests validate; automated critical path passes and failures are reviewed.
- Final Android artifact installs and is manually exercised on target devices.
- Signing, store compliance/listing and Play Console gates are complete before production claims.

## 12. Verified snapshot — re-check every time

- Repository README currently describes a **four-chapter** offline-first Android WebView game; `app/src/main/assets/index.html` is listed as the content entry.
- Uploaded screenplay is a 120-page draft plus a camera-technique appendix.
- PR #35 (`feat/reference-mockup-ui-overhaul`) was open/unmerged when this plan was drafted; latest known commit was `65d4dca79c5f459f18744f68c8277eef861d5582`. Re-check before relying on this.
- CI for that commit was observed in progress; do not infer green results.
- Some shell art/chapter cards are CSS-based, not a finished asset pass.
- Device validation, signing and release are separate gates.
- The 32-level map is a proposal, not an approved immutable product decision.

## Final instruction

**Analyze first. Verify the real repository. Map the task to the screenplay and this plan. State acceptance criteria. Make one safe, testable increment. Inspect evidence. Update this document. Never confuse proposed work with implemented work, passing CI with a playable game, or an artifact with a production release.**
