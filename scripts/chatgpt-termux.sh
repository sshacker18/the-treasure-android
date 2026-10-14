#!/data/data/com.termux/files/usr/bin/bash
# ChatGPT Termux — safe, bounded diagnostics menu for Termux.
set -u
APP_TITLE="ChatGPT Termux"
APP_DIR="$HOME/.local/share/chatgpt-termux"
TMP_DIR="$APP_DIR/tmp"
LOG_DIR="$HOME/.local/state/chatgpt-termux"
LOG_FILE="$LOG_DIR/activity.log"
mkdir -p "$TMP_DIR" "$LOG_DIR" || exit 1
umask 077

pause_menu() {
  printf '\nPress Enter to return to the menu...'
  IFS= read -r -t 5 _ || true
}

action() {
  local title="$1"; shift
  clear 2>/dev/null || true
  printf '=== %s ===\n%s\n\n' "$APP_TITLE" "$title"
  if timeout 5s "$@"; then
    printf '\n[DONE] Completed within the timeout.\n'
    printf '%s | OK | %s\n' "$(date '+%F %T')" "$title" >> "$LOG_FILE" 2>/dev/null || true
  else
    local code=$?
    if [ "$code" -eq 124 ] || [ "$code" -eq 137 ]; then
      printf '\n[TIMEOUT] The action exceeded 5 seconds or was stopped.\n'
    else
      printf '\n[ERROR] Action returned exit code %s. Menu is still available.\n' "$code"
    fi
    printf '%s | FAIL:%s | %s\n' "$(date '+%F %T')" "$code" "$title" >> "$LOG_FILE" 2>/dev/null || true
  fi
  pause_menu
}

ram_maintenance() {
  echo '-- BEFORE --'
  awk '/^(MemTotal|MemAvailable|SwapTotal|SwapFree):/ {printf "%-16s %8.2f GiB\n",$1,$2/1048576}' /proc/meminfo 2>/dev/null || {
    echo 'Memory metrics unavailable on this Android build.'
    return 0
  }
  echo
  echo '-- SAFE MAINTENANCE --'
  echo 'Removing only files in this utility-owned temp directory older than 24 hours.'
  find "$TMP_DIR" -type f -mmin +1440 -delete 2>/dev/null || true
  echo 'No other apps were stopped. No app data or caches were touched.'
  echo
  echo '-- AFTER --'
  awk '/^(MemTotal|MemAvailable|SwapTotal|SwapFree):/ {printf "%-16s %8.2f GiB\n",$1,$2/1048576}' /proc/meminfo 2>/dev/null || true
  echo
  echo 'Note: Android manages RAM; this utility cannot guarantee free RAM.'
}

storage_report() {
  echo '-- Storage --'
  df -h "$HOME" 2>/dev/null || echo 'Storage report unavailable.'
  echo
  echo '-- Utility temp folder --'
  du -sh "$TMP_DIR" 2>/dev/null || true
}

network_report() {
  if ! command -v curl >/dev/null 2>&1; then
    echo 'curl is not installed; run: pkg install curl'
    return 0
  fi
  echo 'Checking GitHub connectivity (maximum 4 seconds)...'
  if timeout 5s curl -fsSI --connect-timeout 2 --max-time 4 https://github.com >/dev/null 2>&1; then
    echo 'GitHub network: reachable'
  else
    echo 'GitHub network: unavailable or timed out'
  fi
}

process_report() {
  echo '-- Process snapshot (read-only) --'
  ps -A -o PID,USER,%CPU,RSS,NAME 2>/dev/null | head -n 16 || ps -A 2>/dev/null | head -n 16
  echo
  echo 'No process was terminated.'
}

activity_report() {
  if [ -s "$LOG_FILE" ]; then
    tail -n 20 "$LOG_FILE"
  else
    echo 'No actions recorded yet.'
  fi
}

while :; do
  clear 2>/dev/null || true
  cat <<'MENU'
================================
         ChatGPT Termux
================================
1. RAM maintenance
2. Storage diagnostics
3. Network connectivity
4. Process snapshot
5. Recent activity
0. Exit
--------------------------------
MENU
  printf 'Choose an action (auto-exit after 60s): '
  choice=''
  IFS= read -r -t 60 choice || { echo; echo 'Input timed out; exiting safely.'; break; }
  case "$choice" in
    1) action 'RAM maintenance' ram_maintenance ;;
    2) action 'Storage diagnostics' storage_report ;;
    3) action 'Network connectivity' network_report ;;
    4) action 'Process snapshot' process_report ;;
    5) action 'Recent activity' activity_report ;;
    0) echo 'Exiting ChatGPT Termux.'; break ;;
    *) echo 'Invalid option.'; sleep 1 ;;
  esac
done
