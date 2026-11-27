# Make a reel: quick guide

Written 2026-11-24, updated 2026-11-25 (the `/reel` style menu, saved themes, alive scenes). Everything marked VERIFIED was run on this PC. Free: external spend is $0.

## 1. Start
In Claude Code, in this folder, type **`/reel "<time, topic, script or post text>"`**, for example `/reel "40 s, why cabs arrive faster with an app"`, or paste a finished script or a post you want turned into a reel.
Claude will (rules: `.claude/skills/studio-prompts/reel-flow.md`):
1. Read your request. Anything you wrote is locked. A script you paste is used word for word.
2. Run `python scripts/studio_styles.py` and `scripts/studio_preflight.py` (every look we can make, with evidence).
3. Ask you ONE batched question: **the look** (see 1b), plus the rest of the creative brief (`brief-template.md`) with a recommended answer for each line.
4. Create `projects/<id>/` and open the board (`python -m backlot open <id>`).

## 1b. The style menu you will see
In this order:
1. **Saved themes** (a look you kept, for example `blueprint-isometric-explainer`): same look, new topic.
2. **Recommended for your topic**, with one line of why.
3. **Every look in the inventory**: blueprint, paper cutout, 3D tabletop (Blender), chalkboard/math, neon city, data motion, clay, ink doodle, animated drawing, cartoon, anime/Ghibli, office set, human character (stock, own footage or flat avatar), stock footage plus text. Each shows its evidence level (VERIFIED, PROBED = one test scene rendered 2026-11-25, UNTESTED, BLOCKED). PROBED and UNTESTED looks are shown and labelled; Claude builds a short test first. BLOCKED ones (paid AI avatars, paid AI image or video generation, and local Stable Diffusion on this GPU) are named with the local alternative.
4. **Create a theme / character series**: robots, a tomato, stick figures, clay, two characters talking, a mascot. You set the cast, voices, colours, caption position and end lines once, then every episode reuses them (the clayrified model).
List it yourself any time: `python scripts/studio_styles.py`.

## 1c. Keeping a look (themes)
After you approve the final cut, Claude asks "save this look as a theme?". Commands:
```
python scripts/studio_theme.py save <project_id> <name> --kit <kit folder> --card <style card> --note "..."
python scripts/studio_theme.py list | show <name>
python scripts/studio_theme.py apply <name> <new_project_id>     # after init_project
```
A theme stores the art direction, playbook, reference stills, route, runtime, voice, music, caption style and kit paths. Never a topic or script. Saved so far: `blueprint-isometric-explainer`, `blender-3d-explainer`, and the `clayrifying` series. Kit files are referenced, not copied yet (roadmap F6).

## 1d. Quality bar
Every look is judged against two projects: `projects/ai-compute-business-explainer/` and `projects/sunlight-to-electricity/`. That means a signature device, a locked palette, motion that explains, no static-card scenes, captions clear of subjects, a contact-sheet review before the render.

## 1e. Scenes must be alive
Each scene shows its narration as a visible action landing on a spoken word, and passes the mute test ("does it move and explain itself with sound off?"). Motion recipes: `scene-motion.md`. A deliberate still (for example a silent closing card) is allowed only when flagged. The script follows the deck's spine and checks: `script-spine.md`.

## 2. You decide, Claude proposes
What you fill in is **locked**; Claude never changes it without asking. Blank = Claude recommends.

| Stage | You see | You can change | Gate |
|---|---|---|---|
| Research | angles, facts with source links | pick angles, add/ban facts | no |
| Proposal | 3 concepts, look, voice, music (3 options), runtime, cost ($0) | anything | **yes** |
| Script | table: time / voice / on-screen text / visual action / source, plus 4 hooks | any line (kept word for word), hook, length, ask | **yes** |
| Scene plan | per scene: action, look, source, mute test, stills | swap look, source, action, timing | **yes** |
| Assets | voice sample, stock picks (contact list), music | voice, clips, track | **yes** |
| Render + QA | the video, 8 checks | point at a second and say what is wrong | no |
| Publish | caption, sources, cover | wording, hashtags, cover | **yes** |

