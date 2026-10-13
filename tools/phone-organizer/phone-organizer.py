#!/usr/bin/env python3
"""Non-destructive Android shared-storage inventory and organization planner."""
from __future__ import annotations
import csv, hashlib, json, os, time
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path("/storage/emulated/0")
HOME = Path.home()
OUT = HOME / ".phone-organizer" / "reports"
SKIP_DIR_NAMES = {"data", "obb"}  # only when directly under Android/
MAX_SAMPLE = 15
HASH_CHUNK = 1024 * 1024

def category(path: Path) -> str:
    n, ext = path.name.lower(), path.suffix.lower()
    if any(x in n for x in ("whatsapp", "telegram", "signal")): return "Messaging"
    if ext in {".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt"}: return "Documents"
    if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".bmp"}: return "Photos"
    if ext in {".mp4", ".mkv", ".mov", ".webm", ".avi", ".3gp"}: return "Videos"
    if ext in {".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac", ".opus"}: return "Audio"
    if ext in {".apk", ".apks", ".xapk"}: return "Installers"
    if ext in {".zip", ".7z", ".rar", ".tar", ".gz"}: return "Archives"
    if ext in {".html", ".htm", ".css", ".js", ".py", ".java", ".kt", ".json", ".xml"}: return "Development"
    if ext in {".xls", ".xlsx", ".csv", ".ppt", ".pptx"}: return "Office"
    if ext in {".jks", ".keystore", ".pem", ".key", ".p12", ".pfx"}: return "Sensitive - do not move automatically"
    if ext in {".db", ".sqlite", ".sqlite3"}: return "App data - review manually"
    return "Other"

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(HASH_CHUNK), b""):
            digest.update(chunk)
    return digest.hexdigest()

def main():
    if not ROOT.exists():
        print("Shared storage path not found. Run termux-setup-storage and grant permission.")
        return 2
    OUT.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    csv_path, json_path = OUT / f"inventory-{stamp}.csv", OUT / f"inventory-{stamp}.json"
    counts, bytes_by_category, size_candidates = Counter(), Counter(), defaultdict(list)
    rows, errors = [], []
    total_bytes = 0
    protected = {".jks", ".keystore", ".pem", ".key", ".p12", ".pfx"}
    for current, dirs, files in os.walk(ROOT, topdown=True, onerror=lambda e: errors.append(str(e))):
        current_path = Path(current)
        if current_path == ROOT / "Android":
            dirs[:] = [d for d in dirs if d not in SKIP_DIR_NAMES]
        dirs[:] = [d for d in dirs if d not in {".thumbnails"}]
        for name in files:
            p = current_path / name
            try:
                st = p.stat()
                cat = category(p)
                sensitive = p.suffix.lower() in protected or cat.startswith("App data")
                suggested = "Review manually" if sensitive else f"Organized/{cat}"
                row = {"path": str(p), "name": name, "bytes": st.st_size,
                       "modified_epoch": int(st.st_mtime), "extension": p.suffix.lower(),
                       "category_suggestion": cat, "proposed_destination_folder": suggested}
                rows.append(row)
                counts[cat] += 1
                bytes_by_category[cat] += st.st_size
                total_bytes += st.st_size
                size_candidates[st.st_size].append(p)
            except (PermissionError, OSError) as e:
                errors.append(f"{p}: {e}")

    # Hash only files sharing a size with at least one other file, to reduce I/O.
    # Matching SHA-256 and size is a strong duplicate indicator; nothing is removed.
    duplicate_buckets = defaultdict(list)
    hash_errors = []
    candidates = [p for paths in size_candidates.values() if len(paths) > 1 for p in paths]
    hashed_bytes = 0
    for p in candidates:
        try:
            digest = sha256_file(p)
            size = p.stat().st_size
            duplicate_buckets[(size, digest)].append(str(p))
            hashed_bytes += size
        except (PermissionError, OSError) as e:
            hash_errors.append(f"{p}: {e}")
    duplicates = [{"bytes_each": size, "sha256": digest, "paths": paths}
                  for (size, digest), paths in duplicate_buckets.items() if len(paths) > 1]
    duplicates.sort(key=lambda g: g["bytes_each"] * (len(g["paths"]) - 1), reverse=True)
    duplicate_extra_bytes = sum(g["bytes_each"] * (len(g["paths"]) - 1) for g in duplicates)
    largest = sorted(rows, key=lambda r: r["bytes"], reverse=True)[:MAX_SAMPLE]
    top_dirs = Counter()
    for r in rows:
        rel = Path(r["path"]).relative_to(ROOT)
        top_dirs[str(rel.parts[0]) if rel.parts else "."] += r["bytes"]

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        fields = ["path","name","bytes","modified_epoch","extension","category_suggestion","proposed_destination_folder"]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    summary = {"root": str(ROOT), "generated_local_time": time.strftime("%Y-%m-%d %H:%M:%S"),
               "files_scanned": len(rows), "total_bytes": total_bytes,
               "category_counts": dict(counts), "category_bytes": dict(bytes_by_category),
               "permission_or_scan_errors": errors, "hash_errors": hash_errors,
               "same_size_files_hashed": len(candidates), "bytes_read_for_hashing": hashed_bytes,
               "duplicate_groups": len(duplicates), "duplicate_extra_bytes_if_one_copy_were_archived": duplicate_extra_bytes,
               "largest_files": largest, "top_level_folder_bytes": dict(top_dirs.most_common()),
               "csv_report": str(csv_path), "json_report": str(json_path),
               "changes_made": False, "files_moved": 0, "files_renamed": 0, "files_deleted": 0}
    json_path.write_text(json.dumps({"summary": summary, "duplicates": duplicates, "files": rows}, indent=2), encoding="utf-8")
    print("\nPHONE ORGANIZER — SAFE SCAN + DUPLICATE CHECK")
    print("=" * 46)
    print(f"Root: {ROOT}")
    print(f"Files scanned: {len(rows)} | Total size: {total_bytes / (1024**3):.2f} GiB")
    print(f"Scan warnings: {len(errors)} | Hash warnings: {len(hash_errors)}")
    print("\nCategory summary:")
    for cat, count in counts.most_common():
        print(f"  {cat}: {count} files ({bytes_by_category[cat] / (1024**2):.1f} MiB)")
    print(f"\nDuplicate check: hashed {len(candidates)} same-size candidates ({hashed_bytes / (1024**2):.1f} MiB read)")
    print(f"Exact duplicate groups: {len(duplicates)}")
    print(f"Potential redundant bytes (not deleted): {duplicate_extra_bytes / (1024**2):.1f} MiB")
    for i, group in enumerate(duplicates[:10], 1):
        print(f"  Group {i}: {len(group['paths'])} copies, {group['bytes_each'] / (1024**2):.2f} MiB each")
        for p in group["paths"][:4]:
            print(f"    {p}")
        if len(group["paths"]) > 4: print(f"    ... and {len(group['paths']) - 4} more")
    print("\nLargest files:")
    for row in largest:
        print(f"  {row['bytes'] / (1024**2):8.1f} MiB  {row['path']}")
    print("\nLargest top-level folders (sum of file sizes):")
    for folder, size in top_dirs.most_common(10):
        print(f"  {size / (1024**2):8.1f} MiB  {folder}")
    print("\nReports saved privately in Termux:")
    print(f"  {csv_path}")
    print(f"  {json_path}")
    print("\nSafety: 0 files moved; 0 files renamed; 0 files deleted.")
    print("Duplicate matches are based on file size + SHA-256. Review before any manual action.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
