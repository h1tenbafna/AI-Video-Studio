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

8. **Bring every scene to life.** Show what the narration says as a literal, visible action, not a static card or caption.
   "Tap an app" means a thumb taps a button and the cab arrives; "hire a specialist" means the specialist shows up at the door.
   At scene_plan, every scene description must name a concrete action synced to a narrated word, plus a still-frame check
   ("does this scene move if I mute it?"). Text-only or still cards are allowed only when deliberate (for example a silent closing card), and must be flagged as such.
9. **Cite facts.** Every statistic or quote shown or spoken needs a source: a small on-screen source tag (30 px minimum), the URL in
   `research_brief`, and the source list in the publish caption. Mark anything unverified as UNVERIFIED and do not lock it before the script gate.

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
- Machine limits differ per computer. Run `scripts/studio_preflight.py` and ask the user about RAM/GPU before choosing heavy local routes.
  Original Windows PC: 4 GB VRAM, 7.8 GB RAM, small C: drive. macOS: see `docs/MAC_SETUP.md` (Apple Silicon, no CUDA, skip local video-gen models).
- Keep large files off a small system drive (Windows: use D:). Prefer libx264. Keep Remotion concurrency at 2.

## Studio helpers
- **`/reel` front door:** `.claude/skills/studio-prompts/reel-flow.md` (style menu from `python scripts/studio_styles.py`, saved themes in `themes/` via `scripts/studio_theme.py save|list|show|apply`, character series, quality bar = the `ai-compute-business-explainer` and `sunlight-to-electricity` projects). Script notes from the AI Builders deck: `script-spine.md`. Alive scenes: `scene-motion.md`. Offer to save the look after the final cut is approved.
- Skills: `studio` (stage loop), `studio-prompts` (**read at intake and before every stage**: brief, prompt cards, style chooser, stock-via-Chrome, campaigns; user-written fields are locked), `clay-series` (a recurring same-look character series, e.g. clay explainers; kit in `clay/`), `route-and-style` (per-scene route + `styles/library/` card), `cost-and-qa`.
- `python scripts/studio_routes.py` (what works, with evidence), `scripts/studio_stale.py <id>` (what a change made stale), `scripts/studio_rerender.py <id> --scene sN` (re-render one Remotion scene). Guides: `docs/QUICKSTART_REEL.md`, `docs/REWORK_GUIDE.md`.
- `python scripts/studio_preflight.py` before a production (read-only readiness check). `python scripts/studio_report.py <id>` after.
- Music ($0): `pixabay_music` (free; scrapes the site, can 403/break, user-approved 2026-11-20), `freesound_music` (official free API, needs a user-created `FREESOUND_API_KEY`), or tracks in `music_library/`. Local ACE-Step is NOT installed (needs CUDA 12.8; driver is 522). Present the music plan at proposal and let the user pick.
- Manim LaTeX formulas need MiKTeX on PATH (`D:\MiKTeX\miktexind`, already in the user PATH; in an old shell `export PATH="/d/MiKTeX/miktex/bin/x64:$PATH"`). Verification: `docs/ROUTE_VERIFICATION_2026-11-24.md`, `python scripts/studio_pipeline_check.py`.
- User guide: `docs/STUDIO_GUIDE.md`.

## Discover capabilities (do not scan the repo)
```bash
export PATH="$PWD/.venv/bin:$PATH"   # macOS/Linux. Windows Git Bash: .venv/Scripts. Needed or piper_tts and math_animate show "unavailable"
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
