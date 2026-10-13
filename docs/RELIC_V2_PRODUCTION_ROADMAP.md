# RELIC V2 — Production Game Roadmap

**Decision status:** approved direction for development planning; NOT a production release plan.
**Current prototype:** Canvas 2D browser proof-of-concept on `qa/relic-v2-adventure-prototype`.
**Target platform:** Android landscape first, with the POCO M2 Pro (Android 15 / LineageOS) as the primary manual test device.
**Build policy:** no routine APK installation during feature development. Use browser preview and CI tests first; create a single consolidated Android UAT candidate only when the vertical slice and release gates are ready. Cloud CI builds may run for technical verification, but they are not requests to install builds on the user's phone.

## Product target

A polished, approachable 3D/2.5D adventure with four chapters and sixteen campaign stages, one recognizable original human hero, authored dialogue and generic licensed voice assets, checkpoints, optional assists, secrets, hazards, enemy encounters, boss patterns, a clear finale, and optional non-disruptive rewarded ads after policy and retention testing.

The first commercial release must be scoped to a complete, enjoyable campaign—not an open world, online multiplayer, or a cinematic AAA-scale production. "PS5-level feel" is interpreted as strong art direction, responsive controls, readable animation, satisfying feedback, sound design, and polished presentation, not console-scale content volume or graphics.

## Recommended technology direction

Evaluate Godot 4.x for the production game rather than extending the Canvas prototype indefinitely. Build a small Android vertical slice before committing the entire campaign:
- landscape 3D/2.5D camera and one production-quality playable level;
- one rigged, original humanoid hero with idle/run/jump/land/dodge/attack/interact animations;
- joystick and four action buttons with configurable size, left-handed option, pause/resume, and safe touch zones;
- one enemy, one environmental hazard, one checkpoint, one collectible/secret, and one simple objective;
- one short dialogue scene with subtitles, pre-generated licensed voice audio, replay/mute controls;
- save/progression persistence and reliable Android lifecycle/audio behavior;
- measurable performance on the target phone before expanding scope.

If the vertical slice cannot meet the agreed visual/performance budget, simplify lighting, effects, environment density, animation complexity, or use a 2.5D presentation before building sixteen levels.

## Phase gates

### Gate 0 — Stabilize the existing browser prototype
- [ ] Repair all failing Playwright tests; no skipped or masked failures without an explanation.
- [ ] Validate stage navigation, all 16 metadata entries, controller pointer lifecycle, action feedback, dialogue fallback, resize, reduced motion, and browser console errors.
- [ ] Generate a current browser-preview ZIP and verify that HTML, engine JS, and audio files are packaged together.
- [ ] User evaluates that ZIP and gives feedback on control layout, hero readability, dialogue, and stage flow.
- Exit: green browser tests and an identifiable preview artifact; still not a release.

### Gate 1 — Art/technology spike
- [ ] Create a Godot 4.x test project on a separate feature branch, not in the production Android branch.
- [ ] Evaluate original hero design and properly licensed starter assets; do not ship placeholder/third-party assets without asset-register entries.
- [ ] Compare 3D and 2.5D camera options on the target device.
- [ ] Test export, input latency, frame pacing, memory, thermals, and resume-from-background.
- Exit: vertical slice runs acceptably on the target device and the chosen rendering approach is documented.

### Gate 2 — Production vertical slice
- [ ] Finalize one hero rig and animation state machine.
- [ ] Deliver one complete beginning-to-end level with movement, jumping, interactions, a hazard, enemy encounter, checkpoint, collectable, and clear success/failure/retry behavior.
- [ ] Add sound mix, subtitles, dialogue playback, pause/settings, accessibility options, and persistence.
- [ ] Add automated engine/unit checks where practical plus UI/smoke tests and a repeatable Android export.
- Exit: user and at least one additional tester can complete the level without developer intervention; no critical defects.

### Gate 3 — Campaign production
- [ ] Implement all four chapters and sixteen stages using reusable level components and data-driven configuration.
- [ ] Introduce mechanics gradually, then combine them for chapter finales and boss encounters.
- [ ] Complete checkpoints, save migration, unlocks, secrets, objectives, and ending/credits.
- [ ] Keep difficulty accessible by default, with optional harder challenges.
- Exit: full campaign can be completed; progression and save state survive restart/update.

### Gate 4 — Content, performance, and monetization
- [ ] Complete art, animation, music/SFX, dialogue, credits, and asset provenance.
- [ ] Profile on low-end Android hardware; fix frame drops, memory spikes, thermal issues, audio interruptions, and lifecycle bugs.
- [ ] Add analytics/ads only after a privacy and SDK review; use test ads, optional rewarded placements, and a working no-ad route.
- [ ] Check current Google Play requirements and complete Data safety, privacy, content rating, ads, target audience, signing, and app-access declarations.
- Exit: no unresolved critical/high-severity issues; all content has evidence of commercial usage rights.

### Gate 5 — Single UAT candidate
- [ ] Freeze the candidate commit and tag it.
- [ ] Run the full automated suite and Android build against that exact commit.
- [ ] Generate one installable UAT artifact; record SHA-256, version, package ID, and signing certificate.
- [ ] Preserve the original app signing identity where update compatibility is required; never ask the user to uninstall existing RELIC to work around a signing mismatch.
- [ ] User tests on POCO M2 Pro and reports gameplay/audio/performance results.
- Exit: all required tests pass, user signs off, and no install/update/signing blocker remains.

### Gate 6 — Store release
- [ ] Produce the signed release artifact from the approved candidate using the verified signing identity.
- [ ] Run final install/update smoke tests and validate store listing/screenshots/privacy disclosures.
- [ ] Submit through the intended Play Console track; handle review feedback without bypassing policy.
- [ ] Monitor crashes, retention, stage completion, reviews, ad quality, and revenue after launch.
- Exit: store approval and successful rollout. Revenue is not guaranteed; do not make income claims before observing actual results.

## Testing and release discipline

- Browser preview is the fastest feedback loop for layout, dialogue text, stage data, and basic input.
- Automated CI validates code and packaging; it cannot certify real-device feel, battery/thermal behavior, speaker quality, or touch comfort.
- Only the user can confirm physical-device UX; record feedback as reproducible issues with device, steps, expected behavior, actual behavior, and screenshot/video where helpful.
- Never label an artifact "production-ready" solely because it builds or because unit/browser tests pass.
- Do not promote a prototype branch directly to production. Use reviewable PRs and a single approved candidate.
- Keep production APKs off the phone until UAT; the user should not need to install every development build.

## Scope and schedule expectations

This is a multi-phase indie game project, not a quick UI conversion. A realistic estimate depends heavily on whether the art and animation are custom, how sophisticated combat/boss mechanics become, and what performance the target device can sustain. The vertical slice should be used to revise the estimate before committing to all sixteen stages. Prefer a smaller polished complete release over a large unfinished campaign.

## Commercial and rights rules

Follow `docs/COMMERCIAL_PUBLISHING_GATES.md`. No copied game characters, unlicensed music, unclear model/voice terms, unauthorized likenesses, fake installs, incentivized ad clicks, or misleading reward promises. Retain licenses, attribution notices, source URLs, and hashes for shipped assets.
