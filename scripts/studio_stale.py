#!/usr/bin/env python
"""What is stale in a project after a change?  Read-only (except --mark-built).

Usage:
  python scripts/studio_stale.py <project_id>               report
  python scripts/studio_stale.py <project_id> --mark-built  save a snapshot of the current state as "built"
  python scripts/studio_stale.py <project_id> --json

Two independent checks, both DERIVED from files under projects/<id>/:
  1. Timestamps: an output older than one of its inputs is STALE.
       research -> proposal -> script -> scene_plan -> asset_manifest/assets -> edit_decisions -> render -> publish
  2. Content snapshot (needs --mark-built once after a build): which script sections,
     scenes, assets or music files changed since, and what that touches downstream.

Limits (stated, not hidden):
  * Timestamps show "touched after", not "meaningfully changed". A re-saved file with the same text is a false alarm,
    which the snapshot check (content hashes) will not repeat.
  * Without a snapshot only check 1 runs.
  * Which narration file belongs to which script section is read from asset_manifest scene_id/script_section_id
    when present; otherwise the report says "narration" as a whole.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOL = 2.0  # seconds of mtime tolerance

# artifact name -> (list of upstream artifact names)
CHAIN = [
    ("research_brief", []),
    ("proposal_packet", ["research_brief"]),
    ("script", ["proposal_packet"]),
    ("scene_plan", ["script"]),
    ("asset_manifest", ["scene_plan", "script"]),
    ("edit_decisions", ["asset_manifest", "scene_plan"]),
    ("render", ["edit_decisions", "asset_manifest"]),
    ("publish_log", ["render"]),
]


def _sha(p: Path) -> str:
    h = hashlib.sha1()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()[:12]


def _text_sha(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:12]


def _load(p: Path):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def artifact_path(proj: Path, name: str) -> Path | None:
    if name == "render":
        cands = sorted((proj / "renders").glob("final*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
        main = proj / "renders" / "final.mp4"
        return main if main.exists() else (cands[0] if cands else None)
    p = proj / "artifacts" / f"{name}.json"
    return p if p.exists() else None


def current_state(proj: Path) -> dict:
    """Content fingerprint of everything a rework can touch."""
    st: dict = {"script_sections": {}, "scenes": {}, "assets": {}, "music": {}, "edit": None}
    script = _load(proj / "artifacts" / "script.json")
    if script:
        for s in script.get("sections", []):
            st["script_sections"][str(s.get("id"))] = _text_sha(
                json.dumps({"t": s.get("text"), "d": s.get("delivery_cues"), "pr": s.get("pronunciation_guides")},
                           sort_keys=True))
    plan = _load(proj / "artifacts" / "scene_plan.json")
    if plan:
        for sc in plan.get("scenes", []):
            st["scenes"][str(sc.get("id"))] = _text_sha(json.dumps(sc, sort_keys=True))
    man = _load(proj / "artifacts" / "asset_manifest.json")
    if man:
        for a in man.get("assets", []):
            path = a.get("path")
            if not path:
                continue
            fp = Path(path)
            if not fp.is_absolute():
                # manifests use repo-relative OR project-relative paths
                fp = next((c for c in (ROOT / path, proj / path) if c.exists()), ROOT / path)
            key = f"{a.get('type')}:{a.get('id')}"
            st["assets"][key] = {
                "path": path,
                "scene_id": a.get("scene_id"),
                "sha": _sha(fp) if fp.exists() else "MISSING",
            }
    for p in sorted((proj / "assets" / "music").glob("*")):
        if p.is_file():
            st["music"][p.name] = _sha(p)
    ed = proj / "artifacts" / "edit_decisions.json"
    if ed.exists():
        st["edit"] = _sha(ed)
    return st


def diff_state(old: dict, new: dict) -> list[dict]:
    out = []

    def cmp(kind, a, b, get=lambda v: v):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                out.append({"kind": kind, "id": k, "change": "added"})
            elif k not in b:
                out.append({"kind": kind, "id": k, "change": "removed"})
            elif get(a[k]) != get(b[k]):
                out.append({"kind": kind, "id": k, "change": "changed"})

    cmp("script_section", old.get("script_sections", {}), new.get("script_sections", {}))
    cmp("scene", old.get("scenes", {}), new.get("scenes", {}))
    cmp("asset", old.get("assets", {}), new.get("assets", {}), get=lambda v: v["sha"])
    cmp("music", old.get("music", {}), new.get("music", {}))
    if old.get("edit") != new.get("edit"):
        out.append({"kind": "edit_decisions", "id": "edit_decisions", "change": "changed"})
    return out


IMPACT = {
    "script_section": "narration for that section, section timing, word timings, caption pages, scene timing, edit, render",
    "scene": "that scene's assets or code, its cut in edit_decisions, the render (frame range of that scene)",
    "asset": "its cut in edit_decisions and the render (frame range of its scene)",
    "music": "audio mix, then mux (a full video re-render is NOT needed if video was rendered muted)",
    "edit_decisions": "the render",
}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project_id")
    ap.add_argument("--mark-built", action="store_true", help="save the current state as the built baseline")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    proj = ROOT / "projects" / a.project_id
    if not proj.is_dir():
        print(f"No such project: {proj}")
        return 2
    snap_path = proj / ".studio_snapshot.json"
    state = current_state(proj)

    if a.mark_built:
        snap_path.write_text(json.dumps(state, indent=1), encoding="utf-8")
        print(f"Snapshot saved: {snap_path.relative_to(ROOT)}  "
              f"({len(state['script_sections'])} script sections, {len(state['scenes'])} scenes, "
              f"{len(state['assets'])} assets)")
        return 0

    findings: list[dict] = []

    # 1. timestamps
    mt = {}
    for name, _ in CHAIN:
        p = artifact_path(proj, name)
        mt[name] = p.stat().st_mtime if p else None
    for name, ups in CHAIN:
        if mt[name] is None:
            continue
        for u in ups:
            if mt.get(u) and mt[u] > mt[name] + TOL:
                findings.append({"check": "timestamp", "stale": name, "because": u,
                                 "gap_s": round(mt[u] - mt[name])})
    # assets older than manifest inputs are covered by the snapshot; check narration vs script here
    script_p = artifact_path(proj, "script")
    nar = sorted((proj / "assets" / "audio").glob("narration*"))
    if script_p and nar:
        newest = max(p.stat().st_mtime for p in nar)
        if script_p.stat().st_mtime > newest + TOL:
            findings.append({"check": "timestamp", "stale": "narration audio", "because": "script", "gap_s":
                             round(script_p.stat().st_mtime - newest)})

    # 2. snapshot
    changes = []
    have_snap = snap_path.exists()
    if have_snap:
        changes = diff_state(json.loads(snap_path.read_text(encoding="utf-8")), state)
    missing = [k for k, v in state["assets"].items() if v["sha"] == "MISSING"]
    plan_ids = set(state["scenes"])
    covered = {v["scene_id"] for v in state["assets"].values() if v["scene_id"]}
    no_assets = sorted(plan_ids - covered) if state["assets"] else []

    if a.json:
        print(json.dumps({"timestamp_findings": findings, "snapshot": have_snap, "changes": changes,
                          "missing_assets": missing, "scenes_without_assets": no_assets}, indent=1))
        return 0

    print(f"Project: {a.project_id}")
    print("\n[1] Timestamps (touched-after, may include harmless re-saves)")
    if not findings:
        print("  OK: no output is older than its inputs.")
    for f in findings:
        print(f"  STALE: {f['stale']} is older than {f['because']} by {f['gap_s']} s")

    print("\n[2] Content changes since last --mark-built")
    if not have_snap:
        print("  UNKNOWN: no snapshot yet. After a build you are happy with, run with --mark-built.")
    elif not changes:
        print("  OK: nothing changed since the snapshot.")
    for c in changes:
        print(f"  {c['change'].upper():8} {c['kind']} {c['id']}  ->  re-do: {IMPACT.get(c['kind'], '?')}")

    print("\n[3] Integrity")
    print("  Missing asset files:", ", ".join(missing) if missing else "none")
    print("  Scenes with no asset in the manifest:", ", ".join(no_assets) if no_assets else "none"
          + ("  (manifest has no scene_ids or no assets)" if not state["assets"] else ""))
    print("\nNothing was changed. To re-render one scene: python scripts/studio_rerender.py <id> --scene <sN>")
    return 0


if __name__ == "__main__":
    sys.exit(main())
