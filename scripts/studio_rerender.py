#!/usr/bin/env python
"""Re-render ONE scene (or a frame range) of a Remotion atelier project and splice it into the existing video.

Usage:
  python scripts/studio_rerender.py <project_id> --scene s3
  python scripts/studio_rerender.py <project_id> --seconds 12.5-18.0
  python scripts/studio_rerender.py <project_id> --frames 300-420
  Options: --base renders/video_v3.mp4   video (muted) to patch; default = newest renders/video*.mp4
           --audio assets/audio/final_mix.wav   audio to mux; default = that file if it exists
           --fps 30                       composition fps (default 30)
           --dry-run                      print the plan and the commands, run nothing

Reads composition entry, id, concurrency and crf from artifacts/edit_decisions.json -> bespoke.
Scene times come from artifacts/scene_plan.json (start_seconds/end_seconds).

Safety:
  * Never overwrites final.mp4 or the base video. Output: renders/rerender_<range>_<timestamp>.mp4
  * Renders MUTED and muxes audio with ffmpeg (the Remotion silent-audio step failed on this machine earlier).
  * Remotion concurrency is taken from the project (this install: keep it at 2).
  * Splice re-encodes with libx264 so the cut is frame-accurate; this takes roughly the length of the video in seconds.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def run(cmd: list[str], cwd: Path | None = None, dry: bool = False) -> int:
    print("  $", " ".join(str(c) for c in cmd))
    if dry:
        return 0
    return subprocess.call([str(c) for c in cmd], cwd=str(cwd) if cwd else None)


def parse_range(text: str, cast):
    a, b = text.split("-", 1)
    return cast(a), cast(b)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project_id")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--scene")
    g.add_argument("--seconds")
    g.add_argument("--frames")
    ap.add_argument("--base")
    ap.add_argument("--audio")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    proj = ROOT / "projects" / a.project_id
    ed_p = proj / "artifacts" / "edit_decisions.json"
    if not ed_p.exists():
        print("No edit_decisions.json: this helper needs a built project.")
        return 2
    ed = json.loads(ed_p.read_text(encoding="utf-8"))
    be = ed.get("bespoke") or {}
    if ed.get("render_runtime") != "remotion" or not be.get("entry"):
        print("This helper handles Remotion atelier projects only (edit_decisions.bespoke.entry missing).")
        print("For other routes re-run the stage tool for that scene and rebuild; see docs/REWORK_GUIDE.md.")
        return 2

    fps = a.fps
    if a.scene:
        plan_p = proj / "artifacts" / "scene_plan.json"
        if not plan_p.exists():
            print("No scene_plan.json (a draft is not enough). Use --seconds or --frames.")
            return 2
        scenes = json.loads(plan_p.read_text(encoding="utf-8")).get("scenes", [])
        sc = next((s for s in scenes if str(s.get("id")) == a.scene), None)
        if not sc:
            print("Scene ids:", ", ".join(str(s.get("id")) for s in scenes))
            return 2
        f0, f1 = int(round(sc["start_seconds"] * fps)), int(round(sc["end_seconds"] * fps)) - 1
    elif a.seconds:
        s0, s1 = parse_range(a.seconds, float)
        f0, f1 = int(round(s0 * fps)), int(round(s1 * fps)) - 1
    else:
        f0, f1 = parse_range(a.frames, int)
    if f1 < f0:
        print("Empty range.")
        return 2

    rdir = proj / "renders"
    base = Path(a.base) if a.base else None
    if base is None:
        cands = sorted(rdir.glob("video*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
        base = cands[0] if cands else None
    elif not base.is_absolute():
        base = ROOT / base
    if not base or not base.exists():
        print("No base video found (looked for renders/video*.mp4). Pass --base.")
        return 2
    audio = Path(a.audio) if a.audio else proj / "assets" / "audio" / "final_mix.wav"
    if not audio.is_absolute():
        audio = ROOT / audio

    stamp = time.strftime("%Y%m%d-%H%M%S")
    tag = f"{f0}-{f1}"
    patch_dir = rdir / "patch"
    patch = patch_dir / f"p{tag}_{stamp}.mp4"
    spliced = rdir / f"_splice_{tag}_{stamp}.mp4"
    out = rdir / f"rerender_{tag}_{stamp}.mp4"
    entry = be["entry"]
    comp_dir = ROOT / "remotion-composer"
    entry_rel = entry.split("remotion-composer/", 1)[-1]

    print(f"Project {a.project_id}: frames {f0}-{f1} ({(f1 - f0 + 1) / fps:.2f} s) of {be.get('composition_id')}")
    print(f"  base : {base.relative_to(ROOT)}")
    print(f"  audio: {audio.relative_to(ROOT) if audio.exists() else 'NONE (output will be silent)'}")
    print(f"  out  : {out.relative_to(ROOT)}   (final.mp4 is not touched)")
    if not a.dry_run:
        patch_dir.mkdir(parents=True, exist_ok=True)

    print("\n[1/3] Render the range muted")
    rc = run(["npx", "remotion", "render", entry_rel, be["composition_id"], str(patch),
              f"--frames={f0}-{f1}", "--muted", f"--concurrency={be.get('concurrency', 2)}",
              f"--crf={be.get('crf', 18)}"], cwd=comp_dir, dry=a.dry_run) if sys.platform != "win32" else \
        run(["cmd", "/c", "npx", "remotion", "render", entry_rel, be["composition_id"], str(patch),
             f"--frames={f0}-{f1}", "--muted", f"--concurrency={be.get('concurrency', 2)}",
             f"--crf={be.get('crf', 18)}"], cwd=comp_dir, dry=a.dry_run)
    if rc:
        print("Render failed. Nothing was spliced.")
        return rc

    print("\n[2/3] Splice: base before + patch + base after")
    t0, t1 = f0 / fps, (f1 + 1) / fps
    fc = (f"[0:v]trim=0:{t0:.4f},setpts=PTS-STARTPTS[a];"
          f"[1:v]setpts=PTS-STARTPTS[b];"
          f"[0:v]trim=start={t1:.4f},setpts=PTS-STARTPTS[c];"
          f"[a][b][c]concat=n=3:v=1:a=0[v]")
    if f0 == 0:
        fc = (f"[1:v]setpts=PTS-STARTPTS[b];[0:v]trim=start={t1:.4f},setpts=PTS-STARTPTS[c];"
              f"[b][c]concat=n=2:v=1:a=0[v]")
    rc = run(["ffmpeg", "-y", "-loglevel", "error", "-i", base, "-i", patch, "-filter_complex", fc, "-map", "[v]",
              "-r", fps, "-c:v", "libx264", "-crf", be.get("crf", 18), "-pix_fmt", "yuv420p", spliced], dry=a.dry_run)
    if rc:
        return rc

    print("\n[3/3] Mux audio")
    if a.dry_run or audio.exists():
        rc = run(["ffmpeg", "-y", "-loglevel", "error", "-i", spliced, "-i", audio, "-map", "0:v", "-map", "1:a",
                  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], dry=a.dry_run)
    else:
        shutil.copy(spliced, out)
        rc = 0
    if rc == 0 and not a.dry_run:
        spliced.unlink(missing_ok=True)
        print(f"\nDone: {out.relative_to(ROOT)}")
        print("Check it (frame stills around the cut), then copy it over final.mp4 yourself if you approve.")
    return rc


if __name__ == "__main__":
    sys.exit(main())
