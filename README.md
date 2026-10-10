# THE TREASURE — Android APK

This repository contains the Android WebView wrapper for the four-chapter THE TREASURE browser game.

## Build APK on GitHub Actions

Every push to `main` and manual workflow dispatch builds a debug APK using GitHub-hosted runners. Download it from the workflow run's Artifacts section.

## Project structure

- `app/src/main/assets/index.html` — playable game bundled offline
- `app/src/main/java/com/thetreasure/game/MainActivity.java` — fullscreen WebView activity
- `.github/workflows/build-apk.yml` — cloud APK build workflow

## Run the build

Open **Actions** → **Build THE TREASURE Android APK** → **Run workflow**. After it completes successfully, open the run and download the `the-treasure-debug-apk` artifact ZIP. Extract it on Android and install the APK. For installation, allow Chrome or Files to install unknown apps if Android asks.

This pipeline produces a debug APK for personal testing, not a Play Store-signed release.