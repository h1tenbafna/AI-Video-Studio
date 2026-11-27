# Prompt cards (edit here)

Each card: **Prompt** (what Claude follows), **Checks** (what must be true before showing the user), **Levers** (what the user can change at this stage).
Brackets are filled from `creative_brief.md`. Locked fields are never changed without asking.

---
## 0. Intake  (before `init_project`)
**Prompt:** Read `brief-template.md`. Ask the blanks in one batched question with a recommended default each. Show the filled brief back, then lock it. Run `python scripts/studio_routes.py` and `python scripts/studio_preflight.py`; say what is VERIFIED for this brief.
**Checks:** one idea only; length chosen; look is either user-chosen or recommended from `style-chooser.md` with a reason; no BLOCKED route promised.
**Levers:** everything.

## 1. Research  (research-director)
**Prompt:** Research [topic] for [audience]. Map 3+ existing pieces, find 3+ different angles each grounded in a finding, 3+ specific data points, 5+ sources with URLs, and real audience questions (forums, comments), not invented ones. Use the current date in queries. Mark every figure with its source URL. Anything only found in one source or behind a block: UNVERIFIED.
**Checks:** every number has a URL; UNVERIFIED items listed separately; angles differ in structure, not just wording.
**Levers:** pick or reject angles; add your own facts; ban sources or claims.

## 2. Proposal  (proposal-director) — GATE
**Prompt:** Offer at least 3 concepts (different hook, structure and look). For each: working title, hook, core message, structure, length, recommended look from `style-chooser.md` with one-line reason, and what it would NOT be good at. Then present: both composition runtimes (Remotion, HyperFrames) with a recommendation; authoring mode (templated or atelier; atelier for hero work); voice; **music plan with 3 options**; visual sourcing plan (stock via Chrome, code-made, supplied); a cost table (external spend $0; say time estimates are estimates); the route evidence level for each part.
**Checks:** nothing BLOCKED in the plan; evidence level stated; decisions logged (`decision_log`, same category and subject when changed).
**Levers:** concept, look, runtime, authoring mode, voice, music, sourcing, length. END THE TURN.

## 3. Script  (script-director) — GATE
**Prompt (short-form, 20-60 s; the deck's spine):**
```
Write a [40]-second vertical script for [audience] about [one idea].
Return a table: time | voiceover | on-screen text | visual action | source.
Six parts: hook 0-3 s, bridge 3-6, setup 6-15, turn 15-28, takeaway 28-35, next step 35-42 (scale to length).
Rules: short spoken lines, contractions, plain words, no em dashes.
Visual-first (script-spine.md): write the shot list first; one clause = one shot (1-2.5 s, 4-7 words);
every clause names a visible noun doing a verb; abstract ideas become physical images;
one central object opens, solves and pays off the story in the last line; cut on the key noun.
The voice never reads the on-screen card aloud. Say the stakes out loud.
Visual action: a literal action tied to a spoken word (a thumb taps a button and the cab arrives).
Flag any row that is deliberately a still card.
The takeaway is one sentence someone could repeat tomorrow.
Every number or quote has a source URL; unverified ones are marked UNVERIFIED and are not locked.
Premise before data: show a cause before the statistic.
End on one ask: [save | send | comment WORD]. Say it once.
Also give 4 hook options (card 4) and a voice_performance plan (card 8).
```
**Prompt (long-form):** use the director's arc (hook, setup, build, climax, landing), 150 wpm, `enhancement_cues` about every 8-10 s.
**Checks (the deck's five):** one idea; stakes spoken aloud; takeaway repeatable; ask once; reads aloud in time (over length = cut lines, never speed up the voice). Word budget: 40 s = about 95-100 words at 150 wpm; 30 s = 70-80.
**Levers:** edit any line (it stays word for word), swap the hook, change length, change the ask, add or remove facts. Ask once: "where does a viewer swipe away, and why? cut 8 seconds" if the user wants a tighter cut. END THE TURN.

## 4. Hooks
**Prompt:** Write 4 hooks, one per pattern: surprising question, dated contrast, direct decision, positive promise. Each = frame-0 text + first spoken line. Frame 0 shows the subject, bright, never a fade-in. No vague dares ("Would you dare to..."). Search words (topic, brand) in the on-screen text. Read frame 0 alone: does it work with the sound off?
**Levers:** pick one, mix two, write your own.

## 5. Scene plan  (scene-director + `route-and-style`) — GATE
Pick each scene's motion with `scene-motion.md` (verb -> animation). Script spine and hook rules: `script-spine.md`.
**Prompt:** Cover the full duration. For EVERY scene write: id, time range, narrated words it covers, scene type, route + `style_id`, the 5 aspects (subject, subject motion, scene, spatial framing, camera or "N/A - Remotion native"), overlays listed separately, and three extra fields:
```
action_beat:   the visible action and the word it lands on ("thumb taps phone @ 'tap'")
mute_test:     pass | fail   (does it move and explain itself with sound off?)
visual_source: code-made | stock-pexels-chrome | blender | manim | threejs | supplied  + the search query or file
```
A scene with `mute_test: fail` needs a "deliberate still" flag and a reason (a silent closing card is fine).
**Checks:** no still frame in the first 5 s; frame 0 shows the hook subject; 3+ scene types; no 3 same type in a row; text 2-4 s per block; visual change every 1-3 s; safe zone for the platform (Reels: keep text inside x 80-980, y 240-1600; captions near y 1290); every route VERIFIED or flagged as a test.
**Levers:** per scene: swap route/look/source, change the action, change timing, merge or split scenes. Show a contact sheet of stills before any render. END THE TURN.

## 6. Stock query  (see `stock-chrome.md`)
**Prompt:**
```
Search "[concrete subject]" + "[setting]", orientation portrait, largest size.
Reject: logos, brand text, watermarks, recognisable stock faces as "the customer", dark openers.
Prefer: bright daylight, a visible action that matches the narrated word, clear space at the top.
Open the 3 best; log for each: URL, creator, licence line, duration, dimensions, why it fits the word.
```
**Levers:** pick per scene from the contact sheet; ask for 3 more; supply your own.

## 7. Code-made scene (Remotion kits)  (asset-director, atelier)
**Prompt (pre / critique / post, from the director):** 1) write the scene as you would; 2) critique it on the 5 aspects and replace vague words ("modern", "clean") with visual causes (type, spacing, palette, motion); 3) rewrite, then render a still and LOOK at it before anything else. One motion idea per scene. Layer order matters; check the title is not hidden behind a later layer.
**Checks:** still reviewed; text at least 30 px for source tags; orange/low-contrast text not used for reading; no overlapping leader lines.
**Levers:** palette, shapes, timing, what moves.

