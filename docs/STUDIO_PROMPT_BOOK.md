# Studio Prompt Book

One place to see every prompt, route, gate and rework path in the studio.
Written 2026-11-24 from the repo as it stands. Nothing here changes how the studio runs yet.

**Status labels used throughout**
- **EXISTS** = read in the repo today (file and section given).
- **PROPOSED** = a locked template I am suggesting. It is not wired into any director skill until you approve it.
- **UNTESTED** = not run on this machine.
- **Digest** = I read the file and summarised it. Open the file for exact wording.

---

## UPDATE 2026-11-24: what changed since this was written

**Done and active** (you approved): the PROPOSED cards are now real, in one place: `.claude/skills/studio-prompts/` (brief, prompt cards, style chooser, stock-via-Chrome, campaign template). `CLAUDE.md` and `/reel` point to it. User-written fields are locked.
**New tools:** `scripts/studio_routes.py` (honest route menu), `scripts/studio_stale.py` (what a change made stale), `scripts/studio_rerender.py` (one-scene re-render and splice). Guides: `docs/QUICKSTART_REEL.md`, `docs/REWORK_GUIDE.md`.

**Resolved from section 9 (what I had not verified):**
| Item | Result |
|---|---|
| Remotion licence | Confirmed on remotion.dev/docs/license/faq: free for individuals (commercial too) and teams of up to 3 people. Larger companies need a Company licence. |
| Asset cache for local tools | Piper, `diagram_gen` and `video_compose` declare themselves deterministic, but the cache is **OFF unless `OPENMONTAGE_ASSET_CACHE=1`**. It was never on in our runs, so "only the changed prompt recomputes" did not apply. Not enabled by me. |
| Executive Producer file | No code or command references it. It is only a skill the agent may read. Gates are the real control. |
| `diagram_gen` | Boxes mode renders but is CRUDE (arrows cut across boxes). Mermaid mode is BROKEN (mmdc cannot launch a headless browser). Draw diagrams in the Remotion kits. |
| Cheap ffmpeg tools | `video_trimmer`, `auto_reframe`, `color_grade`, `audio_enhance`, `subtitle_gen`, `showcase_card`, `silence_cutter` ran and outputs were probed. |
| Pexels via Chrome | Search, candidate listing, licence/size/duration read: works. Download: not run, needs your yes. |
| One-scene re-render | Works: 1 s of the paper reel, 1,395 frames and 46.5 s unchanged, 48-50 dB PSNR vs original. |
| Style cards | `status` now `verified` for blueprint, tabletop, night-city, chalkboard, paper (with an `evidence:` line). `blueprint-isometric` had an invalid status string that the contract test would reject; fixed. `clean-data-motion` still untested. |

**Still not verified:** the other 11 pipelines; character animation tools; `/ink-art`, `/animated-drawing`; screen recording; `video_downloader`; `remotion_caption_burn` and `export_bundle` in isolation; rework of Blender/Three.js/Manim scenes (only Remotion is automated); a one-command voice-line redo (not built).

---

## 1. Where the prompts actually live

OpenMontage has no `prompts.json`. The "prompts" are **director skills**: markdown files the agent reads before each stage.
Editing one changes how every later video behaves. The full text for `animated-explainer` is about 155 KB (about 40k tokens), so this book gives you the control points, not a copy.

