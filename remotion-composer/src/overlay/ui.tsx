import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Theme, FONT, clamp, eo, prog } from "./theme";
import { WORDS } from "./words";

export const ThemeCtx = createContext<Theme>({ tag: "#fff", ink: "#000", mid: "#555", accent: "#f00", white: "#fff", shadow: "#0004" });
export const useTheme = () => useContext(ThemeCtx);

type TagProps = { target: [number, number]; x: number; y: number; w: number; index: string; title: string; names?: string[]; role?: string[]; t: number; chip?: { text: string }; collapsed?: number; leader?: boolean; titleSize?: number; };
export const tagHeight = (names?: string[], role?: string[], chip?: boolean) => 18 + 52 + (names?.length ?? 0) * 42 + (role?.length ?? 0) * 40 + (chip ? 70 : 0) + 14;

export const PartTag: React.FC<TagProps> = ({ target, x, y, w, index, title, names, role, t, chip, collapsed = 0, leader = true, titleSize = 34 }) => {
  const C = useTheme();
  const h = tagHeight(names, role, !!chip);
  const lead = eo(prog(t, 0, 0.5)), box = eo(prog(t, 0.45, 0.5)), full = 1 - collapsed;
  const midY = y + 36;
  const lx = target[0] + (x - target[0]) * lead, ly = target[1] + (midY - target[1]) * lead;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: leader ? 1 - 0.65 * collapsed : 0 }}>
        <line x1={target[0]} y1={target[1]} x2={lx} y2={ly} stroke={C.ink} strokeWidth={9} strokeLinecap="round" opacity={0.35} />
        <line x1={target[0]} y1={target[1]} x2={lx} y2={ly} stroke={C.tag} strokeWidth={5} strokeLinecap="round" />
        <circle cx={target[0]} cy={target[1]} r={11 * lead} fill={C.accent} stroke={C.tag} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", left: x, top: y, width: collapsed > 0 ? w * (0.96 + 0.04 * full) : w, height: collapsed > 0 ? 72 + (h - 72) * full : h, opacity: box, transform: `translateX(${(1 - box) * 30}px)`, background: C.tag, border: `3.5px solid ${C.ink}`, borderRadius: 10, boxShadow: `6px 6px 0 ${C.shadow}`, fontFamily: FONT, color: C.ink, overflow: "hidden", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px 0" }}>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: C.accent, color: C.white, fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{index}</div>
          <div style={{ fontWeight: 800, fontSize: titleSize, letterSpacing: 1, whiteSpace: "nowrap" }}>{title}</div>
        </div>
        {full > 0.35 && (
          <div style={{ padding: "6px 14px 0", opacity: full }}>
            {names?.map((n, i) => <div key={i} style={{ fontSize: 33, fontWeight: 600, lineHeight: "42px", whiteSpace: "nowrap" }}>{n}</div>)}
            {role?.map((r, i) => <div key={i} style={{ fontSize: 30, fontWeight: 500, lineHeight: "40px", color: C.mid, whiteSpace: "nowrap" }}>{r}</div>)}
            {chip && <div style={{ marginTop: 10, background: C.accent, border: `3px solid ${C.ink}`, color: C.white, fontWeight: 800, fontSize: 30, padding: "6px 12px", display: "inline-block" }}>{chip.text}</div>}
          </div>
        )}
      </div>
    </>
  );
};

export const Callout: React.FC<{ x: number; y: number; w: number; t: number; big?: string; small: string[]; foot?: string; bigSize?: number }> = ({ x, y, w, t, big, small, foot, bigSize = 84 }) => {
  const C = useTheme();
  const a = eo(prog(t, 0, 0.5)), u = eo(prog(t, 0.4, 0.5));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: a, transform: `translateY(${(1 - a) * 24}px)`, background: C.tag, border: `3.5px solid ${C.ink}`, borderRadius: 10, boxShadow: `6px 6px 0 ${C.shadow}`, padding: "14px 20px 16px", fontFamily: FONT, color: C.ink, boxSizing: "border-box" }}>
      {big && <div style={{ fontWeight: 800, fontSize: bigSize, lineHeight: 1.05, letterSpacing: -1 }}>{big}</div>}
      <div style={{ height: 8, background: C.accent, width: `${u * 100}%`, margin: "6px 0 8px", borderRadius: 4 }} />
      {small.map((s, i) => <div key={i} style={{ fontSize: 36, fontWeight: 600, lineHeight: "44px" }}>{s}</div>)}
      {foot && <div style={{ fontSize: 28, fontWeight: 500, color: C.mid, marginTop: 6 }}>{foot}</div>}
    </div>
  );
};

