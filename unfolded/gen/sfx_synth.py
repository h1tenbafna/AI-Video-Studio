"""Synthesised Foley for Unfolded ($0, numpy only). python unfolded/gen/sfx_synth.py out_dir
Makes: paper, rustle, tear, tap, thud, clink, chime, pop, whoosh, swell, organ, gloop, click, clunk (48 kHz mono wav)."""
import sys, wave, numpy as np
SR = 48000
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(SR * d)) / SR

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))

def env(n, a, d):            # attack / exponential decay (seconds)
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)

def crackle(n, rate):        # random amplitude flutter like paper fibres
    k = rng.random(n // 200 + 2) ** 3
    return np.interp(np.arange(n), np.arange(len(k)) * 200, k) * rate + (1 - rate)

def save(path, x, gain=0.9):
    x = x / (np.abs(x).max() + 1e-9) * gain
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def sines(fr, d, decay, amps=None):
    t = t_(d); amps = amps or [1] * len(fr)
    return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / (decay * (1 - i * 0.15))) for i, (f, a) in enumerate(zip(fr, amps)))

out = sys.argv[1]
n = lambda d: rng.standard_normal(int(SR * d))
S = {}
S["paper"] = band(n(0.22), 1500, 9000) * env(int(SR * .22), .005, .05) * crackle(int(SR * .22), .7)
S["rustle"] = band(n(0.7), 1200, 8000) * np.sin(np.pi * t_(0.7) / 0.7) ** 1.5 * crackle(int(SR * .7), .9)
tr = t_(0.28); S["tear"] = band(n(0.28), 2000, 11000) * crackle(int(SR * .28), 1.0) * np.minimum(1, tr / .02) * np.exp(-tr / .12)
S["tap"] = sines([190, 420], 0.12, .03) + 0.3 * band(n(0.12), 2000, 6000) * env(int(SR * .12), .001, .01)
S["thud"] = sines([85, 160], 0.35, .08) + 0.25 * band(n(0.35), 200, 1500) * env(int(SR * .35), .002, .03)
S["clink"] = sines([2400, 3720, 5150, 6900], 0.6, .18, [1, .6, .4, .2])
S["chime"] = sines([880, 1320, 1760, 2640], 1.6, .55, [1, .5, .35, .15]) * np.minimum(1, t_(1.6) / .01)
pt = t_(0.07); S["pop"] = np.sin(2 * np.pi * (700 * pt - 2500 * pt ** 2)) * env(len(pt), .002, .02)
S["whoosh"] = band(n(0.5), 300, 4000) * np.sin(np.pi * t_(0.5) / 0.5) ** 2
st = t_(2.2); S["swell"] = sum(np.sin(2 * np.pi * f * st) for f in (220, 277.2, 329.6, 440)) * np.sin(np.pi * st / 2.2) ** 2
ot = t_(2.6); S["organ"] = sum(a * np.sin(2 * np.pi * f * h * ot) for f in (196, 246.9, 293.7) for h, a in ((1, 1), (2, .45), (3, .25), (4, .12))) * np.minimum(1, ot / .4) * np.minimum(1, (2.6 - ot) / .8)
gt = t_(0.32); S["gloop"] = np.sin(2 * np.pi * np.cumsum(200 - 340 * gt + 25 * np.sin(gt * 60)) / SR) * env(len(gt), .01, .09)
S["click"] = band(n(0.03), 2500, 9000) * env(int(SR * .03), .0005, .004)
S["clunk"] = sines([140, 870, 1310], 0.4, .07, [1, .5, .3]) + 0.4 * band(n(0.4), 300, 3000) * env(int(SR * .4), .001, .02)
for k, v in S.items(): save(f"{out}/{k}.wav", v)
print("sfx:", ", ".join(S))
