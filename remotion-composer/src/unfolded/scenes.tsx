import React from "react";
import { U, W, H, Stage, Cut, T, Cap, Crease, Scientist } from "./kit";

/* ---- STILL 1 (sc1a hook): the folded sheet opening onto the lab bench ---- */
export const Still1: React.FC = () => (
  <Stage bg={U.sheet}>
    {/* lab wall */}
    <rect width={W} height={H} fill={U.teal} />
    <Cut><rect x={0} y={0} width={W} height={1100} fill={U.tealDeep} /></Cut>
    {/* shelf with jars */}
    <Cut sm><rect x={90} y={560} width={420} height={22} rx={6} fill={U.wood} /></Cut>
    {[150, 250, 350, 430].map((x, i) => <Cut key={x} sm><rect x={x} y={470} width={56} height={90} rx={12} fill={[U.sky, U.gold, U.coral, U.white][i]} opacity={0.95} /></Cut>)}
    {/* paper strip stuck to the wall with a glue blob (about to slide off) */}
    <Cut sm transform="translate(780 700) rotate(-8)"><rect x={-110} y={-34} width={220} height={68} rx={8} fill={U.white} /><T x={0} y={14} size={34} fill={U.inkSoft} weight={700}>SUPER GLUE?</T></Cut>
    <circle cx={684} cy={706} r={20} fill={U.glue} stroke={U.gold} strokeWidth={4} />
    {/* bench */}
    <Cut><rect x={-20} y={1080} width={W + 40} height={300} fill={U.wood} /></Cut>
    <rect x={-20} y={1080} width={W + 40} height={24} fill={U.woodDark} opacity={0.5} />
    {/* beaker with rising glue */}
    <Cut sm transform="translate(690 1070)">
      <path d="M-70 -200 L-56 0 L56 0 L70 -200 Z" fill={U.sky} opacity={0.5} stroke={U.white} strokeWidth={8} strokeLinejoin="round" />
      <path d="M-62 -90 L-56 0 L56 0 L62 -90 Q0 -110 -62 -90 Z" fill={U.glue} />
      <path d="M-12 -200 Q0 -280 14 -200" stroke={U.glue} strokeWidth={12} fill="none" strokeLinecap="round" />
    </Cut>
    <Scientist x={420} y={1090} s={2.1} pour />
    <Cut sm transform="translate(596 846) rotate(118)"><path d="M-16 -50 L16 -50 L16 -10 L44 60 L-44 60 L-16 -10 Z" fill={U.sky} opacity={0.75} stroke={U.white} strokeWidth={5} strokeLinejoin="round" /><path d="M-36 40 L36 40 L44 60 L-44 60 Z" fill={U.glue} /></Cut>
    {/* pour stream */}
    <path d="M565 835 Q600 900 648 960" stroke={U.glue} strokeWidth={14} fill="none" strokeLinecap="round" />
    <ellipse cx={450} cy={680} rx={300} ry={220} fill="url(#warm)" opacity={0.45} />
    {/* four corner flaps: the sheet is still unfolding */}
    <Cut><path d="M0 0 L430 0 L0 520 Z" fill={U.sheet} /></Cut>
    <path d="M0 520 L430 0" stroke={U.sheet2} strokeWidth={5} />
    <Cut><path d="M1080 0 L650 0 L1080 520 Z" fill={U.sheet2} /></Cut>
    <Cut><path d="M0 1920 L0 1500 L520 1920 Z" fill={U.sheet2} /></Cut>
    <Cut><path d="M1080 1920 L1080 1500 L560 1920 Z" fill={U.sheet} /></Cut>
    {/* title chip + mascot */}
    <Cut sm transform="translate(540 330) rotate(-2)"><rect x={-250} y={-62} width={500} height={124} rx={30} fill={U.gold} /><T x={0} y={26} size={78} ls={4}>Unfolded</T></Cut>
    <Crease x={150} y={1700} s={1.1} mood="wince" />
    <Cap lines={[[{ w: "A scientist tried to" }, { w: "make" }], [{ w: "the strongest" }, { w: "glue", on: true }, { w: "ever." }]]} y={1290} />
  </Stage>
);

