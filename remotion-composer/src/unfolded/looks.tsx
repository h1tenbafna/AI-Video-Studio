import React from "react";
import { W, H, Defs, Cut, T } from "./kit";

const Svg: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: bg, display: "block" }}><Defs />{children}</svg>
);
const SERIF = "Georgia,'Times New Roman',serif";
const HAND = "'Segoe Print','Comic Sans MS',cursive";
const TYPE = "'Courier New',Courier,monospace";

/* ---------- 2. SHADOW PUPPET THEATRE ---------- */
const sil = "#1A0D07";
export const LookShadow: React.FC = () => (
  <Svg bg="#120804">
    <defs>
      <radialGradient id="screen" cx="50%" cy="42%" r="70%">
        <stop offset="0" stopColor="#FFE3A6" /><stop offset="0.45" stopColor="#F5A957" /><stop offset="0.8" stopColor="#B4512A" /><stop offset="1" stopColor="#4A1A0C" />
      </radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="2.2" /></filter>
      <filter id="flame"><feGaussianBlur stdDeviation="30" /></filter>
    </defs>
    {/* carved wooden frame + glowing cloth screen */}
    <rect x={40} y={170} width={1000} height={1430} rx={26} fill="#3A1F12" />
    <g filter="url(#fibre)"><rect x={80} y={210} width={920} height={1350} rx={10} fill="url(#screen)" /></g>
    <ellipse cx={540} cy={520} rx={330} ry={260} fill="#FFF1C9" opacity={0.35} filter="url(#flame)" />
    {/* silhouettes (slightly soft, like shadows on cloth) */}
    <g filter="url(#soft)" fill={sil}>
      {/* shelf + jars */}
      <rect x={600} y={610} width={330} height={16} rx={6} />
      {[630, 700, 770, 850].map((x, i) => <path key={x} d={`M${x} 610 L${x} ${560 - (i % 2) * 20} Q${x + 22} ${540 - (i % 2) * 20} ${x + 44} ${560 - (i % 2) * 20} L${x + 44} 610 Z`} />)}
      {/* scientist in profile: coat, head, nose, hair tuft, glasses, arm pouring */}
      <path d="M250 1260 L285 900 Q330 860 380 900 L430 1260 Z" />
      <circle cx={340} cy={820} r={78} />
      <path d="M408 812 L452 838 L410 852 Z" />
      <path d="M285 770 Q300 700 360 720 Q330 690 300 690 Q340 670 380 700 Q360 740 330 760 Z" />
      <path d="M380 930 Q470 920 545 875 L556 893 Q480 950 392 965 Z" />
      <path d="M540 840 L600 870 L585 905 L520 880 Z" />
      {/* beaker on a stand + pour stream */}
      <path d="M600 1120 L612 960 L700 960 L712 1120 Z" />
      <rect x={540} y={1120} width={240} height={20} rx={6} />
      <rect x={560} y={1140} width={16} height={130} /><rect x={744} y={1140} width={16} height={130} />
      {/* puppet rods */}
      <rect x={336} y={1260} width={8} height={300} /><rect x={470} y={955} width={6} height={605} transform="rotate(-8 473 955)" />
      {/* Crease as a tiny puppet with its own rod */}
      <path d="M860 1220 L920 1160 L980 1220 L920 1290 Z" /><path d="M870 1205 L880 1150 L905 1182 Z" /><path d="M970 1205 L960 1150 L935 1182 Z" />
      <rect x={917} y={1290} width={6} height={270} />
    </g>
    {/* cut-out details let the light through (traditional puppet trick) */}
    <circle cx={372} cy={812} r={16} fill="none" stroke="#F8C77A" strokeWidth={5} />
    {[960, 1030, 1100, 1170].map((y) => <circle key={y} cx={340} cy={y} r={9} fill="#F8B864" opacity={0.9} />)}
    <path d="M640 1010 L680 1010 L688 1100 L632 1100 Z" fill="#FFE9A8" opacity={0.85} />
    <path d="M595 880 Q618 930 640 1000" stroke="#FFE9A8" strokeWidth={7} fill="none" opacity={0.85} />
    <circle cx={905} cy={1205} r={6} fill="#FFD27A" /><circle cx={935} cy={1205} r={6} fill="#FFD27A" />
    {/* bottom curtain + title */}
    <rect x={40} y={1560} width={1000} height={60} fill="#5A1E14" />
    <T x={540} y={135} size={54} fill="#F5C98A" weight={700} ls={8}>UNFOLDED</T>
    <text x={540} y={1720} fontSize={62} fill="#FFE3A6" fontFamily={SERIF} fontStyle="italic" textAnchor="middle">A scientist tried to make</text>
    <text x={540} y={1800} fontSize={62} fill="#FFE3A6" fontFamily={SERIF} fontStyle="italic" textAnchor="middle">the strongest <tspan fill="#FF9A6B" fontWeight={700}>glue</tspan> ever.</text>
  </Svg>
);

