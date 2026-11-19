# OpenMontage (studio fork)

Instruction-driven video production: the agent follows pipeline manifests + skills and drives tools.
Architecture: `PROJECT_CONTEXT.md`. Full operating manual: `AGENT_GUIDE.md` (**read sections on demand, see the map below, never the whole file**).

Chat, questions and repo work do not need the guide. Only production work does.

## Production rules (always apply)
1. **Every video goes through a pipeline** (`pipeline_defs/*.yaml`). No ad-hoc scripts that call tools directly.
2. Before each stage, read its director skill `skills/pipelines/<pipeline>/<stage>-director.md`.
   Before calling a generation tool, read the Layer 3 skills in its `agent_skills` (`.agents/skills/`).
3. Create projects with `init_project`, write every output under `projects/<id>/` with an explicit `output_path`,
   then `python -m backlot open <id>` (the board is an observer, never a blocker).
4. **Gates:** if a stage has `human_approval_default: true`, write the checkpoint as `awaiting_human`, present it, and END THE TURN.
   Approval is per gate. Never approve on the user's behalf.
5. **Announce before acting** on any consequential choice (tool, provider, model, runtime). Ask before changing one.
   Never substitute a provider, model, runtime or quality level silently. If the approved path is blocked, stop and report:
   what failed, why, options, recommendation.
6. When a logged decision changes, append a new `decision_log` entry with the same `category` and `subject`.
7. At proposal, present both composition runtimes (Remotion, HyperFrames) when both exist, with a recommendation, and wait for approval.
   Offer authoring mode too: templated or atelier (atelier for hero work).

## Cost and safety (this install)
- **External spend is $0.** Claude Pro is the only paid service. No paid APIs, credits or stock.
  The registry shows `openai_*` and `sora` (stray OPENAI key) and `google_*` / `gemini_*` (GEMINI_API_KEY) as "available".
  They may bill: never use them without the user's explicit approval.
  If a scene cannot be made locally, flag it and offer a local alternative. Do not quietly lower quality.
  Preflight "setup offers" that need a paid key: list them as unavailable and do not push setup.
- **Enforced in code:** `lib/spend_policy.py` blocks every non-local tool (see `spend_policy` in `config.yaml`; allow-list only with approval).
  It cannot see skill scripts that call paid APIs directly. The stray `GEMINI_API_KEY` / `OPENAI_API_KEY` stay in place but are never used:
  do not run `hyperframes-media` `bgm.mjs` / `lyria-recipe.py`, `motion-graphics/grounding/locate.mjs`, or `scripts/kling_official_animated_explainer_e2e.py`.
- "Available" in the registry is not "verified working". Say which one you mean, and say when a route is untested here.
- Machine limits (4 GB VRAM, 7.8 GB RAM, small C: drive) are in auto-memory. Check them before choosing heavy local routes.
- Keep large files on D:. Prefer libx264. Keep Remotion concurrency at 2.

## Discover capabilities (do not scan the repo)
```bash
export PATH="$PWD/.venv/Scripts:$PATH"   # needed or piper_tts and math_animate show "unavailable"
python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu_summary(), indent=1))"
```
Use `registry.capability_catalog()` for a family and `registry.provider_menu()` for detail. Do not dump `support_envelope()`.

## Resume, never restart
`lib/checkpoint.py` `get_next_stage()` finds the next stage. State lives in `projects/<id>/checkpoint_*.json`
(superseded ones in `history/`). Redo only the stage or scene that changed.
Start a fresh session at each approval gate: checkpoints hold the state, so no history is needed.

## Read on demand (AGENT_GUIDE.md sections)
| When you need | Section |
|---|---|
| Vague or exploratory request | `First Interaction` then `skills/meta/onboarding.md` |
| User supplies a reference video | `Reference Video Entry Point` then `skills/meta/video-reference-analyst.md` |
| Starting a production | `Rule Zero`, `Project Directory Convention`, `Available Pipelines` (beta caveats), `Mandatory Preflight`, `User-Facing Planning Protocol` (includes the mandatory music plan) |
| Provider, runtime or atelier choices | `Decision Communication Contract` |
| Checkpoints and reviews | `Human Checkpoint Protocol`, `Reviewer Protocol`, `Communication Protocol` |
| Tool classes and selectors | `Tool Families`, `Layer Map` |
| Style playbooks | `Style Playbooks` |

Find a section with `grep -n "^## " AGENT_GUIDE.md`, then read only that range.
Skill index: `skills/INDEX.md` (large: search it, do not read it whole).
