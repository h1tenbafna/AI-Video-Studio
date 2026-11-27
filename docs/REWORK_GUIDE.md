# Fix a reel: quick guide

Updated 2026-11-25. Rule: **change the one thing, check what that touches, redo only that.** Say it in plain words ("scene 3 shows a card, I want the cab arriving"); Claude classifies it and follows the table.

## Three commands
```
python scripts/studio_stale.py <id>                   what is stale after a change (read-only)
python scripts/studio_rerender.py <id> --scene s3      re-render ONE scene of a Remotion project and splice it in
python scripts/studio_stale.py <id> --mark-built       after you approve: remember this state as the baseline
```
- `studio_rerender.py` never overwrites `final.mp4` or the base video. It writes `renders/rerender_<frames>_<time>.mp4`. You approve, then copy it over `final.mp4`.
- Also takes `--seconds 12.5-18` or `--frames 300-420`. `--dry-run` shows the plan.
- Verified 2026-11-24 on the paper reel: 1 s range, 1.5 min (mostly start-up), result identical to the original at 48-50 dB PSNR, same 1,395 frames.
- Works for **Remotion atelier** projects. Blender, Three.js and Manim scenes: redo that plate with its tool, then re-render the overlay range (steps below). Not automated, not tested as a rework.

## What to do for each problem
| Problem | Say | What Claude changes | Then | Cost (estimate) |
|---|---|---|---|---|
| Scene idea wrong | "scene 3 should show X" | that scene in the scene plan (action, source) + its code/asset | still of that scene, then `studio_rerender --scene s3` | minutes |
| Wrong stock clip | "swap the clip in scene 2" | new Pexels pick (you approve the download), manifest row | re-render scene 2 | minutes |
| Animation timing off | "the tap lands late" | timing in the scene code/cue | re-render the range | minutes |
| Look wrong in one scene | "scene 4 palette is off" | that scene only | re-render scene 4 | minutes |
| Caption style or position | "captions too low" | caption config | re-render captions only if rendered in the comp (then the whole range, or full) | render |
| Music too loud / wrong mood | "lower the music" / "other track" | audio mix only | **re-mix and mux, no video re-render** (video is rendered muted) | about 1 min |
| One script line | "change 'cost' to 'risk'" | that line only | regenerate that section's voice, then see the voice row | medium |
| Voice flat or a word wrong | "pause before 'but'" / "say it 'ay-eye'" | `delivery_cues` or `pronunciation_guides`, then ONE sample | regenerate that section, loudness-match, reassemble | medium |
| Scene is a static card / does not move | "scene 3 just sits there" | pick a verb-to-animation recipe from `scene-motion.md`, update `action_beat` and `mute_test` in the scene plan | still sequence, then `studio_rerender --scene s3` | minutes |
| Whole look is wrong | "start over in blueprint" or "use my saved theme X" | proposal and scene plan (needs your approval); a saved theme: `python scripts/studio_theme.py apply <name> <id>` | most stages | large |
| Look is right, want to keep it | "save this look" | `python scripts/studio_theme.py save <id> <name> --kit ...` (never changes the video) | `studio_theme.py list` | seconds |

## Voice or script change (the awkward one)
A longer or shorter line moves every cue after it. Steps (manual today):
1. Edit the line in `script.json` (only that section).
2. Regenerate only that section's narration (Kokoro/Piper), loudnorm it to match.
3. Re-assemble the timeline (`assets/audio/section_timing.json`) and re-run Whisper for word timings.
4. Regenerate the caption words file used by the composition (for the paper kit: `words.ts` from `transcript/words.json`).
5. If scene timings moved, update those scenes; then `studio_rerender` for the affected range (or full render if most moved).
6. Re-mix with music, mux, listen.
`studio_stale.py` lists exactly which of these apply (section changed -> narration, timing, words, captions, scene timing, edit, render).
**Not built yet:** a one-command "redo this voice line" for Remotion kits (roadmap B1). The clay kit already has `--redo-line`.

## Rules while reworking
- Show a still or the short patch before any full render. Look at frames; automated checks miss layout bugs.
- If a decision changes, append a `decision_log` entry with the same category and subject.
- Keep everything the user did not mention. Locked fields stay locked. A scene fix must keep the mute test passing (`scene-motion.md`) and keep the theme's palette and signature device (`theme_lock.json`, `art-direction.md`).
- Revision limits (director files): 3 revisions per stage, 1 send-back per stage pair. These are guidance for the agent, not enforced in code.
- Superseded checkpoints move to `projects/<id>/history/`; nothing is lost.
- If a background render is killed (low memory), Claude reports it and waits; it does not restart it on its own.

## Clay series episodes (clay/episode.py)
Everything is in `projects/<id>/episode.json`, so a fix is an edit plus one command. Verified 2026-11-24 on a 15 s draft.
| Problem | Edit in `episode.json` | Command | What re-renders |
|---|---|---|---|
| A spoken line is wrong | that line's `text` | `python clay/episode.py <id> --redo-line N` | re-voices line N; frames from N on if the timing moved (measured: frames 78-193 of 193), earlier frames stay byte-identical |
| A prop is wrong or overlaps | that line's `props` (type, pos, anim, at) | `python clay/episode.py <id> --stage render` then plate, compose (or `--stage all`) | spec changed, so all frames re-render (about 1 s/frame at 1080x1920 is NOT measured yet; draft is 0.5 s/frame) |
| Camera or action is wrong | `cam`, `action`, `action_at` | same as above | all frames |
| Caption style, hook text, end card | `hook`, `end_lines`, or `remotion-composer/src/clay/ClayEpisode.tsx` | `--stage compose` | Remotion only, no Blender |
| Music | `music` or `--no-music` | `--stage compose` | mix and mux only |
| A character looks wrong | `clay/series/<name>/series.json` cast entry | `--stage render` | all frames (the series look changes for every episode) |
| The kit itself changed (`clay_kit.py`) | none | `--stage render` | frames clear automatically |
Always run `--draft` first when changing visuals, show a contact sheet, then do the full render.
