#!/usr/bin/env python
"""Print the style menu for /reel: every look this studio can make, with evidence level and saved themes.
  python scripts/studio_styles.py          # the full menu
  python scripts/studio_styles.py --json   # machine readable
Read-only. Evidence levels match scripts/studio_routes.py (VERIFIED / PROBED / CRUDE / UNTESTED / BLOCKED).
Edit the WORLDS table when a new look is added or its evidence changes.
"""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

# (menu name, what it looks like, route, evidence, card/skill, best for)
WORLDS = [
 ("Blueprint / isometric technical drawing", "drafting sheet, numbered part tags, isometric parts", "Remotion kit", "VERIFIED", "styles/library/blueprint-isometric.md", "AI, tech, systems, money flows (benchmark 1)"),
 ("Paper-cutout diorama", "layered paper people and sets, warm", "Remotion kit", "VERIFIED", "styles/library/paper-cutout-diorama.md", "people, relationships, history, habits"),
 ("3D tabletop miniature / Blender hero scene", "objects on a table, physical systems, real lighting", "Blender + Remotion", "VERIFIED (heavy on 4 GB VRAM)", "styles/library/tabletop-miniature.md", "supply chains, physical processes, energy (benchmark 2)"),
 ("Chalkboard / math animation", "step by step derivations, LaTeX formulas", "Manim", "VERIFIED (wobbly shapes, hard cuts)", "styles/library/chalkboard-derivation.md", "maths, logic, science"),
 ("Neon night city", "glow, contrast, dramatic", "Three.js / Remotion", "VERIFIED at blockout tier only", "styles/library/night-city-neon.md", "finance, networks, the future of X"),
 ("Data motion (charts, counters)", "clean flat charts and numbers", "Remotion", "UNTESTED as a finished look", "styles/library/clean-data-motion.md", "stats, comparisons, KPIs"),
 ("Clay stop-motion characters", "clay figures talking, fixed cast, reusable series", "Blender + Remotion kit", "VERIFIED (simple characters)", "styles/library/clay-stopmotion.md + skill clay-series", "recurring page of explainers or dialogues (clayrified style)"),
 ("Hand-drawn doodle / ink", "ink on white, a figure that draws itself", "/ink-art (HyperFrames)", "VERIFIED (small figure)", "skill ink-art", "deadpan explainers, doodles"),
 ("Animated drawing (a supplied sketch moves)", "your drawing walks and dances", "/animated-drawing", "VERIFIED bundled demo character only; own drawings need ~16 GB RAM", "skill animated-drawing", "mascots from a drawing"),
 ("Cartoon / flat 2D characters", "flat vector characters in Remotion (our own kit)", "Remotion", "PROBED 2026-11-25: one cab-booking scene (two characters, phone tap, cab arrives) rendered; reusable cast kit not built (roadmap F1)", "remotion-composer/src/probes (test code)", "friendly explainers"),
 ("Anime / Ghibli painterly", "watercolour edges, warm golden light, soft nature", "Remotion + Three.js painted look", "PROBED 2026-11-25: painted sky, hills, clouds, glow, lantern girl rendered from code. Local Stable Diffusion fails on this GPU (black fp16 images). Playbook: styles/anime-ghibli.yaml", "styles/anime-ghibli.yaml", "stories, wonder, nature"),
 ("Office / workplace set", "an office as a 3D or paper set with characters at desks", "Blender or paper kit", "PROBED 2026-11-25: flat office, 3 desks, envelope flies Sales to Finance, chart grows. Workers hidden behind monitors (fix). No card yet", "remotion-composer/src/probes (test code)", "business, productivity, B2B"),
 ("Human character (real photo or bitmoji-like)", "a person explaining", "stock people via Pexels, or own footage, or a flat avatar built in Remotion", "stock VERIFIED; flat avatar PROBED (mouth follows Piper audio level); talking-head pipeline UNTESTED; SadTalker/Wav2Lip UNTESTED; AI avatar BLOCKED (paid)", "stock-chrome.md", "services, how-to, trust"),
 ("Stock footage + text on motion", "real clips, bold text, counters", "Pexels via Chrome + Remotion", "VERIFIED (needs /claude-in-chrome on)", "stock-chrome.md", "how-to, lifestyle, local business"),
 ("Character theme of your own (robots, tomato, Doraemon-like, stick figures, two characters talking)", "a recurring cast on any topic; saved as a theme", "clay kit pattern or Remotion character kit", "clay VERIFIED; others UNTESTED (a cartoon kit is PROBED). Copyrighted characters (Doraemon etc.) need original look-alikes, not copies", "skill clay-series", "a page with 20+ videos in one look"),
]

def themes():
    out = []
    for f in sorted((ROOT / "themes").glob("*/theme.json")):
        j = json.loads(f.read_text(encoding="utf8"))
        out.append({"name": j["name"], "kind": "saved look", "note": j.get("note", ""), "voice": j.get("voice")})
    for f in sorted((ROOT / "clay" / "series").glob("*/series.json")):
        j = json.loads(f.read_text(encoding="utf8"))
        out.append({"name": f.parent.name, "kind": "character series", "note": j.get("tagline", ""), "voice": ", ".join(j.get("cast", {}))})
    return out

if __name__ == "__main__":
    t = themes()
    if "--json" in sys.argv:
        print(json.dumps({"worlds": WORLDS, "saved_themes": t}, indent=1)); sys.exit()
    print("SAVED THEMES (reuse = same look, new topic)")
    for x in t:
        print(f"  * {x['name']} [{x['kind']}] {x['note']}")
    if not t: print("  none")
    print("\nALL LOOKS")
    for i, w in enumerate(WORLDS, 1):
        print(f"{i:>2}. {w[0]}\n      looks like: {w[1]}\n      route: {w[2]} | evidence: {w[3]}\n      best for: {w[5]} | spec: {w[4]}")
