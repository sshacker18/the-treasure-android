# RELIC V2 — Linear Campaign Implementation

## Product decision
Build Version 2 as the next campaign in the existing Android project, not a separate app. Preserve the current release candidate on `main`; all V2 changes land on `feature/relic-v2-linear-campaign` and are merged only after CI and review pass. Keep the existing application ID and signing lineage so this remains an upgrade path rather than a separate Play Store app.

## Campaign structure
Four story chapters, each with four linear stages: 16 stages total. Every stage in a chapter must be more difficult than the previous one. The first stage teaches/reinforces mechanics; stage two combines mechanics; stage three adds stronger enemy patterns and tighter hazards; stage four is a chapter climax/boss or set-piece. Difficulty carries forward across chapters; Chapter 2 begins above Chapter 1's peak, and so on.

- Chapter 1 — The Forgotten Jungle: Into the Wild; Broken Trails; Hunter's Path; Ancient Gate.
- Chapter 2 — The Sunken Temple: The Descent; Hall of Traps; The Waterworks; Temple Guardian.
- Chapter 3 — The Lost Kingdom: Beyond the Ruins; Abandoned City; Shadows of the Past; Broken Crown.
- Chapter 4 — The Final Relic: Forbidden Passage; Trial of the Relic; Final Guardian; Treasure Revealed.

## Characters and visual direction
- Explorer protagonist: original pulp-adventure archaeologist silhouette (wide-brim hat, weathered field jacket, satchel, boots, whip/rope as an optional tool); evoke classic adventure cinema without copying Indiana Jones trademarks or an actor's exact likeness.
- Sameer: tribal jungle guide/companion, capable and resourceful, designed respectfully with a specific fictional culture and practical clothing; avoid generic or stereotyped costume shorthand.
- Mina: city-born researcher/adventurer, beautiful and expressive, practical explorer clothing, clearly readable silhouette and active gameplay role.
- Enemies: jungle wildlife, temple guardians, undead/stone golems, chapter-specific boss silhouettes.
- Visuals: coherent hand-painted 2D art, parallax backgrounds, limited but expressive animation. Prefer sprite sheets / atlas with explicit frame metadata to manually cropped individual image assets.

## Runtime/technology
Keep the existing Android WebView + HTML/JavaScript game runtime for V2's first implementation; it is already integrated into Android packaging and GitHub Actions. Use Canvas 2D for sprite animation, parallax and effects. Three.js is primarily a 3D/WebGL framework and adds complexity for this 2D target; do not migrate to it without a measured need. Python may be used in the asset pipeline to crop/pack atlases and validate dimensions, but should not be a runtime dependency in the Android app.

## Architecture requirements
- Scene registry: 16 named stage definitions, shared renderer/physics/input systems.
- Explicit stage progression and stage unlock persistence.
- Save/checkpoint state, pause/resume lifecycle and audio lifecycle.
- Data-driven stage difficulty: enemy health/speed/attack cadence, hazard timing, platform spacing and checkpoint placement.
- Transitions use short cinematic/fade/camera pans, never duplicate PLAY AGAIN or unexpected pause overlays.
- Accessibility: readable UI, scalable touch controls, no reliance on tiny text.
- Performance: target stable 60 FPS where device permits; avoid loading every stage's assets simultaneously; verify on POCO M2 Pro / Android 15.

## Delivery gates
1. Inspect current runtime and existing tests before changing gameplay.
2. Integrate the first production-quality scene framework and character animation support in this feature branch.
3. Add automated regression tests for stage ordering, progression, replay, app background/resume audio, and completion flow.
4. Build Android APK and AAB in existing GitHub Actions.
5. Review CI and PR diffs; do not merge if checks fail.
6. Physical-device testing is required before declaring release-ready.
7. Do not publish to Google Play or change production track from this branch.

## Asset slicing rule
The generated concept board is a visual reference, not a ready-to-use sprite sheet: it combines portraits, turnarounds, environments, text and miniature poses with inconsistent scale. Do not blindly crop it and ship those fragments as production animation. Create clean transparent sprite sheets or individual layers from consistent character art, define frame rectangles in metadata, then validate alpha bounds and animation playback. Use the concept art as the art-direction reference while preparing consistent production assets.
