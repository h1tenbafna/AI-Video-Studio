---
name: studio-prompts
description: The single place where this studio's prompts, intake brief, style chooser, stock-sourcing protocol and rework rules live. Use at the start of any reel/short/explainer, at every stage (research to publish), and whenever the user wants to change a scene, script line, visual, voice or music.
---

# Studio prompts (one place to edit)

**Edit prompts here, not in the 155 KB of director files.** The director skills (`skills/pipelines/<pipeline>/<stage>-director.md`) still define
schemas, artifacts and gates. These cards only set the **wording, defaults and checks** for this studio. If a card and a director disagree on
*wording or taste*, the card wins. If they disagree on a *gate, schema, $0 rule or provider rule*, `CLAUDE.md` and the director win.

## The user owns the creative decisions
1. Start every production from `brief-template.md`: copy it to `projects/<id>/creative_brief.md` and fill it with the user (batch the questions, with a recommended default for each).
2. **Anything the user wrote in the brief or in chat is LOCKED.** Propose only for blanks. Never silently change a locked field (topic, angle, length, hook line, script wording, look, voice, music, a chosen stock clip). To change one, ask.
3. At each stage show the output and the **levers** the user can pull (listed per stage in `prompts.md`). End the turn at gates.
4. Edits are surgical: if the user changes one script line or one scene, change only that, then report what became stale (`python scripts/studio_stale.py <id>`).

## Files
| File | Use it for |
|---|---|
| `reel-flow.md` | **The `/reel` front door**: style menu from the full inventory, saved themes, character series, quality bar, theme saving |
| `brief-template.md` | Intake: the creative brief the user fills in |
| `script-spine.md` | Script notes distilled from the AI Builders deck: spine, hooks, checks, captions, post |
| `scene-motion.md` | Make every scene alive: verb -> animation table, per-look motion, mute test |
| `prompts.md` | One card per stage: research, proposal, script, hooks, scene plan, stock query, code-made scenes, voice, music, captions, QA, publish, rework |
| `style-chooser.md` | Topic type -> look, route, voice, music, length. What each look cannot do |
| `stock-chrome.md` | Pexels via Chrome: protocol, licence logging, download approval |
| `campaign-template.md` | Client batches: Teach / Prove / Give / Offer, brand file, parallel gates |

## Honesty rules (apply to every card)
- Say which level of evidence a route has: run `python scripts/studio_routes.py`. VERIFIED, CRUDE, BROKEN, UNTESTED, NEEDS KEY, BLOCKED are the only levels. Never describe an UNTESTED route as working.
- Offer only routes that are VERIFIED (or say plainly it is a test). Never offer BLOCKED ones except to say they are blocked and what the local alternative is.
- External spend stays $0. Downloads need the user's explicit yes (filename, source, size). Nothing is posted by Claude.

## After a change
`python scripts/studio_stale.py <id>` (what is stale) -> fix only that -> `python scripts/studio_rerender.py <id> --scene sN` for one scene of a Remotion project -> show stills -> `--mark-built` once the user approves.
See `docs/REWORK_GUIDE.md`.
