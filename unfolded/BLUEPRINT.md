# Unfolded: production blueprint (v0, 2026-11-27)

The reusable recipe for every video on the page, whatever the story. Goal: premium, story-led reels at **$0**, made locally.
Status labels: VERIFIED (ran here and checked), TESTING (built, first runs in progress), PLANNED (not built yet).

## 0. The recipe in one line
**Visual-first script -> cast sheet -> one AI keyframe per shot (local SD) -> 2.5D motion per shot -> captions, voice, SFX, music -> QA.**

## 1. Script (VERIFIED method, from the reference analysis)
Rules live in `.claude/skills/studio-prompts/script-spine.md` (Visual-first scripting). In short:
- Shot list first, words second. One clause = one shot, 1-2.5 s, 4-7 words. 45-60 s = 20-28 shots.
- Every clause names a visible noun doing a verb. Abstract ideas become physical images.
- One central object opens, solves and pays off the story in the last line.
- Every fact sourced (rule 9); simplifications flagged to the user at the script gate.
Output: `artifacts/script.json` with `metadata.shot_list` (clause, on_screen, source per shot).

## 2. Look (LOCKED: style C)
A look = a **style block** appended to every shot prompt + a **negative block** + fixed model and settings.
Candidates under test (`projects/unfolded-postit-pilot/assets/images/keyframes/styletest/`): A animated film, B handcrafted miniature, C painted storybook.
**Locked 2026-11-27: C, painted storybook.** Style block: `storybook illustration, painterly digital painting, soft brush texture, warm glowing light, cinematic composition, rich colors, detailed background`. Negative block in `series.json`.
Lessons from the test: SD1.5 follows scenes and characters well but specific actions (a falling bookmark) poorly, and hands are unreliable. So **the AI paints the scene and the cast; code animates the action** (see section 6). Always state gender, age and clothing of a character.
Model: `Lykon/dreamshaper-8` (CreativeML OpenRAIL-M: commercial use allowed, use restrictions apply). Size 512x896, 22 steps, CFG 6.5, DPM++ Karras.

## 3. Cast (VERIFIED 2026-11-27)
- Each recurring character gets a **cast card**: name, role, a fixed text description (hair, face, clothes, colours) and one approved reference image.
- Consistency: same description text + **IP-Adapter Plus FACE** (`ip-adapter-plus-face_sd15.safetensors`, Apache-2.0) at scale 0.6, fed with the approved reference portrait (`"ip_ref"`, `"ip_weight"`, `"ip_scale"` in the jobs file).
- Do NOT use the general Plus adapter for action shots: it copies the reference pose even at 0.3 (tested).
- Make a reference: one waist-up portrait per character, 2 seeds, user picks; store in `unfolded/cast/<name>.png` + `<name>.txt`.
- Memory on the 4 GB / 7.8 GB PC: the image encoder runs once in fp16 under no_grad, then is deleted; close Chrome during long runs (a run was stopped for low RAM).
- Real people are never drawn as likenesses: generic figures labelled by role.
- Crease (mascot): carry over if it survives the new look; otherwise redesign in the chosen style.

## 4. Keyframes (VERIFIED on this PC)
`unfolded/gen/keyframe.py <jobs.json>` in the diffusion env (`D:/AI-Video-Studio/_test-envs/diffusion`, `HF_HOME=D:/AI-Video-Studio/_test-envs/hf-cache`, `HF_HUB_OFFLINE=1`).
- GTX 1650 Ti recipe: fp16 UNet with cuDNN off + classic attention (upcast), then cuDNN on for an fp32 VAE decode. 512x512 x 20 steps = 114 s, peak 2.9 GB.
- Prompt = shot description (from `on_screen`) + style block. Framing words per shot type (section 5).
- Generate 2 seeds per shot, pick one (contact sheet at the scene gate). Budget estimate: 3-4 min per image, so about 1.5-2.5 h for a 21-shot reel (estimate).
- Upscale to 1080x1920: PLANNED (Real-ESRGAN ncnn, Vulkan; or a gentle resize while testing).

## 5. Shot grammar (VERIFIED from references; use as a menu)
| Shot | Prompt framing words | Typical length | Motion default |
|---|---|---|---|
| Establishing wide | wide shot, full scene, environment | 2-3 s | slow push or drift |
| Medium (character + action) | medium shot, waist up | 1.5-2.5 s | push |
| Close-up (face, reaction) | close-up portrait, expressive face | 1-2 s | push, small |
| Macro (object, hands) | extreme close-up, macro, shallow depth of field | 1-2 s | drift or rise |
| Low angle (drama, scale) | low angle, looking up | 1.5-2 s | rise |
| Over the shoulder / POV | over the shoulder, point of view | 1.5-2 s | drift |
Rhythm: change every 1-3 s; no three of the same shot type in a row; the payoff gets the longest hold.

