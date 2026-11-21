# Route probe v4: Manim chalkboard-derivation (plate) + Remotion text overlay
Project `projects/ai-compute-explainer-v4` (same script/narration/music/text as v1). Style `chalkboard-derivation`, overlay theme `chalk`. Final: `renders/final.mp4` (40 s, 1080x1920, 5.7 MB, -14.8 LUFS, $0).

## What was built
- `manim/scene.py`: one file, six Scene classes (S1, S2A, S2B, S2C, S3, S4), portrait set via `config.*` at the top (1080x1920, 30 fps, 100 px per unit). Layout constants and `anchors_all()` live in the same file, so `manim/probe.py` writes `remotion/public/anchors.json` with no render. Plate has no text except one "$" glyph.
- `manim/render.py` calls `math_animate` per segment (`-r 1080,1920 --fps 30`); `ffmpeg concat` joins them (trim to 1200 frames). Then the same overlay render (`artifacts/render_overlay.py`, theme chalk) and a `final_mix.wav` mux as in v2/v3.
- Chalk look: `chalk()` makes jittered polylines (deterministic sin noise) so every shape wobbles like hand drawing.

## Gotchas
- `math_animate` times out at 300 s, so scene 2 (19 s) is split into three segments at scroll boundaries; later segments re-add earlier shapes statically at the scrolled offset.
- The safety scan blocks `getattr`, `os`, `pathlib` etc. in scene code. Keep scene files free of them.
- Plays do not overlap: each `play` starts when the previous ends, so a late start shifts everything after. `Seg.run` waits on `self.time`; schedule non-overlapping windows (an overlapping plan gave 147 frames instead of 141).
- Scrolling = `Group.animate.shift` with `rate_func=smoothstep`; anchors use the same smoothstep, so they match.
- Plain `python` lacks manim; run probe.py with the venv bin folder on PATH (`.venv/Scripts` on Windows, `.venv/bin` on macOS).

## Verdict
Fast: about 5 min to render all segments, overlay about 4 min. Chalk look reads clearly and anchors match by construction. Weak spots: shapes are small and wobble makes rectangles look pillowy; no vignette or dust haze; arrows long in scene 2 (fan lines cross); the plate has no camera depth, only vertical scrolls.
