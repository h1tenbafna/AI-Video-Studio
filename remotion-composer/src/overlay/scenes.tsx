import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, SCENE, SF, T, back, clamp, eio, eo, prog } from "./theme";
import { Callout, Header, PartTag, StepRail, useTheme } from "./ui";

export type Anchors = Record<string, Record<string, [number, number][]>>;
export const AnchorCtx = createContext<Anchors>({});
const useAnchor = (scn: string, name: string, g: number): [number, number] => {
  const a = useContext(AnchorCtx)[scn]?.[name] ?? [[540, 960]];
  return a[Math.max(0, Math.min(a.length - 1, g - SF[scn]))];
};
const useT = (): { t: number; g: number } => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: f / fps, g: f };
};
// scene-local helper: global frame = sequence-from + local frame
const useScene = (startSec: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: f / fps, g: Math.round(startSec * fps) + f };
};
const useFade = (t: number, dur: number) => Math.min(eo(prog(t, 0, 0.2)), 1 - eo(prog(t, dur - 0.2, 0.2)));

export const Scene1: React.FC = () => {
  const C = useTheme();
  const { t, g } = useScene(SCENE.s1[0]);
  const clock = useAnchor("1", "clock", g);
  const title = eo(prog(t, 0.9, 0.7)), byHour = back(prog(t, 2.3, 0.5));
  const label = eo(prog(t, 1.4, 0.6));
  return (
    <AbsoluteFill style={{ opacity: useFade(t, SCENE.s1[1]) }}>
      <div style={{ position: "absolute", left: clock[0] - 150, top: clock[1] - 190, width: 300, textAlign: "center", opacity: label, fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.ink, background: C.tag, border: `3.5px solid ${C.ink}`, borderRadius: 10, padding: "6px 0", boxShadow: `6px 6px 0 ${C.shadow}` }}>PER HOUR</div>
      <div style={{ position: "absolute", left: 70, top: 1190, fontFamily: FONT, fontWeight: 800, color: C.tag, fontSize: 150, lineHeight: "150px", opacity: title, transform: `translateY(${(1 - title) * 40}px)`, letterSpacing: -3, textShadow: `0 6px 0 ${C.ink}, 0 0 24px ${C.ink}` }}>
        RENT THE<br />CHIPS
        <div style={{ height: 14, background: C.accent, width: `${title * 640}px`, marginTop: 14, borderRadius: 7 }} />
      </div>
      <div style={{ position: "absolute", left: 76, top: 1530, opacity: clamp(byHour), transform: `scale(${0.8 + 0.2 * byHour})`, transformOrigin: "left center", background: C.accent, border: `4px solid ${C.ink}`, borderRadius: 10, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 56, padding: "6px 22px", letterSpacing: 2, boxShadow: `6px 6px 0 ${C.shadow}` }}>BY THE HOUR</div>
    </AbsoluteFill>
  );
};

const D2 = SCENE.s2[1] - SCENE.s2[0];
const L = { b2: T.s3 - T.s2, b3: T.s4 - T.s2 };
export const Scene2: React.FC = () => {
  const { t, g } = useScene(SCENE.s2[0]);
  const A = (n: string) => useAnchor("2", n, g);
  const nv = A("nvidia"), az = A("aws"), rw = A("nebius"), lab = A("anthropic"), you = A("you");
  const tx = 660, tw = 380;
  const col1 = eo(prog(t, L.b2, 0.6)), col2 = eo(prog(t, L.b2 + 2.3, 0.6));
  const dollar = eo(prog(t, 3.0, 1.8)) * 89;
  const dollarOp = 1 - eo(prog(t, L.b2 - 0.3, 0.5));
  const priceOp = Math.min(1, eo(prog(t, 9.9, 0.1))) * (1 - eo(prog(t, 14.0, 0.5)));
  const side = (a: [number, number]): [number, number] => [a[0] + 105, a[1]];
  return (
    <AbsoluteFill style={{ opacity: useFade(t, D2) }}>
      <PartTag target={side(nv)} x={tx} y={nv[1] - 120} w={tw} index="1" title="NVIDIA" role={["makes the chips"]} t={prog(t, 1.2, 1.1)} collapsed={col1} />
      <div style={{ opacity: dollarOp, position: "absolute", inset: 0 }}><Callout x={80} y={270} w={520} t={prog(t, 2.8, 1.0)} big={`$${Math.round(dollar)}B`} small={["data-center sales,", "last quarter"]} /></div>
      <PartTag target={side(az)} x={tx} y={az[1] - 150} w={tw} index="2" title="THE CLOUDS" names={["Microsoft Azure", "Amazon AWS", "Google Cloud"]} role={["rent chips by the hour"]} t={prog(t, L.b2 + 0.9, 1.1)} collapsed={col2} />
      <PartTag target={side(rw)} x={tx} y={rw[1] - 150} w={tw} index="3" title="CHIP RENTERS" names={["CoreWeave", "Nebius", "Lambda"]} role={["rent chips by the hour"]} t={prog(t, L.b2 + 2.9, 1.1)} collapsed={eo(prog(t, L.b3 + 0.2, 0.6))} />
      <div style={{ opacity: priceOp, position: "absolute", inset: 0 }}><Callout x={80} y={270} w={640} t={prog(t, 10.0, 1.0)} big="about $3/hour" bigSize={62} small={["to rent one top AI chip"]} foot="H100 chip, Nebius list price, 2026" /></div>
      <PartTag target={side(lab)} x={tx} y={lab[1] - 120} w={tw} index="4" title="AI LABS" names={["OpenAI", "Anthropic"]} role={["rent chips to build AI"]} t={prog(t, L.b3 + 1.1, 1.1)} />
      <PartTag target={[you[0] + 60, you[1]]} x={tx} y={you[1] - 40} w={tw} index="5" title="YOU" role={["pay for the answers"]} t={prog(t, 16.9, 1.0)} />
      <StepRail time={t} lit={[0.2, L.b2, L.b3, 16.4]} labels={["MAKE", "RENT", "BUILD AI", "USE"]} fadeIn={prog(t, 0.2, 0.6)} />
      <Header t={t} />
    </AbsoluteFill>
  );
};