| Layer | Location | What it controls |
|---|---|---|
| Project rules | `CLAUDE.md` | Gates, $0 policy, announce-before-acting, rule 8 (live visuals), rule 9 (cite facts) |
| Stage directors | `skills/pipelines/<pipeline>/<stage>-director.md` | The instructions per stage (section 3) |
| Cross-stage meta | `skills/meta/*.md` | `voice-performance-director`, `reviewer`, `checkpoint-protocol`, `taste-direction`, `creative-intake` |
| Craft skills | `skills/creative/*.md` | `short-form`, `image-gen-usage`, `stock-sourcing-usage`, `video-gen-prompting`, `sound-design`, `storytelling` |
| Model prompt guides | `skills/creative/prompting/*.md` | Veo, Sora, Seedance, LTX, Grok, Hunyuan (all paid or GPU, so unusable here) |
| Tool skills | `.agents/skills/*` | Per-tool usage, read before calling a generator |
| Look cards | `styles/library/*.md` (7) and playbooks `styles/*.yaml` | Visual identity |
| Studio helpers | `.claude/skills/{studio,route-and-style,cost-and-qa}` | Stage loop, per-scene route, cost report |
| Output contracts | `schemas/artifacts/*.json` | What each stage must produce |

Other pipelines (`animation`, `cinematic`, `talking-head`, `clip-factory`, and so on) have their own director folders with the same stage names. I did not read those.

---

## 2. Why some videos came out flat or used weak images (root causes)

1. **No working stock route.** The registry shows `pexels_image`, `pexels_video`, `pixabay_image`, `pixabay_video` and `image_selector` as **unavailable** (no API keys). The asset director never reaches a real photo, so the agent falls back to drawn or code-made visuals.
   Your instruction "use Pexels from Chrome" is not written into any skill, so each session has to be told again. Fix: section 5.
2. **"Live action" lived only in memory and `CLAUDE.md`.** The scene director's own checklist (5 aspects: subject, subject motion, scene, framing, camera) does not require an action synced to a narrated word. `CLAUDE.md` rule 8 does, but the director skill never mentions it.
3. **Local image and video generation is impossible** (4 GB VRAM), so `image_generation` and `video_generation` have 0 working providers. Anything "cinematic" has to come from stock or from code-made scenes.
4. **Quality loops depend on me looking at frames.** The pipeline has automated checks, but my notes record that they false-alarm on burned-in captions and miss layout bugs. Only rendered stills caught the real ones.

---

## 3. Stage prompt map (animated-explainer, the only pipeline proven on this machine)

Gate column is from `pipeline_defs/animated-explainer.yaml` (`human_approval_default`).

| # | Stage | Director file (size) | Produces | Gate | What the prompt asks for (digest) |
|---|---|---|---|---|---|
| 1 | research | `research-director.md` (16 KB) | `research_brief` | no | Content landscape (3+ existing pieces), 3+ angles each grounded in findings, 3+ data points, 5+ sources with URLs, audience questions from real forums |
| 2 | proposal | `proposal-director.md` (33 KB) | `proposal_packet`, `decision_log` | **yes** | 3+ distinct concepts, runtime choice (Remotion or HyperFrames), mood board, itemised cost, **music plan (mandatory)** |
| 3 | script | `script-director.md` (14 KB) | `script` | **yes** | Arc hook-setup-build-climax-landing; per-section `text`, `speaker_directions`, `delivery_cues`, `enhancement_cues`; word budget |
| 4 | scene_plan | `scene-director.md` (17 KB) | `scene_plan` | **yes** | Scenes covering full duration, 3+ scene types, no 3 same type in a row, 5-aspect checklist, `production.route` and `style_id` |
| 5 | assets | `asset-director.md` (17 KB) | `asset_manifest` | **yes** | Narration, images, diagrams, music; sample preview before batch; pre/post prompt self-review |
| 6 | edit | `edit-director.md` (5 KB) | `edit_decisions` | no | Cuts reference real assets, subtitles, music ducking, no gaps |
| 7 | compose | `compose-director.md` (19 KB) | `render_report`, `final_review` | no | Runtime routing, pre-render validation, post-render self-review, loudness |
| 8 | publish | `publish-director.md` (7 KB) | `publish_log` | **yes** | Title, description, tags, hashtags, thumbnail concept, chapters, export bundle |

