# Scenes that are alive (rule 8, applied)

Every scene must show what the narration says as a visible action, synced to a narrated word. Ask of each scene: **"does this move and still explain itself if I mute it?"** Fail = redo or flag as a deliberate still (a silent closing card only).

## How to pick the motion (3 questions)
1. What is the **verb** in the line? (taps, hires, sends, grows, splits, compares, breaks, connects). That verb is the animation.
2. What is the **object**? (phone, cab, money, chip, person). Draw the object, not a label for it.
3. Which **word** does the action land on? Write it in `action_beat`: "thumb taps phone @ 'tap'". The kit's word-timing file gives the frame.

## Verb -> animation (pick per look; all exist in or can be built from our kits)
| Narration says | Show | Motion recipe |
|---|---|---|
| a flow of money, goods, data | arrows or tokens travelling a path | line draws on, then tokens ride the path; dashed "planned" becomes solid when reached |
| a number grows or falls | counter + bar/ring | count up over the word, ease-out, overshoot 4% |
| a comparison (X vs Y) | two objects side by side | both enter, one scales up / the other dims on the winning word |
| a step in a process | the part moves into place | slide along its axis, snap with short overshoot, tag draws in |
| a person does something | the figure performs it | pose swap or walk/hand action at the word; the prop reacts (cab arrives, door opens) |
| a cause then effect | chain reaction | A moves, a beat, B reacts, camera pushes to B |
| a list of items | items drop in one per spoken item | stagger on each word; never all at once |
| something breaks / risk | the part cracks, flashes, wobbles | red accent once, 6-frame shake, then settles |
| scale (small to huge) | camera pull-back or zoom | scrolling sheet or dolly between beats |
| a definition / takeaway | one clean card | the only allowed near-still: type on word by word, 1 s of silence before it (deck) |

## Per look
- **Blueprint**: line-draw before fill, parts slide on axis, camera scrolls down the chain, part tags with leader lines.
- **Paper**: layered parallax, figures pop up from the fold, hands and props animate on the verb.
- **Blender 3D**: camera path through the scene, light changes with the idea (sun, glow), objects travel real paths.
- **Chalkboard/Manim**: write, transform, highlight; each equation line appears on its word.
- **Clay**: characters turn, nod, point; props enter lanes on the word; reaction shot after the punchline.
- **Stock + text**: footage already moves; match the clip's action to the verb, and text animates on the word.
- **Anime/cartoon/office/human (untested)**: build one scene as a test, show a still sequence, then proceed.

## Rhythm rules
Visual change every 1-3 s; one motion idea per scene; frame 0 shows the subject, bright, never a fade-in; no still frame in the first 5 s; 3+ scene types, never 3 of the same type in a row; sound design: a soft whoosh or click on each action beat (louder than the first reel, user preference).

## Scene plan line (use in the scene plan card)
`sN | t0-t1 | words | route+style | action_beat | motion recipe | mute_test pass/fail | source tag (if a fact)`
