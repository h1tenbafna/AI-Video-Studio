---
name: studio
description: Entry point for producing a video in this studio fork. Use at the start of any production or when resuming one. Gives the stage loop, gate rules and what to read, so the whole AGENT_GUIDE is not loaded.
---

# Studio loop

1. **Resume first.** If `projects/<id>/` exists, run `get_next_stage()` from `lib/checkpoint.py` and continue there. Redo only the stage or scene that changed.
2. **New video:** pick a pipeline in `pipeline_defs/`, create the project with `init_project`, run preflight, then `python -m backlot open <id>`.
3. **Per stage:** read `skills/pipelines/<pipeline>/<stage>-director.md`, then the Layer 3 skills of any generation tool you will call.
4. **Gates:** if the stage has `human_approval_default: true`, write the checkpoint as `awaiting_human`, present it and END THE TURN. Approval is per gate and never assumed. Suggest a fresh session after each gate (checkpoints hold the state).
5. **Per-scene route and style:** use `route-and-style`. **Cost, time and QA:** use `cost-and-qa`.

# Rules that never bend
- $0 external spend. Paid and stray-key providers stay unused. If a scene cannot be made locally, flag it and offer a local alternative.
- Announce any tool, provider, model or runtime choice before acting, and ask before changing it. Never substitute silently.
- "Available" in the registry is not "verified working". Say which one you mean.
- Machine limits: 4 GB VRAM, 7.8 GB RAM, small C: drive. Large files on D:. libx264. Remotion concurrency 2.
