#!/usr/bin/env python
"""Read-only readiness check for a first (or next) production on this machine.

Usage:  python scripts/studio_preflight.py [--json]

Makes NO network calls, calls NO providers, installs nothing and writes nothing.
It reports three separate things and never mixes them up:
  OK    = verified present right now (file exists, tool reports AVAILABLE, policy loaded)
  WARN  = works but limited, or needs a manual step from you
  FAIL  = a required piece is missing
"Tool AVAILABLE" means policy allows it and its dependencies are present. It is NOT proof it renders.
Proof only comes from a real render (see docs/STUDIO_GUIDE.md).
Exit code 1 if any FAIL.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# Tools the verified routes need (Blender, Remotion/ffmpeg composition, Piper narration, captions).
REQUIRED_TOOLS = ["piper_tts", "video_compose", "subtitle_gen", "audio_mixer", "transcriber", "blender_world", "visual_qa"]
# Untested here: report availability but never claim they work.
# Rendered a small test here on 2026-11-20 (see projects/_route_tests/). Low-res / blockout proof, not a quality guarantee.
TESTED_SMALL = {"threejs_world": "blockout 720p 4s", "math_animate": "Manim 480p 3.6s, plain text (no LaTeX)", "hyperframes_compose": "rendered the Three.js test"}
UNTESTED_TOOLS = ["diagram_gen"]
IS_WINDOWS = sys.platform == "win32"
IS_MAC = sys.platform == "darwin"
# Free space wanted on the drive that holds the repo (projects, renders, caches). Windows also checks C: (caches live there).
MIN_FREE_GB = {"C": 1.0, "D": 20.0}
MIN_FREE_REPO_GB = 20.0


def _row(level: str, item: str, detail: str) -> dict:
    return {"level": level, "item": item, "detail": detail}


def check() -> list[dict]:
    rows: list[dict] = []

    # 1. $0 policy
    try:
        from lib.config_model import OpenMontageConfig
        from lib.spend_policy import get_policy
        cfg, pol = OpenMontageConfig.load(), get_policy()
        if cfg.budget.total_usd == 0 and pol.enforced:
            rows.append(_row("OK", "spend policy", f"mode={pol.mode}, budget cap ${cfg.budget.total_usd}, allow_tools={sorted(pol.allow_tools)}"))
        else:
            rows.append(_row("FAIL", "spend policy", f"budget=${cfg.budget.total_usd}, enforced={pol.enforced}; expected $0 and enforced"))
    except Exception as e:  # fail closed: unreadable config is a failure
        rows.append(_row("FAIL", "spend policy", f"could not load: {e}"))

    # 2. Tools
    try:
        from tools.base_tool import ToolStatus
        from tools.tool_registry import registry
        registry.discover()
        for name in REQUIRED_TOOLS + list(TESTED_SMALL) + UNTESTED_TOOLS:
            tool = registry._tools.get(name)
            status = tool.get_status() if tool else None
            ok = status == ToolStatus.AVAILABLE
            if name in TESTED_SMALL:
                rows.append(_row("OK" if ok else "FAIL", f"tool {name}", ("available; small test rendered: " + TESTED_SMALL[name]) if ok else f"status={status}"))
            elif name in REQUIRED_TOOLS:
                rows.append(_row("OK" if ok else "FAIL", f"tool {name}", "available (not proof it renders)" if ok else f"status={status}"))
            else:
                rows.append(_row("WARN", f"tool {name}", ("available" if ok else f"status={status}") + "; UNTESTED on this machine"))
        music = registry._tools.get("music_library")
        n_tracks = len([p for p in (ROOT / "music_library").glob("*") if p.suffix.lower() in {".mp3", ".wav", ".m4a", ".ogg", ".flac"}])
        if n_tracks:
            rows.append(_row("OK", "music_library", f"{n_tracks} track(s)"))
        else:
            rows.append(_row("WARN", "music_library", "empty. No music source is available under the $0 policy. "
                             "Drop royalty-free tracks into music_library/ or proceed without music. Check licences yourself."))
    except Exception as e:
        rows.append(_row("FAIL", "tool registry", f"could not load: {e}"))

    # 3. Binaries and runtimes
    ffmpeg = shutil.which("ffmpeg")
    rows.append(_row("OK" if ffmpeg else "FAIL", "ffmpeg", ffmpeg or ("not on PATH (macOS: brew install ffmpeg)" if IS_MAC else "not on PATH (install ffmpeg and add its bin folder to PATH)")))
    node = shutil.which("node")
    if node:
        v = subprocess.run([node, "--version"], capture_output=True, text=True).stdout.strip()
        rows.append(_row("OK", "node", v))
    else:
        rows.append(_row("FAIL", "node", "not found"))
    from tools.graphics.blender_world import find_blender
    blender = find_blender()
    rows.append(_row("OK" if blender else "WARN", "blender", str(blender) if blender else
                     "not found (only needed for the Blender route). Install Blender 4.5 LTS, set BLENDER_PATH, or unpack under .runtime/blender"))
    rows.append(_row("OK" if (ROOT / "remotion-composer/node_modules").is_dir() else "FAIL", "remotion deps", "remotion-composer/node_modules"))
    voices = sorted(p.name for p in (Path.home() / ".piper/models").glob("*.onnx"))
    rows.append(_row("OK" if voices else "FAIL", "piper voices", ", ".join(voices) or "none in ~/.piper/models (see docs/MAC_SETUP.md or docs/STUDIO_GUIDE.md)"))
    venv_bin = Path(sys.executable).parent
    on_path = shutil.which("piper") is not None
    rows.append(_row("OK" if on_path else "WARN", "venv on PATH",
                     "piper found" if on_path else f"piper not on PATH. Run: export PATH=\"{venv_bin}:$PATH\" (Windows Git Bash: .venv/Scripts)"))

    # 4. Disk space
    if IS_WINDOWS:
        checks = {f"{d}:/": need for d, need in MIN_FREE_GB.items()}
    else:
        checks = {str(ROOT): MIN_FREE_REPO_GB}
    for target, need in checks.items():
        try:
            free = shutil.disk_usage(target).free / 1e9
            rows.append(_row("OK" if free >= need else "WARN", f"disk {target}", f"{free:.1f} GB free (want >= {need:g})"))
        except OSError:
            rows.append(_row("WARN", f"disk {target}", "drive not found"))

    # 5. Stray paid keys: informational. They are never used.
    import os
    stray = [k for k in ("OPENAI_API_KEY", "GEMINI_API_KEY") if os.environ.get(k)]
    if stray:
        rows.append(_row("WARN", "stray keys", f"{', '.join(stray)} present in env; never used here (CLAUDE.md rule)"))
    return rows


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    rows = check()
    if a.json:
        print(json.dumps(rows, indent=2))
    else:
        for r in rows:
            print(f"[{r['level']:<4}] {r['item']:<22} {r['detail']}")
        counts = {k: sum(r["level"] == k for r in rows) for k in ("OK", "WARN", "FAIL")}
        print(f"\n{counts['OK']} ok, {counts['WARN']} warn, {counts['FAIL']} fail")
    return 1 if any(r["level"] == "FAIL" for r in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
