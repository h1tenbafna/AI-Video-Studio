#!/usr/bin/env python
"""Clay series episode builder: dialogue script in, finished vertical reel out. $0, all local.

  python clay/episode.py <project_id> --stage all [--draft]
  python clay/episode.py <project_id> --stage voice|spec|render|plate|compose
  python clay/episode.py <project_id> --redo-line 3          re-voice line 3 and re-render only its frames
  python clay/episode.py <project_id> --stage compose --no-music

Needs the repo venv on PATH (Windows Git Bash: export PATH="$PWD/.venv/Scripts:$PATH"), ffmpeg on PATH, Blender in .runtime/.
Input: projects/<id>/episode.json  (see clay/README.md). Series cast: clay/series/<series>/series.json.
Outputs under projects/<id>/clay/ : lines/, narration.wav, spec.json, frames/, plate.mp4, remotion_public/, props.json, comp.mp4, final.mp4.

--draft renders 540x960 at 12 samples (about 0.5 s/frame). Full quality is 1080x1920 at 24 samples.
Nothing is posted and nothing is paid for. Voice engines: Piper (registered tool) or Kokoro (npx hyperframes tts, outside the registry).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
FPS_OUT = 30
STOP_FPS = 12
GAP = 0.28


def sh(cmd, **kw):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True, **kw)
    if r.returncode:
        raise RuntimeError(f"{cmd[0]} failed: {(r.stderr or r.stdout)[-600:]}")
    return r


def probe_dur(p: Path) -> float:
    return float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).stdout.strip())


def loudnorm_two_pass(src: Path, dst: Path, ar=48000, I=-14.0, TP=-1.5):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af", f"loudnorm=I={I}:TP={TP}:LRA=9:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    if not m:
        sh(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}", "-ar", ar, dst]); return
    j = json.loads(m.group(0))
    af = (f"loudnorm=I={I}:TP={TP}:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", ar, dst])


def blender() -> Path:
    for p in (ROOT / ".runtime" / "blender").glob("blender-*/blender.exe"):
        return p
    for p in (ROOT / ".runtime" / "blender").glob("**/blender"):
        return p
    raise SystemExit("Blender not found under .runtime/blender")


def load(proj_id: str):
    proj = ROOT / "projects" / proj_id
    ep = json.loads((proj / "episode.json").read_text(encoding="utf-8"))
    series = json.loads((ROOT / "clay" / "series" / ep["series"] / "series.json").read_text(encoding="utf-8"))
    work = proj / "clay"
    for d in ("lines", "frames"):
        (work / d).mkdir(parents=True, exist_ok=True)
    return proj, ep, series, work


# ------------------------------------------------------------------ voice
def tts_line(i, line, voice, work: Path, force=False) -> Path:
    raw = work / "lines" / f"line_{i}.raw.wav"
    out = work / "lines" / f"line_{i}.wav"
    sig = hashlib.sha1((line["text"] + json.dumps(voice, sort_keys=True)).encode()).hexdigest()[:10]
    sigf = work / "lines" / f"line_{i}.sig"
    if out.exists() and sigf.exists() and sigf.read_text() == sig and not force:
        return out
    eng = voice.get("engine", "piper")
    if eng == "piper":
        from tools.tool_registry import registry
        registry.discover()
        r = registry.get("piper_tts").execute({"text": line["text"], "model": voice.get("model", "en_US-ryan-high"),
                                               "length_scale": voice.get("length_scale", 1.0), "sentence_silence": 0.25,
                                               "output_path": str(raw)})
        if not r.success:
            raise RuntimeError(f"piper_tts: {r.error}")
    elif eng == "kokoro":
        env = dict(os.environ, HYPERFRAMES_PYTHON=str(ROOT / ".venv" / "Scripts" / "python.exe"))
        r = subprocess.run([shutil.which("npx") or "npx", "hyperframes", "tts", line["text"], "--voice", voice.get("voice", "af_heart"), "-o", str(raw)],
                           capture_output=True, text=True, env=env, cwd=str(ROOT))
        if r.returncode or not raw.exists():
            raise RuntimeError("kokoro failed: " + (r.stderr or r.stdout)[-400:])
    else:
        raise SystemExit(f"unknown voice engine {eng}")
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-15:TP=-1.5:LRA=7", "-ar", "24000", "-ac", "1", out])
    sigf.write_text(sig)
    return out


def stage_voice(proj_id, redo=None):
    proj, ep, series, work = load(proj_id)
    for i, line in enumerate(ep["lines"]):
        voice = series["cast"][line["speaker"]]["voice"]
        tts_line(i, line, voice, work, force=(redo == i))
        print(f"  voice line {i} ({line['speaker']}) ok")


# ------------------------------------------------------------------ spec
def align_words(text: str, whisper_words: list, t0: float, dur: float):
    toks = text.split()
    if len(toks) == len(whisper_words):
        return [{"w": toks[k], "s": t0 + whisper_words[k]["start"], "e": t0 + whisper_words[k]["end"]} for k in range(len(toks))]
    tot = sum(len(t) + 1 for t in toks); acc = 0.0; out = []
    for t in toks:
        ln = (len(t) + 1) / tot * dur
        out.append({"w": t, "s": t0 + acc, "e": t0 + acc + ln * 0.9}); acc += ln
    return out


def stage_spec(proj_id):
    proj, ep, series, work = load(proj_id)
    from tools.tool_registry import registry
    registry.discover()
    cast = series["cast"]; names = list(cast.keys())
    t = 0.4; lines = []
    concat = []
    for i, line in enumerate(ep["lines"]):
        wav = work / "lines" / f"line_{i}.wav"
        if not wav.exists():
            raise SystemExit(f"missing {wav}; run --stage voice")
        d = probe_dur(wav)
        r = registry.get("transcriber").execute({"input_path": str(wav), "model_size": "base", "language": "en", "output_dir": str(work / "lines" / f"tr{i}")})
        ww = []
        if r.success:
            ww = [w for s in r.data.get("segments", []) for w in s.get("words", [])]
        words = align_words(line["text"], ww, t, d)
        lines.append({"i": i, "speaker": line["speaker"], "start": t, "end": t + d, "words": words, "wav": wav})
        t += d + GAP + (0.1 if i + 1 < len(ep["lines"]) and ep["lines"][i + 1]["speaker"] != line["speaker"] else 0)
    last_end = lines[-1]["end"]
    duration = last_end + 1.8
    # narration timeline on one track
    inputs, parts = [], []
    for k, L in enumerate(lines):
        inputs += ["-i", str(L["wav"])]
        parts.append(f"[{k}:a]adelay={int(L['start'] * 1000)}|{int(L['start'] * 1000)}[a{k}]")
    mix = "".join(f"[a{k}]" for k in range(len(lines))) + f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={duration:.3f}[o]"
    sh(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(parts) + ";" + mix, "-map", "[o]", "-t", f"{duration:.3f}", "-ar", "24000", work / "narration.wav"])
    # camera plan: first and last line = two_shot, others close-up on the speaker, a two_shot every third line
    xs = {n: (-1 if k == 0 else 1) for k, n in enumerate(names)} if len(names) == 2 else {}
    seg = []
    for k, L in enumerate(lines):
        cam = ep["lines"][k].get("cam")
        if not cam:
            if k == 0 or k == len(lines) - 1 or k % 3 == 2: cam = "two_shot"
            else: cam = "left" if xs.get(L["speaker"], -1) < 0 else "right"
        start = 0.0 if k == 0 else lines[k]["start"] - 0.12
        seg.append({"start": start, "end": 0, "speaker": L["speaker"], "cam": cam, "words": [{"w": w["w"], "s": w["s"], "e": w["e"]} for w in L["words"]]})
    for k in range(len(seg)):
        seg[k]["end"] = seg[k + 1]["start"] if k + 1 < len(seg) else duration
    actions = []
    for k, line in enumerate(ep["lines"]):
        if line.get("action"):
            actions.append({"who": line.get("action_who", line["speaker"]), "do": line["action"], "t": lines[k]["start"] + line.get("action_at", 0.1), "len": line.get("action_len", 1.0)})
    props = list(ep.get("props", series.get("props", [])))
    for k, line in enumerate(ep["lines"]):
        for pr in line.get("props", []):
            q = dict(pr); q["at"] = lines[k]["start"] + pr.get("at", 0.0)
            if "until" in q: q["until"] = lines[k]["start"] + q["until"]
            elif q.pop("hold", False): q["until"] = last_end + 0.3
            else: q["until"] = lines[k]["end"] + 1.0
            if "move_at" in q: pass
            props.append(q)
    spec = {"stop_fps": STOP_FPS, "duration": duration, "seed": ep.get("seed", 7), "style": series["style"],
            "cast": {n: {k: v for k, v in c.items() if k != "voice"} for n, c in cast.items()},
            "props": props, "timeline": seg, "actions": actions}
    (work / "spec.json").write_text(json.dumps(spec, indent=1), encoding="utf-8")
    allw = [w for L in lines for w in L["words"]]
    (work / "words.json").write_text(json.dumps(allw, indent=1), encoding="utf-8")
    if (work / "plan.json").exists():
        shutil.copy(work / "plan.json", work / "plan.prev.json")
    (work / "plan.json").write_text(json.dumps({"duration": duration, "end_start": last_end + 0.4,
                                                "lines": [{"i": L["i"], "start": L["start"], "end": L["end"]} for L in lines]}, indent=1))
    print(f"  spec ok: {duration:.1f} s, {int(math.ceil(duration * STOP_FPS))} stop-motion frames")


# ------------------------------------------------------------------ render
def stage_render(proj_id, draft, samples=None, redo_line=None, frames=None):
    proj, ep, series, work = load(proj_id)
    res = (540, 960) if draft else (1080, 1920)
    samples = samples or (12 if draft else 24)
    fdir = work / ("frames_draft" if draft else "frames"); fdir.mkdir(exist_ok=True)
    plan = json.loads((work / "plan.json").read_text())
    if redo_line is not None:
        prev = work / "plan.prev.json"
        first = redo_line
        if prev.exists():
            pl = json.loads(prev.read_text())["lines"]
            for k, (a_, b_) in enumerate(zip(pl, plan["lines"])):
                if abs(a_["start"] - b_["start"]) > 0.02 or abs(a_["end"] - b_["end"]) > 0.02:
                    first = min(first, k); break
        shifted = prev.exists() and abs(json.loads(prev.read_text())["duration"] - plan["duration"]) > 0.02
        a = int(plan["lines"][first]["start"] * STOP_FPS) - 2
        b = int(math.ceil(plan["duration"] * STOP_FPS)) + 2 if shifted else int(plan["lines"][redo_line]["end"] * STOP_FPS) + 4
        print(f"  invalidating frames {max(1, a)}-{b}" + (" (timing shifted: later lines moved)" if shifted else ""))
        for f in range(max(1, a), b + 1):
            (fdir / f"f_{f:04d}.png").unlink(missing_ok=True)
    # frames are only valid for the kit version they were rendered with (mixed looks otherwise)
    kitsig = hashlib.sha1((ROOT / "clay" / "clay_kit.py").read_bytes()).hexdigest()[:12]
    kitf = fdir / ".kit_hash"
    if kitf.exists() and kitf.read_text() != kitsig:
        print("  clay_kit.py changed since these frames were rendered: clearing frames (full re-render)")
        for q in fdir.glob("f_*.png"): q.unlink()
    kitf.write_text(kitsig)
    # frames are only valid for the spec they were rendered from. A changed spec (not a --redo-line) clears them.
    sig = hashlib.sha1((work / "spec.json").read_bytes()).hexdigest()[:12]
    sigf = fdir / ".spec_hash"
    if redo_line is None and not frames and sigf.exists() and sigf.read_text() != sig:
        print("  spec changed since the last render: clearing frames (full re-render)")
        for q in fdir.glob("f_*.png"): q.unlink()
    # a killed Blender leaves 0-byte placeholders: remove them so they are re-rendered
    for p in fdir.glob("f_*.png"):
        if p.stat().st_size < 3000: p.unlink()
    cmd = [blender(), "-b", "--factory-startup", "-P", ROOT / "clay" / "clay_kit.py", "--", "--spec", work / "spec.json",
           "--out", str(fdir / "f_####.png"), "--res", res[0], res[1], "--samples", samples]
    if frames: cmd += ["--frames", frames[0], frames[1]]
    print("  rendering", "draft" if draft else "full", res, "samples", samples)
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode or "Traceback" in r.stdout:
        raise RuntimeError("blender: " + ((r.stdout or "") + (r.stderr or ""))[-800:])
    sigf.write_text(sig)
    print("  frames:", len(list(fdir.glob("f_*.png"))))


def stage_plate(proj_id, draft):
    proj, ep, series, work = load(proj_id)
    fdir = work / ("frames_draft" if draft else "frames")
    out = work / ("plate_draft.mp4" if draft else "plate.mp4")
    vf = "scale=1080:1920:flags=lanczos" if draft else "null"
    sh(["ffmpeg", "-y", "-loglevel", "error", "-framerate", STOP_FPS, "-i", fdir / "f_%04d.png", "-r", FPS_OUT, "-vf", vf,
        "-c:v", "libx264", "-crf", 16, "-pix_fmt", "yuv420p", out])
    print("  plate ok:", out.name, f"{probe_dur(out):.1f}s")


# ------------------------------------------------------------------ compose
def stage_compose(proj_id, draft, use_music=True):
    proj, ep, series, work = load(proj_id)
    plan = json.loads((work / "plan.json").read_text())
    pub = work / "remotion_public"; (pub / "fonts").mkdir(parents=True, exist_ok=True)
    plate = work / ("plate_draft.mp4" if draft else "plate.mp4")
    shutil.copy(plate, pub / "plate.mp4")
    shutil.copy(ROOT / "remotion-composer" / "public" / "fonts" / "Inter-var.ttf", pub / "fonts" / "Inter-var.ttf")
    words = json.loads((work / "words.json").read_text())
    dur = plan["duration"]
    props = {"plate": "plate.mp4", "frames": int(round(dur * FPS_OUT)), "hook": ep.get("hook", ep["title"]), "brand": series.get("brand", series["name"]),
             "words": words, "sources": ep.get("sources_on_screen", []), "captionY": series.get("caption_y", 1400),
             "hookUntil": min(3.5, plan["lines"][0]["end"]),
             "end": {"start": plan["end_start"], "lines": ep.get("end_lines", series.get("end_lines", ["follow for more"]))}}
    (work / "props.json").write_text(json.dumps(props, indent=1), encoding="utf-8")
    comp = work / "comp.mp4"
    cmd = [shutil.which("npx") or "npx", "remotion", "render", "src/clay/index.tsx", "ClayEpisode", str(comp), f"--props={work / 'props.json'}",
           f"--public-dir={pub}", "--muted", "--concurrency=2", "--crf=18"]
    print("  remotion render (muted)")
    r = subprocess.run(cmd, cwd=str(ROOT / "remotion-composer"), capture_output=True, text=True)
    if r.returncode:
        print("  remotion failed once (seen under memory/CPU pressure); retrying")
        r = subprocess.run(cmd, cwd=str(ROOT / "remotion-composer"), capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError("remotion: " + ((r.stdout or "") + (r.stderr or ""))[-800:])
    # audio: narration (+ music ducked) to -14 LUFS
    music = ep.get("music") or series.get("music")
    final = work / ("final_draft.mp4" if draft else "final.mp4")
    if music and use_music and (ROOT / music).exists():
        fc = ("[1:a]volume=0.22,afade=t=out:st={fo}:d=1.0[m];[m][0:a]sidechaincompress=threshold=0.03:ratio=9:attack=20:release=300[md];"
              "[0:a][md]amix=inputs=2:normalize=0[a]").format(fo=max(0, dur - 1.4))
        sh(["ffmpeg", "-y", "-loglevel", "error", "-i", work / "narration.wav", "-stream_loop", "-1", "-i", ROOT / music, "-filter_complex", fc,
            "-map", "[a]", "-t", f"{dur:.3f}", "-ar", "48000", work / "mix_pre.wav"])
        loudnorm_two_pass(work / "mix_pre.wav", work / "mix.wav")
    else:
        loudnorm_two_pass(work / "narration.wav", work / "mix.wav")
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", comp, "-i", work / "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", final])
    print("  final:", final.relative_to(ROOT), f"{probe_dur(final):.1f}s")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project_id")
    ap.add_argument("--stage", default="all", choices=["all", "voice", "spec", "render", "plate", "compose"])
    ap.add_argument("--draft", action="store_true")
    ap.add_argument("--samples", type=int)
    ap.add_argument("--redo-line", type=int)
    ap.add_argument("--no-music", action="store_true")
    a = ap.parse_args()
    stages = ["voice", "spec", "render", "plate", "compose"] if a.stage == "all" else [a.stage]
    if a.redo_line is not None:
        stage_voice(a.project_id, redo=a.redo_line)
        stages = ["spec", "render", "plate", "compose"]
    for s in stages:
        print(f"[{s}]")
        if s == "voice": stage_voice(a.project_id)
        elif s == "spec": stage_spec(a.project_id)
        elif s == "render": stage_render(a.project_id, a.draft, a.samples, redo_line=a.redo_line)
        elif s == "plate": stage_plate(a.project_id, a.draft)
        elif s == "compose": stage_compose(a.project_id, a.draft, use_music=not a.no_music)
    return 0


if __name__ == "__main__":
    sys.exit(main())
