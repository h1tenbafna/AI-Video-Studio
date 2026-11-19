---
name: route-and-style
description: Choose a production route and style card per scene and record it in the scene plan. Use at the scene_plan stage, or when the user asks for a different look or technique for a scene.
---

# Route and style per scene

**Three separate choices; do not mix them:**
- **Route** = asset technology of one scene: `blender | threejs | manim | remotion | cinematic | hybrid`. Stored in `scene.production.route`.
- **Composition runtime** = `remotion | hyperframes | ffmpeg`, chosen once per project at proposal with the user.
- **Execution tool** = the registered tool that renders it (`scene.production.execution_tool`, optional).

**Style** = a card in `styles/library/<id>.md`, set as `production.style_id`. Playbooks in `styles/*.yaml` remain the project-level identity.

## Choosing
1. List candidate styles whose `routes` contain the wanted route. Read only the chosen card.
2. Check the route's evidence: only Blender, Remotion and Piper TTS are verified rendering on this machine. Three.js, Manim and HyperFrames-to-Remotion are installed or available but UNTESTED here; say so and propose a short test render before committing a whole video to them.
3. `cinematic` needs AI image or video generation, which is unavailable locally. Flag the scene and offer a local alternative (Blender, or Remotion with stills). Do not quietly lower quality.
4. Present per-scene route, style, rationale and a time estimate (label it estimate) to the user at the scene_plan gate. Changing a route later needs the user's approval.
5. Log it as a `decision_log` entry with category `provider_selection`; a change appends a new entry with the same category and subject.

Heavy options (Blender Cycles, Three.js bloom or fog) must be sized against 4 GB VRAM first.
