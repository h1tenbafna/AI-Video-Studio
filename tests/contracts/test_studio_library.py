"""Style cards must match the scene-plan route enum; studio_report must run on a synthetic project."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

SCHEMA = json.loads((ROOT / "schemas/artifacts/scene_plan.schema.json").read_text(encoding="utf-8"))
ROUTES = set(SCHEMA["properties"]["scenes"]["items"]["properties"]["production"]["properties"]["route"]["enum"])
CARDS = [p for p in (ROOT / "styles/library").glob("*.md") if p.name != "README.md"]


def _front(p):
    m = re.match(r"---\n(.*?)\n---", p.read_text(encoding="utf-8"), re.S)
    assert m, f"{p.name}: missing frontmatter"
    return dict(line.split(": ", 1) for line in m.group(1).splitlines())


def test_cards_exist_and_are_consistent():
    assert CARDS
    for p in CARDS:
        f = _front(p)
        assert f["id"] == p.stem
        routes = {r.strip() for r in f["routes"].strip("[]").split(",")}
        assert routes and routes <= ROUTES, f"{p.name}: unknown routes {routes - ROUTES}"
        assert f["status"] in {"untested", "verified"}


def test_studio_report_on_synthetic_project(tmp_path, monkeypatch):
    import studio_report as sr
    proj = tmp_path / "projects" / "demo"
    (proj / "history").mkdir(parents=True)
    for stage, ts in [("research", "2026-01-01T00:00:00+00:00"), ("script", "2026-01-01T00:30:00+00:00")]:
        (proj / f"checkpoint_{stage}.json").write_text(json.dumps({"stage": stage, "status": "completed", "timestamp": ts}))
    ev = [{"event": "finish", "tool": "piper_tts", "success": True, "duration_s": 2.0, "cost_usd": 0.0},
          {"event": "finish", "tool": "x", "success": False, "duration_s": 1.0, "cost_usd": 0.0}]
    (proj / "events.jsonl").write_text("\n".join(json.dumps(e) for e in ev))
    monkeypatch.setattr(sr, "ROOT", tmp_path)
    r = sr.build("demo", None)
    assert r["stages"][1]["elapsed_since_previous_min"] == 30.0
    assert r["tools"]["x"]["failed"] == 1
    assert r["external_spend_usd"] == 0.0
    assert r["claude_usage_usd_user_supplied"] is None