/* ---------- 4. UNFOLDING MAP ---------- */
export const LookMap: React.FC = () => {
  const panels = [0, 1, 2].flatMap((c) => [0, 1].map((r) => ({ c, r })));
  return (
    <Svg bg="#1F3A40">
      <rect width={W} height={H} fill="#24434A" />
      {/* map paper with 3x2 fold panels, alternate shading = folds */}
      <g transform="translate(70 300)">
        {panels.map(({ c, r }) => (
          <Cut key={`${c}${r}`} sm><rect x={c * 314} y={r * 560} width={314} height={560} fill={(c + r) % 2 ? "#EFE2C4" : "#F7ECD3"} /></Cut>
        ))}
        {/* sea + land */}
        <path d="M0 0 L942 0 L942 260 Q760 300 700 420 Q640 560 760 700 Q860 820 942 800 L942 1120 L0 1120 L0 880 Q120 860 180 760 Q260 620 160 520 Q60 420 0 430 Z" fill="#9FCBD0" opacity={0.55} />
        <path d="M200 140 Q360 80 520 150 Q640 210 600 360 Q560 520 420 560 Q300 600 250 480 Q190 340 200 140 Z" fill="#C9D9A8" opacity={0.85} />
        <path d="M300 640 Q460 600 560 700 Q640 800 560 930 Q440 1040 330 960 Q240 860 300 640 Z" fill="#D9C99B" opacity={0.85} />
        {/* dotted route */}
        <path d="M330 300 Q520 420 470 640 Q430 820 640 960" stroke="#C0392B" strokeWidth={7} strokeDasharray="2 20" strokeLinecap="round" fill="none" />
        {/* pins with mini icons */}
        {[[330, 300, "1968 · the weak glue", "flask"], [470, 640, "a choir bookmark", "book"], [640, 960, "1980 · every desk", "note"]].map(([x, y, label, ic], i) => (
          <g key={i}>
            <Cut sm><path d={`M${x} ${+y + 10} Q${+x - 46} ${+y - 50} ${x} ${+y - 92} Q${+x + 46} ${+y - 50} ${x} ${+y + 10} Z`} fill="#E8685A" /></Cut>
            <circle cx={+x} cy={+y - 58} r={24} fill="#FFF6E2" />
            {ic === "flask" && <path d={`M${+x - 10} ${+y - 74} L${+x + 10} ${+y - 74} L${+x + 16} ${+y - 44} L${+x - 16} ${+y - 44} Z`} fill="#4F8FA0" />}
            {ic === "book" && <path d={`M${+x - 18} ${+y - 70} L${x} ${+y - 64} L${+x + 18} ${+y - 70} L${+x + 18} ${+y - 46} L${x} ${+y - 40} L${+x - 18} ${+y - 46} Z`} fill="#6D5BA8" />}
            {ic === "note" && <rect x={+x - 16} y={+y - 74} width={32} height={32} fill="#F5B841" />}
            <Cut sm><rect x={+x + 40} y={+y - 84} width={label.toString().length * 21 + 30} height={58} rx={12} fill="#FFF6E2" /></Cut>
            <text x={+x + 55} y={+y - 44} fontSize={34} fontFamily={SERIF} fill="#2C3E50" fontStyle="italic">{label}</text>
          </g>
        ))}
        {/* compass */}
        <g transform="translate(830 100)"><circle r={60} fill="#FFF6E2" opacity={0.9} /><path d="M0 -55 L14 0 L0 55 L-14 0 Z" fill="#2C3E50" /><path d="M0 -55 L14 0 L-14 0 Z" fill="#C0392B" /><text y={-68} fontSize={28} textAnchor="middle" fontFamily={SERIF} fill="#FFF6E2">N</text></g>
      </g>
      {/* Crease sitting on the corner */}
      <Cut sm transform="translate(930 1440)"><path d="M0 -70 L70 0 L0 70 L-70 0 Z" fill="#E8685A" /><path d="M-60 -10 L-40 -80 L-10 -45 Z M60 -10 L40 -80 L10 -45 Z" fill="#C9503F" /><circle cx={-20} cy={-8} r={7} fill="#1B2B30" /><circle cx={20} cy={-8} r={7} fill="#1B2B30" /><path d="M-14 18 Q0 30 14 18" stroke="#1B2B30" strokeWidth={5} fill="none" /></Cut>
      <T x={540} y={200} size={56} fill="#F7ECD3" ls={8}>UNFOLDED</T>
      <text x={540} y={1650} fontSize={60} fill="#FFFFFF" fontWeight={800} textAnchor="middle" fontFamily="'Trebuchet MS',sans-serif" stroke="#1F3A40" strokeWidth={10} paintOrder="stroke">A scientist tried to make</text>
      <text x={540} y={1740} fontSize={60} fill="#FFFFFF" fontWeight={800} textAnchor="middle" fontFamily="'Trebuchet MS',sans-serif" stroke="#1F3A40" strokeWidth={10} paintOrder="stroke">the strongest <tspan fill="#F5B841">glue</tspan> ever.</text>
    </Svg>
  );
};

