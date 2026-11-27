# Studio roadmap: what to fix next (written 2026-11-25)

Starting point for any new session: read `CLAUDE.md`, then `docs/ROUTE_VERIFICATION_2026-11-24.md`, `python scripts/studio_routes.py`, and `.claude/skills/studio-prompts/SKILL.md`.
Priorities are my judgement. Each item names the file to change and how you would know it worked.

## A. Better video (quality)
| # | Item | Where | Done when |
|---|---|---|---|
| A1 | **Prop layout checker**: reject overlapping props and clipped lanes before rendering (the test episode showed "BLUE" over the sun) | `clay/episode.py` stage_spec, rules in `clay/README.md` | a draft with two props in one lane fails with a clear message |
| A2 | **More clay vocabulary**: tick and cross, curved arrows, speech bubbles, a map or chart prop, crowd (copies of a character), a second set, walking, hands, hair and clothes | `clay/clay_kit.py` (Prop class, Character class) | one new episode on a topic that needs it renders without workarounds |
| A3 | **Caption collision**: captions at y 1400 sit over the characters' bodies; make `caption_y` and the camera framing a pair | `clay/series/*/series.json`, `CAMS` in `clay_kit.py` | faces and captions never overlap in a contact sheet |
| A4 | **Loudness**: clay mix lands at -15.1 LUFS, target -14 | `loudnorm_two_pass` in `clay/episode.py` (check true peak limiting) | `ffmpeg loudnorm` summary reads -14 +- 0.5 |
| A5 | **Three.js production flaws**: some trees render black, the template burns in an "OPENMONTAGE - EXPLICIT WORLD" HUD, terrain PBR maps are checked by the gate but unused | `tools/graphics/templates/threejs_world/world-runtime.js` | clean frames, ground uses the supplied maps |
| A6 | **Kokoro as a registered tool** so spend policy, reports and the cache see it | new tool beside `tools/audio/piper_tts.py` | `registry` lists it as available and `studio_report` counts it |
| A7 | **Vertical safe-zone check** (x 80-980, y 240-1600) run automatically on a final render | `scripts/` new `studio_qa.py` using `visual_qa` | one command prints the eight pre-publish checks as pass or fail |
| A8 | **Script quality loop**: the deck's "where does a viewer swipe away" pass and 4-hook generation as a scripted step, plus a 48-hour metrics log file per video | `.claude/skills/studio-prompts/prompts.md` cards 3, 4, 12 | `projects/<id>/metrics.md` template filled after posting |

## B. Faster iteration and rework
| # | Item | Where |
|---|---|---|
| B1 | One-command **voice-line redo for Remotion kits** (paper, blueprint): re-voice, re-time, regenerate words file, re-render the range | new `scripts/studio_voice_redo.py`; today documented as manual in `docs/REWORK_GUIDE.md` |
| B2 | Make `studio_stale.py` aware of `clay/` projects (episode.json lines, props) | `scripts/studio_stale.py` |
| B3 | Prop-only edits re-render all frames today; render only frames where props changed | `clay/episode.py` stage_render (spec diff per frame range) |
| B4 | Decide whether to turn on the asset cache (`OPENMONTAGE_ASSET_CACHE=1`); it is off | `.env`, `lib/asset_cache.py` |
| B5 | Pipeline artifacts for clay: write `asset_manifest`, `edit_decisions`, checkpoints so the board and `studio_report` see clay episodes | adapter at the end of `clay/episode.py` |

## C. Setup still open
| # | Item | Notes |
|---|---|---|
| C1 | **Commit** the new work (nothing is committed): `clay/`, `scripts/studio_*.py`, `.claude/skills/studio-prompts`, `.claude/skills/clay-series`, `docs/*`, `styles/library/*`, patched `tools/analysis/face_tracker.py`, `tools/enhancement/eye_enhance.py`, `assets/models/*.xml`, `remotion-composer/src/clay`, `remotion-composer/public/fonts` | you said you commit; `.env` change is local only and must NOT be committed |
| C2 | **Tests** for the new scripts (pytest is not installed in the venv); `tests/contracts/test_studio_library.py` still guards style-card status values | install pytest in `D:\AI-Video-Studio\_test-envs` or approve it in the venv |
| C3 | **START_HERE.md** one-page new-user guide (still not written) and a Mac pass for the new scripts (paths, MiKTeX, Playwright) | `docs/MAC_SETUP.md` |
| C4 | Freesound API key for `freesound_music` | you create it, put it in `.env` |
| C5 | NVIDIA driver update (522 to 610+): enables NVENC and a possible ACE-Step install | machine change, yours to approve |
| C6 | Real production run of one more pipeline (talking-head or clip-factory) to move it from READY (tools exist) to verified | `scripts/studio_pipeline_check.py` |
| C7 | Checklist for hosting a client batch: brand file, campaign plan, parallel gates | `.claude/skills/studio-prompts/campaign-template.md` (unused on a real client) |

