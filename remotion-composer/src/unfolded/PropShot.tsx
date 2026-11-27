import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

/** Reusable Unfolded shot: 2.5D background clip + one AI-painted prop cut-out animated in code + style-B caption.
 *  keys: transform keyframes for the prop; words: caption words with start/end frames (active word highlighted). */
export type Key = { f: number; x: number; y: number; rot: number; sx?: number; sy?: number; skew?: number; shadow?: number; rx?: number };
export type Word = { w: string; s: number; e: number; key?: boolean };
/** origin: CSS transform-origin (sticky note peels hinged at its top edge: "50% 0%"); rx: 3D tilt toward camera in degrees (peel/curl) */
export type PropShotProps = { bg: string; prop: string; propW: number; keys: Key[]; words: Word[]; flutter?: { from: number; amp: number; freq: number }; origin?: string;
  /** camZoom: end zoom of the background clip's push (motion.py push = 1.10), so the prop stays glued to the wall */ camZoom?: number;
  /** lit: same prop with the plate's light baked in (unfolded/gen/lightmap.py), shown while it rests on the wall and faded out over litFade [from,to] frames as it leaves;
   *  baseBright: brightness of the plain prop underneath (room ambient once it is off the wall) */ lit?: string; litFade?: [number, number]; baseBright?: number };

const lerpKeys = (keys: Key[], f: number, k: keyof Key, def = 0) => {
  const fs = keys.map((q) => q.f), vs = keys.map((q) => (q[k] as number | undefined) ?? def);
  return interpolate(f, fs, vs, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
};

export const PropShot: React.FC<PropShotProps> = ({ bg, prop, propW, keys, words, flutter, origin = "10% 90%", camZoom = 1, lit, litFade = [0, 1], baseBright = 1 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cz = 1 + (camZoom - 1) * (f / durationInFrames);   // linear, same as motion.py
  const fq = Math.floor(f / 2) * 2;   // prop moves "on twos" (stop-motion feel); camera/background stay smooth
  let x = lerpKeys(keys, fq, "x"), y = lerpKeys(keys, fq, "y"), rot = lerpKeys(keys, fq, "rot");
  const sx = lerpKeys(keys, fq, "sx", 1), sy = lerpKeys(keys, fq, "sy", 1), skew = lerpKeys(keys, fq, "skew"), sh = lerpKeys(keys, fq, "shadow", 0.3), rx = lerpKeys(keys, fq, "rx");
  if (flutter && fq > flutter.from) { const t = (fq - flutter.from) / 30; x += Math.sin(t * flutter.freq * 6.283) * flutter.amp * Math.min(1, t * 2); rot += Math.sin(t * flutter.freq * 6.283 + 1.2) * 14 * Math.min(1, t * 2); }
  const active = words.findIndex((w) => f >= w.s && f < w.e);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(bg)} muted />
      <AbsoluteFill style={{ transform: `scale(${cz})`, transformOrigin: "540px 960px" }}>
      <div style={{ position: "absolute", left: x - propW / 2, top: y, width: propW,
        transform: `perspective(1400px) rotate(${rot}deg) rotateX(${rx}deg) skewX(${skew}deg) scale(${sx},${sy})`, transformOrigin: origin,
        filter: `drop-shadow(${-8 * sh * 3}px ${18 * sh * 3}px ${12 + 30 * sh}px rgba(20,30,30,${0.25 + sh * 0.5}))` }}>
        <Img src={staticFile(prop)} style={{ width: "100%", display: "block", filter: baseBright !== 1 ? `brightness(${baseBright})` : undefined }} />
        {lit && <Img src={staticFile(lit)} style={{ position: "absolute", left: 0, top: 0, width: "100%",
          opacity: interpolate(fq, litFade, [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />}
      </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1240, textAlign: "center", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif",
        fontSize: 78, fontWeight: 800, lineHeight: 1.15, color: "#FFF8EC", WebkitTextStroke: "10px #1F2A30", paintOrder: "stroke fill" as any }}>
        {words.map((w, i) => <span key={i} style={{ color: i === active ? "#FFC93C" : "#FFF8EC" }}>{w.w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </AbsoluteFill>
  );
};