export const Header: React.FC<{ t: number }> = ({ t }) => {
  const C = useTheme();
  const a = eo(prog(t, 0.2, 0.6));
  const arrow = (x: number, col: string, label: string) => (
    <g transform={`translate(${x} 0)`}>
      <line x1={0} y1={0} x2={64} y2={0} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <line x1={0} y1={0} x2={64} y2={0} stroke={col} strokeWidth={8} strokeLinecap="round" />
      <text x={84} y={12} fontFamily={FONT} fontWeight={600} fontSize={32} fill={C.ink}>{label}</text>
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
      <rect x={36} y={36} width={1008} height={88} rx={10} fill={C.tag} stroke={C.ink} strokeWidth={3.5} />
      <g transform="translate(66 80)">{arrow(0, C.white, "chips flow down")}{arrow(480, C.accent, "money flows up")}</g>
    </svg>
  );
};

// Step rail as a horizontal bar under the header.
export const StepRail: React.FC<{ time: number; lit: number[]; labels: string[]; y?: number; fadeIn?: number; closed?: number }> = ({ time, lit, labels, y = 146, fadeIn = 1, closed = 0 }) => {
  const C = useTheme();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: eo(clamp(fadeIn)) }}>
      <rect x={36} y={y} width={1008} height={70} rx={10} fill={C.tag} stroke={C.ink} strokeWidth={3.5} />
      {labels.map((l, i) => {
        const on = time >= lit[i];
        const active = on && (i === lit.length - 1 || time < lit[i + 1]);
        const cx = 80 + i * 252;
        return (
          <g key={i}>
            <circle cx={cx} cy={y + 35} r={24} fill={active || closed > 0 ? C.accent : on ? C.ink : C.tag} stroke={C.ink} strokeWidth={3.5} />
            <text x={cx} y={y + 45} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={on ? C.white : C.ink}>{i + 1}</text>
            <text x={cx + 34} y={y + 45} fontFamily={FONT} fontWeight={700} fontSize={27} letterSpacing={1} fill={C.ink} opacity={on ? 1 : 0.5}>{l}</text>
          </g>
        );
      })}
    </svg>
  );
};

type W = { word: string; startMs: number; endMs: number };
const buildPages = (words: W[]) => {
  const pages: W[][] = []; let cur: W[] = []; let chars = 0;
  for (const w of words) {
    const len = w.word.length + 1;
    const se = /[.!?]$/.test(cur[cur.length - 1]?.word ?? "");
    if (cur.length && (cur.length >= 3 || chars + len > 19 || se)) { pages.push(cur); cur = []; chars = 0; }
    cur.push(w); chars += len;
  }
  if (cur.length) pages.push(cur);
  return pages;
};
const PAGES = buildPages(WORDS as W[]);
export const Captions: React.FC<{ bottom?: number }> = ({ bottom = 108 }) => {
  const C = useTheme();
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
      <div style={{ background: C.tag, border: `3.5px solid ${C.ink}`, borderRadius: 10, boxShadow: `6px 6px 0 ${C.shadow}`, padding: "12px 22px", display: "flex", gap: 14, alignItems: "center", opacity: eo(age), transform: `translateY(${(1 - eo(age)) * 16}px)`, maxWidth: 980 }}>
        {page.map((w, i) => {
          const active = ms >= w.startMs && ms < w.endMs;
          return <span key={i} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: "76px", padding: "0 14px", borderRadius: 6, background: active ? C.ink : "transparent", color: active ? C.tag : C.ink, whiteSpace: "nowrap" }}>{w.word}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
