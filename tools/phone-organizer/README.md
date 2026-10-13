# Phone Organizer (Termux)

A phone-first, non-destructive file inventory and organization planner for Android shared storage.

## Safety model
- **Never deletes files.**
- First version only scans and proposes a destination; it does not move or rename anything.
- Stores reports under Termux's private home directory at `~/.phone-organizer/`, not Downloads.
- Skips Android app-private/expansion folders when scanning (`Android/data`, `Android/obb`) because Android permissions and apps may depend on them.
- Permission-denied paths are reported; they are not treated as empty.
- Inventory can contain sensitive filenames and paths. Keep reports private.

## Install on Android / Termux
1. Open Termux.
2. Grant shared-storage access if not already done:
   `termux-setup-storage`
3. Install Python if needed:
   `pkg install python`
4. Download this repository file to Termux (or copy it from GitHub), then run:
   `python ~/phone-organizer.py`

For a direct download from Termux:
```sh
curl -L https://raw.githubusercontent.com/sshacker18/the-treasure-android/tool/termux-phone-organizer/tools/phone-organizer/phone-organizer.py -o ~/phone-organizer.py
python ~/phone-organizer.py
```

## What it does
- Recursively inventories accessible files under `/storage/emulated/0`.
- Shows counts, total bytes, category counts, unreadable paths, and a sample of proposed destinations.
- Creates timestamped CSV and JSON reports in `~/.phone-organizer/reports/`.
- Categories are suggestions based on extension/name only; they are not guaranteed to reflect file contents.

## Reports and privacy
Find reports in:
`~/.phone-organizer/reports/`

To view the latest report without selecting terminal text:
`ls -lt ~/.phone-organizer/reports/`

No remote service, server, telemetry, or network upload is used by the script. The GitHub download above is only for obtaining the script.

## Important limitation
This script runs locally when you start it in Termux. It does **not** connect ChatGPT to your phone or provide remote terminal control. A separate authenticated bridge would be required for that, and this first version intentionally does not create one.
