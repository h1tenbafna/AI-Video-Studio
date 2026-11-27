---
name: explainer
description: Make a new explainer video in the exact look and sound of the ai-compute-business-explainer project (blueprint-isometric drafting sheet, numbered part tags, Kokoro af_heart voice, "Ambient Calm" music bed, blueprint caption strip). Use when the user types /explainer, or asks for "an explainer like the AI compute one" / "same theme as the chip video". Topic, script, objects and animation are new each time; the look and audio are fixed.
argument-hint: <length> <topic> [notes, facts, sources, must-say lines, audience]
---

# /explainer: same theme, new topic

**Request:** $ARGUMENTS

Typical call: `/explainer 45s why airlines overbook flights; audience is students; mention the 2017 United case`.

The theme is FIXED. The topic is NEW. Do not show the style menu, runtime choice or music menu: those were decided
when this theme was saved. Everything else (gates, citations, live scenes, $0) follows `CLAUDE.md` as usual.

## What is locked (never change without the user asking)

| Locked | Value | Source |
|---|---|---|
| Look | pale-blue drafting sheet #8FB8E0, white grid, navy #0B2A4A lines, one orange #FF7A1A accent (shapes only, never text), isometric solids at 35 degrees, Space Grotesk | `themes/blueprint-isometric-explainer/art-direction.md`, `styles/custom/blueprint-isometric.yaml` |
| Signature device | every name and figure is a numbered PART TAG or CALLOUT with a leader line that draws on. No floating captions. | `remotion-composer/src/blueprint/ui.tsx` |
| Motion | lines draw on before fills; parts slide and snap with a short overshoot; dashed "planned" outlines become solid as the narrator names them; sheet scrolls between beats; 0.25 s fade between scenes | `iso.tsx` (`IsoBox` t 0..1) |
| Captions | blueprint strip, word by word, active word as a navy chip, 64 px, bottom 108 px | `Captions` in `ui.tsx` |
| Format | 1080x1920 vertical, 30 fps, libx264 CRF 18, Remotion atelier, concurrency 2 | |
| Voice | Kokoro-82M `af_heart` via `npx hyperframes tts`, local, $0. One clip per script section, two-pass loudnorm to -15.1 LUFS / -1 dBTP | |
| Music | `music_library/pixabay_calm_ambient_tech.mp3` ("Ambient Calm" by AtlasAudio, about 1:54), volume 0.35, fade in 1.0 s, fade out 2.5 s, ducking on (threshold -3 dB, reduction -8 dB, attack 200 ms, release 500 ms) | |
| Master | final mix loudnorm -14 LUFS, muxed after the silent Remotion render | |

**What adapts to the topic:** the script, the objects drawn (new iso shapes built from the kit primitives), how they
move, the tags/callouts and their text, number of scenes, length, title-block label.

Quality bar: `projects/ai-compute-business-explainer/renders/final.mp4` (if present locally) and the stills in
`themes/blueprint-isometric-explainer/reference/`. Look at them before scene_plan.

## Step 0: parse and check (before init)

1. Parse `$ARGUMENTS` into: **length** (e.g. `40s`, `1 min`; default 40 s if missing, and say so), **topic**, **notes**
   (facts, sources, must-say lines, audience, tone). Anything the user wrote is LOCKED (see `studio-prompts`).
   If the topic is missing, ask for it and stop.
2. Run `python scripts/explainer_kit.py check` (Windows: `.venv/Scripts` on PATH; macOS: `export PATH="$PWD/.venv/bin:$PATH"`).
   - `music: MISSING` -> tell the user to download "Ambient Calm" by AtlasAudio from pixabay.com/music (free) and save
     it as `music_library/pixabay_calm_ambient_tech.mp3`. Do NOT scrape it, use `pixabay_music`, or pick another
     track. You may continue research/proposal/script/scene_plan while they do it, but the assets gate needs it.
   - `kokoro-onnx MISSING` -> ask before installing (`pip install kokoro-onnx` into `.venv`, plus a ~600 MB model on first
     use). On macOS this route is UNTESTED: say so, and if it fails stop and report (do not fall back to Piper silently).
   - Never use paid TTS / music / image providers (see `CLAUDE.md` Cost and safety).
3. Run `python scripts/studio_preflight.py` and note machine limits (Mac: Apple Silicon, no CUDA; Remotion is fine).

## Step 1: project

- Project id: a short kebab-case slug of the topic. Create it with `init_project(project_id, title=..., pipeline_type="animated-explainer", style_playbook="blueprint-isometric")` from `lib/checkpoint.py`.
- `python scripts/studio_theme.py apply blueprint-isometric-explainer <project_id>` (writes `theme_lock.json` + `art-direction.md`).
  Then rewrite the "Why this subject" and "Scene distinctness" lines of the project's `art-direction.md` for the new topic.
