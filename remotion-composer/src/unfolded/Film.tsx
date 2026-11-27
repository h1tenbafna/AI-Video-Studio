import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";

/** Unfolded episode: a list of shots, each = 2.5D background clip (+ optional pose-B swap) + code-animated layers + overlays.
 *  Captions come from Whisper word timings (seconds) and show the words spoken inside the current shot. */
export type K = { f: number; x?: number; y?: number; rot?: number; rx?: number; ry?: number; sx?: number; sy?: number; op?: number; shadow?: number };
export type Layer = { kind: "img" | "text" | "div" | "rays" | "motes" | "glow"; src?: string; w?: number; h?: number; text?: string; style?: React.CSSProperties;
  keys?: K[]; origin?: string; twos?: boolean; glue?: boolean; flutter?: { from: number; amp: number; freq: number }; lit?: string; litFade?: [number, number];
  baseBright?: number; swapText?: { f: number; text: string } };
export type Shot = { id: string; from: number; dur: number; bg?: string; bgColor?: string; swap?: { src: string; f: number }; zoom?: [number, number];
  shake?: { f: number; amp: number; len: number }; layers?: Layer[]; tag?: string; chip?: string; noCaption?: boolean };
export type Word = { w: string; s: number; e: number };
export type FilmProps = { shots: Shot[]; words: Word[] };

