#!/data/data/com.termux/files/usr/bin/bash
# Safe duplicate review for Termux shared Downloads.
# Default is REPORT ONLY. Deletion requires --delete and typing DELETE.
set -u

ROOT="/storage/emulated/0/Download"
OUT="$HOME/phone-cleanup-review-$(date +%Y%m%d-%H%M%S).txt"
MODE="${1:-}"

if [ ! -d "$ROOT" ]; then
  echo "Downloads folder not accessible: $ROOT"
  exit 1
fi

# Only consider common media/archive formats. Never touch PDFs, APKs, keys,
# JSON/configs, source files, identity documents, or files outside Downloads.
python - "$ROOT" "$OUT" "$MODE" <<'PY'
import hashlib, os, sys
from collections import defaultdict

root, out, mode = sys.argv[1:4]
safe_ext = {".mp4", ".mov", ".mkv", ".jpg", ".jpeg", ".png", ".webp",
            ".gif", ".mp3", ".wav", ".m4a", ".aac", ".flac", ".zip", ".7z"}
groups = defaultdict(list)
errors = []

for base, dirs, files in os.walk(root, followlinks=False):
    dirs[:] = [d for d in dirs if d not in {".git", "Android"}]
    for name in files:
        path = os.path.join(base, name)
        if os.path.splitext(name)[1].lower() not in safe_ext:
            continue
        try:
            if os.path.islink(path) or not os.path.isfile(path):
                continue
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for block in iter(lambda: f.read(1024 * 1024), b""):
                    h.update(block)
            groups[h.hexdigest()].append(path)
        except OSError as e:
            errors.append(f"{path}: {e}")

candidates = []
for digest, paths in groups.items():
    if len(paths) < 2:
        continue
    paths.sort(key=lambda p: (len(p), p.lower()))
    # Keep one copy; list only additional byte-for-byte identical files.
    for path in paths[1:]:
        candidates.append((path, os.path.getsize(path), digest, paths[0]))

lines = [
    "PHONE CLEANUP — EXACT DUPLICATE REVIEW",
    f"Scope: {root}",
    "Mode: " + ("DELETE requested" if mode == "--delete" else "REPORT ONLY"),
    "Only identical SHA-256 files with approved media/archive extensions are considered.",
    "PDFs, APKs, text/configs, signing keys, source code and files outside Downloads are excluded.",
    ""
]
if candidates:
    lines.append("DUPLICATE CANDIDATES (one copy retained):")
    for path, size, digest, kept in sorted(candidates):
        lines.append(f"EXTRA {size} bytes | {path}")
        lines.append(f"KEEP           | {kept}")
        lines.append(f"SHA256         | {digest}")
else:
    lines.append("No exact duplicate media/archive files found.")
if errors:
    lines += ["", "READ ERRORS:"] + errors
lines += ["", f"Candidate count: {len(candidates)}",
          f"Potential space: {sum(x[1] for x in candidates) / 1024 / 1024:.1f} MiB",
          "No files were deleted unless --delete was passed and DELETE was confirmed."]
report = "\n".join(lines) + "\n"
with open(out, "w", encoding="utf-8") as f:
    f.write(report)
print(report)
print(f"Report saved: {out}")

if mode == "--delete" and candidates:
    print("WARNING: deletion is permanent and limited to the listed exact duplicates.")
    try:
        confirm = input('Type DELETE to remove only the listed EXTRA files: ')
    except EOFError:
        confirm = ""
    if confirm != "DELETE":
        print("Cancelled. Nothing deleted.")
        sys.exit(0)
    freed = 0
    removed = 0
    for path, size, digest, kept in candidates:
        try:
            # Re-hash immediately before deletion to guard against changes.
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for block in iter(lambda: f.read(1024 * 1024), b""):
                    h.update(block)
            if h.hexdigest() != digest or not os.path.isfile(kept):
                print(f"SKIP changed/missing file: {path}")
                continue
            os.remove(path)
            freed += size
            removed += 1
            print(f"REMOVED: {path}")
        except OSError as e:
            print(f"FAILED: {path}: {e}")
    print(f"Removed {removed} duplicate file(s); approximately {freed / 1024 / 1024:.1f} MiB reclaimed.")
elif mode not in ("", "--report", "--delete"):
    print("Usage: bash phone-cleanup-review.sh [--report|--delete]")
    sys.exit(2)
PY
