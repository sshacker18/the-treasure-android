# RELIC Project State

## 2026-10-10 — Branding and package rename proposal

- Baseline: `main` commit `bcc277f206dd383ecd65646872ad169146a46ce6`.
- Working title: RELIC; ODYSSEY retained as runner-up.
- Added package identity proposal `com.relic.game`, namespace `com.relic.game`, launcher label `RELIC`, versionName `2.0`, versionCode `4`.
- Added reusable repository continuation instructions in `PROMPT.md`.
- Added README branding/release gates and adjusted CI validation/artifact names for RELIC.
- Current branch: `branding/relic-odyssey-identity`.
- Validation status: not yet verified on this branch; PR CI must run before merge.
- Important risk: the new application ID is a distinct Android/Play identity and will not upgrade an installed `com.thetreasure.game` app. Confirm the intended Play listing before publishing.
- Artwork: concept poster generated in ChatGPT; prompt committed, binary artwork not yet tracked in the repo.
- Next action: inspect PR checks, correct any CI/config issues, then decide whether to merge the identity change and build the renamed app.
