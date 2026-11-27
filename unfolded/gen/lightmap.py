"""Bake the plate's light into a flat prop so it sits inside the painting.

Samples the (blurred) background frame under the prop's resting pose in the comp, and multiplies the prop by
that local light: window bars and shade carry across the prop. Alpha is kept. Use the result as PropShot `lit`,
faded out with `litFade` once the prop leaves the wall.

  python unfolded/gen/lightmap.py bg_frame0.png prop.png out.png --propW 420 --x 420 --y 190 --rot -3 --origin 0.5,0
     [--strength 0.85] [--lo 0.70] [--hi 1.22] [--blur 5] [--tint 0.35]
x, y, rot, origin, propW are the same numbers as the first key in the shot JSON (x = centre, y = top).
"""
import argparse
import numpy as np
from PIL import Image, ImageFilter


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("bg"); ap.add_argument("prop"); ap.add_argument("out")
    ap.add_argument("--propW", type=float, required=True)
    ap.add_argument("--x", type=float, required=True); ap.add_argument("--y", type=float, required=True)
    ap.add_argument("--rot", type=float, default=0.0)
    ap.add_argument("--origin", default="0.5,0")
    ap.add_argument("--strength", type=float, default=0.85, help="0 = no change, 1 = full plate contrast")
    ap.add_argument("--lo", type=float, default=0.70); ap.add_argument("--hi", type=float, default=1.22)
    ap.add_argument("--blur", type=float, default=5.0, help="px blur on the plate (removes brush detail)")
    ap.add_argument("--tint", type=float, default=0.35, help="how much of the plate's colour cast to take")
    ap.add_argument("--ref-pct", type=float, default=50, help="percentile of plate light under the prop treated as neutral (higher = darker shade)")
    a = ap.parse_args()

    bg = Image.open(a.bg).convert("RGB").filter(ImageFilter.GaussianBlur(a.blur))
    B = np.asarray(bg, dtype=np.float32) / 255.0
    P = np.asarray(Image.open(a.prop).convert("RGBA"), dtype=np.float32) / 255.0
    h, w = P.shape[:2]
    s = a.propW / w
    ox, oy = (float(t) for t in a.origin.split(","))
    # comp position of the transform origin
    left, top = a.x - a.propW / 2, a.y
    Ox, Oy = left + ox * a.propW, top + oy * h * s
    th = np.deg2rad(a.rot); c, sn = np.cos(th), np.sin(th)
    v, u = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = (u + 0.5) * s + left - Ox, (v + 0.5) * s + top - Oy
    X = np.clip(Ox + dx * c - dy * sn, 0, B.shape[1] - 1).astype(int)
    Y = np.clip(Oy + dx * sn + dy * c, 0, B.shape[0] - 1).astype(int)
    S = B[Y, X]                                           # plate colour under each prop pixel
    L = S @ np.array([0.299, 0.587, 0.114], np.float32)
    inside = P[..., 3] > 0.5
    ref = float(np.percentile(L[inside], a.ref_pct))       # this light level under the prop = neutral
    gain = np.clip((L / max(ref, 1e-3)) ** a.strength, a.lo, a.hi)[..., None]
    cast = S / np.maximum(L[..., None], 1e-3)             # plate colour cast (wall bounce / warm sun)
    cast = 1 + a.tint * (cast / cast[inside].mean(0) - 1)
    rgb = np.clip(P[..., :3] * gain * cast, 0, 1)
    out = np.concatenate([rgb, P[..., 3:]], -1)
    Image.fromarray((out * 255 + 0.5).astype(np.uint8), "RGBA").save(a.out)
    print(f"ref L={ref:.3f}  gain range {float(gain[inside].min()):.2f}..{float(gain[inside].max()):.2f} -> {a.out}")


if __name__ == "__main__":
    main()
