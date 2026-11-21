# Studio Guide: making good videos with this pipeline

For the person running the studio (you), not for the agent. The agent's rules live in `CLAUDE.md` and the skills.
Written 2026-11-20. Claims are labelled **verified** (it rendered on this machine), **untested** (installed or available, never
rendered here) or **estimate** (my judgment, not measured).

---

## 1. What you have, in one minute

- **Cost:** $0 external spend. Only your Claude Pro subscription is paid. Paid tools are blocked in code (`config.yaml`, `lib/spend_policy.py`).
- **Verified here:** one 30 s vertical (1080x1920, 30 fps) video, "Sunlight to Electricity", made with Blender (3D scenes), Remotion
  (text, captions, composition), Piper (voice), ffmpeg (encode). Final: -13.9 LUFS, 98.1% speech-to-text match to the script.
- **Small test renders passed 2026-11-20** (evidence in `projects/_route_tests/`): Manim (480p, 3.6 s, plain text, no LaTeX) and Three.js world via
  HyperFrames (720p, 4 s, **blockout tier**, dim low-poly look). These prove the route works, not that it looks premium.
- **Still untested here:** every style card as a finished look, Three.js at production tier (needs the Kenney packs), `diagram_gen`, long renders.
- **Not possible locally:** AI-generated video or photoreal images (4 GB VRAM is too small).
- **Music:** `pixabay_music` works (one test download passed, 2026-11-20), `freesound_music` needs your free API key, and `music_library/` takes tracks you add. Local music generation (ACE-Step) is not installed, see section 2.
- **Machine limits (original Windows PC):** 4 GB VRAM, 7.8 GB RAM, small C: drive. Keep files on D:. Encode with libx264. Remotion concurrency 2.

## 2. One-time setup checklist (about 10 minutes)

1. Open a terminal in the repo folder and run: `python scripts/studio_preflight.py`
   (use the project `.venv`; Git Bash on Windows: `export PATH="$PWD/.venv/Scripts:$PATH"`; macOS: `source .venv/bin/activate`).
   **On a Mac, follow `docs/MAC_SETUP.md` instead** (one script does the whole install).
   Expected today: 0 FAIL. WARNs for untested routes and an empty music folder are normal.
2. **Music (three working sources):**
   - **Pixabay Music (works now, free, no key).** `pixabay_music` finds and downloads tracks (Pixabay Content License: free, no attribution
     required; check each track page for any YouTube Content-ID claims). Caveats: it scrapes the website with browser-style headers, so it can
     return HTTP 403 (it retries), and it will break if Pixabay changes its pages. Pixabay's terms may not welcome automated scraping; you accepted that for now.
   - **Freesound (needs you, 5 minutes).** Create a free account at freesound.org, request an API key, and add `FREESOUND_API_KEY=...` to `.env`.
     Official API, Creative Commons tracks (check each licence; some require attribution). The tool is already allow-listed.
   - **Your own tracks** in `music_library/` (already holds one Pixabay track, "Ambient Calm" by AtlasAudio, 113 s).
   - **Local generation (ACE-Step): not installed.** The official guide needs CUDA 12.8 PyTorch; this PC's NVIDIA driver is 522.06 (CUDA 11.8 only),
     and the minimum VRAM is 4 GB (DiT-only), exactly this card. Updating the NVIDIA driver (also needed for NVENC) would be the first step; then a
     ~10 GB model download and a new tool wrapper. Do this only if you want it; it is untested on 4 GB VRAM.
3. **Kenney 3D packs (optional, only for Three.js):** download from the kit page on kenney.nl using "Continue without donating", save as
   `<catalog_id>.zip` (`nature-kit`, `fantasy-town-kit`, `survival-kit`). Skip this unless you want Three.js.
4. Close heavy apps before Blender renders. RAM is tight and Claude Code may kill idle background jobs when free RAM gets low.

## 3. How a video gets made (the loop)

You talk to Claude Code in the repo. Say what you want; the agent runs the pipeline stage by stage.

```
research -> proposal* -> script* -> scene_plan* -> assets* -> edit -> compose -> publish*
                 (* = you must approve before it continues)
```

Two shorter pipelines: `hybrid` (idea -> script -> scene_plan -> assets -> edit -> compose -> publish) when you bring footage,
and `documentary-montage` (beta, needs stock sources that are mostly blocked here).
For topic-to-video use `animated-explainer` (stable) or `animation` (motion graphics, diagrams, math, Three.js).