/* ---- STILL 2 (sc4b choir close-up): bookmark slips out of the hymnal ---- */
export const Still2: React.FC = () => (
  <Stage bg={U.sheet}>
    <rect width={W} height={H} fill="#7FA6B5" />
    {/* blurred choir rows behind */}
    <g>
      <Cut blur="far"><rect x={0} y={420} width={W} height={520} fill={U.robe} opacity={0.9} /></Cut>
      {[110, 290, 470, 650, 830, 990].map((x, i) => (<Cut key={x} blur="far"><circle cx={x} cy={430} r={70} fill={i % 2 ? U.skin : U.skin2} /><rect x={x - 90} y={500} width={180} height={300} rx={50} fill={i % 2 ? U.coral : U.robe} /></Cut>))}
    </g>
    <Cut><rect x={-20} y={940} width={W + 40} height={260} fill={U.wood} /></Cut>
    {/* Fry: face partly above the book, worried */}
    <Cut sm transform="translate(540 760)">
      <rect x={-120} y={20} width={240} height={200} rx={60} fill={U.ink} />
      <circle cx={0} cy={-20} r={104} fill={U.skin} />
      <path d="M-108 -30 Q-112 -130 0 -126 Q112 -130 108 -30 Q70 -86 0 -84 Q-70 -86 -108 -30 Z" fill="#6B4A32" />
      <circle cx={-34} cy={-10} r={10} fill={U.ink} /><circle cx={34} cy={-10} r={10} fill={U.ink} />
      <path d="M-60 -44 L-20 -34 M60 -44 L20 -34" stroke={U.ink} strokeWidth={7} strokeLinecap="round" />
      <ellipse cx={0} cy={44} rx={16} ry={20} fill={U.ink} />
    </Cut>
    {/* hymnal, open, large */}
    <Cut transform="translate(540 1230)">
      <path d="M-470 -150 L0 -110 L0 230 L-470 190 Z" fill={U.white} />
      <path d="M470 -150 L0 -110 L0 230 L470 190 Z" fill="#EFEBDD" />
      <path d="M-480 -158 L-470 190" stroke={U.coral} strokeWidth={14} />
      {[-90, -40, 10, 60, 110, 160].map((y, i) => <path key={y} d={`M-420 ${y - 20 + i * 2} L-60 ${y + 8 + i * 2}`} stroke={U.inkSoft} strokeWidth={9} strokeLinecap="round" opacity={0.55} />)}
      {[-90, -40, 10, 60, 110].map((y, i) => <path key={y} d={`M60 ${y + 8 + i * 2} L420 ${y - 20 + i * 2}`} stroke={U.inkSoft} strokeWidth={9} strokeLinecap="round" opacity={0.55} />)}
    </Cut>
    {/* the bookmark slipping out, with a motion trail */}
    <path d="M300 1060 Q280 1180 250 1270" stroke={U.gold} strokeWidth={6} strokeDasharray="4 22" strokeLinecap="round" fill="none" />
    <Cut sm transform="translate(235 1330) rotate(-24)"><rect x={-30} y={-110} width={60} height={220} rx={8} fill={U.gold} /><path d="M-30 110 L0 78 L30 110" fill="#FFFFFF" opacity={0.18} /></Cut>
    <Cut sm transform="translate(700 1110) rotate(8)"><rect x={-26} y={-90} width={52} height={150} rx={8} fill={U.sky} /></Cut>
    <Crease x={930} y={300} s={1.0} mood="wince" />
    <Cap lines={[[{ w: "His" }, { w: "bookmarks" }], [{ w: "kept" }, { w: "slipping", on: true }, { w: "out" }]]} y={1500} />
  </Stage>
);