/* ---------- 5. SKETCHBOOK DIARY ---------- */
const ink = "#22303A";
export const LookSketch: React.FC = () => (
  <Svg bg="#6E4A33">
    <defs>
      <filter id="wash"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="5" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="40" /><feGaussianBlur stdDeviation="3" /></filter>
      <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="2" result="w" /><feDisplacementMap in="SourceGraphic" in2="w" scale="5" /></filter>
    </defs>
    <rect width={W} height={H} fill="#7A5238" />
    {/* notebook page */}
    <Cut><rect x={70} y={150} width={940} height={1560} rx={18} fill="#FBF6E9" /></Cut>
    {Array.from({ length: 26 }).map((_, i) => <line key={i} x1={110} x2={970} y1={260 + i * 56} y2={260 + i * 56} stroke="#9CC3D5" strokeWidth={2} opacity={0.6} />)}
    <line x1={190} x2={190} y1={150} y2={1710} stroke="#E8A0A0" strokeWidth={3} opacity={0.7} />
    {[220, 420, 620, 820, 1020, 1220, 1420, 1620].map((y) => <circle key={y} cx={110} cy={y} r={14} fill="#7A5238" />)}
    {/* watercolour washes */}
    <g filter="url(#wash)" style={{ mixBlendMode: "multiply" }}>
      <ellipse cx={420} cy={860} rx={220} ry={330} fill="#F2A99A" opacity={0.45} />
      <ellipse cx={720} cy={1020} rx={140} ry={160} fill="#9ECFE0" opacity={0.6} />
      <ellipse cx={720} cy={1080} rx={110} ry={70} fill="#FFE08A" opacity={0.7} />
      <ellipse cx={850} cy={1330} rx={90} ry={90} fill="#F27A6A" opacity={0.5} />
    </g>
    {/* ink doodle: scientist + beaker + Crease */}
    <g filter="url(#wobble)" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={420} cy={620} r={90} />
      <circle cx={385} cy={615} r={26} /><circle cx={455} cy={615} r={26} /><path d="M411 615 L429 615" />
      <circle cx={385} cy={615} r={5} fill={ink} /><circle cx={455} cy={615} r={5} fill={ink} />
      <ellipse cx={420} cy={672} rx={12} ry={16} />
      <path d="M340 560 Q360 500 420 530 Q470 490 500 545" />
      <path d="M330 720 L300 1180 L540 1180 L510 720 Q420 690 330 720 Z" />
      <path d="M420 720 L420 1180" /><path d="M375 760 L395 800" />
      <path d="M500 780 Q580 800 640 760" /><path d="M640 760 L680 720 L700 750 L660 790 Z" />
      <path d="M690 760 Q705 820 715 880" strokeDasharray="10 12" />
      <path d="M640 900 L655 1140 L790 1140 L805 900" /><path d="M645 1000 Q720 985 800 1000" />
      <path d="M360 1180 L350 1260 M480 1180 L490 1260" />
      <path d="M850 1260 L910 1320 L850 1390 L790 1320 Z" /><path d="M800 1305 L812 1250 L835 1280 M900 1305 L888 1250 L865 1280" />
      <circle cx={835} cy={1318} r={4} fill={ink} /><circle cx={865} cy={1318} r={4} fill={ink} /><path d="M838 1345 Q850 1335 862 1345" />
    </g>
    {/* handwritten notes */}
    <text x={610} y={330} fontSize={50} fontFamily={HAND} fill={ink} transform="rotate(-4 610 330)">Unfolded</text>
    <text x={230} y={1420} fontSize={44} fontFamily={HAND} fill={ink}>"the strongest glue ever"</text>
    <text x={230} y={1500} fontSize={40} fontFamily={HAND} fill="#C0392B">...it barely stuck.</text>
    <path d="M700 870 Q760 820 800 845" stroke="#C0392B" strokeWidth={4} fill="none" /><text x={805} y={850} fontSize={34} fontFamily={HAND} fill="#C0392B">glue!</text>
    {/* pen resting on the page */}
    <Cut sm transform="translate(820 560) rotate(35)"><rect x={-18} y={-210} width={36} height={360} rx={14} fill="#2D3E66" /><path d="M-18 150 L0 205 L18 150 Z" fill="#D9B26A" /></Cut>
  </Svg>
);