## 6. Motion and actions (VERIFIED on shot 4, 2026-11-27)
Every shot moves. Default is **2.5D parallax** from one keyframe:
- `unfolded/gen/depth.py in.png depth.png` (Depth Anything V2 Small, Apache-2.0, CPU).
- `unfolded/gen/motion.py img depth out.mp4 --dur 2.4 --move push|drift_l|drift_r|rise|orbit` (ffmpeg displace + zoom, 1080x1920, 30 fps, libx264).
- **Actions are animated in code on top of the painted plate**: `remotion-composer/src/unfolded/PropShot.tsx` (composition per shot, keyframes in `src/unfolded/shots/<shot>.json`): 2.5D background clip + prop cut-out on a keyframed path (peel, fall with flutter, slide, stick), props move "on twos" for a stop-motion feel, drop shadow grows as the prop lifts, style-B caption with the active word from Whisper timings.
- **Prop rule:** simple flat props (paper strips, notes, bookmarks, labels) are code-made with a painted paper texture (`unfolded/gen/paperprop.py strip|note|bookmark`); SD turns them into rolls or roses. Scenes, people and complex objects are AI-painted.
- **Plate rule:** for a prop shot, paint the plate EMPTY (negative: person, people, hands, face), then add the action in code. The action starts on its narrated word.
- **Recognisable props (user feedback on shot 4 v1):** the hero object must read instantly at phone size: its iconic form (sticky note = yellow square, clean edges, sticky band), at least 35% of frame width, and it moves the way the real thing moves (a sticky note peels from the bottom while hinged at the top: `"origin": "50% 0%"`, `rx` positive = toward camera).
- **Close-ups:** SD widens "close-up" wall shots; generate the plate, then crop the useful part (ffmpeg crop + lanczos to 1080x1920) before depth/motion. Keep the shot prompt short: prompt + style block must fit CLIP's 77 tokens or the end of the style block is dropped.
- **Light props into the plate (VERIFIED shot 4 v3):** `unfolded/gen/lightmap.py bg_frame0.png prop.png prop_lit.png --propW --x --y --rot --ref-pct 75 --blur 2 --lo 0.62 --hi 1.15 --strength 1.0` (pose = the first key) bakes the wall's window bars and shade into the prop; PropShot `lit` + `litFade` [from,to] fades it out as the prop leaves the wall, `baseBright` 0.9 for room shade, rest `shadow` 0.10 for a contact shadow.
- **Glue props to a pushing camera:** pass `"camZoom": 1.10` (motion.py push) so the prop zooms with the wall.
- SFX: `unfolded/sfx/` (peel, flutter, land; synthesised with ffmpeg, $0). Mix: voice + SFX with adelay to the action frames, loudnorm -14 LUFS, TP -1.5.
- Reference build: `projects/unfolded-postit-pilot/assets/images/keyframes/shot04/shot04_v2_final.mp4` (2.8 s, 1080x1920, 30 fps; v1 = white strip in a wide room, rejected: "doesn't look like postit").
- Real character acting (image-to-video) is not possible on this GPU. Hero shots only, PLANNED via the Mac or a free web tool the user approves.

## 7. Edit, captions, sound (VERIFIED in earlier reels)
- Cuts land on the key noun (Whisper word timings). Hard cuts by default; the series device (to choose with the look) opens and closes each episode.
- Captions: style B (bold, 2 short lines, active word highlighted, low-middle, never over a face).
- Voice: Kokoro `af_heart` (local). Music: Pixabay / library, ducked. SFX on every action beat (+4 dB). Mix -14 LUFS, TP -1.5.
- QA: the eight checks in `prompts.md` card 11; `python scripts/studio_report.py <id>`.

## 8. Per-episode checklist
1. Research + sources -> 2. visual-first script (gate) -> 3. shot list with framing + motion per shot (gate) -> 4. keyframes, 2 seeds each, contact sheet (gate)
-> 5. depth + motion clips -> 6. voice, word timings, cut list -> 7. captions, SFX, music -> 8. render, QA, publish caption with sources (gate).

## 9. Files
`unfolded/series.json` (identity), `unfolded/BLUEPRINT.md` (this), `unfolded/gen/` (keyframe, depth, motion), `unfolded/kit.py` (Blender kit, kept as a fallback look), `unfolded/tests/`.
Models on D: in `D:/AI-Video-Studio/_test-envs/hf-cache` (about 6.6 GB). Delete there if the route is dropped.
