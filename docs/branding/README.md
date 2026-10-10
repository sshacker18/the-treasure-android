# RELIC — Game Branding and Identity

## Decision

**Current selected title: RELIC**  
**Runner-up: ODYSSEY**  
**Tagline: “Some secrets should stay buried.”**

RELIC emphasizes ancient artifacts, forgotten civilizations, dangerous ruins, and discovery. ODYSSEY remains a strong alternate if the franchise later leans more toward an epic journey.

## Visual identity

- Cinematic ancient-jungle ruins and monumental stone architecture
- A lone explorer facing a vast forgotten temple
- Warm gold light against deep teal/blue shadows
- Mist, waterfalls, bridges, overgrown stonework, and a mysterious glowing artifact
- Premium adventure-game key art with clear title typography

## Game structure

The existing game has four chapters. Keep the existing chapter progression and gameplay unchanged during this branding and package migration.

## Current Android identity on this branch

- Launcher label: `RELIC`
- Android application ID: `com.relic.game`
- Android namespace: `com.relic.game`
- Version: `2.0`, versionCode `4`
- Activity source: `app/src/main/java/com/relic/game/MainActivity.java`

## Important migration warning

The previous application ID was `com.thetreasure.game`. Changing the application ID to `com.relic.game` creates a **separate Android app identity**. It will not upgrade the installed Treasure app, and Google Play treats it as a separate listing. Local app data does not migrate automatically.

The rename is implemented on the branding feature branch for review and CI validation. Before public release, confirm whether the new Play Store listing is intended, ensure signing configuration is appropriate, and validate installation on a clean device. Do not promise in-place upgrade compatibility.

## Artwork

The RELIC concept poster was generated in the ChatGPT conversation. Its prompt is saved in `docs/branding/relic-key-art-prompt.md`. The binary artwork still needs to be committed as a repository asset before it can be referenced by the app or release workflow.

## Before production release

1. Verify title availability and trademark/store conflicts for RELIC and ODYSSEY.
2. Add optimized artwork to the repository and define uses for the menu, splash screen, store listing, and social preview.
3. Run CI, Playwright QA, Android builds, and physical-device regression.
4. Confirm the new application ID / Play listing decision.
5. Configure protected signing, build a signed AAB, and complete the Google Play release gates in the root README.
