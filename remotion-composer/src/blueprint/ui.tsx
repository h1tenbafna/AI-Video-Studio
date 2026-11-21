import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, clamp, eo, prog } from "./lib";
import { WORDS } from "./words";

// ---------- Drafting sheet: paper, grid, border, title block, grain ----------
export const Sheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.paper }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke={C.white} strokeWidth="1.5" opacity="0.28" />
        </pattern>
        <pattern id="grid5" width="300" height="300" patternUnits="userSpaceOnUse">
          <path d="M 300 0 L 0 0 0 300" fill="none" stroke={C.white} strokeWidth="2.5" opacity="0.32" />
        </pattern>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.04  0 0 0 0 0.16  0 0 0 0 0.29  0 0 0 0.5 0" />
        </filter>
      </defs>
      <rect width={1080} height={1920} fill="url(#grid)" />
      <rect width={1080} height={1920} fill="url(#grid5)" />
      <rect width={1080} height={1920} filter="url(#grain)" opacity={0.07} />
      <rect x={22} y={22} width={1036} height={1876} fill="none" stroke={C.navy} strokeWidth={4} />
      <rect x={36} y={36} width={1008} height={1848} fill="none" stroke={C.white} strokeWidth={2} />
      {/* title block */}
      <g transform="translate(676 1812)">
        <rect width={368} height={72} fill={C.tag} stroke={C.navy} strokeWidth={3} />
        <line x1={0} y1={36} x2={368} y2={36} stroke={C.navy} strokeWidth={2} />
        <text x={14} y={27} fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.navy} letterSpacing={2}>AI COMPUTE CHAIN</text>
        <text x={14} y={61} fontFamily={FONT} fontWeight={500} fontSize={22} fill={C.mid} letterSpacing={2}>SHEET 1/1  REV A</text>
      </g>
    </svg>
  </AbsoluteFill>
);

// ---------- Part tag: leader line draws on, then a boxed tag with index + role ----------
type TagProps = {
  target: [number, number];
  x: number; // box left
  y: number; // box top
  w: number;
  index: string;
  title: string;
  names?: string[];
  role?: string[];
  t: number; // 0..1
  chip?: { text: string }; // orange chip with navy text (e.g. the debt figure)
  collapsed?: number; // 0..1 shrink to number-only
  leader?: boolean;
  titleSize?: number;
};
export const tagHeight = (names?: string[], role?: string[], chip?: boolean) =>
  18 + 52 + (names?.length ?? 0) * 46 + (role?.length ?? 0) * 42 + (chip ? 70 : 0) + 14;

