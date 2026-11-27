import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate, Easing } from "remotion";

export type W = { w: string; s: number; e: number };
export type ClayProps = {
  plate: string; frames: number; hook: string; brand: string; words: W[];
  sources: { text: string; from: number; to: number }[];
  end: { start: number; lines: string[] }; captionY: number; hookUntil: number;
};

const AMBER = "#FFD27A";
const FONT = "InterClay, Inter, 'Segoe UI', Arial, sans-serif";

const useFont = () => {
  const [h] = React.useState(() => delayRender("font"));
  React.useEffect(() => {
    const f = new FontFace("InterClay", `url(${staticFile("fonts/Inter-var.ttf")})`, { weight: "100 900" });
    f.load().then((ff) => { (document as any).fonts.add(ff); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// 2-3 words per page, one line, break after sentence punctuation
const makePages = (words: W[]) => {
  const pages: W[][] = []; let cur: W[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const brk = /[.,?!;:]$/.test(w.w) || cur.length >= 3 || (cur.length === 2 && cur.join("").length > 14);
    if (brk || i === words.length - 1) { pages.push(cur); cur = []; }
  });
  return pages;
};

const stroke: React.CSSProperties = { WebkitTextStroke: "10px #2a1a12", paintOrder: "stroke fill" as any, strokeLinejoin: "round" as any };

export const ClayEpisode: React.FC<ClayProps> = (p) => {
  useFont();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const pages = React.useMemo(() => makePages(p.words), [p.words]);
  const pg = pages.find((g) => t >= g[0].s - 0.05 && t <= g[g.length - 1].e + 0.2);
  const hookOn = t < p.hookUntil;
  const hookPop = 1 + 0.06 * Math.max(0, 1 - t * 5);               // visible from frame 0, tiny settle only
  const endP = interpolate(t, [p.end.start, p.end.start + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile(p.plate)} style={{ width: 1080, height: 1920 }} />
      {hookOn && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 112,
          lineHeight: 1.05, color: "#fff", transform: `scale(${hookPop})`, ...stroke }}>{p.hook}</div>
      )}
      {!hookOn && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: 6, color: "#fff", opacity: 0.9, ...stroke, WebkitTextStroke: "6px #2a1a12" }}>{p.brand.toUpperCase()}</div>
      )}
      {pg && t < p.end.start && (
        <div style={{ position: "absolute", left: 40, right: 40, top: p.captionY, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 84, whiteSpace: "nowrap" }}>
          {pg.map((w, i) => {
            const active = t >= w.s && (i === pg.length - 1 || t < pg[i + 1].s);
            return <span key={i} style={{ margin: "0 14px", color: active ? AMBER : "#fff", textShadow: active ? "0 0 28px rgba(255,210,122,.85)" : "none", ...stroke }}>{w.w.replace(/[.,?!;:]$/, "")}</span>;
          })}
        </div>
      )}
      {p.sources.filter((s) => t >= s.from && t <= s.to).map((s, i) => (
        <div key={i} style={{ position: "absolute", left: 60, right: 60, top: 1530, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#fff", ...stroke, WebkitTextStroke: "6px #2a1a12" }}>Source: {s.text}</div>
      ))}
      {t >= p.end.start && (
        <AbsoluteFill style={{ background: `rgba(42,26,18,${0.55 * endP})`, alignItems: "center", justifyContent: "center", opacity: endP }}>
          {p.end.lines.map((l, i) => (
            <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: i === 0 ? 96 : 64, color: i === 0 ? "#fff" : AMBER, textAlign: "center", margin: "10px 60px", ...stroke, WebkitTextStroke: "8px #2a1a12" }}>{l}</div>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
