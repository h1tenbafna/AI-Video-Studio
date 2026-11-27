import React from "react";
import { PillTag, Light, C, W, H, Stage, Hill, House, Person, Thread, Card, T, Lines, SourceTag, Caption, Title, Cut, Coin, SANS, SERIF } from "./kit";

/* ---------- shared dusk sky ---------- */
export const Sky: React.FC<{ moon?: boolean; cold?: boolean }> = ({ moon = true, cold }) => (
  <g>
    <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1B1D52" /><stop offset="0.45" stopColor="#4A3F8F" /><stop offset="0.72" stopColor={cold ? "#2E3170" : "#C9718F"} /><stop offset="0.9" stopColor={cold ? "#232660" : "#F7B58B"} />
    </linearGradient></defs>
    <rect width={W} height={H} fill="url(#dusk)" />
    {[[120,300],[260,420],[420,260],[610,330],[760,250],[960,420],[90,520],[880,560],[330,560],[700,480]].map(([x,y],i)=>(
      <path key={i} d={`M${x} ${y-9} L${x+3} ${y-3} L${x+9} ${y} L${x+3} ${y+3} L${x} ${y+9} L${x-3} ${y+3} L${x-9} ${y} L${x-3} ${y-3} Z`} fill={C.paper} opacity={0.75} />
    ))}
    {moon && <Cut><circle cx={850} cy={330} r={80} fill={C.paper} /><circle cx={880} cy={310} r={70} fill="#4A3F8F" /></Cut>}
  </g>
);
export const Lamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g><ellipse cx={x} cy={y} rx={60} ry={50} fill="url(#glow)" /><Cut sm><circle cx={x} cy={y} r={14} fill={C.mustard} /></Cut></g>
);

/* ---------- Scene 1: neighbourly insurance + 29% stat ---------- */
export const Scene1: React.FC = () => (
  <Stage bg={C.night}>
    <Sky />
    <Title text="THE OLDEST INSURANCE" />
    {/* layered hills, far to near */}
    <Hill y={700} fill={C.hill1} amp={55} blur="far" />
    <Hill y={790} fill={C.hill2} amp={40} ph={2} blur="mid" />
    {/* umbrella */}
    <Cut>
      <path d="M170 500 Q540 190 910 500 Q840 455 775 500 Q705 455 640 500 Q590 455 540 500 Q490 455 440 500 Q375 455 305 500 Q240 455 170 500 Z" fill={C.mustard} />
      <path d="M540 285 L440 500 M540 285 L305 500 M540 285 L640 500 M540 285 L775 500" stroke="#C98A1B" strokeWidth={5} fill="none" opacity={0.7} />
      <rect x={532} y={480} width={16} height={190} rx={8} fill={C.wood} />
    </Cut>
    <Cut sm transform="translate(540 405) rotate(-3)">
      <rect x={-160} y={-36} width={320} height={72} rx={14} fill={C.paper} />
      <T x={0} y={15} size={42} ls={5}>INSURANCE</T>
    </Cut>
    {/* village */}
    <House x={190} y={900} s={1.1} roof={C.terracotta} wall={C.paper} />
    <House x={540} y={880} s={1.2} roof={C.violet} wall={C.paper} />
    <House x={890} y={900} s={1.1} roof={C.teal} wall={C.paper} />
    <Hill y={930} fill={C.hill3} amp={28} ph={4} />
    <Lamp x={365} y={850} /><Lamp x={715} y={850} />
    <Thread x1={215} y1={800} x2={515} y2={780} sag={70} />
    <Thread x1={565} y1={780} x2={865} y2={800} sag={70} />
    <Thread x1={190} y1={730} x2={890} y2={730} sag={150} w={5} op={0.85} />
    {/* foreground ground */}
    <Cut><rect x={-20} y={1130} width={W + 40} height={300} fill="#232560" /></Cut>
    {/* ladder + two neighbours */}
    <Cut sm transform="translate(60 1190)">
      <rect x={0} y={-230} width={12} height={230} rx={5} fill={C.wood} />
      <rect x={70} y={-230} width={12} height={230} rx={5} fill={C.wood} />
      {[-200, -150, -100, -50].map((y) => <rect key={y} x={0} y={y} width={82} height={10} rx={4} fill={C.wood} />)}
    </Cut>
    <Person x={165} y={1200} s={1.2} body={C.mustard} armF={150} hair="#6B3B24" style="bun" />
    <Person x={98} y={1020} s={0.85} body={C.terracotta} armF={140} armB={-30} style="short" hair="#222" />
    {/* fence + soup */}
    <Cut sm>
      {[385, 455, 525, 595].map((x) => <rect key={x} x={x} y={1100} width={28} height={110} rx={10} fill={C.paper} />)}
      <rect x={375} y={1128} width={260} height={16} rx={6} fill={C.paper} />
    </Cut>
    <Person x={330} y={1215} s={1.2} body={C.teal} armF={95} hair="#222" />
    <Person x={680} y={1215} s={1.2} body={C.terracotta} flip armF={95} skin={C.skin2} style="long" hair="#1a1010" />
    <Cut sm transform="translate(505 1075)">
      <path d="M-38 -4 Q0 46 38 -4 Z" fill={C.paper} stroke={C.mustard} strokeWidth={5} />
      <path d="M-16 -18 q7 -18 0 -30 M8 -18 q7 -18 0 -30" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
    </Cut>
    {/* puddle + lift */}
    <Cut sm><ellipse cx={910} cy={1220} rx={110} ry={24} fill="#6FA4D8" /></Cut>
    <Person x={860} y={1195} s={1.15} body={C.mustard} armF={125} skin={C.skin2} style="bun" hair="#1a1010" />
    <Person x={915} y={1095} s={0.75} body={C.peach} armF={40} small style="short" hair="#4a2a18" />
    {/* stat card */}
    <Card x={540} y={1390} w={900} h={270} fill={C.paper}>
      <T x={-290} y={40} size={150} fill={C.terracotta} weight={900}>29%</T>
      <Lines x={-110} y={-26} size={36} lines={["higher risk of early death", "linked to social isolation"]} anchor="start" />
      <SourceTag x={0} y={105} text="US Surgeon General advisory, 2023 (Holt-Lunstad 2015)" />
    </Card>
    <Caption words={["Relationships", "were", "our", "insurance"]} active={2} />
  </Stage>
);

