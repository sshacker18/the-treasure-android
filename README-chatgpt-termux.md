# ChatGPT Termux

A lightweight, safe diagnostics and maintenance menu for Android Termux.

## Run
```bash
bash scripts/chatgpt-termux.sh
```

## Features
- RAM and swap snapshots using Android's `/proc/meminfo`
- Bounded storage diagnostics
- Bounded GitHub connectivity check
- Read-only process snapshot
- Activity log
- Each menu action is time-limited to five seconds and returns to the menu on errors/timeouts

## Safety and limitations
Android controls application memory and may reclaim it independently. This script cannot guarantee a fixed amount of free RAM, dedicate RAM to a single app, kill other applications without elevated privileges, or clear other apps' private caches. It only cleans old regular files in its own private temporary directory. No app data is deleted.

The five-second timeout applies to menu actions, not Termux package installation or the initial setup.
