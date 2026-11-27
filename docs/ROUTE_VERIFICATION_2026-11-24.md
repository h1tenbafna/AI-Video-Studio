# Route, tool and skill verification (2026-11-24 and 2026-11-25)

Scope: everything the repo exposes on THIS PC (GTX 1650 Ti 4 GB, 7.8 GB RAM, $0 policy). "Verified" means it ran here and the output was checked.
Paid and key-gated services were NOT called (the $0 rule), so for those the only check possible is the registry status and a static look. Live menu: `python scripts/studio_routes.py --all`.

## 1. Tools: 164 in the registry

| Group | Count | Result |
|---|---|---|
| Available and **verified** (ran, output checked) | 46 of 47 available | see list below |
| Available, **crude** | 2 | `diagram_gen` boxes mode (arrows cut across boxes); `character_rig_renderer` preview (plain stick-style SVG character, loads GSAP from a CDN) |
| Available, **not isolated** | 4 | `green_screen_composite` (ran, picture-in-picture only), `character_animation_reviewer`, `composition_validator`, `screen_capture_selector` (recommend and record ran) |
| **Unavailable** | 117 | 94 need an API key (paid), 14 need a GPU or CUDA this PC lacks, 3 other local (`minicut_music_fit`, `bgm_montage_lite`, `clip_search`), 6 hybrid selectors with no usable backend (`image_gen`, `image_selector`, `video_selector`, `bg_remove`, `corpus_builder`, `direct_clip_search`) |

**Fixed on 2026-11-25 (you approved downloads):**
| Was | Fix | Evidence |
|---|---|---|
| `diagram_gen` mermaid BROKEN | `PUPPETEER_EXECUTABLE_PATH` appended to `.env`, pointing at your installed Chrome (no browser download) | Mermaid flowchart rendered through the tool |
| `face_tracker`, `eye_enhance` BROKEN (mediapipe 1.2.3 has no `solutions`; OpenCV 5 wheel ships no Haar cascades) | availability check now requires the legacy API so the tools fall back to OpenCV; downloaded `haarcascade_frontalface_default.xml` and `haarcascade_eye.xml` (OpenCV repo, about 1.3 MB) to `assets/models/`; tools look there when `cv2.data` has none | real face clip: 27/27 frames detected, eye enhance and face-guided reframe ran. I did NOT downgrade mediapipe: it would have pulled numpy 1.26 and protobuf 4.25 into the shared venv |
| `character_rig_renderer` needed playwright | `pip install playwright` + Chromium (about 170 MB, C:) | rendered a waving character. My first run wrote a text dump because I passed a `.json` output path; with an `.html` path it renders correctly |
| Pexels download not run | downloaded two clips through your Chrome (a phone-in-hand clip and a face clip), moved to D:, trimmed and reframed to 1080x1920 | The delivered file differed from the page: 720x1366 and 24.9 s where the page listed 30 s |
| Kenney assets | Nature Kit zip downloaded through your Chrome, installed with the catalog tool, sha256 pinned (`fa7974a0...c4d9d`, first-use pin), 329 models, 1,640 textures | the Three.js production gate also needs 3+ PBR terrain materials and 8 palette entries in 4 categories, which Kenney does not provide (ambientCG CC0 sets would) |
| `video_downloader`, `transcript_fetcher`, `screen_recorder`, Kokoro, `/ink-art` untested | all ran | yt-dlp audio download of a CC BY video (114 MB WAV, deleted), transcript fetched, 2 s screen test (1920x1080, deleted unviewed), Kokoro line via CLI and via `clay/episode.py`, ink example rendered (21 s, 50 s render, landscape) |
| Clay series route | built and rendered end to end at 1080x1920 | `clay/README.md`, 15.9 s episode, `--redo-line` rework verified |

