"""Code-made paper props with a painted texture (SD is unreliable for simple flat props).
  python unfolded/gen/paperprop.py strip out.png --w 900 --h 240 --color "#F3E8CF"
Kinds: strip | note | bookmark. Output RGBA with soft deckle edge and gentle shading."""
import argparse, numpy as np
from PIL import Image, ImageFilter
a = argparse.ArgumentParser(); a.add_argument("kind"); a.add_argument("out"); a.add_argument("--w", type=int, default=900); a.add_argument("--h", type=int, default=240); a.add_argument("--color", default="#F3E8CF"); a.add_argument("--seed", type=int, default=3)
a = a.parse_args(); rng = np.random.default_rng(a.seed)
W, H = a.w, a.h; pad = 24
c = np.array([int(a.color[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
def noise(sh, scale):
    n = rng.random((sh[0] // scale + 2, sh[1] // scale + 2)).astype(np.float32)
    return np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((sh[1], sh[0]), Image.BICUBIC), dtype=np.float32) / 255
fib = 0.55 * noise((H, W), 3) + 0.3 * noise((H, W), 12) + 0.15 * noise((H, W), 40)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
shade = 1.0 - 0.10 * (yy / H) - 0.06 * (xx / W) + 0.05 * np.sin(xx / W * 3.1)        # soft light from top-left + a gentle curl
rgb = np.clip(c[None, None, :] * (shade[..., None] * (0.93 + 0.12 * fib[..., None])), 0, 255)
# deckle edge alpha
edge = noise((H, W), 6)
dist = np.minimum.reduce([xx, yy, W - 1 - xx, H - 1 - yy])
alpha = np.clip((dist - 2 - edge * 6) / 3, 0, 1)
if a.kind == "note":   # sticky note: clean cut edges, sticky band on top, slight bottom curl catching light
    fibn = 0.97 + 0.05 * fib
    band = H * 0.17
    sh = 1.0 - 0.05 * (yy / H) - 0.04 * (xx / W)
    sh -= 0.05 * np.exp(-((yy - band) / (H * 0.025)) ** 2)                      # faint crease line under the sticky band
    curl = np.clip((yy / H - 0.72) / 0.28, 0, 1) ** 2
    sh += 0.07 * curl - 0.10 * curl * (xx / W) ** 3                               # bottom lifts toward the light, corner darker
    rgb = np.clip(c[None, None, :] * (sh * fibn)[..., None], 0, 255)
    rgb[: int(band)] *= 0.985                                                     # sticky band slightly different sheen
    dist = np.minimum.reduce([xx, yy, W - 1 - xx, H - 1 - yy])
    alpha = np.clip(dist / 1.5, 0, 1)
img = np.dstack([rgb, alpha * 255]).astype(np.uint8)
canvas = Image.new("RGBA", (W + pad * 2, H + pad * 2), (0, 0, 0, 0)); canvas.paste(Image.fromarray(img, "RGBA"), (pad, pad))
canvas.save(a.out); print("prop ok", a.out)
