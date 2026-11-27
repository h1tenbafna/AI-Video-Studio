# Campaign template (client batches)

Use when a client wants several videos in a short span. One pipeline run makes ONE video; the campaign sits above it.
From the AI Builders deck: split teaching, proof, the freebie and the paid offer across four reels. (Template, not yet used on a real client.)

## Client brand file  `projects/_clients/<client>/brand.md` (make once, reuse for every video)
Palette (3-5 hex), fonts (file path), logo (path), voice (Kokoro / Piper + settings), caption style, music mood, tone words, banned words/claims,
look (one style card), safe-zone profile, CTA keyword, link + UTM pattern, contact for approvals.

## Four-video sequence
| # | Role | Job | Ask | Length |
|---|---|---|---|---|
| 1 | Teach | One idea they can use on Monday | follow only | 20-40 s |
| 2 | Prove | Same idea on a real example: a number, a before/after, a screen | none or save | 40 s |
| 3 | Give | The freebie ("Comment WORD and I'll send it"), same word in video and caption | the keyword | 20-40 s |
| 4 | Offer | The paid thing, named plainly, once | one next step | 40 s |
Do not put the freebie in video 1. Ask once, after two videos that were useful alone.

## Plan table (fill per client)
| # | Role | Topic / one idea | Hook pattern | Look | Voice | Facts to source | Ask | Target date | Status |
|---|---|---|---|---|---|---|---|---|---|

## Doing many fast (this machine)
- Reuse the brand file, the look's kit and the captions; only text, timings and assets change.
- Gates run in parallel per video: send all scripts for approval together, then all scene plans, then render. One render at a time (4 GB VRAM, 7.8 GB RAM, Remotion concurrency 2).
- Render time dominates: about 2 min for a Remotion blueprint short, about 26 min for the paper look. Label these as estimates in the plan.
- Record per video: what shipped, 48-hour numbers, the one variable changed. Change one variable per week.