const DEF: Record<string, number> = { x: 540, y: 960, rot: 0, rx: 0, ry: 0, sx: 1, sy: 1, op: 1, shadow: 0 };
const val = (keys: K[] | undefined, f: number, k: keyof K) => {
  const ks = (keys || []).filter((q) => q[k] !== undefined);
  if (!ks.length) return DEF[k as string];
  if (ks.length === 1) return ks[0][k] as number;
  return interpolate(f, ks.map((q) => q.f), ks.map((q) => q[k] as number), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
};
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const LayerView: React.FC<{ L: Layer; f: number }> = ({ L, f }) => {
  const fq = L.twos === false ? f : Math.floor(f / 2) * 2;
  if (L.kind === "rays") {
    const op = val(L.keys, f, "op");
    return <AbsoluteFill style={{ opacity: op, mixBlendMode: "screen", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: 120 + i * 230 + Math.sin(f / 40 + i) * 12, top: -200, width: 120 + (i % 2) * 70, height: 2600,
        transform: "rotate(24deg)", transformOrigin: "50% 0%", background: "linear-gradient(180deg, rgba(255,226,160,0.55), rgba(255,226,160,0) 85%)", filter: "blur(18px)", ...L.style }} />)}
    </AbsoluteFill>;
  }
  if (L.kind === "motes") {
    return <AbsoluteFill style={{ pointerEvents: "none", opacity: val(L.keys, f, "op") }}>
      {Array.from({ length: 46 }).map((_, i) => { const x = rnd(i) * 1080 + Math.sin(f / 30 + i) * 20, y = ((rnd(i + 99) * 1920 - f * (0.6 + rnd(i + 7))) % 1920 + 1920) % 1920, r = 2 + rnd(i + 3) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", background: "rgba(255,236,190,0.8)", filter: "blur(1px)" }} />; })}
    </AbsoluteFill>;
  }
  let x = val(L.keys, fq, "x"), y = val(L.keys, fq, "y"), rot = val(L.keys, fq, "rot");
  const rx = val(L.keys, fq, "rx"), ry = val(L.keys, fq, "ry"), sx = val(L.keys, fq, "sx"), sy = val(L.keys, fq, "sy"), op = val(L.keys, fq, "op"), sh = val(L.keys, fq, "shadow");
  if (L.flutter && fq > L.flutter.from) { const t = (fq - L.flutter.from) / 30; x += Math.sin(t * L.flutter.freq * 6.283) * L.flutter.amp * Math.min(1, t * 2); rot += Math.sin(t * L.flutter.freq * 6.283 + 1.2) * 14 * Math.min(1, t * 2); }
  const w = L.w ?? 300;
  const box: React.CSSProperties = { position: "absolute", left: x - w / 2, top: y, width: w, height: L.h, opacity: op, transformOrigin: L.origin ?? "50% 50%",
    transform: `perspective(1400px) rotate(${rot}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sx},${sy})`,
    filter: sh > 0 ? `drop-shadow(${-8 * sh * 3}px ${18 * sh * 3}px ${12 + 30 * sh}px rgba(20,30,30,${0.25 + sh * 0.5}))` : undefined };
  if (L.kind === "glow") return <div style={{ ...box, height: w, borderRadius: "50%", mixBlendMode: "screen", background: "radial-gradient(circle, rgba(255,200,90,0.85), rgba(255,170,60,0) 65%)", ...L.style }} />;
  if (L.kind === "text") { const t = L.swapText && f >= L.swapText.f ? L.swapText.text : L.text; return <div style={{ ...box, textAlign: "center", ...L.style }}>{t}</div>; }
  if (L.kind === "div") { const t = L.swapText && f >= L.swapText.f ? L.swapText.text : L.text; return <div style={{ ...box, ...L.style }}>{t}</div>; }
  return <div style={box}>
    <Img src={staticFile(L.src!)} style={{ width: "100%", height: L.h ? "100%" : undefined, display: "block", filter: L.baseBright ? `brightness(${L.baseBright})` : undefined, ...L.style }} />
    {L.lit && <Img src={staticFile(L.lit)} style={{ position: "absolute", left: 0, top: 0, width: "100%", opacity: interpolate(fq, L.litFade ?? [0, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />}
  </div>;
};

const ShotView: React.FC<{ S: Shot; words: Word[] }> = ({ S, words }) => {
  const f = useCurrentFrame();
  const [z0, z1] = S.zoom ?? [1, 1];
  const cz = z0 + (z1 - z0) * (f / S.dur);
  const shake = S.shake && f >= S.shake.f && f < S.shake.f + S.shake.len ? Math.sin(((f - S.shake.f) / S.shake.len) * Math.PI * 4) * S.shake.amp * (1 - (f - S.shake.f) / S.shake.len) : 0;
  // pose pair: B, A, B, then hold B (two-frame swaps = stop-motion acting)
  const showB = S.swap ? (f >= S.swap.f && !(f >= S.swap.f + 2 && f < S.swap.f + 4)) : false;
  const t0 = S.from / 30, t1 = (S.from + S.dur) / 30, now = t0 + f / 30;
  const ws = words.filter((w) => w.s >= t0 - 0.05 && w.s < t1 - 0.05);
  const active = ws.findIndex((w) => now >= w.s && now < Math.max(w.e, w.s + 0.12));
  return <AbsoluteFill style={{ backgroundColor: S.bgColor ?? "#000" }}>
    <AbsoluteFill style={{ transform: `rotate(${shake}deg) scale(${1 + Math.abs(shake) * 0.012})` }}>
      {S.bg && <OffthreadVideo src={staticFile(S.bg)} muted />}
      {S.swap && <AbsoluteFill style={{ opacity: showB ? 1 : 0 }}><OffthreadVideo src={staticFile(S.swap.src)} muted /></AbsoluteFill>}
      <AbsoluteFill style={{ transform: `scale(${cz})`, transformOrigin: "540px 960px" }}>
        {(S.layers || []).filter((L) => L.glue !== false).map((L, i) => <LayerView key={i} L={L} f={f} />)}
      </AbsoluteFill>
      {(S.layers || []).filter((L) => L.glue === false).map((L, i) => <LayerView key={"u" + i} L={L} f={f} />)}
    </AbsoluteFill>
    {S.tag && <div style={{ position: "absolute", left: 80, top: 250, padding: "8px 16px", borderRadius: 10, background: "rgba(24,32,36,0.62)", color: "#FFF8EC",
      fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", fontSize: 32, fontWeight: 700, opacity: interpolate(f, [4, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{S.tag}</div>}
    {S.chip && <div style={{ position: "absolute", left: 80, top: S.tag ? 320 : 250, padding: "8px 18px", borderRadius: 10, background: "#FFC93C", color: "#1F2A30",
      fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", fontSize: 36, fontWeight: 800 }}>{S.chip}</div>}
    {!S.noCaption && ws.length > 0 && <div style={{ position: "absolute", left: 80, right: 80, top: 1240, textAlign: "center", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif",
      fontSize: 78, fontWeight: 800, lineHeight: 1.15, color: "#FFF8EC", WebkitTextStroke: "10px #1F2A30", paintOrder: "stroke fill" as any }}>
      {ws.map((w, i) => <span key={i} style={{ color: i === active ? "#FFC93C" : "#FFF8EC" }}>{w.w}{i < ws.length - 1 ? " " : ""}</span>)}
    </div>}
  </AbsoluteFill>;
};

export const Film: React.FC<FilmProps> = ({ shots, words }) => <AbsoluteFill style={{ backgroundColor: "#000" }}>
  {shots.map((S) => <Sequence key={S.id} from={S.from} durationInFrames={S.dur}><ShotView S={S} words={words} /></Sequence>)}
</AbsoluteFill>;