## D. Known limits (hardware or policy, not bugs)
Auto-rig of a client's drawing needs about 16 GB RAM and Docker. No AI image, video, music, voice or avatar generation (paid or GPU, $0 rule). Documentary-montage is BLOCKED; avatar-spokesperson, cinematic and character-animation are PARTIAL. Chrome-based stock sourcing needs the Chrome extension turned on.

## E. Reference map
| Need | File |
|---|---|
| All prompts, per stage, with levers | `.claude/skills/studio-prompts/prompts.md` |
| Which look for which topic | `.claude/skills/studio-prompts/style-chooser.md` |
| Start a series (same look, many topics) | `.claude/skills/clay-series/SKILL.md`, `clay/README.md` |
| What works and what does not | `python scripts/studio_routes.py --all`, `docs/ROUTE_VERIFICATION_2026-11-24.md` |
| What a change made stale, fix one scene | `scripts/studio_stale.py`, `scripts/studio_rerender.py`, `docs/REWORK_GUIDE.md` |
| Pipeline readiness | `python scripts/studio_pipeline_check.py`, `docs/PIPELINE_READINESS_2026-11-25.md` |
| Skill health | `python scripts/studio_skill_audit.py`, `docs/SKILL_AUDIT_2026-11-24.md` |
| Short guides | `docs/QUICKSTART_REEL.md`, `docs/REWORK_GUIDE.md` |
| Full prompt map (long) | `docs/STUDIO_PROMPT_BOOK.md` |

## F. Registered goals (user, 2026-11-25): the `/reel` front door
Done in this session: `reel-flow.md`, `scene-motion.md`, `script-spine.md`, `scripts/studio_styles.py`, `scripts/studio_theme.py`, seeded themes `blueprint-isometric-explainer` and `blender-3d-explainer`, `/reel` command updated.
Still to build (every look in the menu must reach VERIFIED before it is offered without a "test" label):
| # | Item | Done when |
|---|---|---|
| F1 | **Cartoon / flat 2D character kit** (Remotion): reusable cast, walk/talk/point, expressions | one 30 s episode with two characters renders and passes the mute test |
| F2 | **Anime / Ghibli painterly look** from `styles/anime-ghibli.yaml` as a card + Remotion/Three.js recipe (no AI image generation) | card status verified from a real render |
| F3 | **Office set**: card + kit (desks, screens, people) | one scene of a process told in an office |
| F4 | **Human character**: flat bitmoji-like avatar kit, plus the stock-people route | avatar speaks a line with lip flap synced to audio |
| F5 | **Character themes by request** (robots, tomato, stick figures): a `series.json` generator that works for non-clay looks | a new series bible in one question batch |
| F6 | **Theme save for series** (clay and others) shows in `studio_theme.py list`; extend `save` to copy kit files into the theme | `apply` recreates a project that renders without the source project |
| F7 | Theme preview contact sheet in the style menu (stills per look) | the menu shows an image per option |
| F8 | `studio_styles.py` reads evidence from `studio_routes.py` instead of a hand-kept table | one source of truth |

Probe results (2026-11-25): F1-F4 each have a first test scene in `remotion-composer/src/probes/Probes.tsx` (`projects/_look_probes/look_probes.mp4`). Fix list before they become kits: cartoon thumb blob near frame 30; office workers hidden behind monitors; avatar hair shape and a hand-wave fade; speech-bubble width. F9: try local image generation again with a smaller/other route (an SD 1.5 fp32 run with `--lowvram` style offload when no render is running, or an SD-Turbo variant), or accept that Ghibli/cartoon art stays code-made. F10: install SadTalker only if the fp16 NaN issue is solved first.
