# Rennie and the Treasure — 3D Prototype

This is an **isolated Godot 4.x prototype**, kept separate from the existing Android WebView app and its application ID.

## Run it

1. Install a current Godot 4.x editor.
2. Import the folder `godot-prototype/` (select `project.godot`).
3. Run the main scene.

## What the prototype demonstrates

- A generated low-poly/stylized 3D jungle blockout, ruins, treasure chest and glowing relic.
- One human adventurer named Rennie with simple procedural mesh parts and lightweight walk/idle motion.
- Third-person camera tracking, 3D movement, keyboard/arrow navigation, jump, and touch joystick/action-button HUD.
- A simple treasure-reached objective and dialogue text.

## Important limits

This is the **first technical blockout**, not the final friend-inspired character model, finished campaign, or release APK. Procedural primitive geometry is deliberately temporary. The agreed friend-character design should be based on the chosen reference photo and converted into an original, properly rigged 3D model with idle, run, jump, land, dodge, attack, interact and dialogue animations. Obtain the reference/permission workflow and final model before treating the likeness as approved.

The HUD is a first input pass. Verify Godot import, GDScript parse, collision, camera, touch capture, orientation, frame rate and thermal behavior on Android hardware before expanding the level. The project is not wired into the production Android build or Play Console.

## Next production gates

1. Run import/parse and desktop playtest.
2. Replace the primitive hero with the approved stylized 3D character asset and animation rig.
3. Refine movement, collision, objective triggers, camera framing and responsive touch layout.
4. Export a separate Android test APK and profile it on the target phone.
5. Only later decide whether and how the Godot build replaces the existing app shell; preserve package ID/signing compatibility if an in-place update is intended.
