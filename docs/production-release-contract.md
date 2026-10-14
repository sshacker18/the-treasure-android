# THE TREASURE — Production Release Contract

This branch is the production-candidate workstream, not a prototype APK delivery.

## Product contract

- User-facing Android application name: **The Treasure**.
- Keep the existing Android application ID `com.thetreasure.game` so an in-place update remains possible with the matching upload/signing identity.
- One linear campaign: **4 chapters × 4 scenes = 16 scenes**.
- Every scene must have a distinct environment/scenery brief, objective, story beat, character dialogue, music cue, ambient cue, and sound-effect cues.
- Use the same compact landscape gameplay UX across chapters: tap-to-move, circular left controller, automatic pickups/interactions, small minimap on the right, mission text at top-left, and the two-option assistant. Avoid chapter-name clutter and legacy manual interact controls.
- Story, scenery, dialogue, and audio must work offline from bundled assets or a deterministic local audio engine.

## Required gates before the user receives the final application

1. Integrate the campaign manifest into the actual runtime and implement linear scene progression; a content file alone is not sufficient.
2. Verify all 16 scene transitions, objective state, dialogue, audio cues, chapter completion, replay, and save/reset behavior.
3. Run the complete Playwright E2E suite through the Tester User 1 pipeline. Preserve traces, screenshots, videos, and reports; no swallowed JavaScript errors.
4. Validate Android packaging, app label, stable application ID, target SDK, version code, asset inclusion, offline behavior, landscape layout, and audio lifecycle.
5. Build and verify a signed release APK and signed AAB using protected upload-key secrets. The downloadable filenames must be `THE-TREASURE.apk` and `THE-TREASURE.aab`, not `app-debug.apk`.
6. Do not call the build production-ready merely because a CI job is green. The campaign runtime integration gate, automated E2E tests, signature verification, and final release review must all pass.

## Current branch work

- Added the 16-scene campaign content contract at `app/src/main/assets/campaign-manifest.json`.
- Added a production pipeline that invokes the Tester User 1 Playwright workflow, validates campaign/runtime integration, requires release-signing secrets, and uploads clearly named signed release outputs.
- Runtime integration and complete-game verification are still required before this branch can produce a release candidate. Do not distribute an intermediate artifact.
