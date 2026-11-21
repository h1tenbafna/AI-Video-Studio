import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, T, SCENE, FPS, clamp, eo, eio, prog, iso, back } from "./lib";
import { IsoBox, FlowArrow } from "./iso";
import { PartTag, StepRail, Callout, Sheet, Captions, tagHeight } from "./ui";

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps; // seconds since this Sequence started
};

// scene fade in/out so cuts feel like sheets swapping
const useFade = (dur: number) => {
  const t = useT();
  return Math.min(eo(prog(t, 0, 0.25)), 1 - eo(prog(t, dur - 0.25, 0.25)));
};

const Header: React.FC<{ t: number }> = ({ t }) => {
  const a = eo(prog(t, 0.2, 0.6));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
      <rect x={36} y={36} width={1008} height={100} fill={C.tag} stroke={C.navy} strokeWidth={3.5} />
      <g transform="translate(70 86)">
        <line x1={0} y1={0} x2={70} y2={0} stroke={C.navy} strokeWidth={14} strokeLinecap="round" />
        <line x1={0} y1={0} x2={70} y2={0} stroke={C.white} strokeWidth={8} strokeLinecap="round" />
        <text x={92} y={12} fontFamily={FONT} fontWeight={600} fontSize={34} fill={C.navy}>chips flow down</text>
        <g transform="translate(400 0)">
          <line x1={0} y1={0} x2={70} y2={0} stroke={C.navy} strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={0} x2={70} y2={0} stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
          <text x={92} y={12} fontFamily={FONT} fontWeight={600} fontSize={34} fill={C.navy}>money flows up</text>
        </g>
      </g>
    </svg>
  );
};

