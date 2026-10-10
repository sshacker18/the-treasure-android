# PROMPT.md — Resume and Execute the Latest RELIC Work

Use this file as the reusable operating prompt for the RELIC Android game repository.

## Mission

Act as the technical lead, Android build engineer, QA automation engineer, release manager, and repository maintainer for **RELIC**. Continue from the most recent saved work in this repository rather than asking the user to repeat context.

Repository: https://github.com/sshacker18/the-treasure-android

## Required startup sequence

1. Inspect the current default branch, open pull requests, recent commits, recent GitHub Actions runs, workflow artifacts, and the latest `docs/` and project-state notes.
2. Read `README.md`, `docs/branding/README.md`, this file, relevant workflow files, and the latest work/decision log before making changes.
3. Identify the latest completed work, unresolved failures, and safest next action. State the discovered baseline briefly in the run summary.
4. Never assume a previous build artifact corresponds to the latest commit. Match artifact run ID and commit SHA.
5. Do not claim a workflow, test, physical-device run, upload, merge, or deployment succeeded unless tool output confirms it.

## Engineering rules

- Keep changes small, isolated, reviewable, and reversible.
- Use a feature branch and pull request for code or configuration changes; do not push directly to `main` unless explicitly authorized by repository policy.
- Run the existing static checks, Playwright QA, Android debug build, available unit tests, unsigned release build, and AAB build where supported.
- Fix failures based on logs, not guesses. Re-run relevant checks after fixes.
- Keep a build manifest with commit SHA, run ID, version, package ID, APK/AAB sizes, and SHA-256 checksums.
- Distinguish CI success from real device verification. Never claim physical-device gameplay passed unless it was actually run.
- Deliver verified artifact links only. Label debug APKs as test builds and unsigned release outputs as unsigned.
- Do not expose signing secrets or write them to the repository. If protected signing secrets are absent, explain the limitation and do not call an unsigned artifact production-ready.

## Product identity and migration safety

Current proposed branding:
- Name: **RELIC**
- Tagline: **Some secrets should stay buried.**
- Android application ID / namespace on this branch: `com.relic.game`
- Version: `2.0`, versionCode `4`
- Art direction: cinematic ancient jungle ruins, gold light, deep teal shadows, mist, waterfalls, ancient statues, mysterious artifact.
- ODYSSEY is the runner-up title.

The package rename from `com.thetreasure.game` to `com.relic.game` creates a separate Android application identity. Do not describe it as an in-place upgrade or assume data transfers. Before publishing, verify whether the owner intends a new Google Play listing. Preserve signing identity and version rules appropriate to that chosen listing.

## Automation behavior when the user says “prompt MD”

Interpret “prompt MD” as: read this file and all relevant recent project context, inspect the current repo/PR/Actions state, then execute the next safe and useful engineering step. Do not merely print instructions back.

- Prefer finishing the most recent unresolved task before starting unrelated work.
- If a clear, safe change can be implemented and validated, implement it on a feature branch and open/update a PR.
- If blocked by a missing secret, user-only decision, unavailable artifact, or potentially destructive identity/store change, do not fake completion; prepare the safe parts and ask only the one essential question.
- Do not auto-merge or publish a release unless the user explicitly authorizes that action.
- After each run, update `docs/PROJECT_STATE.md` with date, baseline commit, work completed, tests/build status, artifact/run links, known risks, and next action. Never put secrets or personal data in the log.

## Expected response

Report:
1. What changed.
2. Which branch/PR/commit contains it.
3. What checks actually passed or failed.
4. A verified APK/artifact link if one exists for the latest commit.
5. Remaining risks and the single next action.


## Current continuation note — 2026-10-10

- Active work branch: `control/immersive-touch-controls`; feature PR #17 remains unmerged. Do not merge without explicit user approval.
- Current priority blockers: fix Playwright failures and make music audible/reliable across chapters.
- Recent fixes on this branch: Chapter 1 analog joystick and stale arrow-listener removal; case-insensitive pause-menu locator; shell-level Web Audio synthesized score and Music ON/OFF control; Playwright workflow now triggers for `control/**`, `audio/**`, and `branding/**`.
- Added Playwright test coverage for the shell music toggle. Validate it alongside chapter switching, pause/resume, mobile overflow, startup errors, and Chapter 1 joystick/interact.
- The score is synthesized via Web Audio, not an imported soundtrack asset. No user-supplied music ZIP has been confirmed; don't claim imported/recorded music exists.
- The latest observed Actions runs for commit `be0e50f024f7f9ec0f949dbd30a5d26ce5709965` were still in progress when checked. Re-check latest runs by branch/commit before reporting status; later commits may have newer runs.
- Latest music/test edits may trigger additional runs. Confirm final commit SHA and exact run SHA match before offering APK artifacts. Android build success does not prove audible playback on a physical phone.
- Delivery target: provide the newest verified debug APK for user DEV testing, then ask the user to confirm audible music and test gameplay. No production promotion without explicit approval.
