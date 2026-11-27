"""Depth map for a keyframe (Depth Anything V2 Small, Apache-2.0). Diffusion env:
  python -I unfolded/gen/depth.py in.png out_depth.png     (white = near, black = far)"""
import sys, numpy as np
from PIL import Image
from transformers import pipeline
src, dst = sys.argv[1], sys.argv[2]
pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
img = Image.open(src).convert("RGB")
r = pipe(img)
d = np.array(r["depth"], dtype=np.float32)   # PIL depth image, already resized to the input
d = (d - d.min()) / max(1e-6, d.max() - d.min())
Image.fromarray((d * 255).astype(np.uint8)).resize(img.size, Image.BICUBIC).save(dst)
print("depth ok", dst)