// ---------------- Scene 1: the hook ----------------
export const Scene1: React.FC = () => {
  const t = useT();
  const fade = useFade(SCENE.s1[1] - SCENE.s1[0]);
  const chip = prog(t, 0.1, 1.3);
  const dial = eo(prog(t, 0.5, 0.8));
  const needle = -135 + 270 * eio(prog(t, 0.9, 3.4));
  const title = eo(prog(t, 0.9, 0.7));
  const byHour = back(prog(t, 2.3, 0.5));
  const o = { x: 520, y: 760, s: 1.7 };
  const cx = 760;
  const cy = 400;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <IsoBox o={o} w={200} d={200} h={26} t={chip} kind="chip" />
        <g opacity={dial}>
          <circle cx={cx} cy={cy} r={140} fill={C.tag} stroke={C.navy} strokeWidth={5} />
          <circle cx={cx} cy={cy} r={118} fill="none" stroke={C.mid} strokeWidth={2.5} strokeDasharray="3 10" />
          {Array.from({ length: 13 }).map((_, i) => {
            const a = ((-135 + i * 22.5) * Math.PI) / 180;
            return <line key={i} x1={cx + Math.sin(a) * 104} y1={cy - Math.cos(a) * 104} x2={cx + Math.sin(a) * 128} y2={cy - Math.cos(a) * 128} stroke={C.navy} strokeWidth={i % 3 === 0 ? 6 : 3} />;
          })}
          <g transform={`rotate(${needle} ${cx} ${cy})`}>
            <line x1={cx} y1={cy + 18} x2={cx} y2={cy - 104} stroke={C.orange} strokeWidth={9} strokeLinecap="round" />
            <line x1={cx} y1={cy + 18} x2={cx} y2={cy - 104} stroke={C.navy} strokeWidth={3} strokeLinecap="round" />
          </g>
          <circle cx={cx} cy={cy} r={14} fill={C.navy} />
          </g>
        <text x={cx} y={cy - 168} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={38} fill={C.navy} letterSpacing={3} opacity={dial}>PER HOUR</text>
        {/* dimension line from the chip to the meter */}
        {(() => {
          const a = iso(o, [200, 0, 26]);
          const bx = cx - 80;
          const by = cy + 120;
          return (
            <g opacity={dial}>
              <line x1={a[0]} y1={a[1]} x2={a[0]} y2={by + 30} stroke={C.navy} strokeWidth={3} strokeDasharray="10 8" />
              <line x1={a[0]} y1={by + 30} x2={bx} y2={by} stroke={C.navy} strokeWidth={3} strokeDasharray="10 8" />
              <circle cx={a[0]} cy={a[1]} r={9} fill={C.orange} stroke={C.navy} strokeWidth={3} />
            </g>
          );
        })()}
      </svg>
      <div style={{ position: "absolute", left: 80, top: 1160, fontFamily: FONT, fontWeight: 800, color: C.navy, fontSize: 150, lineHeight: "150px", opacity: title, transform: `translateY(${(1 - title) * 40}px)`, letterSpacing: -3 }}>
        RENT THE<br />CHIPS
        <div style={{ height: 14, background: C.orange, borderBottom: `3px solid ${C.navy}`, width: `${title * 640}px`, marginTop: 14 }} />
      </div>
      <div style={{ position: "absolute", left: 84, top: 1540, opacity: clamp(byHour), transform: `scale(${0.8 + 0.2 * byHour})`, transformOrigin: "left center", background: C.orange, border: `4px solid ${C.navy}`, color: C.navy, fontFamily: FONT, fontWeight: 800, fontSize: 56, padding: "6px 22px", letterSpacing: 2, boxShadow: `6px 6px 0 ${C.navy}33` }}>
        BY THE HOUR
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 2: the rental chain (atelier hero) ----------------
const D2 = SCENE.s2[1] - SCENE.s2[0];
const L = { b2: T.s3 - T.s2, b3: T.s4 - T.s2 }; // local beat starts
const X = 320;
const tgt = (o: { x: number; y: number; s: number }, w: number, d: number, h: number): [number, number] => iso(o, [w, d / 2, h / 2]);

export const Scene2: React.FC = () => {
  const t = useT();
  const fade = useFade(D2);
  const cam = 200 * eio(prog(t, L.b2 - 0.2, 1.2)) + 130 * eio(prog(t, L.b3 - 0.2, 1.2));

  const oFab = { x: X, y: 400, s: 1.0 };
  const oCloud = { x: X, y: 800, s: 0.85 };
  const oRack = { x: X, y: 1120, s: 0.85 };
  const oLab = { x: X, y: 1500, s: 0.85 };
  const oPhone = { x: X + 30, y: 1790, s: 0.9 };

  const fabT = prog(t, 0.1, 1.4);
  const cloudT = prog(t, L.b2 + 0.05, 1.4);
  const rackT = prog(t, L.b2 + 2.0, 1.4);
  const labT = prog(t, L.b3 + 0.2, 1.4);
  const phoneT = prog(t, 16.1, 1.0);

  const col1 = eo(prog(t, L.b2, 0.6));
  const col2 = eo(prog(t, L.b2 + 2.3, 0.6));
  const dollar = eo(prog(t, 3.0, 1.8)) * 89;
  const dollarOp = 1 - eo(prog(t, L.b2 - 0.3, 0.5));
  const priceOp = Math.min(1, eo(prog(t, 9.9, 0.1))) * (1 - eo(prog(t, 14.0, 0.5)));

  const worldStyle: React.CSSProperties = { position: "absolute", inset: 0, transform: `translateY(${-cam}px)` };
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(140px 0 0 0)" }}>
      <div style={worldStyle}>
        <svg width={1080} height={2300} style={{ position: "absolute", inset: 0 }}>
          <IsoBox o={oFab} w={170} d={170} h={150} t={fabT} kind="fab" />
          <IsoBox o={oCloud} w={230} d={140} h={100} t={cloudT} kind="cloud" ghost />
          <IsoBox o={oRack} w={200} d={140} h={130} t={rackT} kind="rack" ghost />
          <IsoBox o={oLab} w={170} d={170} h={120} t={labT} kind="lab" ghost />
          <IsoBox o={oPhone} w={70} d={14} h={150} t={phoneT} kind="phone" ghost />
          {/* chips flow down, money flows up */}
          <FlowArrow from={[X - 40, 590]} to={[X - 40, 690]} t={prog(t, L.b2 - 0.5, 0.6)} time={t} color={C.white} token="chip" count={1} />
          <FlowArrow from={[X + 40, 690]} to={[X + 40, 590]} t={prog(t, 14.6, 0.6)} time={t} color={C.orange} token="coin" count={1} />
          <FlowArrow from={[X - 40, 925]} to={[X - 40, 1005]} t={prog(t, L.b2 + 1.6, 0.6)} time={t} color={C.white} token="chip" count={1} />
          <FlowArrow from={[X + 40, 1005]} to={[X + 40, 925]} t={prog(t, 15.0, 0.6)} time={t} color={C.orange} token="coin" count={1} />
          <FlowArrow from={[X - 40, 1275]} to={[X - 40, 1385]} t={prog(t, L.b3 - 0.4, 0.6)} time={t} color={C.white} token="chip" count={1} />
          <FlowArrow from={[X + 40, 1385]} to={[X + 40, 1275]} t={prog(t, 15.4, 0.6)} time={t} color={C.orange} token="coin" count={1} />
        </svg>
        <PartTag target={tgt(oFab, 170, 170, 150)} x={520} y={200} w={520} index="1" title="NVIDIA" role={["makes the chips"]} t={prog(t, 1.2, 1.1)} collapsed={col1} />
        <div style={{ opacity: dollarOp, position: "absolute", inset: 0 }}>
          <Callout x={520} y={352} w={520} t={prog(t, 2.8, 1.0)} big={`$${Math.round(dollar)}B`} small={["data-center sales,", "last quarter"]} />
        </div>
        <PartTag target={tgt(oCloud, 230, 140, 100)} x={520} y={560} w={520} index="2" title="THE CLOUDS" names={["Microsoft Azure", "Amazon AWS", "Google Cloud"]} role={["rent chips by the hour"]} t={prog(t, L.b2 + 0.9, 1.1)} collapsed={col2} />
        <PartTag target={tgt(oRack, 200, 140, 130)} x={520} y={880} w={520} index="3" title="CHIP RENTERS" names={["CoreWeave", "Nebius", "Lambda"]} role={["rent chips by the hour"]} t={prog(t, L.b2 + 2.9, 1.1)} collapsed={eo(prog(t, L.b3 + 0.2, 0.6))} />
        <div style={{ opacity: priceOp, position: "absolute", inset: 0 }}>
          <Callout x={520} y={1180} w={520} t={prog(t, 10.0, 1.0)} big="about $3/hour" bigSize={62} small={["to rent one top AI chip"]} foot="H100 chip, Nebius list price, 2026" />
        </div>
        <PartTag target={tgt(oLab, 170, 170, 120)} x={520} y={1400} w={520} index="4" title="AI LABS" names={["OpenAI", "Anthropic"]} role={["rent chips to build AI"]} t={prog(t, L.b3 + 1.1, 1.1)} />
        <PartTag target={iso(oPhone, [70, 7, 75])} x={520} y={1700} w={520} index="5" title="YOU" role={["pay for the answers"]} t={prog(t, 16.9, 1.0)} />
      </div>
      </div>
      <StepRail time={t} ys={[330, 700, 1070, 1440]} lit={[0.2, L.b2, L.b3, 16.4]} labels={["MAKE", "RENT", "BUILD AI", "USE"]} fadeIn={prog(t, 0.2, 0.6)} />
      <Header t={t} />
    </AbsoluteFill>
  );
};