/* ---- STILL 3 (sc5b macro): glue dab on the bookmark, shallow depth of field ---- */
export const Still3: React.FC = () => (
  <Stage bg={U.sheet}>
    <rect width={W} height={H} fill="#6C9AA8" />
    <Cut blur="far"><rect x={0} y={0} width={W} height={700} fill={U.robe} opacity={0.8} /></Cut>
    <Cut blur="far"><circle cx={220} cy={300} r={120} fill={U.coral} opacity={0.7} /></Cut>
    <Cut blur="far"><circle cx={860} cy={420} r={150} fill={U.gold} opacity={0.5} /></Cut>
    {/* hymnal page filling the frame */}
    <Cut transform="translate(540 1150)"><path d="M-600 -520 L0 -480 L600 -520 L600 700 L0 740 L-600 700 Z" fill={U.white} /><path d="M0 -480 L0 740" stroke="#D9D3C0" strokeWidth={16} /></Cut>
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M120 ${700 + i * 58} L520 ${690 + i * 58}`} stroke={U.inkSoft} strokeWidth={10} strokeLinecap="round" opacity={0.4} />)}
    {/* bookmark strip, large, in focus */}
    <Cut transform="translate(560 1060) rotate(-6)"><rect x={-110} y={-420} width={220} height={720} rx={12} fill={U.gold} /></Cut>
    {/* glue dab being placed with a finger-brush */}
    <Cut sm transform="translate(560 740) rotate(-6)"><ellipse cx={0} cy={0} rx={70} ry={46} fill={U.glue} /><ellipse cx={-18} cy={-12} rx={22} ry={12} fill="#FFFFFF" opacity={0.7} /></Cut>
    <Cut sm transform="translate(690 520) rotate(30)"><rect x={-18} y={-240} width={36} height={340} rx={14} fill={U.wood} /><path d="M-26 100 Q0 180 26 100 Z" fill={U.glue} /></Cut>
    <path d="M610 700 L560 740" stroke={U.glue} strokeWidth={10} strokeLinecap="round" />
    {/* bulb glow remains from the idea */}
    <ellipse cx={900} cy={300} rx={260} ry={220} fill="url(#warm)" opacity={0.65} />
    <Crease x={150} y={290} s={0.95} mood="wow" />
    <Cap lines={[[{ w: "A" }, { w: "dab", on: true }, { w: "on" }, { w: "a" }], [{ w: "bookmark," }, { w: "and" }, { w: "it" }, { w: "stayed" }]]} y={1500} />
  </Stage>
);

/* ---- STILL 4 (sc7b takeaway): marigold note on a teal board ---- */
export const Still4: React.FC = () => (
  <Stage bg={U.tealDeep}>
    <rect width={W} height={H} fill={U.tealDeep} />
    <Cut><rect x={60} y={300} width={960} height={1180} rx={36} fill={U.teal} /></Cut>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={110} y={360 + i * 280} width={860} height={6} fill={U.tealDeep} opacity={0.25} />)}
    {/* the note, slight curl and rotation */}
    <Cut transform="translate(540 900) rotate(-3)">
      <rect x={-390} y={-390} width={780} height={780} rx={10} fill={U.gold} />
      <path d="M390 330 Q300 330 330 390 L390 390 Z" fill="#E2AA1F" />
      <rect x={-390} y={-390} width={780} height={110} fill="#FFFFFF" opacity={0.16} />
    </Cut>
    <T x={540} y={760} size={86} fill={U.ink}>The glue never</T>
    <T x={540} y={870} size={86} fill={U.ink}>failed. It was just</T>
    <T x={540} y={980} size={86} fill={U.ink}>waiting for the</T>
    <T x={540} y={1090} size={86} fill={U.coral} stroke={U.gold}>right problem.</T>
    <Crease x={940} y={1640} s={1.05} mood="smile" />
    <Cut sm transform="translate(260 1640) rotate(-2)"><rect x={-190} y={-44} width={380} height={88} rx={22} fill={U.white} /><T x={0} y={18} size={44}>Unfolded</T></Cut>
  </Stage>
);
