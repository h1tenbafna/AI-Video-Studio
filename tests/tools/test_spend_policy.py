"""Checkpoint 2: hard $0 enforcement.

Runnable with plain python (pytest is not installed in this venv):

    python tests/tools/test_spend_policy.py

Also collectable by pytest. No network, no provider calls: paid tools are only
ever asked for status or blocked before execute reaches their implementation.
"""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from lib import spend_policy
from lib.config_model import BudgetMode, OpenMontageConfig, SpendPolicyMode
from lib.spend_policy import SpendPolicy
from tools.base_tool import BaseTool, ToolResult, ToolRuntime, ToolStatus
from tools.cost_tracker import BudgetExceededError, CostTracker
from tools.provider_pricing import PriceQuoteRequired
from tools.tool_registry import registry

ENFORCED = SpendPolicy(mode="local_only", allow_tools=frozenset({"bg_remove"}))
CALLS: list[str] = []


def _make(name, runtime, provider="acme", deps=None, quote_error=False):
    def execute(self, inputs):
        CALLS.append(self.name)
        return ToolResult(success=True, data={"ran": self.name})

    attrs = {"name": name, "runtime": runtime, "provider": provider,
             "dependencies": deps or [], "execute": execute}
    if quote_error:
        def estimate_cost(self, inputs):
            raise PriceQuoteRequired("no quote")
        attrs["estimate_cost"] = estimate_cost
    return type(f"T_{name}", (BaseTool,), attrs)()


class enforced:
    """Context: force the enforcing policy, restore afterwards."""

    def __enter__(self):
        CALLS.clear()
        spend_policy.set_policy_override(ENFORCED)

    def __exit__(self, *exc):
        spend_policy.set_policy_override(None)


# ---- policy decisions ----

def test_decisions():
    paid = _make("t_api", ToolRuntime.API)
    hyb = _make("t_hybrid", ToolRuntime.HYBRID)
    loc = _make("t_local", ToolRuntime.LOCAL)
    gpu = _make("t_gpu", ToolRuntime.LOCAL_GPU)
    sel = _make("t_sel", ToolRuntime.HYBRID, provider="selector")
    allowed = _make("bg_remove", ToolRuntime.HYBRID)
    with enforced():
        p = spend_policy.get_policy()
        assert not p.decide(paid)[0]
        assert not p.decide(hyb)[0]
        assert p.decide(loc)[0] and p.decide(gpu)[0]
        assert p.decide(sel)[0]
        assert p.decide(allowed)[0]
    assert SpendPolicy(mode="off").decide(paid)[0]


def test_paid_tool_never_executes():
    paid = _make("t_paid", ToolRuntime.API)
    with enforced():
        r = paid.execute({"text": "x"})
    assert r.success is False
    assert r.data["error_class"] == "spend_policy_blocked"
    assert "t_paid" not in CALLS, "implementation must not run"


def test_local_tool_still_executes():
    loc = _make("t_loc2", ToolRuntime.LOCAL)
    with enforced():
        r = loc.execute({})
    assert r.success and CALLS == ["t_loc2"]


def test_status_unavailable_even_with_key_set():
    os.environ["T_FAKE_KEY"] = "x"
    try:
        paid = _make("t_keyed", ToolRuntime.API, deps=["env:T_FAKE_KEY"])
        with enforced():
            assert paid.get_status() == ToolStatus.UNAVAILABLE
        # sanity: with the policy off, the key alone would have made it available
        spend_policy.set_policy_override(SpendPolicy(mode="off"))
        try:
            assert paid.get_status() == ToolStatus.AVAILABLE
        finally:
            spend_policy.set_policy_override(None)
    finally:
        del os.environ["T_FAKE_KEY"]


def test_unknown_cost_provider_is_unavailable_and_blocked():
    unknown = _make("t_unknown", ToolRuntime.API, quote_error=True)
    with enforced():
        assert unknown.get_status() == ToolStatus.UNAVAILABLE
        assert unknown.execute({}).success is False
    assert "t_unknown" not in CALLS


def test_fails_closed_on_unreadable_config():
    original = OpenMontageConfig.load
    try:
        def boom(*a, **k):
            raise RuntimeError("bad config")
        OpenMontageConfig.load = classmethod(lambda cls, *a, **k: boom())
        spend_policy.reset_policy()
        pol = spend_policy.get_policy()
        assert pol.enforced and not pol.allow_tools
    finally:
        OpenMontageConfig.load = original
        spend_policy.reset_policy()


# ---- real config and registry ----

def test_config_is_hard_zero():
    cfg = OpenMontageConfig.load()
    assert cfg.budget.mode == BudgetMode.CAP
    assert cfg.budget.total_usd == 0.0
    assert cfg.budget.reserve_pct == 0.0
    assert cfg.spend_policy.mode == SpendPolicyMode.LOCAL_ONLY
    assert cfg.spend_policy.allow_tools == ["bg_remove", "threejs_asset_catalog"]


def test_registry_only_offers_local_tools():
    spend_policy.reset_policy()  # real config, no override
    registry.discover()
    offenders = []
    allow = set(OpenMontageConfig.load().spend_policy.allow_tools)
    for t in registry.get_available():
        rt = t.runtime.value
        ok = (rt in ("local", "local_gpu") or t.provider == "selector"
              or t.name in allow)
        if not ok:
            offenders.append((t.name, rt))
    assert not offenders, offenders
    for name in ("openai_tts", "openai_image", "sora_video", "gemini_tts",
                 "google_tts", "google_imagen", "google_music", "gemini_omni_video"):
        tool = registry.get(name)
        assert tool is not None and tool.get_status() == ToolStatus.UNAVAILABLE, name


