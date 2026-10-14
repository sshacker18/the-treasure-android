#!/data/data/com.termux/files/usr/bin/bash
set -eu
SCRIPT="$(dirname "$0")/../scripts/chatgpt-termux.sh"
test -s "$SCRIPT"
bash -n "$SCRIPT"
grep -q 'timeout 5s' "$SCRIPT"
grep -q 'MemAvailable' "$SCRIPT"
grep -q 'No other apps were stopped' "$SCRIPT"
echo 'PASS: script exists, parses, has action timeout, reports RAM, documents safe behavior.'
