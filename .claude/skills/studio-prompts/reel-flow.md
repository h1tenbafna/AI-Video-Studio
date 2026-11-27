# /reel flow: request -> style menu -> theme -> production

`/reel "<time, topic, script or post text>"` always runs this front door. Anything the user already stated is LOCKED; ask only for blanks.

## Step 1. Read the request (no questions yet)
Pull out: length (default 40 s), topic/idea, a supplied script (then it is word for word), source text (a post to turn into a reel), platform (default 9:16 Reels), a named theme. Run `python scripts/studio_styles.py` for the live menu and saved themes.

## Step 2. Ask ONE batched question: the look
Show a numbered menu built from `studio_styles.py`, never from memory. Order:
1. **Saved theme** (if any exist): "reuse `blueprint-isometric-explainer`?" Reuse beats rebuilding: same look, new topic.
2. **Recommended for this topic** (from `style-chooser.md`), with one line of why and the evidence level.
3. Every other look in the inventory, each with: what it looks like, evidence level (VERIFIED / PROBED / CRUDE / UNTESTED / BLOCKED; PROBED = one test scene rendered and checked, not yet a full production), best for, and rough render time (label as estimate). Include blueprint, paper, 3D tabletop, math/chalkboard, neon city, data motion, clay, ink doodle, animated drawing, cartoon, anime/Ghibli, office set, human character (stock, own footage, flat avatar), stock + text.
4. **Create a theme / character series** (robots, a tomato, stick figures, clay, two characters talking, a mascot): the series bible flow in the `clay-series` skill pattern. A series is saved so many videos share one look (the clayrified model: fixed cast, voices, set, caption position, end lines, music).
Cartoon, Ghibli, office and flat avatar are PROBED (see `projects/_look_probes/look_probes.mp4`, code in `remotion-composer/src/probes/`): show the probe to the user and build on it. Say plainly which options are PROBED, UNTESTED or BLOCKED (paid AI avatars, AI image/video generation) and what the local alternative is. Never hide an option because it is untested: show it, label it, and offer to run a small test first. Copyrighted characters (Doraemon etc.) are not copied; offer an original look-alike in the same spirit.

## Step 3. Ask the rest of the brief in the same message
Audience, the one idea, length, the ask (save / send / comment WORD), voice and music (present the music plan), runtime (Remotion vs HyperFrames, templated vs atelier). Recommended default for each. Then fill `creative_brief.md`.

## Step 4. After the look is chosen
- A saved theme: `python scripts/studio_theme.py apply <theme> <project_id>` after `init_project` (writes `theme_lock.json` and `art-direction.md`). Announce the carried-over voice, music and runtime; changing any of them needs a yes.
- A new look: write `art-direction.md` (visual language, signature device, type, motion, scene distinctness) as the benchmark projects did.
- A new character series: `clay/series/<name>/series.json` via the `clay-series` skill.

## Step 5. Quality bar (the two benchmark projects)
Judge every scene plan and render against these. Open their stills before promising a look:
- `projects/ai-compute-business-explainer/` (blueprint, 40 s, `renders/final.mp4`, `art-direction.md`): one signature device (numbered part tags), strict palette, line-draw-on motion, every scene visually distinct, facts sourced.
- `projects/sunlight-to-electricity/` (Blender hero + Remotion atelier, `renders/sunlight_to_electricity_final.mp4`): real 3D light, camera moves, narration lands on visible events.
A look is "top notch" only if it has: a signature device, a locked palette, motion that explains (not decorates), no scene that is a static card (see `scene-motion.md`), captions clear of subjects, and a contact-sheet review before the render.

## Step 6. Offer to save the theme (after the user approves the final cut)
"Save this look as a theme for future videos?" If yes: `python scripts/studio_theme.py save <project_id> <name> --kit <kit folder> --card <style card> --note "..."`. Then list it back with `studio_theme.py list`. Never save without asking.

## Step 7. Continue
Script (`script-spine.md`), then the stage loop in `prompts.md` with gates. End the turn at each gate.
