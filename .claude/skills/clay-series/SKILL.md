---
name: clay-series
description: Make a recurring "same look, any topic" character series (for example an Instagram page where clay models explain things or tell stories). Use when the user wants a series, a mascot/character page, or a new episode of an existing clay series. Runs locally at $0 with Blender, Remotion, Piper/Kokoro and Whisper.
---

# Clay series (one look, many topics)

Kit and commands: `clay/README.md`. Starter series: `clay/series/clayrifying/series.json` (edit freely: name, cast, colours, voices, music, end lines).
Style card: `styles/library/clay-stopmotion.md`. Evidence level: run `python scripts/studio_routes.py`.

## Two jobs
**A. Set up the series once** (the series bible), **B. produce each episode** (about 1.5 h of authoring per episode once the series exists, label as estimate).

### A. Series bible (ask in ONE batched question with recommended defaults; user answers are LOCKED)
1. Page name, one-line promise, audience, 3 recurring formats (examples: "Why is X?", "Myth vs fact", "Tiny story", "Two characters argue").
2. Cast: 2 characters to start (name, role, colour, shape, accessory, voice). Keep their roles fixed so the audience learns them (for example a curious kid who asks, a calm professor who answers in one image).
3. Set colours (wall, floor), brand text, end lines, caption position (default y 1400), music (a track in `music_library/` or a Pixabay pick the user approves).
4. Write `clay/series/<name>/series.json`. Render a one-line test (draft) so the user sees the cast before any episode. Voices: Piper models, or Kokoro `af_heart` (both verified).

### B. Episode flow (inside the studio loop; gates stay)
Use the `animated-explainer` pipeline with route `blender` and `style_id: clay-stopmotion`. `clay/episode.py` is the executor for the assets and compose stages. It does NOT write pipeline artifacts, so the agent still writes the checkpoints at each gate.
1. **Research** (rule 9): 3+ facts with URLs; mark anything unverified. Ask only for the topic if the user gave nothing.
2. **Script** (GATE): dialogue in `episode.json` using `episode-prompt.md`. One idea. Hook line = frame-0 text. Present 4 hook options, the lines with speaker names, the word count, and the sources.
3. **Scene plan** (GATE): for each line, the prop plan (lane, type, anim, the word it lands on), the camera, the action, and a mute test. Draw the prop lanes; no overlaps. Rule 8: every line shows its narration as a literal action or prop.
4. **Draft render** `--draft` (about 4 min for 15 s): show a contact sheet of stills and the draft video. Fix layout with the user.
5. **Full render** (GATE: only after the user approves the draft), then QA with the eight checks (`.claude/skills/studio-prompts/prompts.md` card 11), `python scripts/studio_report.py <id>`, and publish caption with sources.
6. **Rework**: `python clay/episode.py <id> --redo-line N` for a line; edit `props`/`action`/`cam` in `episode.json` and re-render for visuals (frames clear automatically); see `docs/REWORK_GUIDE.md`.

## Rules for good episodes
- 25-45 s, 4-8 lines, one question and one answer image. Lines under 14 words. Characters never read the on-screen caption aloud verbatim for the whole line.
- Premise before data: the characters set the question, then a prop shows the cause, then the number.
- Props stay inside the lanes (z 5.5-8.5, x within +-2.5). One new prop idea per line; `until` the line end unless it must persist.
- The hook text covers the top of the frame for 3.5 s; keep line-0 props low (z <= 7.4).
- Every statistic or quote gets a source in `sources_on_screen` and in the caption.
- Do not promise what the kit cannot do: no hair or clothes, no walking, one set, stick arms, primitive props. If a topic needs more (a crowd, a map, real footage), say so and offer: a text-prop version, or a split-screen with Pexels footage added in Remotion (not built).

## What can change between episodes
Topic, lines, props, actions, cameras, set colours. What must not change: cast look, voices, caption style, end card, music mood. That is what makes it a series.
