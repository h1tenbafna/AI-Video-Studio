#!/usr/bin/env python
"""Per-project production report: stage timing, tool time, external spend, failures.

Usage:  python scripts/studio_report.py <project_id> [--claude-usd 12.34] [--json]

Reads only files under projects/<id>/ (checkpoint_*.json, history/, events.jsonl).
Read-only. Everything here is DERIVED from those files; nothing is estimated.

Limits (stated, not hidden):
  * Stage times are gaps between checkpoint timestamps. They include human review
    waits, so they are elapsed time, not working time.
  * events.jsonl records tool, success, duration and cost but NOT error messages,
    so failures are counted by tool only.
  * Claude usage is not recorded in the project. Pass --claude-usd to show a figure
    you read from your own usage page; it is reported separately from external spend.
"""
from __future__ import annotations

import argparse
import collections
import json
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s)


def _load(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def stage_rows(project: Path) -> list[dict]:
    """Final checkpoint per stage, ordered by timestamp, with elapsed gap since the previous one."""
    found = {}
    for p in project.glob("checkpoint_*.json"):
        c = _load(p)
        if c and c.get("timestamp") and c.get("stage"):
            found[c["stage"]] = c
    rows = sorted(found.values(), key=lambda c: _ts(c["timestamp"]))
    out, prev = [], None
    for c in rows:
        t = _ts(c["timestamp"])
        out.append({
            "stage": c["stage"],
            "status": c.get("status"),
            "at": c["timestamp"],
            "elapsed_since_previous_min": None if prev is None else round((t - prev).total_seconds() / 60, 1),
            "revisions": len(list((project / "history").glob(f"checkpoint_{c['stage']}_*.json"))),
        })
        prev = t
    return out


def tool_rows(project: Path) -> dict:
    path = project / "events.jsonl"
    stats = collections.defaultdict(lambda: {"calls": 0, "failed": 0, "seconds": 0.0, "cost_usd": 0.0})
    if not path.exists():
        return {}
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            e = json.loads(line)
        except json.JSONDecodeError:
            continue
        if e.get("event") != "finish":
            continue
        s = stats[e.get("tool", "?")]
        s["calls"] += 1
        s["failed"] += 0 if e.get("success") else 1
        s["seconds"] += float(e.get("duration_s") or 0)
        s["cost_usd"] += float(e.get("cost_usd") or 0)
    return {k: {**v, "seconds": round(v["seconds"], 1), "cost_usd": round(v["cost_usd"], 4)} for k, v in stats.items()}


def build(project_id: str, claude_usd: float | None) -> dict:
    project = ROOT / "projects" / project_id
    if not project.is_dir():
        raise SystemExit(f"No such project: {project}")
    stages, tools = stage_rows(project), tool_rows(project)
    return {
        "project": project_id,
        "stages": stages,
        "total_elapsed_hours": round(
            (_ts(stages[-1]["at"]) - _ts(stages[0]["at"])).total_seconds() / 3600, 2) if len(stages) > 1 else None,
        "tools": tools,
        "external_spend_usd": round(sum(t["cost_usd"] for t in tools.values()), 4),
        "claude_usage_usd_user_supplied": claude_usd,
    }


def render(r: dict) -> str:
    L = [f"Project: {r['project']}", "", "Stages (elapsed incl. review waits; DERIVED from checkpoint timestamps)"]
    for s in r["stages"]:
        gap = "-" if s["elapsed_since_previous_min"] is None else f"{s['elapsed_since_previous_min']} min"
        L.append(f"  {s['stage']:<12} {s['status']:<10} +{gap:<10} revisions={s['revisions']}")
    if r["total_elapsed_hours"] is not None:
        L.append(f"  first to last checkpoint: {r['total_elapsed_hours']} h")
    L += ["", "Tool calls (from events.jsonl; error messages are not recorded)"]
    for name, t in sorted(r["tools"].items(), key=lambda kv: -kv[1]["seconds"]):
        L.append(f"  {name:<22} calls={t['calls']:<4} failed={t['failed']:<3} {t['seconds']}s  ${t['cost_usd']}")
    L += ["", f"External spend (tool-reported): ${r['external_spend_usd']}"]
    c = r["claude_usage_usd_user_supplied"]
    L.append("Claude usage: " + (f"${c} (supplied by you, not measured here)" if c is not None else "not recorded in project"))
    return "\n".join(L)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project_id")
    ap.add_argument("--claude-usd", type=float, default=None)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    r = build(a.project_id, a.claude_usd)
    print(json.dumps(r, indent=2) if a.json else render(r))
    return 0


if __name__ == "__main__":
    sys.exit(main())
