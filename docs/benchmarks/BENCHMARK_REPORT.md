# Benchmark: `sunlight-to-electricity` (production #1)

Baseline for judging whether the studio is becoming reusable. Written 2026-11-18, read-only: no file in the
solar project was modified.

**Labels:** **[M]** measured from logs or files. **[D]** derived from measured data by arithmetic. **[E]** estimate or
recollection (source named). **[U]** unavailable, not recorded anywhere.

## 0. Immutability

`projects/` is gitignored, so git does not protect this project. Fingerprints of the deliverable (SHA-256):

| File | SHA-256 |
|---|---|
| `renders/sunlight_to_electricity_final.mp4` | `f24f713e80e03cfef6fd33707a328c9e72b997026f6e3c490656a27daf2cc3df` |
| `renders/compose_result.json` | `3724060a19df7f1cfffbef6c6c0be8b86651435d5368c1a00b2fde306ef7332c` |
| `artifacts/render_report.json` | `78498f5c2e49cbc339f20ba87fd576ba4ce7c6e226e6c018d1ac48676b73ec15` |

Recommended (not done): copy the final MP4 and `artifacts/` to a backup folder on D:.

## 1. Deliverable [M]

30.06 s, 1080x1920 (9:16), 30 fps, 900 frames, H.264 + AAC 48 kHz stereo, 47 MB (`artifacts/final_review.json`).
Loudness -13.9 LUFS, peak -1.6 dBFS. Narration vs script by speech-to-text: 98.1 % (79 vs 80 words, "built-in" split in two).

## 2. Route and tools [M unless noted]

- Pipeline `animated-explainer`; renderer family `animation-first`; runtime Remotion; mode atelier.
- Visuals: Blender 4.5.10 (Eevee Next, 48 samples, AgX), six scenes, 968 PNG frames, hand-written `sun2e.py`.
- Composition: hand-authored Remotion (`remotion/Film.tsx`): dissolves, style-B captions, 8 tracked labels, grain, vignette.
- Narration: Piper `en_US-ryan-high`. Music: Pixabay "Ever (Piano Documentary)" by leberch. SFX: procedural numpy.
- External providers: **none billed.** Gemini TTS was attempted 3 times and failed (no TTS access on the key). Pixabay music search (free).
- Claude model: `claude-opus-5-5` (transcript). Effort: Medium (**stated by the user, not in logs**).

## 3. Time

Project created 2026-11-16 20:35:20 UTC. Final compose checkpoint 2026-11-17 09:54:11 UTC.

| Stage (checkpoint time, UTC) | Elapsed since previous | Note |
|---|---|---|
| research (20:42) | 7 min [D] | |
| proposal (20:49) | 7 min [D] | gate, approved |
| script (21:13) | 24 min [D] | gate, approved |
| scene_plan (06:14 next day) | 9 h 01 min [D] | includes storyboard gate (first pass 21:42), look-dev, overnight wait |
| assets (09:32) | 3 h 19 min [D] | Blender finals, audio, preview, caption redesign. Gate, approved |
| edit (09:48) | 16 min [D] | |
| compose (09:54) | 6 min [D] | `video_compose` render itself 276 s [M] |
| **Total** | **13 h 19 min [D]** | wall clock, includes waits |

- **Time to first preview.** First still preview (storyboard) about 1 h 07 min after creation [D, from file and checkpoint times,
  assumes local time is UTC+5:30]. First motion preview about 12 h 39 min [D, same assumption].
- **Hands-on time.** The Claude session ran 39.5 h wall clock (it began 54 min before project creation). Only **4.6 h** is
  continuous activity (gaps of 30 min or less) [D]. The other 34.9 h is waiting: renders, gates, overnight. So the 13 h
  is mostly render and approval latency, not Claude working.
- **Blender render time:** "a few hours" for 968 frames at about 4-11 s/frame, plus about 8 min of shader compile per process [E, from
  project memory notes, never timed per scene].
- **Local tool time [M, `events.jsonl`]:** Piper 47 calls, 180 s total (3.8 s avg). Whisper 30 runs, 464 s. Stock search 1 call, 572 s (unused result).
  Final compose 276 s. Blender runs were launched from the shell and are not in the event log.

## 4. Generations, retries and revisions

| Item | Count | Source |
|---|---|---|
| Image or video API generations | **0** | [M] |
| Blender frames rendered | 968 (174, 144, 174, 186, 132, 158) | [M] |
| Piper TTS calls | 47 (incl. auditions) | [M] |
| Whisper QA runs | 30 | [M] |
| Failed provider calls | 3 (Gemini TTS) | [M] |
| Look-dev rounds | 3 (`lookdev_v2/` is the third) | [E, memory] |
| Archived checkpoint re-writes | 8 (research 2, script 2, proposal, scene_plan, assets, edit) | [M, `history/`] |
| Drafts and previews | 1 half-scale draft, 1 asset-review preview, 1 final | [M, files] |
| SFX versions | 2 (v1 subtle, v2 +4 dB), user-requested | [M, files] |
| Caption options mocked | 3 (user chose B) | [M] |
| Background jobs killed by the memory reaper | 2 (Blender itself survived) | [E, memory] |
| **Scene regenerations, per scene** | **[U]** | no per-scene log; finals were rendered once each |

## 5. Claude usage (subscription, not in OpenMontage's cost tracker)