def test_tts_selector_cannot_pick_paid_even_if_preferred():
    spend_policy.reset_policy()
    registry.discover()
    sel = registry.get("tts_selector")
    os.environ.setdefault("OPENAI_API_KEY", "sk-test-not-real")
    inputs = {"text": "hello", "preferred_provider": "openai"}
    cands = sel._providers()
    tool, _ = sel._select_best_tool(inputs, cands, sel._prepare_task_context(inputs))
    assert tool is None or tool.runtime.value in ("local", "local_gpu"), tool and tool.name
    # explicit tool request for a paid tool: error, no rerouting, no call
    r = sel.execute({"text": "hi", "preferred_tool": "openai_tts"})
    assert r.success is False
    # auto mode must land on a local tool when one exists
    tool, _ = sel._select_best_tool({"text": "hi"}, cands, sel._prepare_task_context({"text": "hi"}))
    assert tool is None or tool.runtime.value in ("local", "local_gpu")


def test_no_automatic_fallback_to_another_tool():
    blocked = _make("t_blocked", ToolRuntime.API)
    local = _make("t_fb_local", ToolRuntime.LOCAL)
    blocked.fallback_tools = ["t_fb_local"]
    with enforced():
        r = blocked.execute({})
    assert r.success is False
    assert CALLS == [], "the fallback tool must not be run on the caller's behalf"


# ---- cost tracker ----

def test_cost_tracker_hard_zero_cap():
    t = CostTracker.from_config()
    assert t.mode == BudgetMode.CAP and t.budget_total_usd == 0.0
    eid = t.estimate("some_tool", "gen", 0.01)
    for approve in (False, True):
        if approve:
            t.approve_tool("some_tool")
        try:
            t.reserve(eid)
        except BudgetExceededError:
            continue
        raise AssertionError("a priced action must be refused under a $0 cap")
    free = t.estimate("local_tool", "render", 0.0)
    t.reserve(free)
    t.reconcile(free, 0.0)
    assert t.budget_spent_usd == 0.0


def test_saved_log_cannot_raise_budget():
    import json
    with tempfile.TemporaryDirectory() as d:
        log = Path(d) / "cost_log.json"
        log.write_text(json.dumps({"budget_total_usd": 10.0, "entries": []}))
        t = CostTracker.from_config(cost_log_path=log)
        assert t.budget_total_usd == 0.0


def test_cost_tracker_fails_closed_without_explicit_budget():
    from lib.config_model import OpenMontageConfig as C
    # missing/empty config -> model defaults (warn, $10): must NOT be used
    for cfg in (C(), C.model_validate({}), C.model_validate({"budget": {"mode": "cap"}})):
        t = CostTracker.from_config(config=cfg)
        assert t.mode == BudgetMode.CAP and t.budget_total_usd == 0.0, cfg.budget
    # unreadable config -> hard zero
    original = C.load
    try:
        C.load = classmethod(lambda cls, *a, **k: (_ for _ in ()).throw(OSError("x")))
        t = CostTracker.from_config()
        assert t.mode == BudgetMode.CAP and t.budget_total_usd == 0.0
    finally:
        C.load = original


def test_negative_saved_amounts_cannot_create_budget():
    import json
    with tempfile.TemporaryDirectory() as d:
        log = Path(d) / "cost_log.json"
        log.write_text(json.dumps({"entries": [
            {"id": "a", "tool": "x", "operation": "o", "status": "completed",
             "estimated_usd": 0, "reserved_usd": 0, "actual_usd": -50.0},
            {"id": "b", "tool": "x", "operation": "o", "status": "reserved",
             "estimated_usd": 0, "reserved_usd": -50.0, "actual_usd": 0}]}))
        t = CostTracker.from_config(cost_log_path=log)
        assert t.budget_remaining_usd == 0.0
        eid = t.estimate("x", "gen", 0.01)
        try:
            t.reserve(eid)
        except BudgetExceededError:
            return
        raise AssertionError("negative saved amounts opened the cap")


def test_malformed_config_values_fail_closed():
    """Bad mode / wrong types make load() raise; the policy must stay enforced."""
    import yaml
    original = yaml.safe_load
    bad_docs = [
        {"spend_policy": {"mode": "local-only"}},       # typo
        {"spend_policy": {"allow_tools": "bg_remove"}},  # wrong type
        {"spend_policy": None},
        ["not", "a", "mapping"],
    ]
    try:
        for doc in bad_docs:
            yaml.safe_load = lambda f, d=doc: d
            spend_policy.reset_policy()
            pol = spend_policy.get_policy()
            assert pol.enforced and not pol.allow_tools, doc
    finally:
        yaml.safe_load = original
        spend_policy.reset_policy()


def test_image_selector_status_hook_cannot_bypass_policy():
    paid = _make("t_hook_api", ToolRuntime.API)
    paid.get_status_for = lambda inputs: ToolStatus.AVAILABLE  # hostile hook
    sel = registry.get("image_selector") or None
    if sel is None:
        registry.discover()
        sel = registry.get("image_selector")
    with enforced():
        assert sel._tool_selectable(paid, {}) is False


def test_real_policy_is_active_in_this_module():
    """Guards against the conftest override leaking into these tests."""
    spend_policy.set_policy_override(None)
    spend_policy.reset_policy()
    pol = spend_policy.get_policy()
    assert pol.enforced and pol.mode == "local_only"
    assert spend_policy._override is None
    paid = _make("t_real_api", ToolRuntime.API)
    assert paid.execute({}).success is False and "t_real_api" not in CALLS


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items())
             if n.startswith("test_") and callable(f)]
    failed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as exc:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {type(exc).__name__}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
