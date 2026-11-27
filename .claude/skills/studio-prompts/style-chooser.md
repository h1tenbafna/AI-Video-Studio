# Style chooser: pick the look from the topic

The full menu shown to the user comes from `python scripts/studio_styles.py` (see `reel-flow.md`). This table only picks the **recommended** option.

Rule: recommend ONE look, name the runner-up, and say why. Evidence levels come from `python scripts/studio_routes.py`.
"Suggestion" lines are my judgement, not measured results. The user decides.

## 1. Quick pick by topic

| Topic type | First choice | Runner-up | Why (suggestion) |
|---|---|---|---|
| People, relationships, history, habits, emotional stories | **paper-cutout-diorama** | stock footage + text | Tactile, warm, easy to show a person doing something. Built and chosen by the user (46.5 s). |
| AI / tech / infrastructure / how a system works | **blueprint-isometric** | night-city-neon | Parts, labels and flows read clearly. Built (40 s). |
| Business flow, supply chain, physical process | **tabletop-miniature** (Blender hero scene) | blueprint-isometric | Objects on a table show movement of goods. Built; heavy on 4 GB VRAM. |
| Finance, networks, "the future of X", dramatic hooks | **night-city-neon** | blueprint-isometric | Contrast and glow. Built at blockout tier only (dim, low-poly). |
| Maths, logic, science derivations, "why does X equal Y" | **chalkboard-derivation** | blueprint-isometric | Step by step reveal. Built; wobbly shapes and hard cuts are known weak spots. LaTeX formulas now work (MiKTeX installed 2026-11-25). |
| Stats, comparisons, KPIs, "X vs Y" | **clean-data-motion** (Remotion charts) | blueprint-isometric | Charts and counters are Remotion's strength. Card itself is UNTESTED as a finished look. |
| How-to, services, local business, lifestyle, product use | **stock footage + text on motion** (Pexels via Chrome) | clean-data-motion | Real footage shows real actions. Search/read verified; downloads need your yes per file. |
| A recurring series with the SAME characters on many topics (an Instagram page of clay explainers) | **clay-stopmotion** (use the `clay-series` skill) | paper-cutout-diorama | Fixed cast, voices and set make it a brand. Built and tested at draft quality; characters are simple (no hair/clothes/walking). |
| Process diagram, workflow, architecture | **blueprint-isometric kit** (draw it in Remotion) | clean-data-motion | `diagram_gen` is CRUDE (boxes) / BROKEN (mermaid) here; do not use it. |
| Talking head, founder on camera | **your own footage** + captions (talking-head pipeline) | none | No avatar or lip-sync route works here. Pipeline UNTESTED. |
| Hand-drawn doodle explainers | `/ink-art` | none | UNTESTED here. Offer only as a test. |
| Anything needing AI-generated people/places/video | **not available** | stock footage or code-made scenes | Generation is BLOCKED (paid, or 4 GB VRAM). Say so. |

## 2. Questions to settle the look in 30 seconds
1. Is there a **person doing something** the viewer must see? -> paper or stock footage.
2. Is it a **system with parts**? -> blueprint (or tabletop for physical goods).
3. Is it **numbers**? -> clean-data-motion, with a blueprint hero scene.
4. Is it a **derivation / logic chain**? -> chalkboard.
5. Does the client need **real footage** for trust? -> stock footage + text (or their own footage).
6. Time/cost: paper reel full render about 26 min; Remotion blueprint about 2 min (benchmark: 108 s for a 40 s short); Blender/Three.js plates add minutes. Label these estimates.

## 3. Voice and music suggestions
| Feel | Voice | Music |
|---|---|---|
| Warm, human, story | Kokoro `af_heart` | soft piano / reflective (Pixabay) |
| Neutral, technical, quick | Piper `en_US-ryan-high` | ambient tech, low |
| Urgent, news-like | Piper `ryan-high`, shorter lines | pulse, minimal |
| Their own voice | user recording + `audio_enhance` | per tone |

## 4. Length defaults
20 s = one idea, one proof (tip, definition). **40 s = default** (full spine, short story). 60 s = a case or walkthrough only. Over length: cut lines, never speed up the voice.

## 5. Mixing looks
One look per video by default. A hero scene in a second route (Blender/Three.js) is allowed when the user approves it, because plates add render time and RAM use.