/* ---------- Scene 2: tap an app, hire a specialist ---------- */
export const Scene2: React.FC = () => (
  <Stage bg={C.night}>
    <Sky moon={false} cold />
    <Title text="EVERYTHING ON DEMAND" />
    <g transform="translate(0 20)">
      <Hill y={560} fill="#3A3B86" amp={40} blur="far" />
      <Hill y={640} fill="#2C2D6C" amp={30} ph={2} blur="mid" />
      <House x={200} y={740} s={1.0} wall="#CFCBE8" roof="#6A6FA8" lit={false} dim />
      <House x={560} y={740} s={1.0} wall="#CFCBE8" roof="#5F6AA0" lit={false} dim />
      <House x={930} y={745} s={0.8} wall="#CFCBE8" roof="#6A6FA8" lit={false} dim />
      <Thread x1={240} y1={655} x2={520} y2={655} sag={50} color="#8C8FB8" glow={false} dash="14 18" op={0.9} />
      <Cut sm transform="translate(380 705)"><path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke={C.red} strokeWidth={8} strokeLinecap="round" /></Cut>
      <Cut sm><rect x={-20} y={760} width={W + 40} height={64} fill="#4A4B96" /><path d="M0 792 H1080" stroke="#8C8FB8" strokeWidth={4} strokeDasharray="30 26" /></Cut>
      {/* cab, headlights */}
      <path d="M770 790 L520 760 L520 840 Z" fill="url(#glow)" opacity={0.55} />
      <Cut sm transform="translate(780 805)">
        <rect x={-120} y={-72} width={240} height={72} rx={20} fill={C.mustard} />
        <path d="M-70 -72 L-45 -118 L55 -118 L80 -72 Z" fill={C.mustard} />
        <rect x={-40} y={-108} width={90} height={32} rx={6} fill="#CFE3EA" />
        <rect x={-34} y={-142} width={68} height={24} rx={6} fill={C.paper} />
        <T x={0} y={-124} size={20} fill={C.brown}>TAXI</T>
        <circle cx={-72} cy={6} r={25} fill={C.brown} /><circle cx={72} cy={6} r={25} fill={C.brown} />
        <circle cx={-118} cy={-34} r={9} fill="#fff" />
      </Cut>
      {/* specialist at the door with toolbox */}
      <Light x={240} y={730} rx={90} ry={70} />
      <Person x={290} y={830} s={0.95} body={C.teal} hat={C.mustard} armF={50} scarf={C.paper} style="bun" />
      <Cut sm transform="translate(350 828)"><rect x={-34} y={-24} width={68} height={42} rx={8} fill={C.terracotta} /><rect x={-14} y={-38} width={28} height={16} rx={5} fill="none" stroke={C.terracotta} strokeWidth={6} /></Cut>
    </g>
    <PillTag x={780} y={600} tx={780} ty={650} text="arrives in 4 min" size={30} />
    <Cut sm transform="translate(120 970) rotate(-5)">
      <rect x={-105} y={-58} width={210} height={120} rx={8} fill="#fff" />
      <T x={0} y={-12} size={26} weight={700}>CALL-OUT FEE</T>
      <T x={0} y={40} size={50} fill={C.terracotta} weight={900}>$ 149</T>
    </Cut>
    {/* phone */}
    <Cut>
      <rect x={140} y={1010} width={800} height={830} rx={90} fill="#0F1033" />
      <rect x={172} y={1044} width={736} height={770} rx={64} fill={C.paper} />
    </Cut>
    <T x={W / 2} y={1130} size={44} weight={700}>Your neighbourhood, an app</T>
    <Cut sm><rect x={250} y={1185} width={580} height={140} rx={36} fill={C.mustard} /></Cut>
    <T x={W / 2} y={1275} size={58} ls={2}>BOOK A RIDE</T>
    <Cut sm><rect x={250} y={1385} width={580} height={170} rx={36} fill={C.teal} /></Cut>
    <T x={W / 2} y={1450} size={48} fill="#fff" ls={1}>HIRE A</T>
    <T x={W / 2} y={1512} size={48} fill="#fff" ls={1}>SPECIALIST</T>
    <circle cx={700} cy={1520} r={64} fill="none" stroke="#fff" strokeWidth={6} opacity={0.85} />
    <circle cx={700} cy={1520} r={105} fill="none" stroke="#fff" strokeWidth={4} opacity={0.4} />
    <Cut sm transform="translate(715 1535) rotate(-22)">
      <rect x={-48} y={-30} width={96} height={120} rx={46} fill={C.skin} />
      <ellipse cx={-6} cy={-4} rx={26} ry={12} fill="#F8DCC6" />
    </Cut>
    <Caption words={["Tap", "an", "app", "."]} active={2} />
  </Stage>
);