**Closed on 2026-11-25 (second pass):** MiKTeX installed to D:\MiKTeX and on your user PATH (Manim LaTeX formulas render); three ambientCG CC0 PBR sets downloaded and a production-tier Three.js world rendered (6 s, 1080x1920, 22 s render); `/animated-drawing` bundled mode installed on D: and rendered (the auto-rig mode for a client's drawing is hardware-blocked: it needs about 16 GB RAM, this PC has 7.8 GB); vertical `/ink-art` rendered; 6 skill reference fixes plus 2 audit false positives corrected (now 0 broken references, 0 missing frontmatter); pipeline readiness check added (`scripts/studio_pipeline_check.py`, `docs/PIPELINE_READINESS_2026-11-25.md`).

Remaining limits, none fixable by downloading: auto-rig for client drawings (RAM), Cap app (screen_recorder covers it), all AI image/video/music/avatar generation (paid or GPU, $0 rule), and a full production run of the 11 non-explainer pipelines (statically checked only; documentary-montage is BLOCKED; avatar-spokesperson, cinematic and character-animation are PARTIAL).

Capabilities with **zero** usable tools: `image_generation` (32), `video_generation` (36), `music_generation` (8), `avatar` (5), `voice_conversion`, `realtime_audio`, `sound_effects`, `3d_asset_generation`, `clip_acquisition`, `clip_retrieval`, `corpus_population`. TTS has 2 usable of 20 (Piper and the selector).
Tool availability depends on PATH: one registry check today, run in a shell without ffmpeg on PATH, listed `hyperframes_compose` as unavailable although it is available with ffmpeg on PATH. Always export the venv and ffmpeg paths before checking.

Verified (outputs checked): `video_compose`, `audio_mixer` (full_mix), `hyperframes_compose`, `blender_world`, `threejs_world` (blockout), `math_animate` (Manim), `piper_tts`, `tts_selector`, `transcriber`, `audio_probe`, `audio_energy`, `frame_sampler`, `scene_detect`, `visual_qa`, `video_analyzer`, `video_trimmer`, `video_stitch`, `auto_reframe`, `color_grade`, `face_enhance`, `audio_enhance`, `green_screen_processor`, `silence_cutter` (mark mode), `subtitle_gen`, `showcase_card`, `code_snippet`, `music_library`, `pixabay_music`, `remotion_caption_burn` (ffmpeg fallback), `export_bundle`, `threejs_asset_catalog` (list), `character_spec_generator`, `svg_rig_builder`, `pose_library_builder`, `action_timeline_compiler`, `diagram_gen` (boxes mode only, CRUDE).
Not isolated: `character_animation_reviewer`, `composition_validator`, `green_screen_composite`, `screen_capture_selector`.

Findings worth knowing:
- `diagram_gen` mermaid mode is BROKEN (mmdc cannot launch a headless browser); boxes mode is CRUDE (arrows cut across boxes).
- `character_spec_generator` ignores the brief and returns a generic stub; the agent must fill the design.
- Whisper `base` heard "Clay" as "Play": fix names and numbers by hand.
- The asset cache is off unless `OPENMONTAGE_ASSET_CACHE=1`.

## 2. Routes (what you can offer a client)
VERIFIED: Remotion, HyperFrames, ffmpeg, Blender, Three.js (blockout), Manim, paper-cutout kit, blueprint-isometric kit, **clay stop-motion series kit (new)**, Piper and Kokoro voices, Whisper timing, Pixabay and local music, scene re-render and splice, Pexels via Chrome (search, listing, licence read; the download step is not run).
CRUDE: `diagram_gen` boxes. BROKEN: `diagram_gen` mermaid, face tracking, eye enhance, character rig mp4 preview. UNTESTED: `/ink-art`, `/animated-drawing`, screen recording, the other 11 pipelines, Blender/Three.js/Manim scene-level rework.
BLOCKED (never used): all AI image and video generation, paid TTS, AI music, avatars and lip-sync.

## 3. Skills: 303 files audited (`python scripts/studio_skill_audit.py`)
This is a STATIC audit (structure, referenced paths, tool names against the registry, keys needed). It cannot prove a workflow works.
| Verdict | Count | Meaning |
|---|---|---|
| OK / REFERENCE | 50 / 159 | director or craft docs whose tools exist, or pure knowledge |
| PARTIAL | 55 | mention tools or keys that are unavailable here; the docs offer alternatives |
| FREE-USABLE | 1 | tool skill whose tools are available (`threejs-world-generation`) |
| PAID-BLOCKED / BLOCKED-TOOLS | 23 / 2 | need paid keys or unavailable tools (ElevenLabs, HeyGen, Kling, Seedance, FAL, Azure, Atlas, Lyria, ...) |
| BROKEN-REF | 0 (was 11) | fixed: wrong tool paths corrected in `bg-remove-usage`, `lip-sync-usage`, `synthetic-screen-recording`, `skills/core/remotion.md`; upstream-toolkit paths in `acestep`, `remotion`, `video-toolkit` now carry a repo note saying they are not in this repo |
| NO-FRONTMATTER | 0 (was 2) | false positive: the description is a folded multi-line value; the audit parser now reads it |
Skills the studio itself relies on (`studio`, `studio-prompts`, `route-and-style`, `cost-and-qa`, `clay-series`) pass.

## 4. Open decisions
None required. Optional: a full production run of one more pipeline (talking-head or clip-factory) if a client needs it, and a bigger machine if client-drawing animation matters.
