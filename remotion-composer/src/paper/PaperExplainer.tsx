import React from "react";
import { C, W, H, Defs, Hill, House, Person, Thread, Card, T, Lines, SourceTag, Title, Cut, Coin, PillTag, Light, SERIF } from "./kit";
import { Sky, Lamp, Gear } from "./scenes";
import { A, Pop, Captions, useT, prog, eo, bk, bn, lerp, stepT, tri, cl } from "./anim";

export const TOTAL_FRAMES = 1395; // 46.5 s @ 30 fps

/* ---------- Scene 1 (0 - 9.5 s) ---------- */
const S1: React.FC<{ t: number }> = ({ t }) => {
  const drift = Math.sin(t * 0.5) * 10;
  const bob = Math.sin(stepT(t, 6) * 7) * 4;
  const bowl = tri(t, 4, 1.5), lift = tri(t, 5, 2);
  const umb = bn(prog(t, 2.9, 0.9));
  const cardY = lerp(1760, 1390, eo(prog(t, 5.7, 0.8)));
  const val = Math.round(29 * eo(prog(t, 6.3, 0.8)));
  const fadeTxt = prog(t, 6.3, 0.5);
  const iso = prog(t, 4.75, 0.6);
  const zoom = lerp(1.07, 1, eo(prog(t, 0, 3.6)));
  return (
    <g>
      <A px={540} py={960} s={zoom}>
      <Sky />
      <A x={drift * 0.5}><Hill y={700} fill={C.hill1} amp={55} blur="far" /></A>
      <A x={drift}><Hill y={790} fill={C.hill2} amp={40} ph={2} blur="mid" /></A>
      <A y={lerp(-560, 0, umb)}>
        <Cut>
          <path d="M170 500 Q540 190 910 500 Q840 455 775 500 Q705 455 640 500 Q590 455 540 500 Q490 455 440 500 Q375 455 305 500 Q240 455 170 500 Z" fill={C.mustard} />
          <path d="M540 285 L440 500 M540 285 L305 500 M540 285 L640 500 M540 285 L775 500" stroke="#C98A1B" strokeWidth={5} fill="none" opacity={0.7} />
          <rect x={532} y={480} width={16} height={190} rx={8} fill={C.wood} />
        </Cut>
        <Pop t={t} at={3.6} px={540} py={405}><Cut sm transform="translate(540 405) rotate(-3)"><rect x={-160} y={-36} width={320} height={72} rx={14} fill={C.paper} /><T x={0} y={15} size={42} ls={5}>INSURANCE</T></Cut></Pop>
      </A>
      <Pop t={t} at={0.3} px={190} py={900}><House x={190} y={900} s={1.1} roof={C.terracotta} /></Pop>
      <Pop t={t} at={0.55} px={540} py={880}><House x={540} y={880} s={1.2} roof={C.violet} /></Pop>
      <Pop t={t} at={0.8} px={890} py={900}><House x={890} y={900} s={1.1} roof={C.teal} lit={iso < 0.5} dim={iso >= 0.5} /></Pop>
      <Hill y={930} fill={C.hill3} amp={28} ph={4} />
      <Lamp x={365} y={850} /><g opacity={1 - iso}><Lamp x={715} y={850} /></g>
      <Thread x1={215} y1={800} x2={515} y2={780} sag={70} draw={prog(t, 1.9, 1.2)} />
      <g opacity={1 - iso}><Thread x1={565} y1={780} x2={865} y2={800} sag={70} draw={prog(t, 2.1, 1.2)} /></g>
      <Thread x1={565} y1={780} x2={865} y2={800} sag={70} color="#8C8FB8" glow={false} dash="12 16" op={iso * 0.9} />
      <g opacity={1 - iso * 0.7}><Thread x1={190} y1={730} x2={890} y2={730} sag={150} w={5} op={0.85} draw={prog(t, 2.5, 1.5)} /></g>
      <Cut><rect x={-20} y={1130} width={W + 40} height={300} fill="#232560" /></Cut>
      {/* ladder + helper: the helper steadies, the climber bobs */}
      <Cut sm transform="translate(60 1190)">
        <rect x={0} y={-230} width={12} height={230} rx={5} fill={C.wood} /><rect x={70} y={-230} width={12} height={230} rx={5} fill={C.wood} />
        {[-200, -150, -100, -50].map((y) => <rect key={y} x={0} y={y} width={82} height={10} rx={4} fill={C.wood} />)}
      </Cut>
      <Person x={165} y={1200} s={1.2} body={C.mustard} armF={150 + bob} hair="#6B3B24" style="bun" />
      <A y={bob - 8 - prog(t, 0.6, 3) * 14}><Person x={98} y={1020} s={0.85} body={C.terracotta} armF={140 + bob * 2} armB={-30} hair="#222" /></A>
      {/* soup over the fence */}
      <Cut sm>
        {[385, 455, 525, 595].map((x) => <rect key={x} x={x} y={1100} width={28} height={110} rx={10} fill={C.paper} />)}
        <rect x={375} y={1128} width={260} height={16} rx={6} fill={C.paper} />
      </Cut>
      <Person x={330} y={1215} s={1.2} body={C.teal} armF={95 + (1 - bowl) * 12} hair="#222" />
      <Person x={680} y={1215} s={1.2} body={C.terracotta} flip armF={95 + bowl * 12} skin={C.skin2} style="long" hair="#1a1010" />
      <A x={lerp(-60, 70, bowl)} y={-Math.sin(Math.PI * bowl) * 40}>
        <Cut sm transform="translate(505 1075)"><path d="M-38 -4 Q0 46 38 -4 Z" fill={C.paper} stroke={C.mustard} strokeWidth={5} /><path d="M-16 -18 q7 -18 0 -30 M8 -18 q7 -18 0 -30" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} /></Cut>
      </A>
      {/* puddle + lift */}
      <Cut sm><ellipse cx={910} cy={1220} rx={110} ry={24} fill="#6FA4D8" /></Cut>
      <Person x={860} y={1195} s={1.15} body={C.mustard} armF={125 + lift * 25} skin={C.skin2} style="bun" hair="#1a1010" />
      <A x={lift * 70} y={-Math.sin(Math.PI * lift) * 90 + lift * 40}><Person x={915} y={1095} s={0.75} body={C.peach} armF={40} small hair="#4a2a18" /></A>
      </A>
      <A y={lerp(-160, 0, eo(prog(t, 0.1, 0.6)))} op={prog(t, 0.1, 0.4)}><Title text="THE OLDEST INSURANCE" /></A>
      {/* stat card */}
      <A y={cardY - 1390} op={prog(t, 5.65, 0.1)}>
        <Card x={540} y={1390} w={900} h={270} fill={C.paper}>
          <T x={-290} y={40} size={150} fill={C.terracotta} weight={900}>{val}%</T>
          <g opacity={fadeTxt}><Lines x={-110} y={-26} size={36} lines={["higher risk of early death", "linked to social isolation"]} anchor="start" /></g>
          <g opacity={fadeTxt}><SourceTag x={0} y={105} text="US Surgeon General advisory, 2023 (Holt-Lunstad 2015)" /></g>
        </Card>
      </A>
    </g>
  );
};