**Your job at each gate** (the agent stops and waits, never approves for you):

| Gate | What you check | Typical fix |
|---|---|---|
| proposal | idea, pipeline, runtime (Remotion or HyperFrames), authoring mode (templated or atelier), route per scene, **music plan**, cost ($0) | "swap the opening, no music" |
| script | every sentence read aloud; facts; length vs target | cut 20%, simplify |
| scene_plan | one visual per beat, route + style per scene, hero scene, anything flagged unavailable | change a scene's route (needs your approval) |
| assets | preview frames/clips and voice; caption look | re-render one scene only |
| publish | final file, title, description, thumbnail | |

**Tips that save the most time and tokens**
- Start a **fresh Claude session at each gate**. Checkpoints in `projects/<id>/checkpoint_*.json` hold the state, so nothing is lost.
  Long sessions are what made the first video cost about $19.85 of Claude usage (list price) over about 13 h elapsed, mostly repo discovery and waiting.
- Say "resume `<project id>`". Never restart a project; ask to redo only the changed stage or scene.
- After a run: `python scripts/studio_report.py <project id>` shows stage times, tool time, external spend (must be $0).
- Open the board with `python -m backlot open <project id>`; it is a viewer, not a blocker.

## 4. Choosing a look: routes and styles

A scene has a **route** (how it is made): `blender`, `threejs`, `manim`, `remotion`, `cinematic`, `hybrid`.
The **composition runtime** (Remotion or HyperFrames) is one project-level choice. A **style card** (`styles/library/*.md`) is the look recipe.

| Want this look | Route | Style card | Status |
|---|---|---|---|
| Clean stats, comparisons, news explainer | remotion | `clean-data-motion` | untested card; Remotion route verified |
| Friendly stories, history, people | blender or remotion | `paper-cutout-diorama` | untested card; Blender verified |
| Step-by-step process, cause and effect | blender or threejs | `tabletop-miniature` | untested card |
| How a system is built | threejs, blender, remotion | `blueprint-isometric` | untested card |
| Maths, logic, proofs | manim or remotion | `chalkboard-derivation` | Manim route test passed (matches the card palette); no LaTeX |
| Tech, networks, high energy | threejs or blender | `night-city-neon` | Three.js route test passed (blockout world); card look untested; heavy on 4 GB VRAM |

Rules of thumb:
- **First time using a route or card: make a 10-15 second test scene before the full video.**
- Blender Cycles is slow on this GPU (**estimate**). Budget render time per scene and test one frame first.
- No `cinematic` photoreal scenes locally. The agent will flag them and offer a local alternative; accept or change the idea.

## 5. Short-form (Reels, Shorts, TikTok), 15 to 60 seconds

Profile: `youtube_shorts`, `instagram_reels` or `tiktok` (all 1080x1920, 30 fps). **Verified** on the solar video.

1. **One idea, one payoff.** If you cannot state it in one sentence, cut it.
2. **Hook in the first 2 seconds:** a surprising number, question or striking image. No logo intro, no "In this video".
3. **Script 70-130 words for 30-45 s** (about 2.5 words per second at normal pace; **estimate**). One fact per sentence.
4. **Scenes of 2-4 seconds** with a visual change at every beat. Keep text in the middle safe area (keep clear of the bottom ~20% and right edge where apps put their buttons).
5. **Captions on, large, high contrast**, 3-5 words at a time, synced to the voice (you chose style B on the first video; say if you want it again).
6. **Voice:** Piper `en_US-ryan-high` (best fit for short scripts) or `lessac-high`. Read the script aloud first; fix anything you stumble on.
7. **Sound:** voice on top, light effects underneath (hits on key numbers). Music only if you supplied a track; keep it very low.
8. **End on the payoff**, with a loop-friendly last line or a one-line call to action. Do not fade out slowly.
9. Ask the agent for a **hero scene**, the single most striking moment, and spend extra render time only there.
10. Before posting, watch on a phone: legible at arm's length? sound ok with and without headphones?

A realistic first target: one 30 s video, 5-8 scenes, one route (Blender or Remotion), one style card. **Elapsed time is an estimate: a few hours** if
each gate is answered promptly. The first video took about 13 h across overnight waits and setup.

## 6. Long-form (about 20 minutes), what to expect and how to do it

Be realistic: this studio makes **motion-graphic and animated explainers**, not live-action. 20 minutes means roughly 3,000 words of script and
**100-200 scenes** (**estimate**). Heavy Blender scenes for all of it are not realistic on a 4 GB GPU. Plan this way:

1. **Split it into chapters** of 2-4 minutes. Treat each chapter as its own mini-production inside one project so you can approve, render and fix one at a time.
2. **Mix routes by cost:** mostly `remotion` (cheap, fast: diagrams, charts, text, stills, kinetic type) and `manim` or `blender` only for a few
   hero scenes per chapter. Never make every scene a Blender render.
3. **Use ONE style card and one playbook** across the whole video. Consistency matters more than variety.
4. **Pacing for retention:** change something on screen every 3-8 seconds; a pattern break (new chapter card, number, zoom) every 30-60 seconds;
   recap at chapter ends; a clear promise in the first 20 seconds.
5. **Script first, long.** Read the full script aloud and cut. Long-form quality is mostly the script. Approve it chapter by chapter.
6. **Voice:** Piper is fine for narration but flat over 20 minutes; vary sentence length, use short paragraphs, add pauses between sections. Test a 1-minute sample first and decide if you accept the voice for the full length.
7. **Render per chapter, then stitch.** If a render is killed (low RAM), you redo one chapter, not 20 minutes. Check free disk on D: first (long renders are big).
8. **Fresh session per chapter or gate.** Ask the agent to resume from checkpoints.
9. **Music:** supply 2-3 tracks you have licensed; otherwise rely on voice + subtle effects.
10. **Do a 2-minute vertical-or-horizontal pilot chapter first.** If the pilot works end to end, scale up. Total elapsed time for 20 min is unmeasured, treat any figure as a guess, and expect days of rendering and review, not hours.

Long-form uses `youtube_landscape` (1920x1080, 30 fps). Avoid 4K on this machine.

## 7. Quality checklist before publishing

- Script read aloud; facts checked against sources the agent listed in the research brief.
- Frames inspected at the start, the middle of each scene and the end (not just "the file exists").
- Captions match the voice; no typos; readable on a phone.
- Audio: voice clear, effects under it, no clipping (the agent measures LUFS and peak; the first video was -13.9 LUFS / -1.6 dBFS peak).
- Licences: any music or asset you added is cleared; credit where required. Style cards are original; do not copy other creators' branded styles.
- `python scripts/studio_report.py <id>` shows external spend $0.
- Platform fit: aspect ratio, length limits, title and thumbnail ready.

## 8. When something goes wrong

| Symptom | Do this |
|---|---|
| Agent offers a paid provider or an "API key" setup | Decline. Paid is blocked by design. |
| Agent says a scene cannot be made locally | Pick a local alternative (Blender, Remotion stills) or change the idea. Quality is never lowered silently. |
| Render job vanishes | Low memory killed it. Close apps, re-run only that scene; the agent should not restart automatically. |
| Disk warning | Free C:, keep outputs on D:. |
| Music not found | Expected. Add tracks to `music_library/` or go without. |
| Want to change the voice or a line after assets exist | Only that scene's audio and captions should be redone; say so explicitly. There is **no automatic invalidation** yet, so remind the agent to redo only what changed. |

## 9. First test video: recommended plan

1. Run preflight (section 2).
2. In a fresh session: `/reel` a 30-45 s vertical explainer on a topic you know well, pipeline `animated-explainer`.
3. At proposal choose: Remotion runtime, one route (`remotion`, with `blender` only for the hero scene), style card `clean-data-motion` or `paper-cutout-diorama`, no music (or one track you supply).
4. Approve each gate in its own session.
5. After publish, run `studio_report.py`, then note what to fix (voice, pacing, style). Update the card's `status` to `verified` only if it rendered well.
6. Only then try a second style or route, then Three.js with the resource plan.

## 10. Known limits (so nothing surprises you)

- No automatic resume/invalidation by dependency (narration change vs visuals); redo by hand per stage or scene.
- No error messages in `events.jsonl`; failures are counted by tool.
- Skill scripts that call paid APIs can bypass the code guard (`bgm.mjs`, `lyria-recipe.py`, `locate.mjs`, `kling_official_animated_explainer_e2e.py`). They are never run here.
- ComfyUI "local" workflows could use paid partner nodes; not installed.
- Style cards stay `untested` as finished looks until one is rendered for real. Routes Manim, Three.js (blockout) and HyperFrames passed small tests.
- Three.js world tool had a bug (bare `three` import broke renders); fixed in `tools/graphics/templates/threejs_world/index.html` with an import map.