- `python scripts/explainer_kit.py new <project_id>` -> episode code in `remotion-composer/src/explainers/<project_id>/`.
- `python -m backlot open <project_id>`.
- Log one `decision_log` entry per locked choice (category `provider_selection`, subjects: runtime, voice, music, style),
  rationale "locked by /explainer theme (from ai-compute-business-explainer)".

## Step 2: run the pipeline, EVERY gate

Pipeline `pipeline_defs/animated-explainer.yaml`, director skills in `skills/pipelines/explainer/`. Load the
`studio` and `studio-prompts` skills and follow them stage by stage. Read each director skill before its stage.
Stop at **every** stage with `human_approval_default: true` (proposal, script, scene_plan, assets, publish, and any
sub-stage gate): write the checkpoint as `awaiting_human`, present it, END THE TURN. Never approve for the user.

Theme-specific rules per stage:

- **research:** every statistic or quote needs a source URL in `research_brief`; mark unverified as UNVERIFIED. Re-check
  "latest" numbers on the day (they go stale fast).
- **proposal:** present the locked theme as a fixed choice, not a menu: one line each for look, voice, music,
  runtime (Remotion atelier). Still present Remotion and HyperFrames as `CLAUDE.md` rule 7 requires, recommend Remotion
  because the theme kit is Remotion-only. Include the music plan (the locked track). Show 2-3 still references.
- **script:** follow `.claude/skills/studio-prompts/script-spine.md`. Word budget about **2.7 words per second** of
  target length (40 s ~ 105-110 words). Hook in the first sentence, premise before stats, short sentences, end on one
  line that pays off the hook. Real company/people names on screen where relevant.
- **scene_plan:** 3-5 scenes for 30-60 s. Every scene names a concrete action synced to a narrated word, plus the mute
  test (rule 8). For each scene list: the iso objects (reuse `IsoBox` kinds `fab|cloud|rack|lab|phone|chip|plain`, or
  describe a new shape to draw from `iso()`/`pts()`), tags and callouts with their text, flow arrows, camera scroll,
  and a still-frame check. Scenes must look different from each other. Record `production.route: remotion`,
  `style_id: blueprint-isometric`.
- **assets:**
  - Voice: one Kokoro clip per script section:
    `HYPERFRAMES_PYTHON=<venv python> npx hyperframes tts "<text>" --voice af_heart -o projects/<id>/assets/audio/narration/sN.wav`
    Kokoro has no SSML: pauses come from punctuation. Two-pass `loudnorm` each clip to I=-15.1, TP=-1.
  - Place clips on a timeline with ~0.4-0.6 s gaps (start times go in `edit_decisions.audio.narration.segments`), build
    `assets/audio/narration_timeline.wav`, transcribe it with the local `transcriber` (faster-whisper) to
    `assets/audio/transcript/narration_timeline_transcript.json`, then
    `python scripts/explainer_kit.py words <project_id>` -> captions. Fix misheard names/numbers in `words.ts` by hand.
  - Music: copy the locked track to `assets/music/background_music.mp3`.
- **edit:** `edit_decisions` with `composition_mode: atelier`, `render_runtime: remotion`,
  `bespoke.entry: remotion-composer/src/explainers/<id>/index.tsx`, `composition_id: Episode`, `concurrency: 2`,
  `crf: 18`; music block with the locked values above; `subtitles` burned in by the composition (do not burn again).
- **compose:** write the scenes in `remotion-composer/src/explainers/<id>/` (`timing.ts` anchors = real narration
  starts; `scenes.tsx` = the topic's objects; `TITLE` = short upper-case label). Import the kit from `../../blueprint/`,
  do NOT edit the kit for one episode (add a new shape inside the episode folder instead). Use `footSize={30}` on every
  `Callout` with a source. Check stills first (`npx remotion still ... --frame=N`) at each scene's key beat and
  look at them; then render silent video
  (`cd remotion-composer && npx remotion render src/explainers/<id>/index.tsx Episode ../projects/<id>/renders/video_silent.mp4 --concurrency 2 --crf 18`),
  build `final_mix.wav` with `audio_mixer` (full_mix, locked music values, loudnorm -14), mux to `renders/final.mp4`.
  Verify: ffprobe (1080x1920, 30 fps, h264+aac), loudness about -14 LUFS, Whisper on the final vs script, frames by eye
  (orange never used for text; tags never overlap captions, which sit in the bottom 300 px). `subtitle_check` false-alarms on
  burned-in captions: verify on frames instead.
- **publish:** caption with the source list. Nothing is uploaded without the user.

After the final cut: `python scripts/studio_report.py <project_id>` and the `cost-and-qa` skill (cost must be $0).

## If the approved path breaks

Stop and report what failed, why, the options and a recommendation (rule 5). Never swap the voice, music, look or
runtime on your own: those are the theme.
