#!/data/data/com.termux/files/usr/bin/bash
# Daily RAM monitor for Android/Termux.
# Android owns memory management; this script cannot guarantee a fixed free-RAM target.
# If available RAM is below 2 GiB, it attempts Android's background-process cleanup,
# then records the actual result. It never deletes files or app data.

set -u
LOG="$HOME/phone-ram-daily.log"
MIN_KB=$((2 * 1024 * 1024))
MAX_KB=$((4 * 1024 * 1024))

read_available_kb() {
  awk '/MemAvailable:/ {print $2; found=1; exit} END {if (!found) exit 1}' /proc/meminfo 2>/dev/null
}

{
  echo
  echo "===== $(date '+%Y-%m-%d %H:%M:%S %z') ====="
  if ! command -v awk >/dev/null 2>&1; then
    echo "ERROR: awk unavailable; install coreutils/awk in Termux."
    exit 0
  fi

  if ! AVAIL_KB="$(read_available_kb)" || [ -z "$AVAIL_KB" ]; then
    echo "ERROR: cannot read MemAvailable from /proc/meminfo."
    free -h 2>&1 || true
    exit 0
  fi

  echo "Before:"
  free -h 2>&1 || true
  echo "Available RAM: $((AVAIL_KB / 1024)) MiB"

  if [ "$AVAIL_KB" -lt "$MIN_KB" ]; then
    echo "Below 2 GiB available. Attempting Android background-process cleanup."
    if command -v am >/dev/null 2>&1; then
      am kill-all 2>&1 || echo "Cleanup not permitted in this Termux context; Android will manage memory."
    else
      echo "'am' command unavailable; Android will manage memory."
    fi
  else
    echo "At or above 2 GiB available; no cleanup attempted."
  fi

  sleep 2
  echo "After:"
  free -h 2>&1 || true
  if AVAIL_KB="$(read_available_kb)" && [ -n "$AVAIL_KB" ]; then
    echo "Available RAM after check: $((AVAIL_KB / 1024)) MiB"
    if [ "$AVAIL_KB" -gt "$MAX_KB" ]; then
      echo "Above 4 GiB: no action needed. The script does not force memory usage."
    elif [ "$AVAIL_KB" -lt "$MIN_KB" ]; then
      echo "Below 2 GiB: target not achieved; do not repeatedly kill processes."
    else
      echo "Within 2–4 GiB available-RAM target."
    fi
  fi
  echo "Note: Android may reclaim or allocate memory at any time; 2–4 GiB cannot be guaranteed."
} >> "$LOG" 2>&1