// ---------------- Scene 3: the catch ----------------
export const Scene3: React.FC = () => {
  const t = useT();
  const fade = useFade(SCENE.s3[1] - SCENE.s3[0]);
  const o = { x: 300, y: 640, s: 1.25 };
  const wob = Math.sin(prog(t, 1.6, 2.4) * Math.PI * 6) * 2.2 * (1 - prog(t, 1.6, 2.4)) * (t > 1.6 ? 1 : 0);
  const b = prog(t, 0.1, 1.2);
  const swap = eio(prog(t, 5.0, 1.2));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${wob} ${o.x} ${o.y + 200})`}>
          <IsoBox o={o} w={200} d={140} h={130} t={b} kind="rack" />
        </g>
        {/* old chip -> new chip */}
        <g opacity={eo(prog(t, 4.6, 0.6))}>
          <IsoBox o={{ x: 280, y: 1320, s: 1.1 }} w={150} d={150} h={20} t={1} kind="chip" dim={swap} />
          <IsoBox o={{ x: 740, y: 1320, s: 1.1 }} w={150} d={150} h={20} t={prog(t, 5.0, 1.0)} kind="chip" />
          <line x1={440} y1={1370} x2={540} y2={1370} stroke={C.navy} strokeWidth={8} strokeLinecap="round" />
          <polygon points="566,1370 538,1352 538,1388" fill={C.navy} />
        </g>
      </svg>
      <PartTag target={iso(o, [200, 70, 65])} x={560} y={540} w={480} index="!" title="COREWEAVE" role={["borrowed to buy chips"]} chip={{ text: "~$47B debt, Sept 2026" }} t={prog(t, 1.4, 1.1)} />
      <Callout x={120} y={900} w={840} t={prog(t, 3.2, 1.0)} small={["COLLATERAL = what the lender", "can take if the loan isn't repaid"]} bigSize={0} />
      <div style={{ position: "absolute", left: 110, top: 1500, width: 340, fontFamily: FONT, fontWeight: 800, fontSize: 40, lineHeight: "46px", color: C.navy, textAlign: "center", opacity: eo(prog(t, 4.8, 0.6)) }}>OLDER CHIP<div style={{ fontWeight: 600, fontSize: 36, color: C.mid }}>worth less</div></div>
      <div style={{ position: "absolute", left: 570, top: 1500, width: 340, fontFamily: FONT, fontWeight: 800, fontSize: 40, lineHeight: "46px", color: C.navy, textAlign: "center", opacity: eo(prog(t, 5.4, 0.6)) }}>NEWER CHIP<div style={{ fontWeight: 600, fontSize: 36, color: C.mid }}>takes its place</div></div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 4: the bet ----------------
export const Scene4: React.FC = () => {
  const t = useT();
  const fade = useFade(SCENE.s4[1] - SCENE.s4[0]);
  const n = Math.round(700 * eo(prog(t, 0.5, 2.6)));
  const plus = prog(t, 3.1, 0.3);
  const names = ["AMAZON", "MICROSOFT", "ALPHABET", "META"];
  const recap = eo(prog(t, 6.0, 0.6));
  const steps = ["MAKE CHIPS", "RENT BY THE HOUR", "BUILD AI", "BORROWED MONEY"];
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 80, top: 190, width: 920, fontFamily: FONT, color: C.navy, background: C.tag, border: `4px solid ${C.navy}`, boxShadow: `8px 8px 0 ${C.navy}33`, padding: "20px 30px 26px", opacity: eo(prog(t, 0.2, 0.5)) }}>
        <div style={{ fontWeight: 800, fontSize: 230, lineHeight: 1.0, letterSpacing: -6 }}>${n}B{plus > 0 ? "+" : ""}</div>
        <div style={{ height: 14, background: C.orange, borderBottom: `3px solid ${C.navy}`, width: `${eo(prog(t, 2.0, 1.0)) * 100}%`, margin: "10px 0 12px" }} />
        <div style={{ fontSize: 40, fontWeight: 600, whiteSpace: "nowrap" }}>planned AI infrastructure spend, 2026</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {(() => {
          const bus = eo(prog(t, 2.2, 1.2));
          const yTop = 566;
          const yEnd = 676 + 3 * 120 + 38;
          return (
            <g>
              <line x1={104} y1={yTop} x2={104} y2={yTop + (yEnd - yTop) * bus} stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
              <circle cx={104} cy={yTop} r={9} fill={C.orange} stroke={C.navy} strokeWidth={3} />
            </g>
          );
        })()}
      </svg>
      {names.map((nm, i) => {
        const y = 640 + i * 120;
        const tt = prog(t, 2.6 + i * 0.4, 0.8);
        return (
          <React.Fragment key={nm}>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <line x1={104} y1={y + 38} x2={104 + 46 * eo(prog(tt, 0, 0.5))} y2={y + 38} stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
            </svg>
            <PartTag target={[104, y + 38]} x={150} y={y} w={700} index={String(i + 1)} title={nm} t={tt} leader={false} titleSize={46} />
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 80, top: 1180, width: 920, fontFamily: FONT, fontWeight: 800, fontSize: 62, color: C.navy, textAlign: "center", border: `4px solid ${C.navy}`, background: C.white, padding: "16px 10px", opacity: eo(prog(t, 4.2, 0.6)), boxShadow: `8px 8px 0 ${C.navy}33`, letterSpacing: 1 }}>
        THE BET: AI PAYS IT BACK
      </div>
      <div style={{ position: "absolute", left: 60, top: 1400, width: 960, display: "flex", gap: 14, opacity: recap, transform: `translateY(${(1 - recap) * 30}px)` }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, background: i === 3 ? C.orange : C.tag, border: `3.5px solid ${C.navy}`, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.navy, textAlign: "center", padding: "16px 6px", lineHeight: "38px", position: "relative" }}>
            <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.8 }}>{i + 1}</div>
            {s}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
