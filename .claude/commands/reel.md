---
description: Produce or work on a video using the OpenMontage skills and pipeline system, for whatever task is described.
argument-hint: <what you want made or worked on>
---

Treat the following as a full OpenMontage production/work request and handle it using this repo's skills — do not improvise outside of them:

**Request:** $ARGUMENTS

Follow `AGENT_GUIDE.md`:

1. If the request is vague or exploratory, read `skills/meta/onboarding.md` first.
2. If it references an existing video/URL as inspiration or source footage, read `skills/meta/video-reference-analyst.md` (reference-driven) or use `source_media_review` (footage-led) as appropriate.
3. For any production, load the `studio-prompts` skill first, then follow its `reel-flow.md`: read the request (time, topic, script or post text), run `python scripts/studio_styles.py`, and ask ONE batched question that shows the full style menu (saved themes first, the recommended look for the topic, then every look in the inventory with its evidence level, plus "create a theme / character series"). Anything the user states is locked. Script from `script-spine.md`; every scene follows `scene-motion.md` (narration shown as a live action, mute test). Quality bar: the `ai-compute-business-explainer` and `sunlight-to-electricity` projects. After the final cut is approved, offer to save the look with `python scripts/studio_theme.py save`.
4. Otherwise, follow **Rule Zero**: identify the matching pipeline in `pipeline_defs/`, read its manifest, run preflight/tool discovery, then execute stage by stage — reading each stage director skill in `skills/pipelines/<pipeline>/` and any Layer 3 skill in `.agents/skills/` before calling tools.
5. Announce provider/model/runtime decisions before executing them, log them per the decision-log contract, and checkpoint per `skills/meta/checkpoint-protocol.md`.

If no request text was given after `/reel`, ask the user what they want made or worked on instead of guessing.