/* ---------- Scene 2 (9.5 - 18.2 s) ---------- */
const S2: React.FC<{ t: number }> = ({ t }) => {
  const phoneY = lerp(900, 0, eo(prog(t, 9.6, 0.8)));
  // thumb waypoints
  let tx = 900, ty = 1900, press = 1;
  if (t < 12.3) { const p = eo(prog(t, 11.4, 0.7)); tx = lerp(900, 560, p); ty = lerp(1900, 1330, p); if (t > 12.1) press = 0.9; }
  else if (t < 13.84) { const p = eo(prog(t, 12.3, 1.0)); tx = lerp(560, 690, p); ty = lerp(1330, 1480, p); }
  else { tx = 690; ty = 1480; const r = prog(t, 14.2, 0.8); tx = lerp(690, 900, eo(r)); ty = lerp(1480, 1900, eo(r)); if (t < 14.1) press = 0.9; }
  const ripple = (t0: number, cx: number, cy: number) => { const p = prog(t, t0, 0.7); return p > 0 && p < 1 ? <circle cx={cx} cy={cy} r={lerp(20, 130, eo(p))} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - p} /> : null; };
  const book = t > 12.18 && t < 12.4 ? 0.95 : 1, hire = t > 13.84 && t < 14.06 ? 0.95 : 1;
  const cabP = prog(t, 12.3, 1.1);
  const cabX = lerp(-240, 600, Easing_out_back(cabP));
  const price = Math.round(149 * eo(prog(t, 14.8, 1.4)));
  const snip = prog(t, 15.6, 0.3);
  return (
    <g>
      <Sky moon={false} cold />
      <A y={lerp(-160, 0, eo(prog(t, 9.6, 0.6)))}><Title text="EVERYTHING ON DEMAND" /></A>
      <g transform="translate(0 20)">
        <Hill y={560} fill="#3A3B86" amp={40} blur="far" />
        <Hill y={640} fill="#2C2D6C" amp={30} ph={2} blur="mid" />
        <House x={200} y={740} wall="#CFCBE8" roof="#6A6FA8" lit={false} dim />
        <House x={560} y={740} wall="#CFCBE8" roof="#5F6AA0" lit={false} dim />
        <House x={930} y={745} s={0.8} wall="#CFCBE8" roof="#6A6FA8" lit={false} dim />
        <Thread x1={240} y1={655} x2={520} y2={655} sag={50} color="#8C8FB8" glow={false} dash="14 18" op={0.9} />
        <A px={380} py={705} s={bk(snip)} op={snip}><Cut sm transform="translate(380 705)"><path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke={C.red} strokeWidth={8} strokeLinecap="round" /></Cut></A>
        <Cut sm><rect x={-20} y={760} width={W + 40} height={64} fill="#4A4B96" /><path d="M0 792 H1080" stroke="#8C8FB8" strokeWidth={4} strokeDasharray="30 26" /></Cut>
        {cabP > 0 && <>
          <A x={cabX - 780}><path d="M770 790 L520 760 L520 840 Z" fill="url(#glow)" opacity={0.55} /></A>
          <A x={cabX} y={805 + (cabP > 0.85 && cabP < 1 ? -4 : 0)}>
            <Cut sm><rect x={-120} y={-72} width={240} height={72} rx={20} fill={C.mustard} /><path d="M-70 -72 L-45 -118 L55 -118 L80 -72 Z" fill={C.mustard} /><rect x={-40} y={-108} width={90} height={32} rx={6} fill="#CFE3EA" /><rect x={-34} y={-142} width={68} height={24} rx={6} fill={C.paper} /><T x={0} y={-124} size={20}>TAXI</T><circle cx={-72} cy={6} r={25} fill={C.brown} /><circle cx={72} cy={6} r={25} fill={C.brown} /><circle cx={-118} cy={-34} r={9} fill="#fff" /></Cut>
          </A>
        </>}
        <Light x={240} y={730} rx={90} ry={70} op={prog(t, 14.3, 0.4)} />
        <Pop t={t} at={14.34} px={290} py={830}>
          <Person x={290} y={830} s={0.95} body={C.teal} hat={C.mustard} armF={50 + Math.sin(stepT(t, 8) * 6) * 8} scarf={C.paper} style="bun" />
          <Cut sm transform="translate(350 828)"><rect x={-34} y={-24} width={68} height={42} rx={8} fill={C.terracotta} /><rect x={-14} y={-38} width={28} height={16} rx={5} fill="none" stroke={C.terracotta} strokeWidth={6} /></Cut>
        </Pop>
      </g>
      {t > 13.0 && t < 14.0 && <PillTag x={600} y={600} tx={600} ty={650} text="arrives in 4 min" size={30} />}
      <A x={lerp(-260, 0, eo(prog(t, 14.6, 0.5)))}>
        <Cut sm transform="translate(120 970) rotate(-5)"><rect x={-105} y={-58} width={210} height={120} rx={8} fill="#fff" /><T x={0} y={-12} size={26} weight={700}>CALL-OUT FEE</T><T x={0} y={40} size={50} fill={C.terracotta} weight={900}>$ {price}</T></Cut>
      </A>
      {/* coin shield replaces the umbrella as threads snip */}
      <Pop t={t} at={16.4} px={540} py={420}>
        <Cut sm transform="translate(540 420)"><path d="M0 -95 L85 -62 L74 44 Q0 118 -74 44 L-85 -62 Z" fill={C.tealDark} stroke={C.paper} strokeWidth={6} /></Cut>
        <Coin x={540} y={425} r={42} />
      </Pop>
      <A y={phoneY}>
        <Cut><rect x={140} y={1010} width={800} height={830} rx={90} fill="#0F1033" /><rect x={172} y={1044} width={736} height={770} rx={64} fill={C.paper} /></Cut>
        <T x={W / 2} y={1130} size={44} weight={700}>Your neighbourhood, an app</T>
        <A px={540} py={1255} s={book}><Cut sm><rect x={250} y={1185} width={580} height={140} rx={36} fill={C.mustard} /></Cut><T x={W / 2} y={1275} size={58} ls={2}>BOOK A RIDE</T></A>
        <A px={540} py={1470} s={hire}><Cut sm><rect x={250} y={1385} width={580} height={170} rx={36} fill={C.teal} /></Cut><T x={W / 2} y={1450} size={48} fill="#fff" ls={1}>HIRE A</T><T x={W / 2} y={1512} size={48} fill="#fff" ls={1}>SPECIALIST</T></A>
        {ripple(12.18, 540, 1255)}{ripple(13.84, 690, 1470)}
      </A>
      <A x={tx} y={ty} rot={-22} s={press}><Cut sm><rect x={-48} y={-30} width={96} height={120} rx={46} fill={C.skin} /><ellipse cx={-6} cy={-4} rx={26} ry={12} fill="#F8DCC6" /></Cut></A>
    </g>
  );
};
const Easing_out_back = (p: number) => bk(p);

