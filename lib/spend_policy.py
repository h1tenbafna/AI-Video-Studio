"""Local-only spend policy: the one place that decides if a tool may run.

This install has $0 external spend. A tool is allowed only when it provably
cannot bill:

  * runtime is ``local`` or ``local_gpu``, or
  * it is a pure selector (``provider == "selector"``): selectors only delegate
    to provider tools, and those are checked on their own, or
  * its name is listed in ``spend_policy.allow_tools`` (config.yaml).

Everything else (``api`` runtime, and ``hybrid`` tools that are not selectors)
is blocked. That covers providers whose cost is unknown or that fail to quote a
price, because they are treated as paid until the user allow-lists them.

Enforcement is wired into ``BaseTool`` (``execute`` and ``get_status``), so it
applies to direct calls, selectors, the registry and preflight alike. There is
no automatic fallback: a blocked tool fails, it never reroutes to another one.

No network, no provider calls and no API probes happen in this module.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional

LOCAL_RUNTIMES = frozenset({"local", "local_gpu"})
SELECTOR_PROVIDER = "selector"


@dataclass(frozen=True)
class SpendPolicy:
    mode: str = "local_only"  # local_only | off
    allow_tools: frozenset = field(default_factory=frozenset)

    @property
    def enforced(self) -> bool:
        return self.mode != "off"

    def decide(self, tool: Any) -> tuple[bool, str]:
        """Return (allowed, reason) for a tool instance."""
        if not self.enforced:
            return True, "spend policy off"
        name = getattr(tool, "name", "") or ""
        if name in self.allow_tools:
            return True, "explicitly allow-listed"
        runtime = getattr(getattr(tool, "runtime", None), "value", None)
        if getattr(tool, "provider", "") == SELECTOR_PROVIDER:
            return True, "selector (delegates to guarded providers)"
        if runtime in LOCAL_RUNTIMES:
            return True, f"runtime={runtime}"
        return False, (
            f"runtime={runtime} may call an external service and bill. "
            f"External spend is $0 here; add {name!r} to spend_policy.allow_tools "
            f"in config.yaml only with explicit approval."
        )


_cached: Optional[SpendPolicy] = None
_override: Optional[SpendPolicy] = None


def _load_from_config() -> SpendPolicy:
    try:
        from lib.config_model import OpenMontageConfig

        cfg = OpenMontageConfig.load().spend_policy
        return SpendPolicy(mode=cfg.mode.value, allow_tools=frozenset(cfg.allow_tools))
    except Exception:
        # Fail closed: an unreadable config must never open the gate.
        return SpendPolicy(mode="local_only", allow_tools=frozenset())


def get_policy() -> SpendPolicy:
    if _override is not None:
        return _override
    global _cached
    if _cached is None:
        _cached = _load_from_config()
    return _cached


def reset_policy() -> None:
    """Drop the cached config so the next call re-reads config.yaml."""
    global _cached
    _cached = None


def set_policy_override(policy: Optional[SpendPolicy]) -> None:
    """Force a policy (tests only). Pass None to clear."""
    global _override
    _override = policy


def tool_allowed(tool: Any) -> tuple[bool, str]:
    return get_policy().decide(tool)


def blocked_reason(tool: Any) -> Optional[str]:
    """None if the tool may run, else the reason it is blocked."""
    allowed, reason = tool_allowed(tool)
    return None if allowed else reason
