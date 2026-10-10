# RELIC music asset import

Place the stakeholder-provided music archive at `music-inbox/relic-music.zip` on a `control/**` or `audio/**` branch. The **RELIC - Import Music Assets** workflow extracts supported audio files into `app/src/main/assets/music/`, flattening archive folders and excluding non-audio files.

Supported formats: MP3, OGG, WAV, M4A, AAC, FLAC.

The workflow validates that each extracted file is non-empty and commits imported assets back to the branch. Do not put secrets or copyrighted tracks into the repository unless the team has permission to distribute them.

**Important:** importing tracks does not by itself make them audible. The game must load and play the tracks, manage Android/WebView audio lifecycle and user-gesture restrictions, and provide a working music toggle. Those are separate runtime integration and QA tasks.
