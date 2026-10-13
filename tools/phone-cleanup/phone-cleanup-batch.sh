#!/data/data/com.termux/files/usr/bin/bash
# POCO cleanup batch — safe review-first mode
# Deletes nothing. Creates manifests so you can review before irreversible cleanup.

set -u
BASE="/storage/emulated/0"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$HOME/phone-cleanup-$STAMP"
mkdir -p "$OUT"

if [ ! -d "$BASE" ]; then
  echo "Shared storage not available. Run: termux-setup-storage"
  exit 1
fi

echo "=== Phone cleanup inventory ==="
echo "Reports: $OUT"
echo

{
  echo "Generated: $(date)"
  echo "=== RAM / swap ==="
  free -h 2>/dev/null || cat /proc/meminfo
  echo
  echo "=== Shared storage ==="
  df -h "$BASE"
  echo
  echo "=== Largest visible directories ==="
  du -h -d 2 "$BASE" 2>/dev/null | sort -hr | head -50
} | tee "$OUT/summary.txt"

# Media inventory only; no deletion.
find "$BASE/DCIM" "$BASE/Pictures" "$BASE/Movies" "$BASE/Download" \
  -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \
  -o -iname '*.webp' -o -iname '*.gif' -o -iname '*.heic' \
  -o -iname '*.mp4' -o -iname '*.mkv' -o -iname '*.mov' \
  -o -iname '*.3gp' -o -iname '*.avi' -o -iname '*.webm' \) \
  -printf '%s\t%p\n' 2>/dev/null | sort -nr > "$OUT/media-manifest.tsv"

# Download inventory and APK inventory.
find "$BASE/Download" -type f -printf '%s\t%p\n' 2>/dev/null \
  | sort -nr > "$OUT/downloads-manifest.tsv"

find "$BASE" -type f -iname '*.apk' -printf '%s\t%p\n' 2>/dev/null \
  | sort -nr > "$OUT/apk-manifest.tsv"

# Exact duplicate candidates by SHA-256; no files are removed.
: > "$OUT/duplicate-candidates.tsv"
if command -v sha256sum >/dev/null 2>&1; then
  find "$BASE/Download" -type f -print0 2>/dev/null |
  while IFS= read -r -d '' f; do
    sha256sum "$f" 2>/dev/null
  done | sort -k1,1 | awk '
    NR==1 { hash=$1; first=$2; next }
    $1==hash { if (!shown) { print hash "\t" first; shown=1 } print hash "\t" $2; next }
    { hash=$1; first=$2; shown=0 }
  ' > "$OUT/duplicate-candidates.tsv"
else
  echo "sha256sum unavailable; duplicate scan skipped." > "$OUT/duplicate-candidates.tsv"
fi

{
  echo
  echo "=== Counts ==="
  printf "Media files: "; wc -l < "$OUT/media-manifest.tsv"
  printf "Download files: "; wc -l < "$OUT/downloads-manifest.tsv"
  printf "APK installers: "; wc -l < "$OUT/apk-manifest.tsv"
  printf "Duplicate candidate rows: "; wc -l < "$OUT/duplicate-candidates.tsv"
  echo
  echo "=== Largest media files (top 30) ==="
  head -30 "$OUT/media-manifest.tsv"
  echo
  echo "=== Largest downloads (top 30) ==="
  head -30 "$OUT/downloads-manifest.tsv"
  echo
  echo "=== APK installers ==="
  cat "$OUT/apk-manifest.tsv"
  echo
  echo "=== Exact duplicate candidates ==="
  cat "$OUT/duplicate-candidates.tsv"
} | tee "$OUT/review.txt"

echo
echo "DONE: No files deleted and no apps uninstalled."
echo "Review report: $OUT/review.txt"
echo "Manifests: $OUT/"
echo "Note: this scan cannot inspect app-private storage. Do not delete Termux signing keys or clear app data blindly."
