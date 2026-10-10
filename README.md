# RELIC — Android Adventure Game

**Tagline:** *Some secrets should stay buried.*

RELIC is a four-chapter, landscape-first adventure wrapped in a native Android WebView. Game content is bundled locally so gameplay does not depend on a remote web page.

## Current identity

- Display name: `RELIC`
- Android application ID: `com.relic.game`
- Android namespace: `com.relic.game`
- Version for this rename proposal: `2.0` (`versionCode 4`)
- Preferred title: RELIC; ODYSSEY remains a creative runner-up.
- Visual direction: cinematic ancient jungle ruins, lost civilizations, gold light, teal shadows, waterfalls, and a mysterious artifact.

## Important package-rename warning

Changing the application ID from `com.thetreasure.game` to `com.relic.game` creates a **different Android app identity**. Android will not treat it as an in-place upgrade of an installed Treasure build, and Google Play treats the new application ID as a separate app listing. Existing local app data will not migrate automatically. This branch intentionally implements the requested identity change; do not publish it until the owner confirms that a new Play Store listing is intended and signs the release with the correct key.

## Development status

- Landscape and immersive system UI enabled.
- Four chapter game assets remain bundled locally.
- GitHub Actions checks chapter presence, package/namespace alignment, launcher label, target API, embedded-script escaping, APK size, and build artifact checksums.
- Current Play target: Android 16 / API 36.
- Not yet Play Store release-ready: signed release, physical-device regression, store listing/disclosures, and Play Console testing/review remain required.

## Project structure

- `app/src/main/assets/index.html` — offline game and Chapters 1–4
- `app/src/main/java/com/relic/game/MainActivity.java` — immersive Android WebView activity
- `app/build.gradle.kts` — Android package, version, API, and signing configuration
- `.github/workflows/build-apk.yml` — cloud build and static checks
- `docs/branding/README.md` — brand decision and rollout notes
- `docs/branding/relic-key-art-prompt.md` — concept-art prompt
- `PROMPT.md` — reusable “resume latest saved work and execute” workflow prompt

## Cloud build

Every push to `main`, `qa/**`, `ci/**`, or `branding/**`, pull request targeting `main`, and manual workflow dispatch runs the CI workflow.

Artifacts:
- `relic-debug-apk` — debug installation artifact for testing
- `relic-release-apk-unsigned` — unsigned release APK candidate, not for distribution
- `relic-release-bundle-unsigned` — unsigned Android App Bundle candidate, not for Play upload

Unsigned release outputs are for pipeline validation only. A Play candidate must be signed with the correct protected upload key and verified in Play Console.

## Artwork

The generated RELIC concept poster is saved in the original ChatGPT conversation attachment. The concept-art prompt is committed in `docs/branding/relic-key-art-prompt.md`. The binary poster has not yet been added to this repository as a tracked asset.

## Google Play release gates

1. Green CI build and automated static checks.
2. Complete manual gameplay regression across all chapters and supported Android devices.
3. Decide whether the new `com.relic.game` application ID is intended as a new Play listing.
4. Add protected release signing and build a signed Android App Bundle.
5. Complete store listing, icon/screenshots/feature graphic, content rating, target audience, ads and data-safety declarations, and privacy policy as applicable.
6. Test through Play Console internal/closed tracks; confirm whether the account's production-access testing requirement applies.
7. Submit the signed AAB for review and verify rollout status before announcing availability.
