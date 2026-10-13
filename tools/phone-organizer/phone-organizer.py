#!/usr/bin/env python3
"""Non-destructive Android shared-storage inventory and organization planner."""
from __future__ import annotations
import csv, json, os, time
from collections import Counter
from pathlib import Path

ROOT = Path("/storage/emulated/0")
HOME = Path.home()
OUT = HOME / ".phone-organizer" / "reports"
SKIP_DIR_NAMES = {"data", "obb"}  # only when directly under Android/
MAX_SAMPLE = 30

def category(path: Path) -> str:
    n = path.name.lower()
    ext = path.suffix.lower()
    if any(x in n for x in ("whatsapp", "telegram", "signal")):
        return "Messaging"
    if ext in {".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt"}:
        return "Documents"
    if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".bmp"}:
        return "Photos"
    if ext in {".mp4", ".mkv", ".mov", ".webm", ".avi", ".3gp"}:
        return "Videos"
    if ext in {".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac"}:
        return "Audio"
    if ext in {".apk", ".apks", ".xapk"}:
        return "Installers"
    if ext in {".zip", ".7z", ".rar", ".tar", ".gz"}:
        return "Archives"
    if ext in {".html", ".htm", ".css", ".js", ".py", ".java", ".kt", ".json", ".xml"}:
        return "Development"
    if ext in {".xls", ".xlsx", ".csv", ".ppt", ".pptx"}:
        return "Office"
    if ext in {".jks", ".keystore", ".pem", ".key", ".p12", ".pfx"}:
        return "Sensitive - do not move automatically"
    if ext in {".db", ".sqlite", ".sqlite3"}:
        return "App data - review manually"
    return "Other"

def main():
    if not ROOT.exists():
        print("Shared storage path not found. Run termux-setup-storage and grant permission.")
        return 2
    OUT.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    csv_path, json_path = OUT / f"inventory-{stamp}.csv", OUT / f"inventory-{stamp}.json"
    counts, bytes_by_category = Counter(), Counter()
    rows, errors = [], []
    total_bytes = 0
    protected = {".jks", ".keystore", ".pem", ".key", ".p12", ".pfx"}
    for current, dirs, files in os.walk(ROOT, topdown=True, onerror=lambda e: errors.append(str(e))):
        current_path = Path(current)
        if current_path == ROOT / "Android":
            dirs[:] = [d for d in dirs if d not in SKIP_DIR_NAMES]
        # Avoid recursing into the reports if the user ever places storage inside Termux links.
        dirs[:] = [d for d in dirs if d not in {".thumbnails"}]
        for name in files:
            p = current_path / name
            try:
                st = p.stat()
                cat = category(p)
                suggested = "Review manually" if p.suffix.lower() in protected or cat.startswith("App data") else f"Organized/{cat}"
                row = {"path": str(p), "name": name, "bytes": st.st_size,
                       "modified_epoch": int(st.st_mtime), "extension": p.suffix.lower(),
                       "category_suggestion": cat, "proposed_destination_folder": suggested}
                rows.append(row)
                counts[cat] += 1
                bytes_by_category[cat] += st.st_size
                total_bytes += st.st_size
            except (PermissionError, OSError) as e:
                errors.append(f"{p}: {e}")
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else
            ["path","name","bytes","modified_epoch","extension","category_suggestion","proposed_destination_folder"])
        writer.writeheader()
        writer.writerows(rows)
    summary = {"root": str(ROOT), "generated_local_time": time.strftime("%Y-%m-%d %H:%M:%S"),
               "files_scanned": len(rows), "total_bytes": total_bytes,
               "category_counts": dict(counts), "category_bytes": dict(bytes_by_category),
               "permission_or_scan_errors": errors, "csv_report": str(csv_path),
               "json_report": str(json_path), "changes_made": False, "files_deleted": 0}
    json_path.write_text(json.dumps({"summary": summary, "files": rows}, indent=2), encoding="utf-8")
    print("\nPHONE ORGANIZER — SAFE SCAN")
    print("=" * 34)
    print(f"Root: {ROOT}")
    print(f"Files scanned: {len(rows)}")
    print(f"Total size: {total_bytes / (1024**3):.2f} GiB")
    print(f"Scan warnings: {len(errors)}")
    print("\nCategory summary:")
    for cat, count in counts.most_common():
        print(f"  {cat}: {count} files ({bytes_by_category[cat] / (1024**2):.1f} MiB)")
    print("\nSample proposed destinations (suggestions only; nothing moved):")
    for row in rows[:MAX_SAMPLE]:
        print(f"  {row['name']}  ->  {row['proposed_destination_folder']}")
    print("\nReports saved privately in Termux:")
    print(f"  {csv_path}")
    print(f"  {json_path}")
    print("\nSafety: 0 files moved; 0 files renamed; 0 files deleted.")
    print("Review the plan before any future move feature is enabled.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
