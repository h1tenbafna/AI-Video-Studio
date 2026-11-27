#!/usr/bin/env python
"""One honest menu of what this studio can and cannot do.  Read-only.

Usage:  python scripts/studio_routes.py [--all] [--json]

Combines two sources and never merges them silently:
  * EVIDENCE below = what was actually run on THIS machine (date and test noted). Edit it when you test something new.
  * REGISTRY       = what tools/tool_registry.py reports right now ("available" is NOT proof it works).

Levels:  VERIFIED   rendered or ran on this machine
         CRUDE      runs, but output quality is below what we would ship (reason given)
         BROKEN     fails here (reason given)
         PROBED     one short test scene rendered and its frames checked (2026-11-25); not yet a full production
         UNTESTED   registry says available, never run here
         NEEDS KEY  free route, but needs a key or a manual step from you
         BLOCKED    paid, or needs hardware this PC lacks (never used)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# (what, tool/route, level, evidence, best for)
EVIDENCE = [
    # --- compose runtimes
    ("Compose", "Remotion (atelier + templated)", "VERIFIED", "3 shorts + 40 s explainers; scene re-render and splice 2026-11-24", "everything animated: cards, charts, diagrams, paper/blueprint looks"),
    ("Compose", "HyperFrames", "VERIFIED", "rendered the Three.js plate (v3, 2026-11-20)", "Three.js scenes, HTML/GSAP motion"),
    ("Compose", "ffmpeg (video_compose, audio_mixer)", "VERIFIED", "all final renders and mixes", "assembly, mix, mux"),
    # --- looks / routes
    ("Look", "Blender (blender_world)", "VERIFIED", "solar video, v2 tabletop (heavy on 4 GB VRAM)", "hero 3D scenes, physical systems"),
    ("Look", "Three.js world (threejs_world)", "VERIFIED", "blockout tier (v3) AND production tier 2026-11-25: Kenney Nature Kit models plus 3 ambientCG PBR sets, 6 s at 1080x1920 rendered in 22 s. Known issues: some trees render black, a HUD title (OPENMONTAGE - EXPLICIT WORLD) is burned in, and the runtime does not use the terrain PBR maps (the gate only checks them)", "dramatic tech/city/network scenes, stylised landscapes"),
    ("Look", "Manim (math_animate)", "VERIFIED", "v4 chalkboard, and LaTeX formulas verified 2026-11-25 after installing MiKTeX on D: (E=mc^2 and an integral rendered crisply); 300 s timeout per call", "maths, step-by-step logic, formulas"),
    ("Look", "Clay stop-motion series kit (clay/, Blender + Remotion)", "VERIFIED", "15.9 s two-character episode end to end at full quality 1080x1920 (about 17 min render+compose), redo-line rework verified, 2026-11-25", "recurring character series on any topic (explainers, stories, dialogues)"),
    ("Look", "Paper cutout kit (Remotion)", "VERIFIED", "relationships reel, v3 cut chosen", "people, relationships, history, stories"),
    ("Look", "Blueprint isometric kit (Remotion)", "VERIFIED", "AI-compute explainer", "systems, infrastructure, process"),
    ("Visual", "Stock via Pexels in Chrome", "VERIFIED", "search, list, licence read, download of 2 clips via your Chrome, trim and 1080x1920 reframe, 2026-11-25. The delivered file can differ from the page (got 720x1366 / 24.9 s for a page listing 30 s): always probe", "real footage and photos (how-to, lifestyle, services)"),
    ("Visual", "diagram_gen: boxes mode", "CRUDE", "renders, but arrows cut across boxes (2026-11-24)", "avoid; draw diagrams with the Remotion kits instead"),
    ("Visual", "diagram_gen: mermaid mode", "VERIFIED", "fixed 2026-11-25: mmdc now uses your installed Chrome via PUPPETEER_EXECUTABLE_PATH in .env", "flowcharts, sequence and state diagrams as images (default Mermaid look, not our style cards)"),
    ("Look", "/ink-art (Ink Theater, HyperFrames)", "VERIFIED", "shipped example rendered 2026-11-25 in landscape (50 s) and as a vertical 1080x1920 variant (48 s render); the figure is small and each piece needs its own layout tuning", "hand-drawn doodle explainers, deadpan mascot"),
    ("Look", "/animated-drawing: bundled character mode", "VERIFIED", "2026-11-25: installed in D:/AI-Video-Studio/_test-envs/AnimatedDrawings (Python 3.8 via uv), bundled child-drawing character danced, 339 frames in 34 s, no Docker", "animating a bundled demo character (demo only, per the skill)"),
    ("Look", "/animated-drawing: auto-rig a client drawing", "BLOCKED", "needs Docker plus about 670 MB of models and about 16 GB RAM; this PC has 7.8 GB RAM", "animating a client-supplied drawing (needs a bigger machine)"),
    # --- voice / audio
    ("Voice", "Piper (piper_tts) en_US-ryan-high", "VERIFIED", "solar video, AI-compute explainer", "default narration, fast"),
    ("Voice", "Kokoro af_heart (npx hyperframes tts)", "VERIFIED", "paper reel and a 2026-11-25 line test, also through clay/episode.py; NOT in the registry, so spend/report tools cannot see it", "warmer, more natural narration"),
    ("Voice", "Whisper word timings (transcriber)", "VERIFIED", "all reels", "captions, timing"),
    ("Audio", "audio_mixer", "VERIFIED", "all reels (-14 LUFS, ducking)", "mix"),
    ("Audio", "pixabay_music", "VERIFIED", "1 track 2026-11-20; scrapes the site, may 403", "background music"),
    ("Audio", "music_library (local files)", "VERIFIED", "1 track in music_library/", "background music you supply"),
    ("Audio", "freesound_music", "NEEDS KEY", "needs FREESOUND_API_KEY in .env (you create it)", "background music, SFX"),
    ("Audio", "audio_enhance", "VERIFIED", "2026-11-24 test clip", "clean-up of a supplied recording"),
    # --- post
    ("Post", "video_trimmer / auto_reframe / color_grade / showcase_card", "VERIFIED", "2026-11-24 test clip, outputs probed", "trim, 9:16 reframe, grade, title card"),
    ("Post", "silence_cutter", "VERIFIED", "2026-11-24, mark mode only reports (writes no file)", "tighten talking-head takes"),
    ("Post", "subtitle_gen", "VERIFIED", "2026-11-24 wrote .srt", "plain subtitles; styled captions come from the Remotion kit"),
    ("Post", "remotion_caption_burn, export_bundle", "VERIFIED", "2026-11-24 isolated run (caption burn used the ffmpeg fallback), output files checked", "burn captions, package for upload"),
    ("Analysis", "transcriber, audio_probe, audio_energy, frame_sampler, scene_detect, visual_qa, video_analyzer", "VERIFIED", "2026-11-24 on test clip/narration; Whisper base heard 'Clay' as 'Play' so fix names by hand", "timing, QA, reference analysis"),
    ("Post", "face_enhance, green_screen_processor, video_stitch, tts_selector(Piper), audio_mixer ops", "VERIFIED", "2026-11-24 outputs checked", "grading, chroma key, joining clips, voice routing"),
    ("Visual", "code_snippet, music_library, threejs_asset_catalog (list)", "VERIFIED", "2026-11-24", "code images, local tracks, Kenney catalog listing"),
    ("Analysis", "face_tracker, eye_enhance, face-guided auto_reframe", "VERIFIED", "2026-11-25 on a real face clip: 27/27 frames detected. mediapipe 1.2.3 lacks the legacy API, so the tools now fall back to OpenCV Haar with cascades downloaded to assets/models/ (tools patched)", "talking-head reframing, eye clean-up"),
    ("Visual", "Character rig chain (spec, rig, poses, timeline)", "VERIFIED", "2026-11-24 data chain ran; character_spec_generator ignores the brief and returns a generic stub, the agent must fill the design", "2D SVG rigged characters (data)"),
    ("Visual", "character_rig_renderer mp4 preview", "CRUDE", "works after installing playwright + Chromium (2026-11-25); output is a plain stick-style SVG character, preview quality; the page loads GSAP from a CDN so it needs internet; give an .html output_path", "quick previews of a rigged 2D character"),
    ("Post", "screen_recorder (ffmpeg)", "VERIFIED", "2 s test 2026-11-25, 1920x1080, deleted unviewed", "app demos"),
    ("Post", "cap_recorder (Cap app)", "NEEDS KEY", "the Cap app is not installed here; screen_recorder covers the same job", "polished screen recordings"),
    ("Post", "video_downloader, transcript_fetcher, green_screen_composite", "VERIFIED", "2026-11-25: yt-dlp audio download (CC BY Big Buck Bunny; converts to a 114 MB WAV, deleted), transcript fetch, picture-in-picture composite. Rights to reuse any footage are yours to check", "reference analysis, speaker over a background"),
    ("Post", "Scene re-render + splice (scripts/studio_rerender.py)", "VERIFIED", "1 s range of the paper reel, 48-50 dB PSNR vs original, 2026-11-24", "fix one scene without a full render"),
    # --- blocked
    ("Look", "Cartoon, Ghibli painterly, Office and flat Avatar looks (Remotion, code-made)", "PROBED", "one 4-6 s test scene each rendered as projects/_look_probes/look_probes.mp4 (18 s, 1080x1920, audio) and frames checked 2026-11-25. Known flaws: stray thumb blob in the cartoon at about frame 30; office workers hidden behind monitors; avatar hair is a plain cap shape. Avatar mouth follows the Piper audio level (measured by eye on frames 22 and 100)", "cartoon explainers, calm nature stories, office/process stories, a person speaking"),
    ("Visual", "AI image generation, paid APIs (about 30 tools)", "BLOCKED", "spend policy local_only, no keys", "use stock via Chrome or code-made scenes"),
    ("Visual", "AI image generation, local Stable Diffusion 1.5 (local_diffusion)", "BLOCKED", "tested 2026-11-25 in D:/AI-Video-Studio/_test-envs/diffusion (torch 2.7.1+cu118, CUDA works on driver 522): fp16 gives NaN (black image) on the GTX 1650 Ti, fp32 does not fit 4 GB, and the fp32 CPU-offload attempt was killed for low memory. Not retried", "code-made scenes (Remotion kits) or stock"),
    ("Visual", "AI video generation (36 tools)", "BLOCKED", "0 usable: paid, or local models too large", "use stock footage or animated scenes"),
    ("Voice", "Other TTS (ElevenLabs, OpenAI, Google, Azure ...)", "BLOCKED", "paid; stray OPENAI/GEMINI keys exist and must stay unused", "Piper or Kokoro"),
    ("Audio", "AI music generation (ACE-Step, Suno, ElevenLabs ...)", "BLOCKED", "paid, or needs CUDA 12.8 (driver is 522)", "Pixabay or library tracks"),
    ("Avatar", "AI talking avatars (HeyGen, Kling)", "BLOCKED", "paid, spend policy", "flat avatar with audio-driven mouth (PROBED) or own footage"),
    ("Avatar", "SadTalker / Wav2Lip (talking_head, lip_sync)", "UNTESTED", "free and local, 4 GB VRAM declared, but not installed (repo clone plus CUDA torch). The fp16 NaN problem seen with Stable Diffusion on this GPU may also hit them", "flat avatar (PROBED)"),
]

ORDER = {"VERIFIED": 0, "PROBED": 1, "CRUDE": 1, "UNTESTED": 2, "NEEDS KEY": 3, "BROKEN": 4, "BLOCKED": 5}


def registry_counts() -> dict:
    try:
        from tools.tool_registry import registry
        registry.discover()
        caps: dict = {}
        for _, t in registry._tools.items():
            c = caps.setdefault(t.capability, [0, 0])
            c[0] += 1
            c[1] += 1 if t.get_status().value == "available" else 0
        return {k: {"tools": v[0], "available": v[1]} for k, v in sorted(caps.items())}
    except Exception as e:  # registry problems must not hide the evidence table
        return {"_error": str(e)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--all", action="store_true", help="also show BLOCKED rows")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    rows = [r for r in EVIDENCE if a.all or r[2] != "BLOCKED"]
    reg = registry_counts()
    if a.json:
        print(json.dumps({"evidence": [dict(zip(("group", "route", "level", "evidence", "best_for"), r)) for r in EVIDENCE],
                          "registry": reg}, indent=1))
        return 0
    print("STUDIO ROUTES (what we can do here, with evidence)\n")
    group = None
    for r in sorted(rows, key=lambda r: (r[0], ORDER[r[2]])):
        if r[0] != group:
            group = r[0]
            print(f"\n== {group}")
        print(f"  [{r[2]:9}] {r[1]}\n              best for: {r[4]}\n              evidence: {r[3]}")
    if not a.all:
        print("\n(BLOCKED routes hidden; run with --all to list them.)")
    if "_error" not in reg:
        zero = [k for k, v in reg.items() if v["tools"] and not v["available"]]
        print("\nRegistry check: capabilities with ZERO usable tools:", ", ".join(zero) or "none")
        print("Registry 'available' means the tool loaded, not that it works. Trust the VERIFIED column.")
    else:
        print("\nRegistry unavailable:", reg["_error"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
