# THE TREASURE — Android Game

THE TREASURE is a four-chapter, landscape-first adventure wrapped in a native Android WebView. The game content is bundled locally so gameplay does not depend on a remote web page.

## Development status

- Landscape and immersive system UI enabled.
- QA branch is reducing duplicate shell chrome and adding a compact in-game chapter menu.
- GitHub Actions validates chapter presence and Android Play target API, then produces debug and unsigned release candidates.
- Current Play target: Android 16 / API 36.
- Not yet Play Store release-ready: app signing, device regression, store disclosures/listing, and Play Console testing/review remain required.

## Project structure

- `app/src/main/assets/index.html` — offline game and Chapters 1–4
- `app/src/main/java/com/thetreasure/game/MainActivity.java` — immersive Android WebView activity
- `app/build.gradle.kts` — Android compile/target API and app version
- `.github/workflows/build-apk.yml` — cloud build and static checks

## Cloud build

Every push to `main` or `qa/**`, pull request targeting `main`, and manual workflow dispatch runs the CI workflow.

The workflow uploads:
- `the-treasure-debug-apk` — debug installation artifact
- `the-treasure-release-apk-unsigned` — unsigned release APK candidate
- `the-treasure-release-bundle-unsigned` — unsigned Android App Bundle candidate

Unsigned release outputs are for pipeline validation only. Do not upload them to Google Play; the Play candidate must be signed with a protected upload key and verified in Play Console.

## Music and asset licensing

Music assets must be bundled offline and each selected track's source, license, downloaded filename, and attribution requirements recorded. Prefer explicit CC0/public-domain game-music assets. Do not stream music from an asset marketplace in the released game or rely on a search result as proof of the exact track's license.

Candidate source: [Tallbeard Studios — Free Music Loop Bundle (CC0)](https://tallbeard.itch.io/music-loop-bundle). This is a source to review; specific tracks have not yet been selected or bundled in this repository.

## Google Play release gates

1. Green CI build and automated static checks.
2. Complete manual gameplay regression across all chapters and supported Android devices.
3. Add a protected release signing configuration and build a signed Android App Bundle.
4. Complete store listing, app icon/screenshots/feature graphic, content rating, target audience, ads and data-safety declarations, and accessible privacy policy as applicable.
5. Test through Play Console's internal/closed tracks. Confirm whether the account's production-access closed-test requirement applies.
6. Submit the signed AAB for Play review and confirm rollout status before announcing availability.