export const Scene3: React.FC = () => {
  const C = useTheme();
  const { t, g } = useScene(SCENE.s3[0]);
  const cw = useAnchor("3", "coreweave", g), old = useAnchor("3", "old", g);
  const lab = (x: number, text: string, sub: string, a: number) => (
    <div style={{ position: "absolute", left: Math.max(30, x - 170), top: 0, width: 340, fontFamily: FONT, fontWeight: 800, fontSize: 38, lineHeight: "44px", color: C.ink, textAlign: "center", opacity: a, background: C.tag, border: `3.5px solid ${C.ink}`, borderRadius: 10, padding: "8px 0", boxShadow: `6px 6px 0 ${C.shadow}` }}>{text}<div style={{ fontWeight: 600, fontSize: 32, color: C.mid }}>{sub}</div></div>
  );
  const newA = useAnchor("3", "new", SF["3"] + 239);
  return (
    <AbsoluteFill style={{ opacity: useFade(t, SCENE.s3[1] - SCENE.s3[0]) }}>
      <PartTag target={[cw[0] + 110, cw[1] - 20]} x={610} y={cw[1] - 150} w={430} index="!" title="COREWEAVE" role={["borrowed to buy chips"]} chip={{ text: "~$47B debt, Sept 2026" }} t={prog(t, 1.4, 1.1)} />
      <Callout x={90} y={790} w={900} t={prog(t, 3.2, 1.0)} small={["COLLATERAL = what the lender", "can take if the loan isn't repaid"]} bigSize={0} />
      <div style={{ position: "absolute", top: 1370, left: 0, width: 1080 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0 }}>{lab(old[0], "OLDER CHIP", "worth less", eo(prog(t, 4.8, 0.6)))}</div>
          <div style={{ position: "absolute", top: 0 }}>{lab(newA[0], "NEWER CHIP", "takes its place", eo(prog(t, 5.4, 0.6)))}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Scene4: React.FC = () => {
  const C = useTheme();
  const { t, g } = useScene(SCENE.s4[0]);
  const n = Math.round(700 * eo(prog(t, 0.5, 2.6))), plus = prog(t, 3.1, 0.3);
  const names: [string, string][] = [["amazon", "AMAZON"], ["microsoft", "MICROSOFT"], ["alphabet", "ALPHABET"], ["meta", "META"]];
  const recap = eo(prog(t, 6.0, 0.6));
  const steps = ["MAKE CHIPS", "RENT BY THE HOUR", "BUILD AI", "BORROWED MONEY"];
  return (
    <AbsoluteFill style={{ opacity: useFade(t, SCENE.s4[1] - SCENE.s4[0]) }}>
      <div style={{ position: "absolute", left: 80, top: 160, width: 920, fontFamily: FONT, color: C.ink, background: C.tag, border: `4px solid ${C.ink}`, borderRadius: 12, boxShadow: `8px 8px 0 ${C.shadow}`, padding: "16px 30px 22px", opacity: eo(prog(t, 0.2, 0.5)) }}>
        <div style={{ fontWeight: 800, fontSize: 200, lineHeight: 1.0, letterSpacing: -6 }}>${n}B{plus > 0 ? "+" : ""}</div>
        <div style={{ height: 12, background: C.accent, width: `${eo(prog(t, 2.0, 1.0)) * 100}%`, margin: "8px 0 10px", borderRadius: 6 }} />
        <div style={{ fontSize: 38, fontWeight: 600, whiteSpace: "nowrap" }}>planned AI infrastructure spend, 2026</div>
      </div>
      {names.map(([k, nm], i) => <Flag key={k} k={k} nm={nm} i={i} t={prog(t, 2.6 + i * 0.4, 0.8)} g={g} />)}
      <div style={{ position: "absolute", left: 80, top: 1290, width: 920, fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.ink, textAlign: "center", border: `4px solid ${C.ink}`, borderRadius: 12, background: C.tag, padding: "14px 10px", opacity: eo(prog(t, 4.2, 0.6)), boxShadow: `8px 8px 0 ${C.shadow}`, letterSpacing: 1 }}>THE BET: AI PAYS IT BACK</div>
      <div style={{ position: "absolute", left: 60, top: 1450, width: 960, display: "flex", gap: 14, opacity: recap, transform: `translateY(${(1 - recap) * 30}px)` }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, background: i === 3 ? C.accent : C.tag, border: `3.5px solid ${C.ink}`, borderRadius: 10, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: i === 3 ? C.white : C.ink, textAlign: "center", padding: "14px 6px", lineHeight: "36px" }}>
            <div style={{ fontSize: 28, fontWeight: 700, opacity: 0.8 }}>{i + 1}</div>{s}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const Flag: React.FC<{ k: string; nm: string; i: number; t: number; g: number }> = ({ k, nm, i, t, g }) => {
  const a = useAnchor("4", k, g + 0);
  return <PartTag target={[a[0], a[1] + 10]} x={Math.max(40, Math.min(1040 - 330, a[0] - 165))} y={a[1] + 70} w={330} index={String(i + 1)} title={nm} t={t} leader titleSize={34} />;
};