At a gate Claude stops and waits. Nothing is posted by Claude.

## 3. Which look is recommended? (short version; full menu from `studio_styles.py`, picker in `style-chooser.md`)
| Topic | Look |
|---|---|
| People, stories, relationships, history | paper cutout |
| AI/tech/systems, process diagrams | blueprint isometric (draw diagrams in this, not `diagram_gen`) |
| Physical process, supply chain | tabletop (Blender hero scene, heavy) |
| Dramatic tech, finance | night city (basic quality only) |
| Maths / logic | chalkboard |
| Stats and comparisons | clean data motion (card untested) |
| How-to, services, real-world | stock footage via Pexels + text |
| You on camera | your own footage (pipeline untested) |
| AI-generated people or video | **not available** here |
| Cartoon, anime/Ghibli, office, flat human avatar | PROBED (a test scene each, `projects/_look_probes/look_probes.mp4`): offered with a labelled test first; kits are roadmap F1-F4 |

## 3b. A series page (same characters, many topics)
Pick "create a theme / character series" in the menu, or say "start a clay series" (skill `clay-series`). Only clay is VERIFIED; other character looks (robots, tomato, stick figures) start as a labelled test (roadmap F1, F5). Set up the cast once, then each episode is a dialogue script plus a prop plan. Kit and commands: `clay/README.md`.

## 3c. Why AI image and avatar generation is blocked (tested 2026-11-25)
- **Paid APIs** (about 55 tools: HeyGen, Kling, Sora, Runway, Veo, Seedance and others): blocked by `spend_policy: local_only`. Never used without your explicit yes.
- **Local video models** (Wan, Hunyuan, LTX, Qwen-Image): declare 8-16 GB VRAM; this GPU has 4 GB. From the tools' declared needs, not run.
- **Local Stable Diffusion 1.5**: installed on D: (`_test-envs/diffusion`, torch 2.7.1+cu118, CUDA works on driver 522). Result: fp16 produced NaN (black images), fp32 does not fit 4 GB, and the fp32 CPU-offload run was killed for low memory. Not retried. Model files (2 GB) stay in `_test-envs/hf-cache` on D:.
- **SadTalker and Wav2Lip**: free and local but not installed; they may hit the same fp16 problem. UNTESTED.
- Use instead: code-made kits, Blender, stock via Pexels, the flat avatar (mouth driven by the Piper audio level).

## 4. What exists, honestly
Run `python scripts/studio_routes.py`. Levels: VERIFIED, CRUDE, BROKEN, UNTESTED, NEEDS KEY, BLOCKED. Not verified or not installed: Manim LaTeX, `/animated-drawing`, Three.js production tier (needs PBR terrain maps), 11 of the 12 pipelines beyond animated-explainer. See `docs/ROUTE_VERIFICATION_2026-11-24.md`.

## 5. Voice, music, captions (defaults)
Voice Kokoro `af_heart` (warm) or Piper `ryan-high` (neutral). Music from Pixabay or `music_library/` (3 options offered). Captions "Energy B". Final -14 LUFS, 1080x1920, 30 fps.

## 6. Time (estimates, this PC)
A short from brief to render: about 1.5 h authoring plus render time. Render: about 2 min (blueprint), about 26 min (paper). A scene fix: about 1.5 min for one second of paper reel (measured, mostly start-up), see `docs/REWORK_GUIDE.md`.

## 7. Before you post
Eight checks (`prompts.md` card 11): frame 0 thumbnail, safe zone, captions, specs, loudness, listen once, sources, ask once. Then caption with sources and the AI-label note if anything was generated. After 48 h, log the numbers and change one variable.

## 8. Many videos for a client
Use `.claude/skills/studio-prompts/campaign-template.md` (Teach / Prove / Give / Offer, one brand file).
