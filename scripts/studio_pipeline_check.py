#!/usr/bin/env python
"""Readiness check for every pipeline in pipeline_defs/. Read-only.

Usage:  python scripts/studio_pipeline_check.py [--json] [--md out.md]

For each pipeline: do the manifest, every stage's director skill and every required skill exist, and are the tools each stage
names (required_tools, tools_available) usable on THIS machine according to the live registry?
Verdicts:
  READY    all required tools of every stage are available (optional/alternative tools may be missing)
  PARTIAL  some stage's required tool is unavailable but that stage lists at least one available alternative
  BLOCKED  a stage has required tools and none is available, so that pipeline cannot be completed locally as written
Limits (stated, not hidden): this is a static + registry check. It does not run the pipeline, so READY means "the tools exist",
not "the pipeline was run end to end". Only animated-explainer and the clay route have had real end-to-end runs here.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

RUN_EVIDENCE = {
    "animated-explainer": "end-to-end runs: 4 productions (solar, AI-compute v1-v4, relationships)",
    "character-animation": "tool chain run (spec, rig, poses, timeline, preview render) 2026-11-25; no full pipeline run",
}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--md")
    a = ap.parse_args()
    from tools.tool_registry import registry
    registry.discover()
    avail = {n: t.get_status().value == "available" for n, t in registry._tools.items()}

    rows = []
    for p in sorted((ROOT / "pipeline_defs").glob("*.yaml")):
        d = yaml.safe_load(p.read_text(encoding="utf-8"))
        name = d.get("name", p.stem)
        problems, blocked, partial = [], [], []
        for sk in d.get("required_skills", []):
            if not (ROOT / "skills" / f"{sk}.md").exists():
                problems.append(f"required skill missing: {sk}")
        for st in d.get("stages", []):
            sk = st.get("skill")
            if sk and not (ROOT / "skills" / f"{sk}.md").exists():
                problems.append(f"stage {st['name']}: director missing {sk}")
            req = st.get("required_tools") or []
            ta = st.get("tools_available") or []
            unknown = [t for t in req + ta if t not in avail and t != 'web_search']  # web_search is an agent capability, not a registry tool
            if unknown:
                problems.append(f"stage {st['name']}: unknown tools {unknown}")
            real = [t for t in ta if t in avail]
            if real and not any(avail[t] for t in real) and not [t for t in req if avail.get(t)]:
                blocked.append(f"{st['name']}: none of its tools work here ({', '.join(real[:5])})")
                continue
            miss = [t for t in real if not avail[t]]
            if real and len(miss) * 2 >= len(real) and any(avail[t] for t in real):
                partial.append(f"{st['name']}: most listed tools unavailable ({', '.join(miss[:5])}); usable: {', '.join(t for t in real if avail[t])}")
            for t in req:
                if t in avail and not avail[t]:
                    alts = [x for x in ta if x != t and avail.get(x)]
                    # selector tools (image_selector etc.) count as unavailable when no backend works
                    (partial if alts else blocked).append(f"{st['name']}: {t}" + (f" (alternatives available: {', '.join(alts[:3])})" if alts else ""))
        verdict = "BLOCKED" if blocked else ("PARTIAL" if partial else "READY")
        if problems:
            verdict += " + MANIFEST PROBLEMS"
        rows.append({"pipeline": name, "stages": len(d.get("stages", [])), "verdict": verdict, "blocked": blocked, "partial": partial,
                     "problems": problems, "run_evidence": RUN_EVIDENCE.get(name, "none")})
    if a.json:
        print(json.dumps(rows, indent=1)); return 0
    lines = ["Pipeline readiness (static + registry; READY does not mean a full run was done)", ""]
    for r in rows:
        lines.append(f"{r['pipeline']:22} {r['verdict']:28} stages={r['stages']}  run evidence: {r['run_evidence']}")
        for x in r["blocked"]: lines.append(f"    BLOCKED  {x}")
        for x in r["partial"]: lines.append(f"    PARTIAL  {x}")
        for x in r["problems"]: lines.append(f"    PROBLEM  {x}")
    out = "\n".join(lines)
    if a.md: Path(a.md).write_text(out, encoding="utf-8")
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
