# THE TREASURE — Music Asset Register

## Selection policy

Use music that is licensed for commercial use in a distributed Android game. Prefer CC0/public-domain or an explicit license that permits bundling, editing, and use in commercial apps. Store the specific source URL, author, license evidence, original filename, final bundled filename, and checksum with every asset. Do not load a soundtrack from a third-party website at runtime: the game should remain playable offline and not depend on an asset-hosting service.

## Primary music source

**[FREE Music Loop Bundle — Tallbeard Studios / Abstraction](https://tallbeard.itch.io/music-loop-bundle)**

The publisher states the pack is licensed CC0/public domain and allows commercial and non-commercial projects and modification. It advertises 200+ loops covering multiple styles. This is the preferred source for selecting a small number of distinct tracks: exploration/forest ambience, danger or encounter music, and a finale/treasure theme.

Optional credit, even where not required by CC0:
> Music assets: Abstraction (Tallbeard Studios), [FREE Music Loop Bundle](https://tallbeard.itch.io/music-loop-bundle), CC0.

## Secondary source

**[Adventure Theme — Cleyton Kauffman on OpenGameArt](https://opengameart.org/content/adventure-theme)**

The page labels the work CC0 and describes it as loopable adventure/action music. The page asks that the author be credited:
> Music by Cleyton Kauffman — https://soundcloud.com/cleytonkauffman

Use only if the chosen file is downloaded from the official page and reviewed for fit and loop quality.

## Current integration status

- Source/licensing shortlist recorded.
- No third-party track has yet been copied into the app bundle; therefore no claim is made that the current APK contains these tracks.
- Next music implementation step: select and review a small number of specific tracks, bundle them locally under `app/src/main/assets/audio/`, add asset/license metadata, wire a mute toggle and volume control, and test audio focus/pause/resume.
- Avoid importing an entire large pack into the APK. Keep only the selected track files and their license/credit metadata.