/* ---------- Scene 3: windows, by choice ---------- */
export const Scene3: React.FC = () => {
  const cols = [190, 540, 890], rows = [520, 890, 1260];
  const hair = ["#2a1a14", "#6B3B24", "#111", "#8a5a30", "#222", "#3a2a40", "#5a3a20", "#1a1010"];
  let n = 0;
  return (
    <Stage bg={C.night}>
      <Sky moon={false} cold />
      <Title text="BY CHOICE" />
      {/* apartment facade */}
      <Cut><rect x={30} y={340} width={1020} height={1150} rx={24} fill="#35377F" /></Cut>
      <Cut sm><rect x={30} y={320} width={1020} height={40} rx={14} fill={C.violet} /></Cut>
      {rows.map((ry, ri) => cols.map((cx, ci) => {
        const isGap = ri === 1 && ci === 1;
        const isActor = ri === 1 && ci === 0;
        const idx = n++;
        return (
          <g key={`${ri}${ci}`}>
            <Cut sm>
              <rect x={cx - 140} y={ry - 150} width={280} height={300} rx={14} fill={isGap ? "#1B1D52" : "#F8C45A"} />
              {!isGap && <path d={`M${cx - 140} ${ry - 150} Q${cx - 100} ${ry - 90} ${cx - 140} ${ry - 30} Z`} fill={C.terracotta} opacity={0.8} />}
              <rect x={cx - 3} y={ry - 150} width={6} height={300} fill="#35377F" /><rect x={cx - 140} y={ry - 3} width={280} height={6} fill="#35377F" />
            </Cut>
            {!isGap && <Person x={cx + (isActor ? 40 : 0)} y={ry + 140} s={0.95} flip={isActor} body={[C.teal, C.terracotta, C.violet, C.peach][idx % 4]} hair={hair[idx % 8]} style={(["short", "bun", "long"] as const)[idx % 3]} armF={isActor ? 150 : 58} scarf={C.paper} skin={idx % 3 === 1 ? C.skin2 : C.skin} glow={!isActor} phone={!isActor} />}
            {isGap && <Thread x1={cx - 110} y1={ry + 30} x2={cx + 110} y2={ry + 30} sag={60} color="#8E88C8" dash="10 14" glow={false} w={6} />}
          </g>
        );
      }))}
      {/* dotted optional thread from actor towards neighbour; knock marks */}
      <Thread x1={270} y1={900} x2={420} y2={930} sag={25} color={C.mustard} dash="8 14" glow={false} w={5} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${345 + i * 24} ${760 - i * 4} q10 24 0 48`} stroke={C.paper} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9 - i * 0.25} />)}
      <T x={540} y={1070} size={36} fill="#C9C3F0" weight={600} font={SERIF}>the habit of leaning</T>
      {/* stamp */}
      <Cut sm transform="translate(540 800) rotate(-6)">
        <rect x={-130} y={-62} width={260} height={124} rx={12} fill="#E3F2F0" stroke={C.teal} strokeWidth={7} />
        <T x={0} y={-8} size={38} fill={C.tealDark} ls={2}>✓ PROGRESS</T>
        <T x={0} y={40} size={38} fill={C.tealDark} ls={2}>BY CHOICE</T>
      </Cut>
      <Caption words={["Choice", "replaced", "need"]} active={1} />
    </Stage>
  );
};

/* ---------- Scene 4: three things money cannot buy ---------- */
const Pair: React.FC<{ y: number; n: number; left: React.ReactNode; right: React.ReactNode; ll: string; rl: string; price: string }> = ({ y, n, left, right, ll, rl, price }) => (
  <g>
    <Card x={285} y={y} w={470} h={340} fill={C.teal}>
      <g transform="translate(0 30) scale(1.2)">{left}</g>
      <T x={0} y={-118} size={42} fill="#fff" ls={3}>{ll}</T>
    </Card>
    <Cut sm transform={`translate(75 ${y + 135}) rotate(-8)`}><rect x={0} y={-32} width={180} height={64} rx={10} fill={C.paper} /><T x={90} y={14} size={40} fill={C.terracotta}>{price}</T></Cut>
    <Card x={795} y={y} w={470} h={340} fill={C.mustard}>
      <Light x={0} y={20} rx={200} ry={140} op={0.7} />
      <g transform="translate(0 30) scale(1.2)">{right}</g>
      <T x={0} y={-118} size={38} fill={C.brown} ls={2}>{rl}</T>
    </Card>
    <Cut sm transform={`translate(540 ${y + 140}) rotate(-8) scale(0.72)`}>
      <rect x={-190} y={-44} width={380} height={88} rx={12} fill="#FBE9E6" stroke={C.red} strokeWidth={7} />
      <T x={0} y={16} size={46} fill={C.red} ls={2}>NOT FOR SALE</T>
    </Cut>
    <Cut sm transform={`translate(540 ${y - 60})`}><circle r={28} fill={C.paper} /><T x={0} y={11} size={32}>{n}</T></Cut>
  </g>
);
export const Scene4: React.FC = () => (
  <Stage bg={C.night}>
    <Sky moon={false} cold />
    <Title text="WHAT MONEY CAN'T BUY" />
    <Pair y={430} n={1} ll="CONVENIENCE" rl="SHARED HISTORY" price="$ 4.99"
      left={<g><rect x={-50} y={-70} width={100} height={170} rx={8} fill={C.paper} /><circle cx={34} cy={20} r={5} fill={C.brown} /><Cut sm transform="translate(-85 80)"><rect x={-28} y={-40} width={56} height={44} rx={8} fill={C.mustard} /><path d="M-14 -40 q14 -22 28 0" stroke={C.brown} strokeWidth={5} fill="none" /></Cut></g>}
      right={<g><Cut sm><rect x={-105} y={-65} width={100} height={140} rx={6} fill={C.paper} /><rect x={5} y={-60} width={100} height={140} rx={6} fill={C.paper} transform="rotate(4 55 10)" /></Cut><Person x={-55} y={60} s={0.38} body={C.teal} /><Person x={-20} y={60} s={0.32} body={C.terracotta} flip small /><Person x={50} y={64} s={0.34} body={C.teal} hair="#aaa" /><Person x={88} y={64} s={0.34} body={C.terracotta} flip style="bun" /></g>} />
    <Pair y={900} n={2} ll="EXPERTISE" rl="IN YOUR CORNER" price="$ 80/hr"
      left={<g><Cut sm><rect x={-95} y={-75} width={190} height={150} rx={16} fill="#0F1033" /></Cut><rect x={-80} y={-62} width={160} height={124} rx={8} fill="#DDEBFF" /><circle cx={0} cy={-20} r={28} fill={C.skin} /><rect x={-38} y={8} width={76} height={46} rx={22} fill={C.paper} /></g>}
      right={<g><Cut sm><rect x={-140} y={40} width={280} height={14} rx={6} fill={C.wood} /></Cut><Person x={-45} y={44} s={0.55} body={C.terracotta} armF={75} style="long" hair="#2a1a14" /><Person x={38} y={44} s={0.55} body={C.teal} flip armF={20} /></g>} />
    <Pair y={1370} n={3} ll="ACCESS" rl="BELONGING" price="VIP $$$"
      left={<g><Cut sm><rect x={-45} y={-78} width={90} height={54} rx={8} fill={C.paper} /></Cut><T x={0} y={-40} size={32} fill={C.terracotta}>VIP</T><rect x={-90} y={-8} width={22} height={90} rx={7} fill="#0F1033" /><rect x={68} y={-8} width={22} height={90} rx={7} fill="#0F1033" /><rect x={-68} y={24} width={136} height={12} rx={6} fill={C.mustard} /></g>}
      right={<g><Cut sm><ellipse cx={0} cy={40} rx={140} ry={20} fill={C.wood} /></Cut>{[-100, -45, 15, 70].map((x, i) => <Person key={x} x={x} y={36} s={0.42} body={[C.teal, C.terracotta, C.violet, C.peach][i]} hair={["#222", "#6b3b24", "#111", "#8a5a30"][i]} style={(["short", "bun", "long", "short"] as const)[i]} />)}</g>} />
    <Caption words={["Belonging", "can't", "be", "bought"]} active={0} />
  </Stage>
);

/* ---------- Scene 5: the door opens ---------- */
export const Scene5: React.FC = () => (
  <Stage bg={C.night}>
    <Sky moon />
    <Title text="THE DOOR OPENS" />
    <Hill y={640} fill={C.hill1} amp={50} blur="far" />
    <Hill y={730} fill={C.hill2} amp={35} ph={2} blur="mid" />
    <House x={150} y={930} s={0.95} roof={C.terracotta} />
    <House x={930} y={930} s={0.95} roof={C.teal} />
    {/* big house, door open, warm light spills */}
    <Light x={540} y={1010} rx={420} ry={330} />
    <Cut>
      <rect x={290} y={700} width={500} height={430} rx={14} fill={C.paper} />
      <path d="M255 712 L540 470 L825 712 Z" fill={C.violet} stroke={C.violet} strokeWidth={14} strokeLinejoin="round" />
      <rect x={640} y={430} width={46} height={110} rx={6} fill={C.terracotta} />
    </Cut>
    <path d="M440 1130 L640 1130 L800 1500 L280 1500 Z" fill="#FFD78A" opacity={0.5} />
    <Cut sm><rect x={430} y={780} width={220} height={350} rx={14} fill="#FFE2A0" /></Cut>
    <Cut sm><rect x={320} y={770} width={80} height={100} rx={8} fill="#FFE2A0" /></Cut>
    <Cut sm><rect x={690} y={770} width={70} height={100} rx={8} fill="#FFE2A0" /></Cut>
    <Person x={505} y={1125} s={0.95} body={C.teal} armF={110} style="bun" hair="#6B3B24" />
    <Person x={580} y={1125} s={0.95} body={C.terracotta} flip armF={110} skin={C.skin2} hair="#1a1010" />
    {/* kettle with steam */}
    <Cut sm transform="translate(705 1045)"><rect x={-30} y={-40} width={60} height={50} rx={14} fill={C.mustard} /><path d="M30 -20 L56 -34" stroke={C.mustard} strokeWidth={9} strokeLinecap="round" /><path d="M-6 -50 q6 -16 0 -28 M10 -50 q6 -16 0 -28" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" /></Cut>
    {/* neighbour stepping in */}
    <Person x={450} y={1300} s={1.15} body={C.mustard} armF={150} style="short" hair="#222" scarf={C.terracotta} />
    <Thread x1={180} y1={830} x2={320} y2={780} sag={40} />
    <Thread x1={760} y1={780} x2={900} y2={830} sag={40} />
    <Thread x1={150} y1={690} x2={930} y2={690} sag={120} w={5} />
    <Card x={540} y={1400} w={940} h={190} fill={C.paper}>
      <Lines x={0} y={-30} size={42} lines={["Social connection is as essential", "to survival as food and water."]} font={SERIF} weight={700} />
      <SourceTag x={0} y={76} text="US Surgeon General advisory, 2023" />
    </Card>
    <Caption words={["Knock", "on", "the", "door"]} active={0} />
  </Stage>
);

/* ---------- Scene 6: function vs human needs ---------- */
export const Gear: React.FC<{ x: number; y: number; r: number; fill: string }> = ({ x, y, r, fill }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-r * 0.16} y={-r * 1.25} width={r * 0.32} height={r * 0.5} rx={r * 0.08} fill={fill} transform={`rotate(${i * 45})`} />)}
    <circle r={r} fill={fill} /><circle r={r * 0.4} fill="#0F1033" opacity={0.35} />
  </g>
);
export const Scene6: React.FC = () => (
  <Stage bg={C.night}>
    <Sky moon={false} cold />
    <Cut sm transform="translate(190 150) rotate(-4)"><rect x={-90} y={-40} width={180} height={80} rx={14} fill={C.paper} /><T x={0} y={18} size={46} ls={3}>P.S.</T></Cut>
    <Card x={540} y={640} w={900} h={620} fill={C.teal} rot={-1.5}>
      <Gear x={330} y={-180} r={50} fill="#2B7480" />
      <T x={-40} y={-200} size={64} fill="#fff" ls={6}>FUNCTION</T>
      {["Rides", "Repairs", "Groceries", "Advice"].map((t, i) => (
        <g key={t} transform={`translate(-310 ${-110 + i * 100})`}>
          <rect x={0} y={-36} width={64} height={64} rx={12} fill={C.paper} />
          <path d="M12 -4 L28 12 L54 -26" stroke={C.tealDark} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <T x={100} y={14} size={54} fill="#fff" anchor="start" weight={700}>{t}</T>
        </g>
      ))}
    </Card>
    <Light x={540} y={1250} rx={620} ry={330} />
    <Card x={540} y={1250} w={900} h={420} fill={C.mustard} rot={1.2}>
      <T x={-40} y={-120} size={64} ls={6}>HUMAN NEEDS</T>
      <path d="M-400 30 L520 30 M360 -50 L500 30 L360 110" stroke={C.terracotta} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Card>
    <Caption words={["Function", "isn't", "belonging"]} active={2} />
  </Stage>
);

/* ---------- Scene 7: silent end card (deliberate still) ---------- */
export const Scene7: React.FC = () => (
  <Stage bg={C.night}>
    <Card x={540} y={940} w={900} h={640} fill={C.paper} rot={-0.6}>
      <Lines x={0} y={-140} size={56} lh={1.35} font={SERIF} weight={700} lines={["Average daily socialising", "in the US fell from", "45 to 35 minutes", "over about 20 years."]} />
      <SourceTag x={0} y={260} text="Axios, July 2026, BLS American Time Use Survey" />
    </Card>
  </Stage>
);
