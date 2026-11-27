#!/usr/bin/env python
"""Static audit of every skill file. Read-only.

Usage:  python scripts/studio_skill_audit.py [--json] [--md out.md]

A skill is instructions, so it cannot be "run". This checks what CAN be checked without spending money:
  * frontmatter has name + description
  * repo paths it mentions (scripts/, tools/, skills/, styles/, docs/, .agents/) exist
  * registered tool names it mentions exist in the tool registry, and whether those tools are available here
  * env keys it needs (*_API_KEY, *_TOKEN ...) and whether a key is set (value never printed)
  * paid-service markers
Verdicts for tool skills (.claude/.agents): FREE-USABLE (no key, tools available), NEEDS-KEY, PAID-BLOCKED (paid service; never used under the $0 rule),
          REFERENCE (craft/knowledge, no tool), BROKEN-REF (mentions a path that does not exist), NO-FRONTMATTER.
  For director/craft docs under skills/: OK, PARTIAL (mentions tools or keys that are unavailable; the doc offers alternatives), REFERENCE, BROKEN-REF.
Limits: this proves the skill is well-formed and its dependencies exist; it does NOT prove the workflow it describes works.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

PAID_HINTS = re.compile(r"\b(heygen|elevenlabs|openai|sora|veo|kling|runway|seedance|minimax|fal\.ai|replicate|suno|lyria|imagen|"
                        r"gemini|grok|flux|bfl|atlas ?cloud|dashscope|doubao|fish audio|azure|cartesia|pika|higgsfield|"
                        r"stability|midjourney)\b", re.I)
KEY_RE = re.compile(r"\b([A-Z][A-Z0-9]{2,}(?:_[A-Z0-9]+)*_(?:API_KEY|KEY|TOKEN|SECRET))\b")
PATH_RE = re.compile(r"`((?:scripts|tools|skills|styles|docs|lib|schemas|remotion-composer|pipeline_defs|\.agents|\.claude)/[A-Za-z0-9_./\-]+)`")
SKIP_PATH = re.compile(r"[<>*{}\[\]]|\$|\.\.\.")


def frontmatter(text: str) -> dict:
    m = re.match(r"---\r?\n(.*?)\r?\n---", text, re.S)
    if not m:
        return {}
    out = {}
    key = None
    for line in m.group(1).splitlines():
        if line.startswith((" ", "	")) and key:          # folded / multi-line value continues the previous key
            out[key] = (out[key] + " " + line.strip()).strip()
        elif ":" in line:
            key, v = line.split(":", 1)
            key = key.strip(); out[key] = v.strip().strip('"')
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--md")
    a = ap.parse_args()

    tools = {}
    try:
        from tools.tool_registry import registry
        registry.discover()
        for n, t in registry._tools.items():
            tools[n] = t.get_status().value == "available"
    except Exception as e:
        print("registry unavailable:", e, file=sys.stderr)
    env = {}
    envfile = ROOT / ".env"
    if envfile.exists():
        for line in envfile.read_text(encoding="utf-8", errors="ignore").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                if v.strip():
                    env[k.strip()] = True

    files = []
    for base in (".claude/skills", ".agents/skills"):
        for p in sorted((ROOT / base).glob("*/SKILL.md")):
            files.append((base, p.parent.name, p))
    for p in sorted((ROOT / "skills").rglob("*.md")):
        files.append(("skills", str(p.relative_to(ROOT / "skills")).replace("\\", "/"), p))

    rows = []
    tool_re = re.compile(r"\b(" + "|".join(sorted(map(re.escape, tools), key=len, reverse=True)) + r")\b") if tools else None
    for base, name, p in files:
        text = p.read_text(encoding="utf-8", errors="ignore")
        fm = frontmatter(text) if base != "skills" else {"name": name, "description": "(director/craft doc)"}
        bad = []
        annotated = "Repo note (" in text
        for ref in set(PATH_RE.findall(text)):
            if annotated and ref.startswith(("lib/", "tools/music_gen", "tools/sfx")):
                continue
            if SKIP_PATH.search(ref):
                continue
            r = ref.rstrip(".,:;)")
            if not ((ROOT / r).exists() or (p.parent / r).exists() or (p.parent / 'scripts' / r).exists()):
                bad.append(r)
        used = sorted(set(tool_re.findall(text))) if tool_re else []
        unavailable = [t for t in used if not tools.get(t)]
        keys = sorted(set(KEY_RE.findall(text)))
        keys_set = [k for k in keys if k in env or k in os.environ]
        paid = bool(PAID_HINTS.search(text[:4000])) or bool(keys)
        if base != "skills" and not (fm.get("name") and fm.get("description")):
            verdict = "NO-FRONTMATTER"
        elif bad:
            verdict = "BROKEN-REF"
        elif base == "skills":
            # director / craft docs offer alternatives, so mentioning an unavailable tool is a PARTIAL, not a failure
            verdict = "PARTIAL" if (unavailable or (keys and not keys_set)) else ("OK" if used else "REFERENCE")
        elif keys and not keys_set:
            verdict = "NEEDS-KEY" if not PAID_HINTS.search(text[:4000]) else "PAID-BLOCKED"
        elif paid and unavailable:
            verdict = "PAID-BLOCKED"
        elif used and unavailable and len(unavailable) == len(used):
            verdict = "BLOCKED-TOOLS"
        elif used:
            verdict = "FREE-USABLE"
        else:
            verdict = "REFERENCE"
        rows.append({"where": base, "skill": name, "verdict": verdict, "tools_used": used, "tools_unavailable": unavailable,
                     "keys_needed": keys, "keys_present": keys_set, "broken_refs": bad})

    if a.json:
        print(json.dumps(rows, indent=1))
        return 0
    from collections import Counter
    c = Counter(r["verdict"] for r in rows)
    lines = [f"Skill audit: {len(rows)} files", "  " + ", ".join(f"{k}={v}" for k, v in sorted(c.items())), ""]
    for v in ("BROKEN-REF", "NO-FRONTMATTER", "FREE-USABLE", "OK", "PARTIAL", "NEEDS-KEY", "PAID-BLOCKED", "BLOCKED-TOOLS", "REFERENCE"):
        grp = [r for r in rows if r["verdict"] == v]
        if not grp:
            continue
        lines.append(f"== {v} ({len(grp)})")
        for r in grp:
            extra = ""
            if r["broken_refs"]:
                extra = "  missing: " + ", ".join(r["broken_refs"][:4])
            elif r["keys_needed"]:
                extra = "  keys: " + ", ".join(r["keys_needed"][:3])
            elif r["tools_unavailable"]:
                extra = "  unavailable tools: " + ", ".join(r["tools_unavailable"][:4])
            lines.append(f"  {r['where']}/{r['skill']}{extra}")
        lines.append("")
    out = "\n".join(lines)
    if a.md:
        Path(a.md).write_text(out, encoding="utf-8")
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
