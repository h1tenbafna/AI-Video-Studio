# Clay series kit

Same look, any topic: clay characters explain or discuss, one dialogue script in, one vertical reel out. $0, all local (Blender + Remotion + Piper/Kokoro + Whisper).
Built and tested 2026-11-24 on this PC. See "Measured" for what was actually run.

```
projects/<id>/episode.json  --voice-->  line audio (Piper/Kokoro, loudnormed)
                            --spec---->  word timings (Whisper) + camera plan + prop schedule
                            --render-->  Blender frames, stop-motion on twos (12 fps), EEVEE
                            --plate--->  30 fps video (frames held 2-3x, like real stop-motion)
                            --compose->  Remotion captions/hook/source tag/end card + ducked music + -14 LUFS mix
```

## Commands (venv on PATH: `export PATH="$PWD/.venv/Scripts:$PATH"`, ffmpeg on PATH)
```
python clay/episode.py <id> --stage all --draft        540x960, 12 samples: look + timing check (about 4 min for 15 s)
python clay/episode.py <id> --stage all                1080x1920, 24 samples: the real render
python clay/episode.py <id> --redo-line 2              change line 2 in episode.json, then this: re-voices it, re-renders only the frames that moved
python clay/episode.py <id> --stage compose --no-music captions/mix only (no Blender)
```
Outputs: `projects/<id>/clay/` (`lines/`, `narration.wav`, `spec.json`, `frames/`, `plate.mp4`, `props.json`, `comp.mp4`, `final.mp4`).
Frames are skipped if they exist. The tool clears them automatically when `spec.json` or `clay_kit.py` changes; `--redo-line` clears only the affected range.

## The series (one folder per Instagram page)  `clay/series/<name>/series.json`
```json
{"name":"clayrifying","brand":"clayrifying","style":{"world":"#f4e9d4","floor":"#d9b27c","wall":"#f2b84b"},
 "caption_y":1400,"music":"music_library/<file>.mp3","end_lines":["follow for more","@clayrifying"],
 "cast":{"pip":{"color":"#2bb3a3","shape":"round","eyes":1.05,"accessory":"tuft","accent":"#e4572e",
                "voice":{"engine":"piper","model":"en_US-lessac-high","length_scale":0.95}}}}
```
Cast fields: `color`, `shape` (round | tall | wide), `eyes` (size), `head` (size), `accessory` (none | glasses | hat | bowtie | tuft), `accent`, `dark_brows`,
`voice` = `{"engine":"piper","model":"en_US-ryan-high|en_US-lessac-high|en_GB-alan-medium|en_US-lessac-medium","length_scale":0.9-1.1}` or `{"engine":"kokoro","voice":"af_heart"}`.
Add a new character by adding a cast entry. Keep colours distinct from the wall (the wall is warm yellow here).

## The episode  `projects/<id>/episode.json`
```json
{"series":"clayrifying","title":"Why is the sky blue?","hook":"Why is the sky blue?",
 "lines":[
  {"speaker":"pip","text":"Moss, why is the sky blue?","action":"wave","action_at":0.0,"action_len":0.9,
   "props":[{"type":"text","text":"?","pos":[0,0,7.4],"scale":2.0,"color":"#6a4c93","at":0.9}]},
  {"speaker":"moss","text":"Sunlight hits the air and scatters in every direction.","cam":"right",
   "props":[{"type":"sun","pos":[-2.1,0,8.0],"scale":1.25,"color":"#ffd23f","at":0.0,"anim":"pulse","hold":true}]}],
 "sources_on_screen":[{"text":"NASA Space Place","from":2.0,"to":9.0}],
 "end_lines":["follow for more","@clayrifying"],"music":"music_library/<file>.mp3"}
```
- **Line fields:** `speaker`, `text`, optional `cam` (two_shot | left | right | wide), `action`, `action_who`, `action_at`, `action_len`, `props[]`.
- **Actions** (relative to the line start): `wave`, `hop`, `point`, `shrug`, `cheer`, `lean`, `surprise`. Speakers also get automatic beat gestures, blinks, brows, and lip-sync from word timings; listeners nod and look at the speaker.
- **Cameras:** first and last line = two_shot; others close-up on the speaker; every third line two_shot. Override with `cam`.
- **Props** (the literal visuals; times relative to the line start): `type` = `ball | box | sun | cloud | arrow | ray | bulb | planet | text`.
  `pos [x,y,z]`, `scale`, `color`, `rot` (degrees, arrows/rays, 0 = right, 90 = up), `length` (arrow/ray), `text`/`size` (text), `at`, `until` (or `hold:true` = stay to the end), `anim` = `pop` (default) | `float` | `pulse` | `spin` | `wiggle` | `bounce`, `to` + `move_at` + `move_len` (slide to a new position).
- **Prop lanes (visible in both two-shot and close-ups):** z 5.5 to 8.5, x within +-2.5. Above z 9 gets clipped in close-ups. Characters stand at x = -2.5 and +2.5, z 0 to 4.6. The hook text covers the top 16-27% of the frame for the first 3.5 s, so do not put props in the top lane in line 0 (use z <= 7.4). Props from earlier lines stay up until their `until`: give each idea its own lane and clear old props, or they overlap.
- **Sources on screen:** `sources_on_screen[]` shows a 32 px "Source: ..." tag. Every statistic or quote needs one (CLAUDE.md rule 9).

## Look
Clay material (lumps + fingerprint grain + soft subsurface), 3-point soft lighting, stepped 12 fps with per-frame "boil" jitter, mouths swapped per frame (replacement animation, like Laika). Text props are real extruded clay letters.
Weak spots known: props overlapping when lanes are not planned (seen in the test: 'BLUE' text over the sun and the brand tag), stick arms, simple hands, one set (flat wall + floor), no hair/clothes, a single Blender light hotspot on the wall, props are primitives. See `docs/` and the style card `styles/library/clay-stopmotion.md`.

## Measured (this PC: GTX 1650 Ti 4 GB, 7.8 GB RAM)
- Draft render 540x960, 12 samples: about 0.5 s/frame (191 frames in about 1 min). Compose (Remotion, concurrency 2): about 1 m 45 s for 15 s.
- 15 s episode, draft end to end: about 4 min. `--redo-line` of one line (draft): about 4 min, frame 10 unchanged byte for byte, frames from the changed line on re-rendered.
- Full quality 1080x1920, 24 samples, idle PC (2026-11-25): render 706 s for 191 frames (3.7 s/frame), plate 42 s, Remotion compose 159 s, total 907 s (about 15 min) for a 15.9 s episode. Output 10 MB, -15.1 LUFS, true peak -1.5 dBTP. A 40 s episode is about 480 frames, so roughly 30 min render plus 5 min plate and compose, about 35 min (estimate scaled from these numbers).

## Limits and honesty
- Two characters is the tested case. More than two works in the code (positions spread out) but the camera plan and left/right close-ups assume two.
- Whisper `base` mis-hears made-up names ("Clay" as "Play"); lip-sync uses the script text, so this only matters for the timing alignment when word counts differ.
- Voices: Piper (used in the test episode) and Kokoro (verified separately: CLI line and the wrapper path) both work.
- Stage artifacts of the animated-explainer pipeline (asset_manifest, edit_decisions) are not written by `episode.py`; the agent still writes the script and scene-plan checkpoints and gates. See the skill.