From the solar session transcript (`d97448ce…jsonl`), calls de-duplicated by message id [M]:

| Metric | Value |
|---|---|
| API calls | 237 |
| Tool calls | 247 (Bash 183, Read 30, Write 13, WebSearch 11, PowerShell 5, Edit 2, other 3) |
| User prompts | about 33 |
| Output tokens | 267,595 |
| Cache-write tokens | 795,862 (all 1-hour TTL) |
| Cache-read tokens | 40,625,717 (avg about 171k re-read per call) |
| Uncached input tokens | 522 |

**List-price equivalent [D]** at Opus 5.5 rates ($4 input, $20 output, $0.20 cache read, $8 cache write per MTok). All 795,862
cache-write tokens are logged as 1-hour TTL [M, `usage.cache_creation`], so the $8 rate applies. The same formula reproduces
Claude Code's own `cost-state` snapshot to the cent ($3.578 from its token counts), so the formula is validated; the
inputs here are the transcript's:
output $5.35 + cache read $8.13 + cache write $6.37 + input $0.00 = **$19.85** (matches the user's "about $20").
On a Pro plan this is a share of plan limits, not an invoice.

Known gap [U]: Claude Code's final `cost-state` line reads only $3.578 (29k output tokens), about 9x below the transcript sum. Cause unresolved
(it looks like a partial counter across session resumes). The transcript-based figure is used because per-call context sizes
(compactions at 353k and 202k tokens) are only consistent with it.

Not captured [U]: the 2 auto-compaction summary calls (plausibly $0.3-$1, upper bound about $5 if the cache was cold),
2 of 239 requests with no logged response, any inner usage of the 11 WebSearch calls, plan-limit consumption, per-stage token split.
Subagents: none [M] (0 Agent/Task calls, 0 sidechain entries).

## 6. Quality

- Automated `final_review`: pass. Valid container, no black frames, narration and music present, no clipping, no runtime swap.
  Only 4 frames were spot-checked [M].
- User verdicts [M, from session]: storyboard approved; "visuals are good"; first caption burn rejected as unappealing, replaced by
  style B; music and SFX direction confirmed. No numeric quality score exists [U].

## 7. Technical limitations observed

- 4 GB VRAM and 7.8 GB RAM: Cycles is impractical, Eevee at 1080x1920 is slow (hours for 30 s).
- NVENC fails (driver 522.06, FFmpeg 9 needs 610 or later): libx264 only.
- The Blender runs sit outside the event log, so the cost tracker could not report them.
- `final_review` reported a false "no subtitles" because captions are drawn inside the composition (verified manually).
- Remotion `<Audio>` cannot sidechain-duck: audio had to be premixed with ffmpeg.
- Only 3 `decision_log` entries were recorded, so the board's Decisions rail under-represents the run.

## 8. Manual intervention

Four approval gates (proposal, script, scene_plan, assets) plus: voice choice after the Gemini TTS block; three look-dev rounds
reviewed on contact sheets; caption style pick; music pick; SFX request; the user freeing RAM and typing "continue rendering" /
"check renders" after the reaper killed jobs (twice); and a final review. The user also supplied the music direction.

## 9. Baseline metrics for comparison

| Metric | Solar baseline | Confidence |
|---|---|---|
| Total production time (wall clock) | 13 h 19 min (4.6 h hands-on) | [D] |
| Time to first preview | 1 h 07 min (still), 12 h 39 min (motion) | [D, assumes UTC+5:30] |
| External cost | $0.00 | [M] |
| Claude usage | 237 calls, 267.6k out, 40.6M cache-read tokens, $19.85 at list price | [M]/[D] |
| Generation attempts (API) | 0 (968 local Blender frames) | [M] |
| Render time | final compose 276 s; Blender "a few hours" | [M]/[E] |
| Scene regeneration frequency | not recorded | [U] |
| Final quality | review pass, 98.1 % STT, user-approved | [M] |

## 10. What carries forward (and what does not)

1. **Visual preferences (the user's taste, not a template):** premium, restrained look; amber/cyan/magenta energy coding;
   hairline labels of three words or fewer; style-B captions; loud, punchy SFX; piano-led music. Do not assume every video looks like this.
2. **Reusable methods:** Blender look-dev loop with contact sheets; `project_anchors.py` label tracking; ffmpeg premix;
   edit-builder script producing `edit_decisions.json` and film props; resume-safe Blender settings; STT verification.
3. **Project-specific, not reused automatically:** the solar scene files, Nishita sky settings, cell models, `art-direction.md`, SFX and music.
4. **Improve:** log Blender runs as tool events; scene-level render manifests; pick caption style before the asset gate; check TTS provider
   access at preflight; record `decision_log` entries; a per-stage cost and time rollup.

## 11. How the Stage 4 test will be measured

Same table as section 9, plus tool calls and retries, whether the project resumes after a restart, and whether one scene can be
re-rendered alone. Claude tokens come from the session transcript with the same method as section 5.

## Sources

`projects/sunlight-to-electricity/`: `events.jsonl`, `checkpoint_*.json`, `history/`, `artifacts/*.json`, `renders/compose_result.json`.
Claude usage: `~/.claude/projects/D--AI-Video-Studio-OpenMontage/d97448ce-*.jsonl`. Prices: Claude API skill price table (cached 2026-11-03).
Project memory notes: render timings and look-dev round count.
