import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { Caption, W } from "./kit";
import { WORDS } from "./words";

export const FPS = 30;
export const useT = () => useCurrentFrame() / FPS;
export const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, d: number) => cl((t - a) / d);
export const eo = (p: number) => Easing.out(Easing.cubic)(p);
export const bk = (p: number) => Easing.out(Easing.back(1.8))(p);
export const bn = (p: number) => Easing.out(Easing.bounce)(p);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const stepT = (t: number, fps = 8) => Math.floor(t * fps) / fps;
export const tri = (t: number, period: number, off = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - off)) / period);

/** animated group: translate + rotate + scale about a pivot, with opacity */
export const A: React.FC<{ x?: number; y?: number; rot?: number; s?: number; sx?: number; sy?: number; px?: number; py?: number; op?: number; children: React.ReactNode }> = ({ x = 0, y = 0, rot = 0, s = 1, sx, sy, px = 0, py = 0, op = 1, children }) => (
  <g opacity={op} transform={`translate(${x} ${y}) translate(${px} ${py}) rotate(${rot}) scale(${sx ?? s} ${sy ?? s}) translate(${-px} ${-py})`}>{children}</g>
);

/** pop-in with overshoot, pivot at (px,py) */
export const Pop: React.FC<{ t: number; at: number; px?: number; py?: number; dur?: number; children: React.ReactNode }> = ({ t, at, px = 0, py = 0, dur = 0.45, children }) => {
  const p = prog(t, at, dur);
  if (p <= 0) return null;
  return <A px={px} py={py} s={Math.max(0.001, bk(p))} op={cl(p * 4)}>{children}</A>;
};

/** caption pages built from the Whisper words */
type Tok = { w: string; s: number; e: number };
const pages: Tok[][] = (() => {
  const out: Tok[][] = []; let cur: Tok[] = [];
  WORDS.forEach((x) => {
    cur.push(x);
    if (cur.length >= 4 || /[.?!]$/.test(x.w) || (/,$/.test(x.w) && cur.length >= 2)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
})();
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const pg = pages.find((p) => t >= p[0].s - 0.05 && t <= p[p.length - 1].e + 0.18);
  if (!pg) return null;
  let active = 0; pg.forEach((x, i) => { if (t >= x.s) active = i; });
  const age = prog(t, pg[0].s - 0.05, 0.12);
  return <A px={W / 2} py={1618} s={lerp(0.92, 1, age)} op={age}><Caption words={pg.map((x) => x.w.replace(/[.,?!]$/, ""))} active={active} /></A>;
};
