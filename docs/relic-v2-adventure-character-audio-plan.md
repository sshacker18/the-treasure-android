# RELIC V2: Tiny Adventurer + Spoken Dialogue Prototype

## Decision
The visual direction is a tiny, expressive human adventure hero, not a robot or armored sci-fi bot: oversized friendly head, readable eyes, compact body, bright scarf, small explorer backpack, and slightly oversized boots. Keep a coherent adventure-art style; start with one hero before making a full cast.

## Prototype scope
- Lightweight Canvas style-study with idle bob, walk limbs, jump positioning, and a mouth/talking cue.
- Three story beats with text and generated WAV clips in the browser-preview artifact.
- Kokoro ONNX runs only in CI as a build-time audio generator; its neural model is not bundled into the Android APK.
- The standalone HTML may use browser/device speech synthesis if the WAV folder is missing.
- This is not yet a real 3D character or phoneme-accurate lip sync; it validates scale, readability, dialogue timing, and player response.

## Longer-term visual/engine direction
Build toward 2.5D: rigged 3D humanoid characters animated in a side-on adventure world, with a restrained camera, baked or carefully limited lighting, and authored cinematic dialogue moments. Godot 4.x is a stronger candidate for this than stretching Canvas indefinitely. Keep the prototype reversible until the art test and device review.

Official Godot guides:
- Android export: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html
- Android library integration: https://docs.godotengine.org/en/stable/tutorials/platform/android/android_library.html

## Character assets to evaluate
- Kenney Mini Characters (25 animated 3D mini characters, CC0): https://kenney.nl/assets/mini-characters
- Quaternius assets: https://quaternius.com and current license: https://quaternius.com/license.html

These are candidates for block-out/reference only. Keep the downloaded asset URL/date/license with the project. Quaternius QAL v1.0 (page updated 2026-08-28) permits incorporating assets into commercial products but prohibits redistributing the assets as a standalone pack. The final signature hero should be original.

## Voice pipeline
- Runtime wrapper: https://github.com/thewh1teagle/kokoro-onnx (MIT).
- Kokoro-82M model: Apache-2.0, according to the wrapper repository README/model notes.
- Generate WAVs in CI, validate sample rate/channels/duration, and package them beside the browser preview. If approved, pre-generate and ship the game's dialogue audio rather than infer on the phone.
- `tools/relic-dialogue-lines.json` is the text/voice source of truth; Playwright checks verify the three UI lines and IDs.
- Avoid Coqui XTTS-v2 pending licensing review: its CPML has been described as non-commercial and no commercial licensing path is currently available. See https://github.com/coqui-ai/TTS/discussions/4304.
- No real person's voice is cloned. Use published generic voices and have human listeners judge the sound before choosing permanent character voices.

## Acceptance gates
1. Inspect the character at phone landscape size; eyes and silhouette must remain readable.
2. Listen to all three WAVs on a phone speaker and headphones; assess pronunciation, emotion, loudness, pauses, and naturalness.
3. Confirm dialogue/subtitles are readable, replay works, and audio stops on navigation.
4. Test on the POCO M2 Pro before including WAVs in an APK; browser CI cannot certify real-device audio.
5. Only after review, move to full 3D rig, locomotion/combat animation, mouth shapes/visemes, NPC cast, and chapter cinematics.
