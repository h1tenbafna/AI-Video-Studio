# Route probe v3: Three.js night city (HyperFrames plate) + Remotion text overlay
Project `projects/ai-compute-explainer-v3` (same script/narration/music/text as v1). Style `night-city-neon`, blockout tier (no Kenney packs, no licensed assets). Plate and overlay are separate renders, like v2.

## What was built (reusable)
- `projects/ai-compute-explainer-v3/hyperframes/`: authored HyperFrames workspace (atelier). `world.js` is a hand-written Three.js scene (NOT the `threejs_world` terrain tool: it only knows landforms/landmarks, no city blocks). `layout.js` is pure JS shared by the browser and Node: anchor world points, camera keyframes, `cameraAt(t)` and `project()`. `probe.mjs write` projects every anchor for every frame to `../remotion/public/anchors.json` with no browser (same format as v2). `probe.mjs report` prints sample positions for tuning.
- Camera model: keys give a world point P and the screen pixel it must land on (`s`), plus yaw/pitch/distance; `cameraAt` solves the focus point by fixed-point iteration so P hits that pixel. Tune layout by editing keys, run `report`, no rendering needed.
- Overlay reused unchanged: `remotion-composer/src/overlay` with theme `neon`, props `{theme:"neon", plate:"plate.mp4", anchors}`. Anchor names match v2 (scene 1 chip/clock; 2 nvidia..you; 3 coreweave/old/new/debt; 4 amazon/microsoft/alphabet/meta/tower). Scene 4 uses a 2x2 grid (back row y about 600, front row about 1060) because 330 px flags cannot sit side by side four across.
- Render route: `hyperframes_compose render_existing` (plate, 30 fps, 1080x1920) then `video_compose` atelier with `bespoke.entry=remotion-composer/src/overlay/index.tsx` (same edit_decisions as v2 with paths swapped), then mux `final_mix.wav`.

## Measured
- Plate 1200 frames at 1080x1920 with bloom: about 4 min on the GTX 1650 Ti (GPU WebGL in headless Chrome). Overlay render about 5 min. A snapshot of 6 frames: about 20 s. Whole build from approved scene plan to first full render: about 1.5 h of authoring, most of it writing the scene.
- Plate 91 MB, composed video_only 108 MB at crf 18 (window textures are noisy and incompressible); recompress for delivery.

## Gotchas
- A JS exception inside `renderAt` does not fail the render: the canvas keeps the previous frame, so snapshots at several times look identical. If frames look stuck, find the throw (here: `setGlow` on a mesh instead of a material, and on materials made without `userData.base`).
- `hyperframes snapshot --at a,b,c --no-end` is the fast inspection loop. Contact sheet is `contact-sheet.jpg`.
- Size things in pixels per world unit: at distance 36 and fov 40 one unit is about 72 px, so a 14-unit platform fills a 1080 px frame. The overlay needs the subject in the left 600 px.
- Overlay text boxes are opaque, so the plate behind them is hidden; keep key shapes out of the right 400 px.
- Windows: `BoxGeometry` UVs scaled per face give uniform windows on any block size. Ground reflections were not attempted (no env map), only a glow.
- `three` and addons load from jsdelivr at render time (pinned 0.181.2): needs network; vendor locally if offline rendering matters.

## Verdict
Fast to render and iterate (snapshots in seconds), strong neon look, camera is fully computable so overlays line up. Weak spots: blocky shapes and a pixel-pattern window texture, flat ground, no true reflections, the "you" figure is a capsule. Good for: network/data-flow explainers.
