# Route probe v2: Blender tabletop-miniature + Remotion text overlay
Project `projects/ai-compute-explainer-v2` (same script/narration/music/text as v1 `ai-compute-business-explainer`). Result: `renders/final.mp4`, 40 s, 1080x1920, -14.8 LUFS, $0.

## What was built (reusable)
- `projects/ai-compute-explainer-v2/blender/chain.py`: one 1200-frame timeline, scenes at different table X, 4 cameras bound to markers, helpers imported from the solar project `sun2e.py`. `probe.py` prints anchor screen positions per camera; `anchors.py` writes `remotion/public/anchors.json` (per-frame projected px for named objects).
- `remotion-composer/src/overlay/`: text-on-plate kit (theme.ts palettes tabletop/neon/chalk, ui.tsx tags/callout/rail/header/captions, scenes.tsx, index.tsx composition `OverlayExplainer` taking props `{theme, plate, anchors}`). Reusable for v3/v4 plates (neon, chalk themes already defined; scenes.tsx anchor names must match the plate's anchors.json).
- Render route: `video_compose` render with `edit_decisions.composition_mode=atelier`, `bespoke.entry=remotion-composer/src/overlay/index.tsx`, `props_path`, `public_dir` (holds plate.mp4 + anchors.json); then mux `final_mix.wav` with ffmpeg.

## Measured
- Blender EEVEE 1080x1920, 24 samples, no raytracing: about 3.5 s/frame (scene 1-4 similar); 1200 frames about 75 min; first-frame shader compile about 4 s. 4 GB VRAM was fine.
- Remotion overlay render about 280 s (concurrency 2) for 40 s (video decode of plate included).
- Wall clock from scene-plan approval to final: about 3 h including re-renders.

## Gotchas
- Position text from numbers, not by eye: render a probe of `world_to_camera_view` for each camera before the full render. Portrait width is the constraint (sensor fit): chain 12 units wide needs lens about 22 at distance about 24; leave a 390 px text column on the right.
- `hide_render` is NOT inherited by child objects (windows float as dashes when the parent is hidden). Copy the parent's hide keys to children (done at end of `build()`).
- `use_placeholder=True` leaves 0-byte PNGs when Blender is killed; those frames are then skipped on resume. After a kill, `find frames -size -10k` and delete before re-running.
- Re-render only changed frame ranges: delete the PNGs then run `--anim --frames A B`.
- Schema pitfalls: asset `source` enum is generate|source|provided|record; decision `category` enum has `composition_mode` (not `_selection`); decision_log entries written before `write_checkpoint` stay on disk even if validation fails.
- Background shell watchers (`while tasklist ...`) get reaped under memory pressure; a detached `nohup` Blender process survives. Check frame count instead.
- Wood grain via Wave texture reads as horizontal banding at distance (acceptable, not premium). Clay look is flat; no GI/raytracing.

## Verdict
Works end to end and is the most flexible of the local routes (any scene geometry, honest depth of field). Weak spots: generic box buildings, no logos, flat wood. Good for: process/chain explainers. Cost: long render, so test frames at 540x960 / 12 samples first (about 2 s).
