#!/usr/bin/env python3
"""Read-only Android/Termux performance snapshot. Never kills processes or changes settings."""
from __future__ import annotations
import os, re, shutil, subprocess, time
from pathlib import Path

OUT = Path.home() / "phone-performance-report.txt"
ANDROID = Path("/system/bin")
def run(args, timeout=8):
    try:
        p = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                           text=True, timeout=timeout, check=False)
        return p.stdout.strip() or f"(no output; exit {p.returncode})"
    except Exception as e:
        return f"(unavailable: {e})"
def prop(name):
    return run(["getprop", name]) if shutil.which("getprop") else run([str(ANDROID / "getprop"), name])
def fmt_bytes(n):
    return f"{n / (1024**3):.2f} GiB"
def section(title, text):
    return f"=== {title} ===\n{text}\n"

def main():
    parts = []
    parts.append(section("DEVICE", "\n".join([
        f"Manufacturer: {prop('ro.product.manufacturer')}",
        f"Model: {prop('ro.product.model')}",
        f"Android: {prop('ro.build.version.release')} (SDK {prop('ro.build.version.sdk')})",
        f"ROM: {prop('ro.lineage.version') or '(not exposed)'}",
        f"Hardware: {prop('ro.hardware')}",
        f"Kernel: {run(['uname','-a'])}",
    ])))
    cpu = Path("/proc/cpuinfo").read_text(errors="ignore") if Path("/proc/cpuinfo").exists() else ""
    cores = len(re.findall(r"^processor\s*:", cpu, re.M))
    parts.append(section("CPU", f"Visible logical CPU entries: {cores}\nHardware line: " +
        next((x.split(":",1)[1].strip() for x in cpu.splitlines() if x.startswith("Hardware")), "not exposed")))
    mem = {}
    try:
        for line in Path("/proc/meminfo").read_text().splitlines():
            m = re.match(r"^(MemTotal|MemFree|MemAvailable|Buffers|Cached|SwapTotal|SwapFree):\s+(\d+)\s+kB", line)
            if m: mem[m.group(1)] = int(m.group(2)) * 1024
        ram = [f"{k}: {fmt_bytes(v)}" for k,v in mem.items()]
        parts.append(section("RAM AND SWAP", "\n".join(ram) or "(meminfo unavailable)"))
    except Exception as e: parts.append(section("RAM AND SWAP", str(e)))
    parts.append(section("STORAGE", run(["df","-h","/storage/emulated/0",str(Path.home())])))
    # Termux may not have permission to inspect all Android processes; report that limitation honestly.
    parts.append(section("VISIBLE PROCESSES", run(["top","-b","-n","1","-m","20"], timeout=10)))
    ps = run(["ps","-A","-o","PID,USER,NAME"], timeout=8)
    parts.append(section("PROCESS VISIBILITY", ps[:9000]))
    dumpsys = str(ANDROID / "dumpsys")
    if Path(dumpsys).exists():
        parts.append(section("BATTERY", run([dumpsys,"battery"])))
        parts.append(section("THERMAL", run([dumpsys,"thermalservice"])))
        parts.append(section("MEMORY SUMMARY", run([dumpsys,"meminfo"], timeout=12)))
        parts.append(section("PACKAGE SERVICE", run([str(ANDROID / "cmd"),"package","list","packages","-3"], timeout=10)))
    else:
        parts.append(section("ANDROID SERVICES", "Android /system/bin/dumpsys not found; detailed battery, thermal and app memory services are unavailable to this Termux session."))
    report = "\n".join(parts)
    OUT.write_text(report, encoding="utf-8")
    print(report)
    print(f"\nSaved locally: {OUT}")
    print("Safety: diagnostic only. No apps killed, no settings changed, no files deleted.")
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