## 8. Voice  (voice-performance-director)
**Prompt:**
```
Voice performance: [warm | urgent | calm], pace [conversational ~150 wpm],
energy curve [hook measured, middle warmer, close deliberate].
Pause policy: 0.4-0.6 s after setup lines, a beat before the turn, ~1 s before the takeaway.
Never speed up to hit length; cut lines instead. Spell out numbers and names the voice may mispronounce (pronunciation_guides).
Generate ONE sample section first. User approves. Then batch.
After generating: verify the words with Whisper, loudness-match each section (-15 LUFS), assemble on a timeline.
```
**Routes:** Kokoro `af_heart` (warmer; outside the registry) or Piper `en_US-ryan-high` (neutral). Both VERIFIED. Others BLOCKED.
**Levers:** voice, pace, a pause, one word's pronunciation, re-record one section (see REWORK_GUIDE).

## 9. Music and SFX
**Prompt:** Offer 3 tracks (mood, length, source, licence) from `pixabay_music` / `music_library` / `freesound_music` (key needed). Instrumental, no vocal samples. Under voice: ducked; final mix -14 LUFS, true peak -1.5 dB. Silence under a deliberate silent end card. SFX: +4 dB default with punchy hero hits, verify the narration is still intact by STT.
**Levers:** track, volume, fade, SFX on/off.

## 10. Captions
**Default:** style B "Energy": Inter bold ~76 px, 2-3 words per page, one line, active word amber `#FFD27A` with glow, no box, low on the frame (about y 1290), clear of faces. Fix names and numbers by hand (Whisper guesses both). Hide the caption on the hook line if the title shows the same words.
**Fallback:** `skills/creative/short-form.md` (box or stroke) only if the user asks.
**Levers:** style, position, words per page, highlight colour.

## 11. Compose and QA  (compose-director; the deck's eight checks) — one render
**Prompt:** Check one still per scene first, fix, then render ONCE (Remotion concurrency 2, libx264). Then run:
```
ffprobe -v error -show_entries stream=width,height,r_frame_rate final.mp4          # 1080x1920, 30 fps, H.264
ffmpeg -i final.mp4 -af loudnorm=print_format=summary -f null -                   # about -14 LUFS, true peak -1.5
ffmpeg -i final.mp4 -vframes 1 frame0.png                                          # frame 0 as a thumbnail
```
Eight checks: frame 0 as thumbnail; text inside x 80-980, y 240-1600; captions low and clear of faces; 1080x1920 30 fps H.264; loudness; listen once start to finish; every number sourced (illustrative ones labelled); the ask appears once in the video and once in the caption. Look at rendered frames: automated checks false-alarm on burned-in captions.
**Levers:** point at any second ("the cab scene, 12 s") and say what is wrong -> REWORK_GUIDE.

## 12. Publish — GATE
**Prompt:** Caption = hook line (same words as frame 0), three short story lines, the takeaway, one question about the viewer's own work, the ask (once), five lowercase hashtags, **source list**, and the AI-label note if anything was generated. Title up to 60 characters, keyword first. Thumbnail/cover: frame 0 or a chosen frame inside the grid crop. Post-publish log template: views, 3-second skip rate, average watch time, saves, sends, follows, profile visits at 48 h; where the retention line drops; ONE variable changed per week (hook type, length, close, voice, real vs illustrative). Claude never posts.
**Levers:** wording, hashtags, cover frame, ask.

## 13. Rework request  (user says something is wrong)
**Prompt:** Restate the problem in one line and classify it: script wording | scene idea | visual | animation timing | voice | music | caption | overall look. Run `python scripts/studio_stale.py <id>` after the change. Fix ONLY that item using the matrix in `docs/REWORK_GUIDE.md`. Say what else it touches and the time it will take (label estimates). Show a still or a short patch before any full render. Append a `decision_log` entry with the same category and subject if a decision changed. Never rebuild unrelated scenes.
**Levers:** "undo", "try another option", "keep everything else".