Over all stages, the Executive Producer file (`executive-producer.md`, 18 KB) sets review rounds: max 3 revisions per stage, max 1 send-back per stage pair, max 3 send-backs in total.
I am not sure the EP file is followed as a separate agent in your sessions. In practice I act as EP myself and gates are the real control.

### 3.1 Prompt cards (the text you would tune)

Each card shows the **EXISTS** wording (or a close digest) and a **PROPOSED** studio lock.
All PROPOSED blocks are templates with `[brackets]` to fill. None is active yet.

#### A. Script

EXISTS (`script-director.md`):
- Hook 0-5 s. Never "In this video we'll learn" or "Hey guys". Setup 5-15 s creates a knowledge gap. Build uses "therefore / but", not "and then". Landing is the last 5 s, no new information.
- Word budget: 30 s = 65-75 words, 60 s = 130-150 words. 150 wpm default, 180 energetic, 120 contemplative. Over 20% = cut.
- Required per section: `voice_performance` (intent, pacing, energy curve, pause policy), `delivery_cues` (pace, energy, emphasis_words, pause_after_seconds, `provider_text`), `enhancement_cues` about every 8-10 s.

PROPOSED lock (merges the deck's script prompt with our rules 8 and 9):

```
Write a [40]-second vertical script for [audience] about [one idea].
Return a table: time | voiceover | on-screen text | visual action | source.
Six parts: hook 0-3, bridge 3-6, setup 6-15, turn 15-28, takeaway 28-35, next step 35-42.
Rules: short spoken lines, contractions, plain words, no em dashes.
Voice never reads the on-screen card aloud. Say the stakes out loud.
Visual action column: a literal action tied to a spoken word (a thumb taps, a door opens).
Flag any row that is deliberately a still card.
Every number or quote gets a source URL. Mark anything unverified as UNVERIFIED.
Give four hook options: frame-0 text plus first spoken line.
End on one ask: [save / send / comment WORD]. Say it once.
Then: where does a viewer swipe away, and why? Cut 8 seconds.
```

Word budget for [40] s at 150 wpm is about 95-100 words, but the paper reel only carried about 100 words in 46.5 s. Check your count with a timer, as the deck says.

#### B. Scene plan

EXISTS (`scene-director.md`):
- Allowed scene types: `talking_head, broll, animation, character_scene, diagram, text_card, transition, generated, screen_recording`.
- Narration budget: 85-90% of video length, 2.0-2.5 words per second (calm) or 2.5-3.0 (energetic), 0.5-1 s of silence between scenes.
- 5-aspect checklist. Camera may be "N/A - Remotion native scene" but only stated explicitly.
- Overlays are listed separately, never "in the foreground".

PROPOSED additions (these close the gap in section 2, point 2):

```
For every scene add three fields:
  action_beat:  the visible action and the word it lands on ("thumb taps phone @ 'tap'")
  mute_test:    pass / fail. Does the scene still move and explain itself with sound off?
  visual_source: code-made | stock-pexels-chrome | blender | manim | threejs, plus the search query or file
A scene with mute_test = fail needs an explicit "deliberate still" flag and a reason.
Frame 0 must show the hook subject. No still frame in the first 5 s.
```

#### C. Image and stock prompts

EXISTS (`image-gen-usage.md`): 3-part prompt = scene-specific style direction + playbook anchor + scene description; consistency strategies (shared visual system, hero reference image, seed locking). `asset-director.md` adds a **pre / critique / post caption** loop and logs the triplet.
Generation (FLUX, Imagen, OpenAI) is unavailable or paid, so the part you can use is the **stock query**.

PROPOSED stock query card (also the deck's image prompt, slide 10):

```
Search: "[concrete subject]" + "[setting]", orientation portrait, largest size.
Reject: logos, brand text, recognisable stock faces as "customer", watermarks, dark openers.
Prefer: bright daylight, a visible action, clear space at the top for a headline.
Pick 3, log for each: URL, photographer, licence line, why it fits the narrated word.
Crop to 1080x1920 ourselves.
```

#### D. Voice and narration

EXISTS (`voice-performance-director.md`, `asset-director.md` step 3):
- Contract: `voice_performance` object plus per-section `delivery_cues`, with a **sample gate**: generate one sample, approve it, then batch.
- Flat-voice rule: if the sample is monotone, robotic or ignores pauses, fix the plan and regenerate, do not batch.
- Provider mappings exist for OpenAI, Google, ElevenLabs and Azure (all paid or keyed).

What actually works here (from memory notes, measured):
- **Piper** `en_US-ryan-high` (the registered tool `piper_tts`).
- **Kokoro** `af_heart` via `npx hyperframes tts` (works, but **not in the registry**, so `spend_policy` and the report do not see it). No SSML, no `--provider`.
- After generating, loudness-match with two-pass `loudnorm` and verify the words by Whisper (`transcriber`).

PROPOSED lock:

```
Voice performance: [warm / urgent / calm], pace [conversational ~150 wpm], energy curve [hook measured, middle warmer, close deliberate].
Pause policy: 0.4-0.6 s after setup lines, one beat before the turn, ~1 s before the takeaway.
Never speed up to hit length. Cut lines instead.
One sample section first. Approve. Then batch. Verify by STT. Loudnorm to -15 LUFS per section.
```

#### E. Music and sound

EXISTS: the proposal stage must present a **music plan** (`proposal-director.md` step 5b). `sound-design.md` covers SFX levels.
Working routes: `music_library` (local files), `pixabay_music` (works, scrapes the site, can 403), `freesound_music` (needs `FREESOUND_API_KEY`, not set). ACE-Step is not installed.
Your standing preferences (memory): louder SFX (+4 dB, punchy hero hits), music ducked under voice, final mix -14 LUFS.

#### F. Captions

EXISTS (`short-form.md`): 42 px+ bold sans, 30 chars per line, 2 lines max, word-by-word highlight recommended.
Your choice (memory): style B "Energy", Inter bold about 76 px, 2-3 words per page on one line, active word amber `#FFD27A` with glow, no box.
Conflict to settle: `short-form.md` says semi-transparent box or 3 px stroke. You chose no box. PROPOSED: Energy B is the studio default and `short-form.md` is the fallback.

#### G. Publish

EXISTS (`publish-director.md`): title up to 60 chars with keyword first, first 150 chars of description restate the hook, 5-10 tags, 3-5 hashtags, thumbnail concept of 3-5 words, chapter markers.
PROPOSED add (from the deck and rule 9): caption format = hook line, three short story lines, takeaway, one question about the viewer's work, one ask, five lowercase hashtags, **source list**, AI-label note if anything was generated.

---

## 4. Route inventory

"Available" means the registry reports it. "Verified" means it rendered on this machine (per memory and `docs/route-probes/`). The registry reports **164 tools**. By capability:

### 4.1 What works at $0 on this PC

| Need | Route | Evidence |
|---|---|---|
| Composition | **Remotion** (concurrency 2), **HyperFrames**, **ffmpeg** | Remotion verified (3 shorts). HyperFrames verified for Three.js plates. |
| 3D plate | **Blender 4.5.10** (`blender_world`, Cycles CUDA) | Verified (solar video, v2) |
| 3D web scene | **Three.js world** (`threejs_world`, blockout tier) | Verified small and v3. Production tier needs Kenney zips (manual download) |
| Math / chalkboard | **Manim** (`math_animate`, 300 s timeout, plain text, no LaTeX) | Verified (v4) |
| Diagrams | `diagram_gen` (Mermaid), `code_snippet` (Pygments) | Available, `diagram_gen` untested |
| Character animation | 6 tools (`svg_rig_builder`, `pose_library_builder`, ...) | Available, UNTESTED here |
| Voice | **Piper**, **Kokoro** (outside registry) | Verified |
| Transcription | `transcriber` (WhisperX) | Verified |
| Music | `music_library`, `pixabay_music`, `freesound_music` (needs key) | Pixabay verified once |
| Video post | `video_compose`, `video_stitch`, `auto_reframe`, `silence_cutter`, `color_grade`, `audio_mixer`, `audio_enhance`, `showcase_card`, `green_screen_*` | Available. Compose and mixer verified |
| Screen capture | `screen_recorder`, `cap_recorder` | Available, UNTESTED |
| Source ingest | `video_downloader` (yt-dlp) | Available. Rights are on you |
| Publish | `export_bundle` | Available |

### 4.2 What the registry lists but we cannot use

| Capability | Why unavailable | Count |
|---|---|---|
| `image_generation` | No keys, 4 GB VRAM. Includes `pexels_image`, `pixabay_image`, `image_selector` (stock needs API keys) | 32 (0 working) |
| `video_generation` | Paid APIs, or local models that need more than 4 GB VRAM (`wan_video`, `ltx_video_local`, `hunyuan_video`, `cogvideo_video`) | 36 (0 working) |
| `tts` (other than Piper) | Paid. `tts_selector` works, but only for Piper | 20 (2 working: Piper and the selector) |
| `music_generation` | Paid, or needs CUDA 12.8 (ACE-Step) | 8 (0 working) |
| `avatar`, `lip_sync`, `talking_head` | Paid, or GPU | 5 |
| `upscale`, `face_restore`, `bg_remove` | GPU or extra install | 4 |

Stray keys: `OPENAI_API_KEY` and `GEMINI_API_KEY` exist. `openai_*`, `sora`, `google_*`, `gemini_*` may show "available" and **may bill**. `lib/spend_policy.py` blocks them in code. Skill scripts that call them directly are not covered (list in `CLAUDE.md`).

### 4.3 Looks (style cards in `styles/library/`)

Six cards exist (`styles/library/README.md` is the seventh file). Only `blueprint-isometric` is marked verified. `chalkboard-derivation`, `clean-data-motion`, `night-city-neon`, `paper-cutout-diorama` and `tabletop-miniature` still say `status: untested` in the card, even though v2, v3, v4 and the paper reel were rendered with some of them. The cards were not updated after those builds.

### 4.4 Per-scene route choice

`route-and-style` skill: `blender | threejs | manim | remotion | cinematic | hybrid`. `cinematic` needs generation, so it is flagged unusable. Rough cost on this PC (my measurements from memory, not benchmarks): Remotion paper reel full render about 26 min (SVG filters), Manim v4 about 5 min plate plus 4 min overlay, Three.js v3 about 4 min plate, Blender hero scenes heavier.

---

## 5. Visual sourcing via Pexels in Chrome (PROPOSED, UNTESTED)

Why: the API route is dead (no key) and you approved the browser route. This is the same as you picking stock by hand, with Claude doing the clicking.
Constraints I would keep:
- Use only the public Pexels site in your signed-in Chrome. No scraping with forged headers, no API-key tricks.
- One page per clip or photo, read the licence on the file's own page, and log it.
- Stop and ask if Pexels shows a captcha or block. Do not imitate a browser session.

Protocol per scene:
1. Read the scene's `action_beat` and `visual_source`.
2. Search with the stock query card (section 3.1 C). Open the three best candidates and read titles and descriptions.
3. Download to `projects/<id>/assets/stock/<scene>-<n>.<ext>` on D:.
4. Write the asset into `asset_manifest` with `provider: "pexels-manual"`, `original_url`, `license`, `scene_id`, `source_tool: "chrome-manual"`. (These fields exist in the schema.)
5. Show a contact sheet of all picks at the assets gate. You approve or swap per scene.
6. On-screen credit tag if the licence or our rule 9 asks for it.

Open question: Pexels video for vertical reels is plentiful, but I have not tested a download through the extension, nor checked file sizes against your small C: drive (downloads default to the browser's folder, so redirect or move them to D:).

---

## 6. Rework: when a scene, voice or visual is wrong

### 6.1 How state works (verified in `lib/checkpoint.py` and the schemas)

- Each stage writes `projects/<id>/checkpoint_<stage>.json`. A re-run **archives** the old one to `history/`, so nothing is lost.
- `get_next_stage(pipeline_dir, id, 'animated-explainer')` finds where to resume. It must be given the pipeline name.
- Scenes have stable ids in `scene_plan`; assets point to them with `scene_id`. So redoing one scene means changing that scene's entries and regenerating only its assets.
- `lib/asset_cache.py`: generated assets are keyed by content, so changing one prompt changes only that key. Designed for paid generators. I have **not** checked that the local tools (Piper, Remotion) use it.
- Changed decision? Append a new `decision_log` entry with the **same** `category` and `subject` (rule 6).
- **Not built:** an invalidation helper that tells you what a change makes stale. That is manual today.

### 6.2 Rework matrix

| What went wrong | Go back to | Regenerate | Then re-do | Cost of the change (my estimate) |
|---|---|---|---|---|
| One scene's picture or motion | scene_plan entry (if the idea changes) or asset only | That scene's assets | Edit for that cut, Compose | Small to render, **but the full render dominates** |
| Wrong stock image | assets gate | Pick a new file, update manifest | Edit, Compose | Small |
| A word or fact in the script | script | That section's narration only | Section timing, Whisper words, captions, scene timing, Compose | Medium, because timing shifts everything after it |
| Voice sounds flat | `voice_performance` plan (script) | One sample, then all sections | Loudnorm, words, captions, mix, Compose | Medium |
| Pronunciation | `pronunciation_guides` in script | Only that section | As above | Small to medium |
| Captions look wrong | Edit / Compose config | Nothing generated | Compose | Render only |
| Music too loud or wrong mood | Edit audio layer, or pick a new track | Mix only | Mux (ffmpeg), no re-render if Remotion renders `--muted` | Small |
| Whole look is wrong | proposal or scene_plan style | Most assets | Most stages | Large, needs your approval |

### 6.3 How easy is it in practice (from the reels already built)

- **Easy:** swapping a still, changing caption style, remixing music, changing one scene's code, patching frames. For Remotion, `--frames=a-b` re-renders only a range and ffmpeg splices it. That is how the paper reel was patched without another 26-minute render.
- **Awkward:** any voice or script change. Narration is per section, assembled on a timeline, so one longer line moves every cue after it, and the word timings, the Remotion composition and the caption pages all have to be regenerated.
- **Hard:** a full re-render costs minutes to tens of minutes on this PC, and the reaper can kill background jobs. I do not restart killed jobs on my own.
- **Gaps to close:** (1) a one-line "what became stale" report after any change, (2) a scene-level re-render command in the studio skill, (3) timing stored once and read by both voice and composition, so a change does not mean hand-editing.

---

## 7. What the Instagram Reel deck adds

Source: `AI_Builders_Make_a_Reel_Together_21Nov2026.pptx` (25 slides, compiled by Pankaj Singh, AI Builders session). Mapping against what we already have:

| Deck idea (slide) | Already in the studio? | Action |
|---|---|---|
| **Six-part script spine** with times: hook 0-3, bridge 3-6, setup 6-15, turn 15-28, takeaway 28-35, next step 35-42 (11, 12) | Partly: `script-director` uses hook / setup / build / climax / landing | **Adopt** as the short-form template (card A) |
| **Script table prompt**, 4 columns (13) | No | **Adopt** with a fifth column for source and our action column |
| **Voice never reads the on-screen card**; "cut lines, never speed up voice" (11, 14, 19) | Matches our pacing preference, not written down | **Adopt** as a rule in the voice card |
| **Frame 0 is the cover**; open bright; no still in first 5 s; deliver the promise by 3 s (15) | Partly (`short-form.md` 1-second hook) | **Adopt** frame-0 check at scene_plan |
| **Four hook patterns** and "three variants, pick with sound off" (16) | No | **Adopt**: generate four hooks at the script gate, present as a choice |
| **Five script review checks** (one idea, stakes spoken, repeatable takeaway, ask once, reads aloud) (14) | No | **Adopt** as the script gate checklist |
| **Safe zone** x 80-980, y 240-1600; captions near y 1290 (19, 20) | Different: `short-form.md` says universal 900x1400 centred, Reels 996x1400 | **Reconcile**: Reels-specific zone for reels. Deck is within 10 px of our Reels row |
| **Eight pre-publish checks** and 3 commands (frame 0, ffprobe, loudnorm) (20) | Partly: `studio_report.py`, `cost-and-qa`, final-review stage | **Adopt** as the publish gate. Add a script that runs the three commands |
| **-14 LUFS, true peak -1.5, 1080x1920, 30 fps, H.264** (20) | Matches our mixes | Keep |
| **Four-reel sequence**: Teach, Prove, Give, Offer (6) | No. Pipelines handle one video | **New layer**: a client campaign plan above the pipeline. Fits "many videos in a short span" |
| **Freebie keyword in video and caption**; UTM; track replies per reach (6) | No | **Adopt** into the publish caption card |
| **Caption format** and **first-hour routine**, 48-hour metrics, change one variable per week (21) | No | **Adopt** as a post-publish log template |
| **Licence rules**: no logos, no stock face as customer, label AI images (10) | Rule 9 covers facts, not licences | **Adopt** into the stock card |
| **Type A / B / C** (text on motion, talking head, animated scene) (9) | Partly: our pipelines | Map to `animated-explainer`, `talking-head`, `animation` |
| **"Check a still at each part, review, fix, then render once"** (18) | Matches our still-first review | Keep |
| Nano Banana, Veo 3.1, Flow, ElevenLabs, Whisper by OpenAI (10, 8, 19) | Conflicts with $0 rule or already covered locally | **Do not use** without your approval. Whisper is replaced by local WhisperX |
| **Remotion licence**: free for individuals and companies up to three people (8, 18) | Not recorded anywhere | **Check this**: client work for a company larger than three people needs a licence. Not verified by me from the licence text, so confirm at remotion.dev |

One mismatch worth knowing: the deck's default is a **40-second** reel with **~42 s of script**, our recent reel was **46.5 s** and your taste note says 40-50 s is soft. No conflict, but the deck's spine is tighter.

---

## 8. Decisions I need from you (nothing below is done)

1. **Make the PROPOSED cards active?** I would put them in one new skill, `.claude/skills/studio-prompts/`, that the stage directors point to, so there is **one place** to edit prompts and the 155 KB of director files stay untouched. Alternative: edit the director files directly (more invasive, harder to update from upstream).
2. **Pexels via Chrome:** approve the protocol in section 5, and I run one test (a single vertical clip) before relying on it.
3. **Short-form spine:** adopt the deck's six parts as the default for reels, keeping the existing arc for long-form.
4. **Campaign layer:** do you want a `campaign plan` template (Teach, Prove, Give, Offer) for client batches?
5. **Rework tooling:** build the small "what is stale" report and the scene-only re-render command?
6. **Captions:** confirm Energy B as studio default (deck wants lowercase hashtags and captions at y 1290; Energy B position not recorded in memory).

## 9. What I did not verify

- Directors for the other 11 pipelines, and the full text of research, proposal, edit and compose directors (only outlines read).
- Whether the EP file is run as a separate agent.
- Whether `asset_cache` applies to local tools.
- Any Pexels download through Chrome on this machine.
- The Remotion licence terms, and the registry counts (taken from one `registry.discover()` call today).