/* ---------- Scene 3 (18.2 - 25.35 s) ---------- */
const S3: React.FC<{ t: number }> = ({ t }) => {
  const cols = [190, 540, 890], rows = [520, 890, 1260];
  const hair = ["#2a1a14", "#6B3B24", "#111", "#8a5a30", "#222", "#3a2a40", "#5a3a20", "#1a1010"];
  let n = 0;
  // knock timeline for the actor
  let arm = 20, phone = false;
  if (t > 19.4 && t < 21.4) { arm = lerp(20, 150, eo(prog(t, 19.4, 0.5))); const k = t - 19.9; if (k > 0 && k < 1.1) arm += Math.sin(k * 20) * 12; }
  else if (t >= 21.4) { arm = lerp(150, 58, eo(prog(t, 21.4, 0.4))); phone = t > 21.7; }
  const knockOp = t > 19.9 && t < 21.3 ? 0.5 + 0.5 * Math.sin((t - 19.9) * 20) : 0;
  const slam = prog(t, 21.7, 0.3), shake = t > 21.95 && t < 22.3 ? Math.sin(t * 90) * 6 * (22.3 - t) / 0.35 : 0;
  const dimAt = (i: number) => cl(prog(t, 24.4 + i * 0.11, 0.35) * 0.65);
  return (
    <g>
      <Sky moon={false} cold />
      <A y={lerp(-160, 0, eo(prog(t, 18.3, 0.5)))}><Title text="BY CHOICE" /></A>
      <A s={lerp(1, 1.0, 0)}><Cut><rect x={30} y={340} width={1020} height={1150} rx={24} fill="#35377F" /></Cut><Cut sm><rect x={30} y={320} width={1020} height={40} rx={14} fill={C.violet} /></Cut></A>
      {rows.map((ry, ri) => cols.map((cx, ci) => {
        const isGap = ri === 1 && ci === 1, isActor = ri === 1 && ci === 0;
        const idx = n++;
        const appear = prog(t, 18.3 + idx * 0.08, 0.35);
        const flick = 1 + Math.sin(stepT(t, 5) * 3 + idx) * 0.03;
        return (
          <A key={`${ri}${ci}`} px={cx} py={ry} s={Math.max(0.001, bk(appear))} op={cl(appear * 3)}>
            <Cut sm>
              <rect x={cx - 140} y={ry - 150} width={280} height={300} rx={14} fill={isGap ? "#1B1D52" : "#F8C45A"} />
              {!isGap && <path d={`M${cx - 140} ${ry - 150} Q${cx - 100} ${ry - 90} ${cx - 140} ${ry - 30} Z`} fill={C.terracotta} opacity={0.8} />}
              <rect x={cx - 3} y={ry - 150} width={6} height={300} fill="#35377F" /><rect x={cx - 140} y={ry - 3} width={280} height={6} fill="#35377F" />
            </Cut>
            {!isGap && <Person x={cx + (isActor ? 40 : 0)} y={ry + 140} s={0.95} flip={isActor} body={[C.teal, C.terracotta, C.violet, C.peach][idx % 4]} hair={hair[idx % 8]} style={(["short", "bun", "long"] as const)[idx % 3]} armF={isActor ? arm : 58 + Math.sin(stepT(t, 4) + idx) * 3} scarf={C.paper} skin={idx % 3 === 1 ? C.skin2 : C.skin} glow={!isActor || phone} phone={!isActor || phone} />}
            {isGap && <Thread x1={cx - 110} y1={ry + 30} x2={cx + 110} y2={ry + 30} sag={60} color="#8E88C8" dash="10 14" glow={false} w={6} op={prog(t, 23.3, 0.7)} />}
            {!isGap && t > 24.3 && <rect x={cx - 140} y={ry - 150} width={280} height={300} rx={14} fill={C.night} opacity={dimAt(idx)} />}
          </A>
        );
      }))}
      <Thread x1={270} y1={900} x2={420} y2={930} sag={25} color={C.mustard} dash="8 14" glow={false} w={5} op={prog(t, 21.6, 0.5)} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${345 + i * 24} ${760 - i * 4} q10 24 0 48`} stroke={C.paper} strokeWidth={5} fill="none" strokeLinecap="round" opacity={knockOp * (0.9 - i * 0.25)} />)}
      <g opacity={prog(t, 23.4, 0.6)}><T x={540} y={1070} size={36} fill="#C9C3F0" weight={600} font={SERIF}>the habit of leaning</T></g>
      {slam > 0 && <A x={shake} px={540} py={800} s={lerp(2.2, 1, eo(slam))} op={cl(slam * 5)}>
        <Cut sm transform="translate(540 800) rotate(-6)"><rect x={-130} y={-62} width={260} height={124} rx={12} fill="#E3F2F0" stroke={C.teal} strokeWidth={7} /><T x={0} y={-8} size={38} fill={C.tealDark} ls={2}>✓ PROGRESS</T><T x={0} y={40} size={38} fill={C.tealDark} ls={2}>BY CHOICE</T></Cut>
      </A>}
    </g>
  );
};

/* ---------- Scene 4 (25.35 - 33.0 s) ---------- */
const Pair: React.FC<{ t: number; y: number; n: number; tl: number; tr: number; ll: string; rl: string; price: string; left: React.ReactNode; right: React.ReactNode }> = ({ t, y, n, tl, tr, ll, rl, price, left, right }) => {
  const ts = tr + 0.55, sp = prog(t, ts, 0.3), shake = t > ts + 0.25 && t < ts + 0.6 ? Math.sin(t * 90) * 6 * (ts + 0.6 - t) / 0.35 : 0;
  return (
    <g>
      <Pop t={t} at={tl} px={285} py={y} dur={0.4}>
        <Card x={285} y={y} w={470} h={340} fill={C.teal}><g transform="translate(0 30) scale(1.2)">{left}</g><T x={0} y={-118} size={42} fill="#fff" ls={3}>{ll}</T></Card>
        <Cut sm transform={`translate(75 ${y + 135}) rotate(-8)`}><rect x={0} y={-32} width={180} height={64} rx={10} fill={C.paper} /><T x={90} y={14} size={40} fill={C.terracotta}>{price}</T></Cut>
      </Pop>
      <Pop t={t} at={tr} px={795} py={y} dur={0.4}>
        <Card x={795} y={y} w={470} h={340} fill={C.mustard}><Light x={0} y={20} rx={200} ry={140} op={0.7} /><g transform="translate(0 30) scale(1.2)">{right}</g><T x={0} y={-118} size={38} fill={C.brown} ls={2}>{rl}</T></Card>
      </Pop>
      {sp > 0 && <A x={shake} px={540} py={y + 140} s={lerp(2.4, 0.72, eo(sp))} op={cl(sp * 5)} rot={-8}><Cut sm transform={`translate(540 ${y + 140})`}><rect x={-190} y={-44} width={380} height={88} rx={12} fill="#FBE9E6" stroke={C.red} strokeWidth={7} /><T x={0} y={16} size={46} fill={C.red} ls={2}>NOT FOR SALE</T></Cut></A>}
      <Pop t={t} at={tl} px={540} py={y - 60}><Cut sm transform={`translate(540 ${y - 60})`}><circle r={28} fill={C.paper} /><T x={0} y={11} size={32}>{n}</T></Cut></Pop>
    </g>
  );
};
const S4: React.FC<{ t: number }> = ({ t }) => {
  const laugh = Math.abs(Math.sin(stepT(t, 8) * 5)) * 5;
  // row 1
  const bagY = lerp(-170, 78, bn(prog(t, 25.65, 0.5))), doorW = lerp(0.3, 1, bk(prog(t, 26.2, 0.3)));
  const flip = prog(t, 27.3, 0.5);
  // row 2
  const nod = t > 28.55 ? Math.sin((t - 28.55) * 7) * 4 * (t < 29.6 ? 1 : 0) : 0;
  const slide = eo(prog(t, 29.75, 0.6)), arm1 = lerp(20, 90, eo(prog(t, 30.35, 0.4)));
  // row 3
  const pass = eo(prog(t, 31.25, 0.35)), bar = eo(prog(t, 31.6, 0.35));
  const sh = eo(prog(t, 32.2, 0.5));
  const xs = [-100, -45, 15, 70].map((x, i) => lerp(x, x - 28 - i * 4, sh));
  return (
    <g>
      <Sky moon={false} cold />
      <A y={lerp(-160, 0, eo(prog(t, 25.4, 0.5)))}><Title text="WHAT MONEY CAN'T BUY" /></A>
      <Pair t={t} y={430} n={1} tl={25.5} tr={27.1} ll="CONVENIENCE" rl="SHARED HISTORY" price="$ 4.99"
        left={<g><rect x={-50} y={-70} width={100} height={170} rx={8} fill="#2A2C66" /><A px={-50} py={0} sx={doorW}><rect x={-50} y={-70} width={100} height={170} rx={8} fill={C.paper} /><circle cx={34} cy={20} r={5} fill={C.brown} /></A><A y={bagY - 80}><Cut sm transform="translate(-85 80)"><rect x={-28} y={-40} width={56} height={44} rx={8} fill={C.mustard} /><path d="M-14 -40 q14 -22 28 0" stroke={C.brown} strokeWidth={5} fill="none" /></Cut></A></g>}
        right={<g><Cut sm><rect x={-105} y={-65} width={100} height={140} rx={6} fill={C.paper} /><A px={5} py={0} sx={lerp(1, -1, flip)}><rect x={5} y={-60} width={100} height={140} rx={6} fill={C.paper} transform="rotate(4 55 10)" /></A></Cut><A y={-laugh}><Person x={-55} y={60} s={0.38} body={C.teal} /></A><A y={-laugh * 0.7}><Person x={-20} y={60} s={0.32} body={C.terracotta} flip small /></A><A y={-laugh * 0.8}><Person x={50} y={64} s={0.34} body={C.teal} hair="#aaa" /></A><A y={-laugh}><Person x={88} y={64} s={0.34} body={C.terracotta} flip style="bun" /></A></g>} />
      <Pair t={t} y={900} n={2} tl={28.5} tr={29.7} ll="EXPERTISE" rl="IN YOUR CORNER" price="$ 80/hr"
        left={<g><Cut sm><rect x={-95} y={-75} width={190} height={150} rx={16} fill="#0F1033" /></Cut><rect x={-80} y={-62} width={160} height={124} rx={8} fill="#DDEBFF" /><A y={nod} rot={nod}><circle cx={0} cy={-20} r={28} fill={C.skin} /></A><rect x={-38} y={8} width={76} height={46} rx={22} fill={C.paper} /></g>}
        right={<g><Cut sm><rect x={-140} y={40} width={280} height={14} rx={6} fill={C.wood} /></Cut><Person x={-45} y={44} s={0.55} body={C.terracotta} armF={arm1} style="long" hair="#2a1a14" /><A x={lerp(190, 0, slide)}><Person x={38} y={44} s={0.55} body={C.teal} flip armF={20} /></A></g>} />
      <Pair t={t} y={1370} n={3} tl={31.15} tr={32.05} ll="ACCESS" rl="BELONGING" price="VIP $$$"
        left={<g><A y={lerp(0, 52, pass)}><Cut sm><rect x={-45} y={-78} width={90} height={54} rx={8} fill={C.paper} /></Cut><T x={0} y={-40} size={32} fill={C.terracotta}>VIP</T></A><rect x={-90} y={-8} width={22} height={90} rx={7} fill="#0F1033" /><rect x={68} y={-8} width={22} height={90} rx={7} fill="#0F1033" /><A px={-68} py={30} rot={-70 * bar}><rect x={-68} y={24} width={136} height={12} rx={6} fill={C.mustard} /></A></g>}
        right={<g><Cut sm><ellipse cx={0} cy={40} rx={140} ry={20} fill={C.wood} /></Cut>{xs.map((x, i) => <Person key={i} x={x} y={36} s={0.42} body={[C.teal, C.terracotta, C.violet, C.peach][i]} hair={["#222", "#6b3b24", "#111", "#8a5a30"][i]} style={(["short", "bun", "long", "short"] as const)[i]} />)}<A x={lerp(220, 0, sh)}><Person x={96} y={36} s={0.42} body={C.mustard} hair="#4a2a18" /></A></g>} />
    </g>
  );
};

/* ---------- Scene 5 (33.0 - 37.7 s) ---------- */
const S5: React.FC<{ t: number }> = ({ t }) => {
  const walk = eo(prog(t, 33.1, 1.5)), step = Math.abs(Math.sin(stepT(t, 8) * 6)) * (walk < 1 ? 7 : 0);
  const open = eo(prog(t, 34.2, 0.6)), lean = prog(t, 35.1, 0.8);
  const relit = prog(t, 35.0, 1.4);
  return (
    <g>
      <Sky moon />
      <A y={lerp(-160, 0, eo(prog(t, 33.05, 0.5)))}><Title text="THE DOOR OPENS" /></A>
      <Hill y={640} fill={C.hill1} amp={50} blur="far" />
      <Hill y={730} fill={C.hill2} amp={35} ph={2} blur="mid" />
      <House x={150} y={930} s={0.95} roof={C.terracotta} lit={relit > 0.5} dim={relit <= 0.5} />
      <House x={930} y={930} s={0.95} roof={C.teal} lit={relit > 0.5} dim={relit <= 0.5} />
      <Light x={540} y={1010} rx={420} ry={330} op={open} />
      <Cut><rect x={290} y={700} width={500} height={430} rx={14} fill={C.paper} /><path d="M255 712 L540 470 L825 712 Z" fill={C.violet} stroke={C.violet} strokeWidth={14} strokeLinejoin="round" /><rect x={640} y={430} width={46} height={110} rx={6} fill={C.terracotta} /></Cut>
      <path d="M440 1130 L640 1130 L800 1500 L280 1500 Z" fill="#FFD78A" opacity={0.5 * open} />
      <Cut sm><rect x={430} y={780} width={220} height={350} rx={14} fill="#3A2A66" /></Cut>
      <A px={430} py={950} sx={open}><Cut sm><rect x={430} y={780} width={220} height={350} rx={14} fill="#FFE2A0" /></Cut></A>
      <A op={open}><Cut sm><rect x={320} y={770} width={80} height={100} rx={8} fill="#FFE2A0" /></Cut><Cut sm><rect x={690} y={770} width={70} height={100} rx={8} fill="#FFE2A0" /></Cut></A>
      <Pop t={t} at={34.8} px={540} py={1120}>
        <A px={505} py={1125} rot={lerp(0, 4, lean)}><Person x={505} y={1125} s={0.95} body={C.teal} armF={110} style="bun" hair="#6B3B24" /></A>
        <A px={580} py={1125} rot={lerp(0, -4, lean)}><Person x={580} y={1125} s={0.95} body={C.terracotta} flip armF={110} skin={C.skin2} hair="#1a1010" /></A>
      </Pop>
      <Pop t={t} at={35.3} px={705} py={1045}>
        <Cut sm transform="translate(705 1045)"><rect x={-30} y={-40} width={60} height={50} rx={14} fill={C.mustard} /><path d="M30 -20 L56 -34" stroke={C.mustard} strokeWidth={9} strokeLinecap="round" /></Cut>
        <g transform={`translate(705 ${1045 - Math.sin(t * 5) * 3})`}><path d="M-6 -50 q6 -16 0 -28 M10 -50 q6 -16 0 -28" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" /></g>
      </Pop>
      <A x={lerp(-420, 450, walk)} y={-step}><Person x={0} y={1300} s={1.15} body={C.mustard} armF={t < 34.6 ? 30 : 150} hair="#222" scarf={C.terracotta} /></A>
      <Thread x1={180} y1={830} x2={320} y2={780} sag={40} draw={prog(t, 35.0, 1.0)} />
      <Thread x1={760} y1={780} x2={900} y2={830} sag={40} draw={prog(t, 35.3, 1.0)} />
      <Thread x1={150} y1={690} x2={930} y2={690} sag={120} w={5} draw={prog(t, 35.6, 1.2)} />
      <A y={lerp(300, 0, bk(prog(t, 36.0, 0.6)))} op={prog(t, 36.0, 0.2)}>
        <Card x={540} y={1400} w={940} h={190} fill={C.paper}><Lines x={0} y={-30} size={42} lines={["Social connection is as essential", "to survival as food and water."]} font={SERIF} weight={700} /><SourceTag x={0} y={76} text="US Surgeon General advisory, 2023" /></Card>
      </A>
    </g>
  );
};

/* ---------- Scene 6 (37.7 - 42.5 s) ---------- */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const settle = lerp(1.03, 1, eo(prog(t, 41.2, 1.2)));
  const arrow = eo(prog(t, 40.5, 1.1)), head = bk(prog(t, 41.3, 0.4));
  return (
    <g>
      <Sky moon={false} cold />
      <A y={lerp(-260, 0, eo(prog(t, 37.75, 0.6)))}>
        <Cut sm transform="translate(190 150) rotate(-4)"><rect x={-90} y={-40} width={180} height={80} rx={14} fill={C.paper} /><T x={0} y={18} size={46} ls={3}>P.S.</T></Cut>
      </A>
      <A y={lerp(-700, 0, bk(prog(t, 37.8, 0.7)))}>
        <Card x={540} y={640} w={900} h={620} fill={C.teal} rot={-1.5}>
          <A px={330} py={-180} rot={t * 20}><Gear x={330} y={-180} r={50} fill="#2B7480" /></A>
          <T x={-40} y={-200} size={64} fill="#fff" ls={6}>FUNCTION</T>
          {["Rides", "Repairs", "Groceries", "Advice"].map((l, i) => {
            const tk = prog(t, 38.1 + i * 0.4, 0.2);
            return (
              <g key={l} transform={`translate(-310 ${-110 + i * 100})`}>
                <rect x={0} y={-36} width={64} height={64} rx={12} fill={C.paper} />
                {tk > 0 && <A px={32} py={-4} s={bk(tk)}><path d="M12 -4 L28 12 L54 -26" stroke={C.tealDark} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></A>}
                <T x={100} y={14} size={54} fill="#fff" anchor="start" weight={700}>{l}</T>
              </g>
            );
          })}
        </Card>
      </A>
      <Light x={540} y={1250} rx={620} ry={330} op={prog(t, 40.3, 1.2)} />
      <A y={lerp(700, 0, bk(prog(t, 40.2, 0.7)))} px={540} py={1250} s={settle} op={prog(t, 40.15, 0.05)}>
        <Card x={540} y={1250} w={900} h={420} fill={C.mustard} rot={1.2}>
          <T x={-40} y={-120} size={64} ls={6}>HUMAN NEEDS</T>
          <path d="M-400 30 L520 30" pathLength={1} strokeDasharray={`${arrow} 1.01`} stroke={C.terracotta} strokeWidth={34} fill="none" strokeLinecap="round" />
          {head > 0 && <A px={500} py={30} s={head}><path d="M360 -50 L500 30 L360 110" stroke={C.terracotta} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" /></A>}
        </Card>
      </A>
    </g>
  );
};

/* ---------- Scene 7 (42.5 - 46.5 s): silent still ---------- */
const S7: React.FC = () => (
  <g>
    <rect width={W} height={H} fill={C.night} />
    <Card x={540} y={940} w={900} h={640} fill={C.paper} rot={-0.6}>
      <Lines x={0} y={-140} size={56} lh={1.35} font={SERIF} weight={700} lines={["Average daily socialising", "in the US fell from", "45 to 35 minutes", "over about 20 years."]} />
      <SourceTag x={0} y={260} text="Axios, July 2026, BLS American Time Use Survey" />
    </Card>
  </g>
);

const SCENES: { a: number; b: number; off: number; el: (t: number) => React.ReactNode; cut?: boolean }[] = [
  { a: 0, b: 9.5, off: 0, el: (t) => <S1 t={t} /> },
  { a: 9.5, b: 18.2, off: 0, el: (t) => <S2 t={t} /> },
  { a: 18.2, b: 25.35, off: 0, el: (t) => <S3 t={t} /> },
  { a: 25.35, b: 33.0, off: 0, el: (t) => <S4 t={t} /> },
  { a: 33.0, b: 37.7, off: 0, el: (t) => <S5 t={t} /> },
  { a: 37.7, b: 42.5, off: 0, el: (t) => <S6 t={t} /> },
  { a: 42.5, b: 99, off: 0, el: () => <S7 />, cut: true },
];

export const PaperExplainer: React.FC = () => {
  const t = useT();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", background: C.night }}>
      <Defs />
      {SCENES.map((s, i) => {
        if (t < s.a || t > s.b + 0.35) return null;
        const p = s.cut ? 1 : prog(t, s.a, 0.35);
        return <g key={i} opacity={p} transform={`translate(0 ${s.cut ? 0 : lerp(50, 0, eo(p))})`}>{s.el(t - s.off)}</g>;
      })}
      <rect width={W} height={H} fill="url(#vig)" pointerEvents="none" />
      {t < 42.5 && <Captions t={t} />}
    </svg>
  );
};
