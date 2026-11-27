"""2.5D shot from one keyframe + its depth map (ffmpeg only, $0). Repo venv or any python:
  python unfolded/gen/motion.py img.png depth.png out.mp4 --dur 2.4 --move push|drift_l|drift_r|rise|orbit --amt 1.0
Moves: push = slow dolly-in (near layers grow faster), drift_l/r = lateral parallax, rise = crane up, orbit = small arc.
Output 1080x1920, 30 fps, libx264."""
import argparse, subprocess
a = argparse.ArgumentParser(); a.add_argument("img"); a.add_argument("depth"); a.add_argument("out")
a.add_argument("--dur", type=float, default=2.4); a.add_argument("--move", default="push"); a.add_argument("--amt", type=float, default=1.0)
a = a.parse_args()
D = a.dur; k = a.amt
# displacement in pixels at full depth, ramped over the shot (t from 0 to 1)
px = {"push": (0, 0), "drift_l": (36, 0), "drift_r": (-36, 0), "rise": (0, 30), "orbit": (30, 10)}[a.move]
zoom_end = {"push": 1.10, "drift_l": 1.06, "drift_r": 1.06, "rise": 1.06, "orbit": 1.07}[a.move]
dx, dy = px[0] * k, px[1] * k
W, H = 1080, 1920
fc = (
  f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,format=yuv444p,fps=30,loop=loop={int(D*30)}:size=1:start=0,trim=duration={D},setpts=PTS-STARTPTS[img];"
  f"[1:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=yuv444p,fps=30,loop=loop={int(D*30)}:size=1:start=0,trim=duration={D},setpts=PTS-STARTPTS,split=2[d1][d2];"
  f"[d1]geq=lum='128+({dx})*(p(X,Y)/255-0.5)*(T/{D})':cb=128:cr=128[xm];"
  f"[d2]geq=lum='128+({dy})*(p(X,Y)/255-0.5)*(T/{D})':cb=128:cr=128[ym];"
  f"[img][xm][ym]displace=edge=smear[par];"
  f"[par]scale=w='{W}*(1+({zoom_end}-1)*t/{D})':h='{H}*(1+({zoom_end}-1)*t/{D})':eval=frame,crop={W}:{H}:'(in_w-{W})/2':'(in_h-{H})/2',format=yuv420p[v]"
)
cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-loop", "1", "-i", a.img, "-loop", "1", "-i", a.depth, "-filter_complex", fc, "-map", "[v]", "-t", str(D), "-c:v", "libx264", "-crf", "18", "-preset", "medium", a.out]
subprocess.run(cmd, check=True); print("motion ok", a.out)
