#!/usr/bin/env python
"""Save, list, show and apply reusable themes (a look you liked, kept for future videos).

  python scripts/studio_theme.py save <project_id> <theme_name> [--kit remotion-composer/src/blueprint ...] [--card blueprint-isometric] [--note "..."]
  python scripts/studio_theme.py list
  python scripts/studio_theme.py show <theme_name>
  python scripts/studio_theme.py apply <theme_name> <new_project_id>

A theme lives in themes/<name>/ (theme.json, art-direction.md, playbook.yaml, reference/ stills).
It records the LOOK and the defaults (route, runtime, voice, music, captions, kit paths).
It never records a topic or a script. A character series (clay/series/<name>/) is listed as a theme too.
Read-only on projects; writes only inside themes/ and (apply) projects/<new_project_id>/.
"""
import json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THEMES = ROOT / "themes"
PROJECTS = ROOT / "projects"


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def latest_decisions(pid):
    p = PROJECTS / pid / "decision_log.json"
    if not p.exists():
        return {}
    d = json.loads(p.read_text(encoding="utf8"))
    items = d.get("decisions", d) if isinstance(d, dict) else d
    out = {}
    for x in items:  # later entries with the same category+subject win
        out[(x.get("category"), x.get("subject"))] = x
    return out


def pick(dec, category, *words):
    hit = None
    for (cat, subj), x in dec.items():
        if cat == category and all(w.lower() in (subj or "").lower() for w in words):
            hit = x
    return hit and (hit.get("selected") or hit.get("chosen") or hit.get("decision"))


def cmd_save(a):
    pid, name = a[0], slug(a[1])
    kits, card, note = [], None, ""
    i = 2
    while i < len(a):
        if a[i] == "--kit": kits.append(a[i + 1]); i += 2
        elif a[i] == "--card": card = a[i + 1]; i += 2
        elif a[i] == "--note": note = a[i + 1]; i += 2
        else: i += 1
    proj = PROJECTS / pid
    if not proj.exists():
        sys.exit(f"no project {pid}")
    dec = latest_decisions(pid)
    t = THEMES / name
    (t / "reference").mkdir(parents=True, exist_ok=True)
    ad = proj / "art-direction.md"
    if ad.exists():
        shutil.copy(ad, t / "art-direction.md")
    card = card or pick(dec, "playbook_selection", "card") or pick(dec, "playbook_selection", "style")
    for cand in [ROOT / "styles" / "custom" / f"{card}.yaml", ROOT / "styles" / f"{card}.yaml"]:
        if card and cand.exists():
            shutil.copy(cand, t / "playbook.yaml"); break
    stills = sorted((proj / "renders" / "stills").glob("*.png"))[:4] if (proj / "renders" / "stills").exists() else []
    for s in stills:
        shutil.copy(s, t / "reference" / s.name)
    thumb = proj / "renders" / "thumbnail.png"
    if thumb.exists():
        shutil.copy(thumb, t / "reference" / "thumbnail.png")
    meta = {
        "name": name,
        "kind": "look",
        "saved_from_project": pid,
        "note": note,
        "style_card": card,
        "route": pick(dec, "provider_selection", "route") or pick(dec, "render_runtime_selection"),
        "runtime": pick(dec, "render_runtime_selection"),
        "authoring_mode": pick(dec, "composition_mode"),
        "voice": pick(dec, "voice_selection"),
        "music": pick(dec, "music_source"),
        "captions": pick(dec, "playbook_override", "caption"),
        "kit_paths": kits,
        "how_to_reuse": "New topic, same look: `apply` this theme to a new project, then the scene plan reuses the kit components and "
                        "art-direction.md. The topic, script and facts are NEW every time. Anything the user changes stays theirs (locked).",
    }
    (t / "theme.json").write_text(json.dumps(meta, indent=2), encoding="utf8")
    print(f"saved theme '{name}' -> {t.relative_to(ROOT)}")
    print(json.dumps({k: v for k, v in meta.items() if k != "how_to_reuse"}, indent=1))
    if not kits:
        print("NOTE: no --kit given. Pass the kit folder(s) (for example remotion-composer/src/blueprint) so reuse knows which components to start from.")


def themes():
    out = []
    for d in sorted(THEMES.glob("*/theme.json")):
        out.append(("look", json.loads(d.read_text(encoding="utf8"))))
    for d in sorted((ROOT / "clay" / "series").glob("*/series.json")):
        j = json.loads(d.read_text(encoding="utf8"))
        out.append(("character series", {"name": d.parent.name, "note": j.get("tagline", ""),
                                         "cast": list(j.get("cast", {})), "path": str(d.relative_to(ROOT))}))
    return out


def cmd_list():
    ts = themes()
    if not ts:
        print("no saved themes yet"); return
    for kind, m in ts:
        extra = f"cast: {', '.join(m['cast'])}" if m.get("cast") else f"card: {m.get('style_card')} | voice: {m.get('voice')}"
        print(f"- {m['name']}  [{kind}]  {extra}\n    {m.get('note','')}")


def cmd_show(a):
    f = THEMES / slug(a[0]) / "theme.json"
    if not f.exists():
        sys.exit("no such theme (try: list)")
    print(f.read_text(encoding="utf8"))
    ad = f.parent / "art-direction.md"
    if ad.exists():
        print("\n--- art-direction.md ---\n" + ad.read_text(encoding="utf8"))


def cmd_apply(a):
    name, pid = slug(a[0]), a[1]
    t = THEMES / name
    if not (t / "theme.json").exists():
        sys.exit("no such theme (try: list)")
    proj = PROJECTS / pid
    if not proj.exists():
        sys.exit(f"project {pid} does not exist: run init_project first")
    meta = json.loads((t / "theme.json").read_text(encoding="utf8"))
    meta["applied_at_project"] = pid
    (proj / "theme_lock.json").write_text(json.dumps(meta, indent=2), encoding="utf8")
    if (t / "art-direction.md").exists():
        shutil.copy(t / "art-direction.md", proj / "art-direction.md")
    print(f"applied '{name}' to {pid}: theme_lock.json + art-direction.md written. Announce the carried-over choices (voice, music, runtime) before using them.")


if __name__ == "__main__":
    c = sys.argv[1] if len(sys.argv) > 1 else ""
    a = sys.argv[2:]
    {"save": lambda: cmd_save(a), "list": cmd_list, "show": lambda: cmd_show(a), "apply": lambda: cmd_apply(a)}.get(c, lambda: print(__doc__))()
