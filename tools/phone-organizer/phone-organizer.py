#!/usr/bin/env python3
"""Non-destructive Android shared-storage inventory and organization planner."""
from __future__ import annotations
import argparse, csv, hashlib, json, os, shutil, time
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


def download_category(path: Path) -> str:
    ext = path.suffix.lower()
    if path.name.startswith(".") or ext == ".nomedia": return "KEEP_IN_PLACE"
    if ext in {".jks", ".keystore", ".pem", ".key", ".p12", ".pfx", ".env"}: return "SENSITIVE_REVIEW"
    if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".bmp"}: return "Photos"
    if ext in {".mp4", ".mkv", ".mov", ".webm", ".avi", ".3gp"}: return "Videos"
    if ext in {".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt"}: return "Documents"
    if ext in {".apk", ".apks", ".xapk", ".aab"}: return "Installers"
    if ext in {".zip", ".7z", ".rar", ".tar", ".gz"}: return "Archives"
    if ext in {".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac", ".opus"}: return "Audio"
    if ext in {".xls", ".xlsx", ".csv", ".ppt", ".pptx"}: return "Office"
    if ext in {".html", ".htm", ".css", ".js", ".py", ".java", ".kt", ".json", ".xml"}: return "Development"
    return "Review"

def organize_downloads():
    downloads = ROOT / "Download"
    if not downloads.exists():
        downloads = ROOT / "Downloads"
    if not downloads.exists():
        print(f"Downloads folder not found under {ROOT}.")
        return 2
    candidates = []
    for p in sorted(downloads.iterdir(), key=lambda x: x.name.lower()):
        if not p.is_file():
            continue  # existing folders are preserved; only top-level files are planned
        cat = download_category(p)
        if cat in {"KEEP_IN_PLACE", "SENSITIVE_REVIEW"}:
            continue
        candidates.append((p, cat))
    print("\\nDOWNLOADS ORGANIZATION PREVIEW")
    print(f"Folder: {downloads}")
    print(f"Files eligible to move: {len(candidates)}")
    print("Existing folders, hidden files, and sensitive key/certificate files will not be moved.")
    for p, cat in candidates[:60]:
        print(f"  {p.name}  ->  {cat}/")
    if len(candidates) > 60:
        print(f"  ... and {len(candidates)-60} more files (listed in the local manifest after approval)")
    if not candidates:
        print("Nothing eligible to move.")
        return 0
    print("\\nNo files have been changed yet.")
    answer = input("To apply these moves, type ORGANIZE. Anything else cancels: ").strip()
    if answer != "ORGANIZE":
        print("Cancelled. No files moved.")
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    manifest_path = OUT / f"downloads-moves-{stamp}.json"
    moves, errors = [], []
    for src, cat in candidates:
        dest_dir = downloads / cat
        try:
            dest_dir.mkdir(exist_ok=True)
            dest = dest_dir / src.name
            if dest.exists():
                stem, suffix, i = src.stem, src.suffix, 1
                while dest.exists():
                    dest = dest_dir / f"{stem} (organized {i}){suffix}"
                    i += 1
            shutil.move(str(src), str(dest))
            moves.append({"from": str(src), "to": str(dest)})
        except (OSError, shutil.Error) as e:
            errors.append({"path": str(src), "error": str(e)})
    manifest = {"created_local_time": time.strftime("%Y-%m-%d %H:%M:%S"),
                "downloads_folder": str(downloads), "moves": moves, "errors": errors,
                "deleted": 0, "rollback_instructions": "Run python ~/phone-organizer.py --undo-last-downloads"}
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\\nDone. Moved {len(moves)} files; errors: {len(errors)}; deleted: 0.")
    print(f"Rollback manifest: {manifest_path}")
    print("Nothing was deleted. Existing destination files were never overwritten.")
    return 0

def undo_last_downloads():
    manifests = sorted(OUT.glob("downloads-moves-*.json"))
    if not manifests:
        print("No Downloads move manifest found. Nothing to undo.")
        return 0
    manifest_path = manifests[-1]
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    moves = list(reversed(data.get("moves", [])))
    print(f"Rollback preview from {manifest_path.name}: {len(moves)} moves")
    answer = input("To reverse these moves, type UNDO. Anything else cancels: ").strip()
    if answer != "UNDO":
        print("Cancelled. No files changed.")
        return 0
    restored, skipped = 0, 0
    for move in moves:
        src, dest = Path(move["to"]), Path(move["from"])
        try:
            if not src.exists() or dest.exists():
                skipped += 1
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dest))
            restored += 1
        except OSError:
            skipped += 1
    print(f"Rollback complete: restored {restored}; skipped {skipped}; deleted 0.")
    print("Review any skipped files manually.")
    return 0

def main():
    parser = argparse.ArgumentParser(description="Safe local phone organizer")
    parser.add_argument("--organize-downloads", action="store_true", help="preview and optionally organize top-level files in Downloads")
    parser.add_argument("--undo-last-downloads", action="store_true", help="preview and optionally reverse the latest Downloads organization")
    args = parser.parse_args()
    if args.organize_downloads:
        return organize_downloads()
    if args.undo_last_downloads:
        return undo_last_downloads()
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
    summary_lines = [
        "PHONE ORGANIZER RESULT",
        f"Files: {len(rows)} | Storage scanned: {total_bytes / (1024**3):.2f} GiB",
        f"Warnings: scan={len(errors)}, hash={len(hash_errors)}",
        f"Duplicate groups: {len(duplicates)}",
        f"Potential duplicate bytes: {duplicate_extra_bytes / (1024**2):.1f} MiB (nothing removed)",
        "Largest files:",
    ]
    for row in largest[:5]:
        summary_lines.append(f"- {row['bytes'] / (1024**2):.1f} MiB | {row['name']}")
    summary_lines.extend([
        f"Full report: {json_path}",
        "Safety: no files moved, renamed, or deleted.",
    ])
    clipboard_text = "\\n".join(summary_lines)
    print("\\n" + clipboard_text)
    # Optional convenience: copy only the short summary, never the full inventory.
    import shutil, subprocess
    clipboard = shutil.which("termux-clipboard-set")
    if clipboard:
        try:
            subprocess.run([clipboard], input=clipboard_text, text=True, check=True, timeout=5)
            print("\\nShort summary copied to clipboard. Paste it into ChatGPT only if you choose.")
        except (OSError, subprocess.SubprocessError):
            print("\\nClipboard copy unavailable; summary is shown above.")
    else:
        print("\\nTip: install Termux:API + run 'pkg install termux-api' to enable optional one-tap clipboard copy.")
    print("\\nFull inventory stays in Termux private storage; nothing is uploaded.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
