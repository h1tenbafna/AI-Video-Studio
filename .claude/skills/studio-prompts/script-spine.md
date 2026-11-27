# Script notes from the deck "AI Builders: Make an Instagram Reel" (21 Nov 2026)

Source: `AI_Builders_Make_a_Reel_Together_21Nov2026.pptx` (compiled by Pankaj Singh). Distilled here so the agent need not reopen the file. Use with card 3 and 4 of `prompts.md`.

## Offer test
A reel carries a promise, one proof, one next step. Viewer test: they can say what it is, why it matters, and the one thing to do. If one is missing, fix the script, not the edit.
Lengths: 20 s = one idea, one proof; **40 s = default**; 60 s only for a case or walkthrough. Over length: cut lines, never speed up the voice (a rushed voice reads as AI). Detail in the first 10 s, simple last 10 s.
Four-reel funnel: 1 Teach (no ask beyond follow), 2 Prove (a real example, number, before/after), 3 Give (freebie, "comment MAP"), 4 Offer (paid thing, named once). Never put the freebie in reel 1. Track replies per reach, not likes.

## Six-part spine (scale to length)
HOOK 0-3 s (line + picture at frame 0, subject visible, no fade-in) -> BRIDGE 3-6 (where it is going; keep moving) -> SETUP 6-15 (situation and the stakes SAID aloud) -> TURN 15-28 (what changed + the one number that proves it) -> TAKEAWAY 28-35 (idea in plain words on a card, about 1 s silence before it) -> NEXT STEP 35-42 (save / send / follow / freebie word, once).
Script table columns: time | voiceover | on-screen text | visual. Add ours: action_beat | source. Mark every line a card already shows; the voice skips those words. Narration explains the gap and the impact; it never reads the card aloud.

## Writing rules
Short spoken lines, contractions, plain words, no em dashes. One idea only (two ideas = two reels). Takeaway repeatable by a colleague tomorrow. The ask appears once in the video and once in the caption. Read aloud against a timer; over 45 s cut lines. After drafting ask: "where does a viewer swipe away, and why? cut 8 seconds".

## Hook (first 3 s)
Frame 0 is the cover: hook text + subject visible. Open bright (a face or recognisable object). Name the audience in a small line. Keep moving to 5 s. Deliver the promise by 3 s and leave one gap a later scene fills. Four patterns: surprising question, dated contrast, direct decision, positive promise (list reels). No vague dares. Test: sound off, phone, arm's length. Put topic and brand/framework name in on-screen text and the first caption line.

## Visuals and assets
Vertical 9:16. Keep one master image as reference so a person/place stays consistent. Stock: read the licence on the file's page, no logos or brand text, no stock face presented as the customer. Label generated or illustrative images on screen; turn on the platform AI label. Image prompt shape: `vertical 9:16, [subject], bright daylight, shallow depth of field, no text, no logos, clear space at the top for a headline`. (In this studio: external generation is BLOCKED; use code-made scenes, Blender, or Pexels via Chrome.)

## Captions, voice, mix
Captions word by word (Whisper), highlight the active word, two lines max, low (about y 1290) and never over a face; fix names and numbers by hand. One voice take with one delivery note; one small tempo lift at most. Music instrumental, about 0.2 volume (this studio ducks lower), ducked under the voice. Loudness -14 LUFS, true peak -1.5 dB.

## The eight pre-publish checks
1 frame 0 as a thumbnail; 2 text inside x 80-980, y 240-1600; 3 captions low, clear of faces; 4 1080x1920, 30 fps, H.264; 5 -14 LUFS, TP -1.5; 6 listen once on a phone speaker; 7 every number sourced, illustrative labelled; 8 the ask once in video and once in caption.
Commands: `ffprobe -v error -show_entries stream=width,height,r_frame_rate final.mp4`; `ffmpeg -i final.mp4 -af loudnorm=print_format=summary -f null -`; `ffmpeg -i final.mp4 -vframes 1 frame0.png`.

## Post and measure
Caption: hook line first (same words as frame 0), three short story lines, takeaway, one question, the ask, five lowercase hashtags. First hour: keep original audio, AI label if anything generated, send to 5-10 people, pin a first comment. At 48 h log views, 3 s skip rate, watch time, saves, sends, follows, profile visits; change one variable per week. One reel at 40 views tells you nothing.

## Visual-first scripting (measured from the clay reference reels, 2026-11-27)
Measured on a 67 s reference: 35 shots, 1.9 s and about 5 words per shot; every cut lands on a new phrase. Notes: `docs/REFERENCE_NOTES_CLAYRIFIED_2026-11-27.md`.
1. **Shot list first, words second.** One clause = one shot (1-2.5 s, about 4-7 words). A 45 s reel has about 20-25 shots.
2. **Every clause names something the camera can see**: a noun doing a verb (drags, kneels, peels, drops). Rewrite any clause you cannot draw.
3. **Abstract ideas become physical images.** Jealousy = "rub a little off them". Modern-life pivots use 3 concrete everyday scenes, one shot each.
4. **One central object carries the story** (the chalk, the bookmark). It opens the story, solves it, and the last line pays it off physically ("Pick up the chalk.").
5. **The image arrives with the word**: cut on (or just before) the key noun.
Check: read each clause aloud and say what is on screen. If you cannot, rewrite the clause.