/* ---------- 6. ARCHIVE COLLAGE LETTER (code-made stand-ins, no archive images) ---------- */
export const LookCollage: React.FC = () => (
  <Svg bg="#B98F5F">
    <defs>
      <pattern id="half" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="3.6" fill="#2A2420" /></pattern>
      <pattern id="half2" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2" fill="#2A2420" /></pattern>
    </defs>
    <g filter="url(#fibre)"><rect width={W} height={H} fill="#C49A68" /></g>
    {/* unfolded letter with fold lines */}
    <Cut transform="translate(540 960) rotate(-2)"><rect x={-440} y={-700} width={880} height={1300} fill="#F3EAD6" />
      <line x1={-440} x2={440} y1={-267} y2={-267} stroke="#D8CBB0" strokeWidth={4} /><line x1={-440} x2={440} y1={167} y2={167} stroke="#D8CBB0" strokeWidth={4} /></Cut>
    {/* torn strip with typewriter text */}
    <Cut sm transform="translate(540 430) rotate(1.5)"><rect x={-400} y={-80} width={800} height={160} fill="#FFFDF5" /></Cut>
    <text x={170} y={420} fontSize={46} fontFamily={TYPE} fill="#2A2420" fontWeight={700}>1968. A scientist tries</text>
    <text x={170} y={478} fontSize={46} fontFamily={TYPE} fill="#2A2420" fontWeight={700}>to make the strongest <tspan fill="#B03A2E">glue</tspan>.</text>
    {/* "engraving" figure: halftone silhouette stand-in */}
    <Cut transform="translate(400 940)"><rect x={-230} y={-330} width={460} height={620} fill="#EADFC6" />
      <circle cx={0} cy={-160} r={95} fill="url(#half)" /><path d="M-130 270 L-100 -50 Q0 -90 100 -50 L130 270 Z" fill="url(#half2)" />
      <path d="M60 -20 Q160 -10 210 -70" stroke="#2A2420" strokeWidth={26} strokeLinecap="round" fill="none" /></Cut>
    <text x={400} y={1270} fontSize={26} fontFamily={TYPE} fill="#6A5A48" textAnchor="middle">[placeholder: public-domain engraving]</text>
    {/* stamp with perforated edge */}
    <g transform="translate(800 820) rotate(6)">
      <rect x={-120} y={-150} width={240} height={300} fill="#F6EFE0" />
      {Array.from({ length: 12 }).map((_, i) => <circle key={`t${i}`} cx={-120 + i * 21.8} cy={-150} r={8} fill="#C49A68" />)}
      {Array.from({ length: 12 }).map((_, i) => <circle key={`b${i}`} cx={-120 + i * 21.8} cy={150} r={8} fill="#C49A68" />)}
      <rect x={-95} y={-125} width={190} height={250} fill="#E8685A" />
      <path d="M-50 60 L-35 -60 L35 -60 L50 60 Z" fill="#F6EFE0" opacity={0.9} /><ellipse cx={0} cy={30} rx={45} ry={20} fill="#FFF1B8" />
      <text y={100} fontSize={30} fontFamily={TYPE} fill="#F6EFE0" textAnchor="middle" fontWeight={700}>GLUE · 1968</text>
    </g>
    {/* postmark + masking tape + yellow note */}
    <g opacity={0.75} transform="translate(720 1150)"><circle r={95} fill="none" stroke="#7A2E2A" strokeWidth={6} /><circle r={70} fill="none" stroke="#7A2E2A" strokeWidth={3} /><text y={10} fontSize={30} fontFamily={TYPE} fill="#7A2E2A" textAnchor="middle" fontWeight={700}>UNFOLDED</text></g>
    <rect x={260} y={300} width={170} height={52} fill="#EFE3B8" opacity={0.8} transform="rotate(-12 345 326)" />
    <rect x={650} y={640} width={150} height={48} fill="#EFE3B8" opacity={0.8} transform="rotate(20 725 664)" />
    <Cut sm transform="translate(800 1450) rotate(-5)"><rect x={-150} y={-150} width={300} height={300} fill="#F5C842" /></Cut>
    <text x={800} y={1440} fontSize={36} fontFamily={HAND} fill="#2A2420" textAnchor="middle" transform="rotate(-5 800 1440)">it barely</text>
    <text x={800} y={1490} fontSize={36} fontFamily={HAND} fill="#2A2420" textAnchor="middle" transform="rotate(-5 800 1490)">stuck...</text>
    <T x={540} y={175} size={58} fill="#2A2420" ls={10}>UNFOLDED</T>
  </Svg>
);
