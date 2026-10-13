# THE TREASURE — Master Pipeline V2

Status: proposed replacement for the current master release workflow. This document records lessons from the October 2026 CI runs; it is not evidence that a release has passed.

## Hard lessons encoded
1. A green Android compile is not proof the game launches or is playable.
2. A JavaScript syntax error in a Playwright test file stopped test discovery entirely. Playwright is explicitly excluded from the master release pipeline.
3. Keep the master lane fast: preflight → one signed APK → install/launch smoke → one final result.
4. Never create a new signing key per run. Reuse TREASURE_QA_KEYSTORE_BASE64 and verify the APK signature.
5. A successful workflow is not physical-device sign-off. Emulator smoke and real-device gameplay are separate claims.
6. Do not call unsigned APKs production releases. Publish one signed APK artifact and its SHA-256 only.
7. Preserve failures; the always-run summary must still exit non-zero if any required gate fails or is skipped.

## Pipeline contract
### Stage 1 — Preflight and edge checks
- Confirm Gradle file, manifest, and offline game entrypoint exist.
- Parse versionCode and versionName; require positive versionCode and non-empty versionName.
- Verify expected shell/game bridge and four chapter definitions exist.
- No Node install and no Playwright.

### Stage 2 — Build and sign exactly one APK
- Call the existing reusable signed-APK workflow.
- Reuse the persistent signing key; do not rotate or regenerate it.
- Verify the APK signature and checksum.
- Do not advertise AAB, unsigned APK, or debug APK as the release artifact.

### Stage 3 — Install and launch smoke
- Download the signed APK from this same workflow run.
- Start an Android emulator, install the APK, launch the app, inspect resumed activity and crash output.
- This proves install/launch smoke only, not all levels, audio, touch controls, or progression.

### Stage 4 — Single master verdict
- All required jobs must pass.
- Summary reports outcomes and fails the workflow when any required job fails or is skipped.
- Include commit, run URL, version, artifact, and checksum in the summary.

## Release gates outside this fast lane
- Verify in-place upgrade over the exact previously distributed signed APK with the same signing certificate. A debug build or new key is not a valid baseline.
- On a physical Android device verify Begin Chapter, tap-to-move, auto-interact/relic collection, pause/resume, Chapters 1–4, audio, orientation, system bars, and persistence.
- Inspect a full session for blocking screens, freezes, and progression dead ends.
- Verify Play Console version/signing requirements before upload.

The repository has a reusable signing workflow, but no durable previous-release APK baseline was confirmed during this audit. V2 must not claim in-place upgrade verification until that baseline is configured.

## PR and merge discipline
- One concern per PR; keep changes reversible.
- Review diffs and latest logs, not just a green badge.
- Do not merge while required build/smoke gates are red or pending.
- Never publish to Google Play from a pull request.
- Classify failures as code defect, test/fixture defect, or runner/environment issue; fix root cause and rerun.
- For the 32-level expansion, implement one vertical slice first. The plan is not implementation evidence.