export const PartTag: React.FC<TagProps> = ({ target, x, y, w, index, title, names, role, t, chip, collapsed = 0, leader = true, titleSize = 38 }) => {
  const h = tagHeight(names, role, !!chip);
  const lead = eo(prog(t, 0, 0.5));
  const box = eo(prog(t, 0.45, 0.5));
  const midY = y + 38;
  const elbowX = x - 36;
  const full = 1 - collapsed;
  const ptsList: [number, number][] = [target, [elbowX, midY], [x, midY]];
  const total = Math.hypot(elbowX - target[0], midY - target[1]) + 36;
  const shown = total * lead;
  const seg1 = Math.hypot(elbowX - target[0], midY - target[1]);
  const p1 = Math.min(shown, seg1) / seg1;
  const lx = target[0] + (elbowX - target[0]) * p1;
  const ly = target[1] + (midY - target[1]) * p1;
  const p2 = Math.max(0, shown - seg1) / 36;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: leader ? 1 - 0.7 * collapsed : 0 }}>
        <polyline points={`${target[0]},${target[1]} ${lx},${ly}`} fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
        {p2 > 0 && <line x1={elbowX} y1={midY} x2={elbowX + 36 * p2} y2={midY} stroke={C.navy} strokeWidth={4} strokeLinecap="round" />}
        <circle cx={target[0]} cy={target[1]} r={9 * lead} fill={C.orange} stroke={C.navy} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: collapsed > 0 ? w * (0.8 + 0.2 * full) : w,
          height: collapsed > 0 ? 72 + (h - 72) * full : h,
          opacity: box,
          transform: `translateX(${(1 - box) * 30}px)`,
          background: C.tag,
          border: `3.5px solid ${C.navy}`,
          boxShadow: `6px 6px 0 ${C.navy}33`,
          fontFamily: FONT,
          color: C.navy,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: C.navy, color: C.white, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            {index}
          </div>
          <div style={{ fontWeight: 800, fontSize: titleSize, letterSpacing: 1, whiteSpace: "nowrap" }}>{title}</div>
        </div>
        {full > 0.35 && (
          <div style={{ padding: "6px 16px 0 16px", opacity: full }}>
            {names?.map((n, i) => (
              <div key={i} style={{ fontSize: 36, fontWeight: 600, lineHeight: "46px", whiteSpace: "nowrap" }}>{n}</div>
            ))}
            {role?.map((r, i) => (
              <div key={i} style={{ fontSize: 34, fontWeight: 500, lineHeight: "42px", color: C.mid, whiteSpace: "nowrap" }}>{r}</div>
            ))}
            {chip && (
              <div style={{ marginTop: 10, background: C.orange, border: `3px solid ${C.navy}`, color: C.navy, fontWeight: 800, fontSize: 34, padding: "6px 12px", display: "inline-block" }}>{chip.text}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ---------- Step rail on the left edge ----------
export const StepRail: React.FC<{ time: number; ys: number[]; lit: number[]; labels: string[]; fadeIn?: number; closed?: number }> = ({ time, ys, lit, labels, fadeIn = 0, closed = 0 }) => {
  const op = eo(clamp(fadeIn));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op }}>
      <line x1={92} y1={ys[0]} x2={92} y2={ys[ys.length - 1]} stroke={C.navy} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" />
      {ys.map((y, i) => {
        const on = time >= lit[i];
        const active = on && (i === lit.length - 1 || time < lit[i + 1]);
        const fill = active || closed > 0 ? C.orange : on ? C.navy : C.tag;
        const txt = on && !(active || closed > 0) ? C.white : C.navy;
        return (
          <g key={i}>
            <circle cx={92} cy={y} r={34} fill={fill} stroke={C.navy} strokeWidth={4} />
            <text x={92} y={y + 12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={txt}>{i + 1}</text>
            <text transform={`translate(${92 + 34} ${y + 56}) rotate(-90)`} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={34} letterSpacing={2} fill={C.navy} opacity={on ? 1 : 0.55}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- Boxed dimension callout (big figure, small label, orange underline) ----------
export const Callout: React.FC<{ x: number; y: number; w: number; t: number; big?: string; small: string[]; foot?: string; bigSize?: number }> = ({ x, y, w, t, big, small, foot, bigSize = 84 }) => {
  const a = eo(prog(t, 0, 0.5));
  const u = eo(prog(t, 0.4, 0.5));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: a, transform: `translateY(${(1 - a) * 24}px)`, background: C.tag, border: `3.5px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}33`, padding: "14px 20px 16px", fontFamily: FONT, color: C.navy, boxSizing: "border-box" }}>
      {big && <div style={{ fontWeight: 800, fontSize: bigSize, lineHeight: 1.05, letterSpacing: -1 }}>{big}</div>}
      <div style={{ height: 8, background: C.orange, width: `${u * 100}%`, margin: "6px 0 8px", borderBottom: `2px solid ${C.navy}` }} />
      {small.map((s, i) => (
        <div key={i} style={{ fontSize: 36, fontWeight: 600, lineHeight: "44px" }}>{s}</div>
      ))}
      {foot && <div style={{ fontSize: 28, fontWeight: 500, color: C.mid, marginTop: 6 }}>{foot}</div>}
    </div>
  );
};

// ---------- Legend ----------
export const Legend: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const a = eo(clamp(t));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
      <g transform={`translate(${x} ${y})`}>
        <rect x={-14} y={-14} width={420} height={124} fill={C.tag} stroke={C.navy} strokeWidth={3} />
        <line x1={0} y1={22} x2={70} y2={22} stroke={C.navy} strokeWidth={14} strokeLinecap="round" />
        <line x1={0} y1={22} x2={70} y2={22} stroke={C.white} strokeWidth={8} strokeLinecap="round" />
        <text x={92} y={34} fontFamily={FONT} fontWeight={600} fontSize={34} fill={C.navy}>chips flow down</text>
        <line x1={0} y1={78} x2={70} y2={78} stroke={C.navy} strokeWidth={14} strokeLinecap="round" />
        <line x1={0} y1={78} x2={70} y2={78} stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
        <text x={92} y={90} fontFamily={FONT} fontWeight={600} fontSize={34} fill={C.navy}>money flows up</text>
      </g>
    </svg>
  );
};

// ---------- Captions: blueprint strip, word by word, active word as a navy chip ----------
type W = { word: string; startMs: number; endMs: number };
const buildPages = (words: W[]) => {
  const pages: W[][] = [];
  let cur: W[] = [];
  let chars = 0;
  for (const w of words) {
    const len = w.word.length + 1;
    const sentenceEnd = /[.!?]$/.test(cur[cur.length - 1]?.word ?? "");
    if (cur.length && (cur.length >= 3 || chars + len > 19 || sentenceEnd)) {
      pages.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(w);
    chars += len;
  }
  if (cur.length) pages.push(cur);
  return pages;
};
const PAGES = buildPages(WORDS);

export const Captions: React.FC<{ bottom?: number }> = ({ bottom = 108 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  let idx = -1;
  for (let i = 0; i < PAGES.length; i++) {
    const start = PAGES[i][0].startMs;
    const end = Math.min(PAGES[i + 1]?.[0].startMs ?? Infinity, PAGES[i][PAGES[i].length - 1].endMs + 500);
    if (ms >= start && ms < end) idx = i;
  }
  if (idx < 0) return null;
  const page = PAGES[idx];
  const age = clamp((ms - page[0].startMs) / 160);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom }}>
      <div style={{ background: C.tag, border: `3.5px solid ${C.navy}`, boxShadow: `6px 6px 0 ${C.navy}33`, padding: "12px 22px", display: "flex", gap: 14, alignItems: "center", opacity: eo(age), transform: `translateY(${(1 - eo(age)) * 16}px)`, maxWidth: 980 }}>
        {page.map((w, i) => {
          const active = ms >= w.startMs && ms < w.endMs;
          return (
            <span key={i} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: "76px", padding: "0 14px", background: active ? C.navy : "transparent", color: active ? C.white : C.navy, whiteSpace: "nowrap" }}>
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
