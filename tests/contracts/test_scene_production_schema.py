"""Contract tests for the optional per-scene `production` object in scene_plan."""

import copy
import json
from pathlib import Path

import jsonschema
import pytest

ROOT = Path(__file__).resolve().parent.parent.parent
SCHEMA = json.loads((ROOT / "schemas/artifacts/scene_plan.schema.json").read_text(encoding="utf-8"))
VALIDATOR = jsonschema.Draft202012Validator(SCHEMA)

BASE_SCENE = {
    "id": "s1",
    "type": "animation",
    "description": "Sun rays hit a panel",
    "start_seconds": 0,
    "end_seconds": 5,
}


def _plan(**scene_extra):
    return {"version": "1.0", "scenes": [{**BASE_SCENE, **scene_extra}]}


def _errors(plan):
    return list(VALIDATOR.iter_errors(plan))


def test_scene_without_production_still_valid():
    assert _errors(_plan()) == []


def test_production_minimal_and_full_valid():
    assert _errors(_plan(production={"route": "blender"})) == []
    full = {
        "route": "threejs",
        "style_id": "clean-isometric",
        "execution_tool": "threejs_world",
        "rationale": "Interactive-looking camera orbit",
        "estimated_render_seconds": 90,
    }
    assert _errors(_plan(production=full)) == []


@pytest.mark.parametrize("route", ["blender", "threejs", "manim", "remotion", "cinematic", "hybrid"])
def test_every_route_accepted(route):
    assert _errors(_plan(production={"route": route})) == []


@pytest.mark.parametrize(
    "bad",
    [
        {},  # route required
        {"route": "unreal"},  # not in enum
        {"route": "blender", "runtime": "remotion"},  # runtime is project-level, not per scene
        {"route": "blender", "estimated_render_seconds": -1},
    ],
)
def test_invalid_production_rejected(bad):
    assert _errors(_plan(production=copy.deepcopy(bad))) != []


def test_unknown_scene_key_still_rejected():
    assert _errors(_plan(not_a_field=1)) != []


def test_existing_solar_scene_plan_validates_unchanged():
    path = ROOT / "projects/sunlight-to-electricity/artifacts/scene_plan.json"
    if not path.exists():
        pytest.skip("solar benchmark project not present")
    plan = json.loads(path.read_text(encoding="utf-8"))
    assert _errors(plan) == []
