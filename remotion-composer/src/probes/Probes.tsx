import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ENV } from "./env";

// ---------- helpers ----------
const E = Easing.inOut(Easing.cubic);
const EO = Easing.out(Easing.cubic);
const ip = (f: number, a: [number, number], b: [number, number], e: (t: number) => number = E) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SANS = "'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
const SERIF = "'Georgia', 'Times New Roman', serif";

const Bubble: React.FC<{ x: number; y: number; text: string; f: number; a: number; b: number; tail?: number }> = ({ x, y, text, f, a, b, tail = 0 }) => {
  const s = ip(f, [a, a + 6], [0, 1], EO) * ip(f, [b - 5, b], [1, 0]);
  if (s <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-170} y={-60} width={340} height={110} rx={50} fill="#fff" stroke="#22304a" strokeWidth={6} />
      <path d={`M ${tail - 20} 48 L ${tail} 92 L ${tail + 24} 48`} fill="#fff" stroke="#22304a" strokeWidth={6} strokeLinejoin="round" />
      <rect x={tail - 18} y={42} width={40} height={10} fill="#fff" />
      <text x={0} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill="#22304a">{text}</text>
    </g>
  );
};

// ---------- A. CARTOON ----------
const Person: React.FC<{ x: number; y: number; skin: string; shirt: string; pants: string; hair: string; walk?: number; armL?: number; armR?: number; mouth?: number; flip?: boolean; f: number }> =
  ({ x, y, skin, shirt, pants, hair, walk = 0, armL = 20, armR = -20, mouth = 0.2, flip, f }) => {
    const blink = (f % 70) > 66 ? 0.1 : 1;
    const bob = Math.abs(Math.sin(walk * 1)) * (walk ? 10 : 2 * Math.sin(f / 9));
    return (
      <g transform={`translate(${x},${y - bob}) scale(${flip ? -1 : 1},1)`}>
        <ellipse cx={0} cy={bob + 6} rx={90} ry={16} fill="#00000022" />
        <g transform={`rotate(${Math.sin(walk) * 28} -22 -170)`}><rect x={-38} y={-170} width={32} height={170} rx={16} fill={pants} /><ellipse cx={-14} cy={0} rx={34} ry={16} fill="#22304a" /></g>
        <g transform={`rotate(${-Math.sin(walk) * 28} 22 -170)`}><rect x={6} y={-170} width={32} height={170} rx={16} fill={pants} /><ellipse cx={30} cy={0} rx={34} ry={16} fill="#22304a" /></g>
        <g transform={`rotate(${armR} 52 -330)`}><rect x={38} y={-336} width={28} height={140} rx={14} fill={skin} /></g>
        <rect x={-62} y={-360} width={124} height={210} rx={52} fill={shirt} />
        <g transform={`rotate(${armL} -52 -330)`}><rect x={-66} y={-336} width={28} height={140} rx={14} fill={skin} /></g>
        <circle cx={0} cy={-450} r={92} fill={skin} />
        <path d={`M -96 -460 Q -90 -560 0 -552 Q 92 -560 96 -460 Q 60 -500 0 -498 Q -60 -500 -96 -460 Z`} fill={hair} />
        <ellipse cx={-32} cy={-448} rx={13} ry={17 * blink} fill="#22304a" />
        <ellipse cx={32} cy={-448} rx={13} ry={17 * blink} fill="#22304a" />
        <circle cx={-28} cy={-454} r={4} fill="#fff" /><circle cx={36} cy={-454} r={4} fill="#fff" />
        <ellipse cx={0} cy={-402} rx={24} ry={5 + mouth * 24} fill="#7a2230" />
        <circle cx={-62} cy={-420} r={13} fill="#ff8a8a55" /><circle cx={62} cy={-420} r={13} fill="#ff8a8a55" />
      </g>
    );
  };

export const Cartoon: React.FC = () => {
  const f = useCurrentFrame();
  const benX = ip(f, [0, 40], [-120, 170]);
  const walking = f < 40 ? f * 0.55 : 0;
  const tap = ip(f, [44, 50, 56], [0, 1, 0]);
  const swap = f >= 52;
  const carX = ip(f, [58, 98], [1300, 520], EO);
  const squash = ip(f, [96, 100, 106], [1, 0.9, 1]);
  const thumbY = ip(f, [30, 48], [1000, 790], EO) + tap * 14;
  const mouth = (f > 44 && f < 62) || (f > 82 && f < 110) ? 0.5 + 0.5 * Math.abs(Math.sin(f * 0.9)) : 0.1;
  const phoneShake = swap ? ip(f, [52, 58], [1.06, 1]) : 1;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#7fd0ff,#eaf8ff 62%)" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {[0, 1, 2].map((i) => <ellipse key={i} cx={(200 + i * 380 + f * (0.5 + i * 0.2)) % 1300 - 100} cy={230 + i * 90} rx={140} ry={44} fill="#fff" opacity={0.9} />)}
        <rect y={1180} width={1080} height={740} fill="#7bd36b" />
        <rect y={1380} width={1080} height={300} fill="#4a5568" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={(i * 260 - f * 4) % 1300 - 100} y={1522} width={140} height={14} rx={7} fill="#ffe08a" />)}
        {/* phone card */}
        <g transform={`translate(540,640) scale(${phoneShake})`}>
          <rect x={-190} y={-330} width={380} height={660} rx={54} fill="#22304a" />
          <rect x={-168} y={-300} width={336} height={600} rx={36} fill={swap ? "#e9fff0" : "#ffffff"} />
          {!swap && (<>
            <text y={-190} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#22304a">Need a ride?</text>
            <rect x={-120} y={20} width={240} height={96} rx={48} fill={tap > 0.5 ? "#ff7a1a" : "#ffb347"} />
            <text y={86} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#fff">TAP</text>
            <circle cx={0} cy={68} r={tap * 150} fill="#ff7a1a" opacity={0.25 * (1 - tap)} />
          </>)}
          {swap && (<>
            <text y={-200} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#1c8a4b">Cab booked ✓</text>
            <text y={-110} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill="#22304a">2 min</text>
            <rect x={-110} y={-60} width={220} height={110} rx={20} fill="#ffd23f" />
            <rect x={-70} y={-96} width={140} height={50} rx={18} fill="#ffd23f" /><circle cx={-62} cy={56} r={22} fill="#22304a" /><circle cx={62} cy={56} r={22} fill="#22304a" />
          </>)}
        </g>
        {/* thumb */}
        <g transform={`translate(560,${thumbY + 260})`} opacity={ip(f, [26, 34], [0, 1]) * ip(f, [60, 68], [1, 0])}>
          <rect x={-34} y={0} width={68} height={260} rx={34} fill="#f2b48c" transform="rotate(-8)" />
          <ellipse cx={-6} cy={4} rx={30} ry={38} fill="#f2b48c" /><rect x={-16} y={-10} width={24} height={14} rx={7} fill="#ffd9c0" />
        </g>
        <Person f={f} x={benX} y={1480} skin="#f2b48c" shirt="#ff7a1a" pants="#3b4a6b" hair="#4a2c17" walk={walking} armL={walking ? Math.sin(walking) * 30 : 160 * ip(f, [86, 92], [0, 1])} armR={walking ? -Math.sin(walking) * 30 : -20} mouth={f > 82 && f < 110 ? mouth : 0.1} />
        <Person f={f} x={920} y={1480} skin="#e0a370" shirt="#2bb3a3" pants="#22304a" hair="#1b1b2f" flip armL={-100 + 40 * Math.sin(f / 6) * (swap ? 0 : 1)} mouth={f > 44 && f < 62 ? mouth : 0.1} />
        {/* cab */}
        <g transform={`translate(${carX},1470) scale(1,${squash})`}>
          <ellipse cx={0} cy={50} rx={190} ry={18} fill="#00000033" />
          <rect x={-190} y={-110} width={380} height={130} rx={36} fill="#ffd23f" /><rect x={-110} y={-190} width={210} height={100} rx={34} fill="#ffd23f" />
          <rect x={-90} y={-176} width={80} height={68} rx={14} fill="#bfe9ff" /><rect x={10} y={-176} width={70} height={68} rx={14} fill="#bfe9ff" />
          <rect x={-46} y={-224} width={92} height={36} rx={10} fill="#22304a" /><text x={0} y={-197} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#ffd23f">CAB</text>
          <circle cx={-110} cy={30} r={44} fill="#22304a" /><circle cx={110} cy={30} r={44} fill="#22304a" /><circle cx={-110} cy={30} r={18} fill="#cbd5e1" /><circle cx={110} cy={30} r={18} fill="#cbd5e1" />
        </g>
        <Bubble x={820} y={940} text="Tap!" f={f} a={44} b={64} tail={30} />
        <Bubble x={300} y={940} text="Cab's here!" f={f} a={84} b={116} tail={-10} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- B. GHIBLI (painterly, code-made) ----------
export const Ghibli: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + ip(f, [0, 120], [0, 0.08], (t) => t);
  const sun = ip(f, [0, 120], [560, 520]);
  const hill = (y: number, amp: number, c1: string, c2: string, seed: number, id: string) => {
    let d = `M -50 1920 L -50 ${y}`;
    for (let x = -50; x <= 1130; x += 60) d += ` L ${x} ${y - amp * Math.sin(x / 190 + seed) - amp * 0.5 * Math.sin(x / 71 + seed * 2)}`;
    d += " L 1130 1920 Z";
    return (<g><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs><path d={d} fill={`url(#${id})`} filter="url(#paint)" /></g>);
  };
  const girlX = ip(f, [0, 120], [120, 760], (t) => t);
  const girlY = 1275 + Math.sin(f / 5) * 5 - ip(f, [0, 120], [0, 40]);
  return (
    <AbsoluteFill style={{ background: "#f6d9a8" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ transform: `scale(${push})`, transformOrigin: "540px 1000px" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5aa7d8" /><stop offset="0.5" stopColor="#bfe3e8" /><stop offset="0.85" stopColor="#ffe3a6" /><stop offset="1" stopColor="#ffc880" /></linearGradient>
          <radialGradient id="glow"><stop offset="0" stopColor="#fff6c8" stopOpacity={1} /><stop offset="0.35" stopColor="#ffe08a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffe08a" stopOpacity={0} /></radialGradient>
          <radialGradient id="lamp"><stop offset="0" stopColor="#fff2a8" stopOpacity={1} /><stop offset="1" stopColor="#ffb347" stopOpacity={0} /></radialGradient>
          <filter id="paint" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={26} /></filter>
          <filter id="soft"><feGaussianBlur stdDeviation={9} /></filter>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 3} /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.55 0" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#sky)" />
        <circle cx={760} cy={sun} r={420} fill="url(#glow)" />
        <circle cx={760} cy={sun} r={90} fill="#fff8d8" />
        {[0, 1, 2, 3].map((i) => <polygon key={i} points={`760,${sun} ${100 + i * 260},1500 ${220 + i * 260},1500`} fill="#fff3b8" opacity={0.10 + 0.04 * Math.sin(f / 14 + i)} />)}
        {[0, 1, 2, 3, 4].map((i) => {
          const cx = ((i * 330 + f * (0.8 + i * 0.15)) % 1500) - 200; const cy = 260 + i * 120 + (i % 2) * 60;
          return (<g key={i} filter="url(#soft)" opacity={0.92}><ellipse cx={cx} cy={cy} rx={190} ry={62} fill="#fff" /><ellipse cx={cx - 90} cy={cy + 14} rx={120} ry={50} fill="#fff" /><ellipse cx={cx + 100} cy={cy + 10} rx={130} ry={48} fill="#fff4e0" /><ellipse cx={cx} cy={cy + 40} rx={200} ry={30} fill="#ffd9a8" opacity={0.7} /></g>);
        })}
        {hill(1180, 70, "#9fcf9a", "#6fae7a", 1, "h1")}
        {hill(1300, 60, "#6fb36b", "#3f8a55", 2.6, "h2")}
        {hill(1420, 50, "#4a9a55", "#2a6a45", 4.1, "h3")}
        {Array.from({ length: 70 }).map((_, i) => {
          const x = rnd(i) * 1100 - 10; const y = 1470 + rnd(i + 90) * 420; const h = 50 + rnd(i + 5) * 90; const sw = Math.sin(f / 8 + i) * (6 + h / 14);
          return <path key={i} d={`M ${x} ${y} Q ${x + sw * 0.4} ${y - h * 0.6} ${x + sw} ${y - h}`} stroke={i % 3 ? "#2f7a47" : "#5bb261"} strokeWidth={7} strokeLinecap="round" fill="none" />;
        })}
        {/* signal ribbon: the narrated idea */}
        <path d="M 120 900 C 340 760 520 1080 760 880 S 980 760 1040 820" stroke="#fff8d8" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="14 22" strokeDashoffset={-f * 3} opacity={ip(f, [30, 50], [0, 0.9])} filter="url(#soft)" />
        {/* girl with lantern */}
        <g transform={`translate(${girlX},${girlY}) scale(1.5)`}>
          <ellipse cx={0} cy={4} rx={50} ry={10} fill="#00000033" />
          <g transform={`rotate(${Math.sin(f / 4) * 18} 0 -70)`}><rect x={-12} y={-80} width={18} height={80} rx={9} fill="#7a3b2e" /></g>
          <g transform={`rotate(${-Math.sin(f / 4) * 18} 0 -70)`}><rect x={2} y={-80} width={18} height={80} rx={9} fill="#7a3b2e" /></g>
          <path d="M -34 -70 L 34 -70 L 26 -190 L -26 -190 Z" fill="#d9534f" /><path d="M -38 -214 Q -44 -160 -30 -150 L 30 -150 Q 44 -160 38 -214 Q 0 -262 -38 -214Z" fill="#3a2418" /><circle cx={0} cy={-212} r={32} fill="#f4c9a0" /><path d="M -34 -222 Q 0 -256 34 -222 Q 10 -236 -34 -222Z" fill="#3a2418" /><circle cx={-11} cy={-210} r={3.5} fill="#3a2418" /><circle cx={11} cy={-210} r={3.5} fill="#3a2418" />
          <g transform="translate(46,-130)"><circle r={90} fill="url(#lamp)" opacity={0.85 + 0.1 * Math.sin(f / 3)} /><rect x={-9} y={-16} width={18} height={30} rx={5} fill="#ffdf70" /></g>
          <rect x={20} y={-160} width={8} height={40} rx={4} fill="#f4c9a0" transform="rotate(-25 24 -160)" />
        </g>
        {Array.from({ length: 22 }).map((_, i) => {
          const px = (rnd(i) * 1100 + Math.sin(f / 20 + i) * 40) % 1100; const py = 1000 + rnd(i + 40) * 700 - ((f * (0.6 + rnd(i + 9))) % 300);
          return <circle key={i} cx={px} cy={py} r={4 + rnd(i + 3) * 5} fill="#fff6c8" opacity={0.5 + 0.4 * Math.sin(f / 6 + i)} filter="url(#soft)" />;
        })}
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.28} style={{ mixBlendMode: "multiply" }} />
        <rect width={1080} height={1920} fill="#ffb347" opacity={0.08} />
      </svg>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1530, textAlign: "center", fontFamily: SERIF, fontSize: 58, color: "#fffaf0", textShadow: "0 3px 14px #3a2418aa", opacity: ip(f, [14, 34], [0, 1]) }}>the signal follows her home</div>
    </AbsoluteFill>
  );
};

// ---------- C. OFFICE ----------
const Worker: React.FC<{ x: number; y: number; shirt: string; skin: string; hair: string; f: number; seed: number; flip?: boolean }> = ({ x, y, shirt, skin, hair, f, seed }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-52} y={-130} width={104} height={140} rx={34} fill={shirt} />
    <circle cx={0} cy={-190} r={50} fill={skin} /><path d={`M -52 -196 Q 0 -262 52 -196 Q 24 -222 0 -220 Q -24 -222 -52 -196Z`} fill={hair} />
    <circle cx={-16} cy={-186} r={6} fill="#22304a" /><circle cx={16} cy={-186} r={6} fill="#22304a" /><path d="M -12 -164 Q 0 -154 12 -164" stroke="#7a2230" strokeWidth={5} fill="none" strokeLinecap="round" />
    <rect x={-70} y={-96 + Math.sin(f / 2 + seed) * 8} width={28} height={80} rx={14} fill={skin} transform="rotate(-30 -56 -90)" />
    <rect x={42} y={-96 + Math.cos(f / 2 + seed) * 8} width={28} height={80} rx={14} fill={skin} transform="rotate(30 56 -90)" />
  </g>
);

export const Office: React.FC = () => {
  const f = useCurrentFrame();
  const desks = [{ x: 190, n: "1", label: "Sales", c: "#ff7a1a" }, { x: 540, n: "2", label: "Ops", c: "#2bb3a3" }, { x: 890, n: "3", label: "Finance", c: "#6c5ce7" }];
  const t = ip(f, [36, 80], [0, 1]);
  const ex = 190 + (890 - 190) * t; const ey = 1190 - Math.sin(t * Math.PI) * 300;
  const done = f >= 80;
  const mgr = ip(f, [0, 120], [-100, 1180], (q) => q);
  return (
    <AbsoluteFill style={{ background: "#e9edf5" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1380} fill="#dfe6f2" /><rect y={1380} width={1080} height={540} fill="#b9a58b" />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={i * 100} y={1380} width={4} height={540} fill="#a08d73" />)}
        {/* window */}
        <rect x={60} y={260} width={440} height={420} rx={14} fill="#bfe3ff" stroke="#8aa0c4" strokeWidth={10} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={90 + i * 80} y={680 - 120 - rnd(i) * 160} width={60} height={120 + rnd(i) * 160} fill="#8aa0c4" />)}
        <circle cx={420} cy={340} r={34} fill="#fff3b0" />
        {/* wall chart */}
        <rect x={580} y={280} width={440} height={360} rx={14} fill="#fff" stroke="#8aa0c4" strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={625 + i * 95} y={600 - ip(f, [10 + i * 8, 40 + i * 8], [0, 60 + i * 55]) } width={64} height={ip(f, [10 + i * 8, 40 + i * 8], [0, 60 + i * 55])} fill={i === 3 ? "#ff7a1a" : "#6c8ebf"} />)}
        <text x={800} y={330} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#22304a">Reports sent</text>
        {/* manager walking */}
        <g transform={`translate(${mgr},1885) scale(1.05)`}><rect x={-34} y={-140} width={68} height={120} rx={24} fill="#22304a" /><circle cy={-175} r={38} fill="#e0a370" /><path d="M -38 -182 Q 0 -230 38 -182 Q 10 -200 -38 -182Z" fill="#1b1b2f" /><rect x={30} y={-110} width={34} height={42} rx={8} fill="#fff" /><rect x={-22} y={-20 + Math.sin(f / 3) * 4} width={18} height={50} rx={9} fill="#22304a" /><rect x={6} y={-20 - Math.sin(f / 3) * 4} width={18} height={50} rx={9} fill="#22304a" /></g>
        {desks.map((d, i) => (
          <g key={i}>
            <Worker x={d.x} y={1290} f={f} seed={i * 2} shirt={["#ff7a1a", "#2bb3a3", "#6c5ce7"][i]} skin={["#f2b48c", "#c68642", "#e0a370"][i]} hair={["#4a2c17", "#1b1b2f", "#b5651d"][i]} />
            <rect x={d.x - 150} y={1290} width={300} height={26} rx={8} fill="#8d6e4f" /><rect x={d.x - 130} y={1316} width={20} height={190} fill="#6d5640" /><rect x={d.x + 110} y={1316} width={20} height={190} fill="#6d5640" />
            <rect x={d.x - 80} y={1130} width={160} height={110} rx={10} fill="#22304a" /><rect x={d.x - 68} y={1142} width={136} height={84} rx={6} fill={i === 2 && done ? "#d8ffe6" : "#bfe3ff"} />
            {i === 2 && done ? <text x={d.x} y={1204} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill="#1c8a4b">✓</text> : <rect x={d.x - 52} y={1160} width={ip(f, [0, 30], [0, 100]) } height={10} rx={5} fill="#6c8ebf" />}
            <rect x={d.x - 20} y={1240} width={40} height={14} fill="#22304a" />
            <g transform={`translate(${d.x},1560)`}><circle r={26} fill={d.c} /><text y={10} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill="#fff">{d.n}</text><rect x={-90} y={34} width={180} height={52} rx={26} fill="#fff" stroke={d.c} strokeWidth={5} /><text y={72} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill="#22304a">{d.label}</text></g>
          </g>
        ))}
        {/* envelope flying desk 1 -> desk 3 */}
        {f >= 36 && f <= 86 && (<g transform={`translate(${ex},${ey}) rotate(${Math.sin(t * 6) * 10})`}><rect x={-44} y={-30} width={88} height={60} rx={8} fill="#fff" stroke="#ff7a1a" strokeWidth={6} /><path d="M -44 -26 L 0 8 L 44 -26" stroke="#ff7a1a" strokeWidth={6} fill="none" /></g>)}
        {f >= 36 && f <= 80 && Array.from({ length: 8 }).map((_, k) => { const tt = Math.max(0, t - k * 0.04); return <circle key={k} cx={190 + 700 * tt} cy={1190 - Math.sin(tt * Math.PI) * 300} r={8 - k * 0.8} fill="#ff7a1a" opacity={0.5 - k * 0.05} />; })}
        <g transform="translate(1010,1330)"><rect x={-26} y={20} width={52} height={60} rx={8} fill="#a0663c" /><path d="M 0 20 Q -60 -40 -30 -90 Q 0 -30 0 20 M 0 20 Q 60 -40 34 -100 Q 0 -30 0 20" fill="#3f9a55" /></g>
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 130, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#22304a", opacity: ip(f, [4, 16], [0, 1]) }}>Sales sends it. Finance has it.</div>
    </AbsoluteFill>
  );
};

// ---------- D. FLAT AVATAR (audio-driven mouth) ----------
export const Avatar: React.FC = () => {
  const f = useCurrentFrame();
  const a = ENV[Math.min(f, ENV.length - 1)] ?? 0;
  const am = (a + (ENV[Math.max(0, f - 1)] ?? 0)) / 2;
  const blink = (f % 84) > 80 ? 0.12 : 1;
  const sway = Math.sin(f / 22) * 6 + am * 5;
  const wave = f < 36 ? Math.sin(f / 2.2) * 18 : 0;
  const hand = ip(f, [0, 8, 40, 52], [0, 1, 1, 0]);
  const mouthH = 6 + am * 58; const mouthW = 54 - am * 14;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg,#ffe3d1,#d9e8ff)" }}>
      <Audio src={staticFile("probes/avatar_line.wav")} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={140 + i * 270} cy={300 + (i % 2) * 140 + Math.sin(f / 30 + i) * 14} r={70 + i * 8} fill="#ffffff55" />)}
        <g transform={`translate(540,${1000 + Math.sin(f / 18) * 5}) rotate(${sway * 0.3})`}>
          {/* torso */}
          <path d="M -330 900 Q -330 480 -140 430 L 140 430 Q 330 480 330 900 Z" fill="#2bb3a3" /><path d="M -90 430 L 0 560 L 90 430 Z" fill="#f1c27d" />
          <rect x={-60} y={300} width={120} height={150} rx={40} fill="#e5b06a" />
          {/* waving hand */}
          <g transform={`translate(${300},${420 - hand * 330}) rotate(${wave})`} opacity={hand}><rect x={-34} y={0} width={68} height={180} rx={34} fill="#f1c27d" /><circle cy={-10} r={62} fill="#f1c27d" />{[-40, -14, 12, 38].map((x, i) => <rect key={i} x={x - 9} y={-110 + Math.abs(i - 1.5) * 8} width={18} height={70} rx={9} fill="#f1c27d" />)}</g>
          {/* head */}
          <g transform={`translate(0,${-40 + am * -4})`}>
            <path d="M -230 -90 Q -250 -420 0 -430 Q 250 -420 230 -90 Z" fill="#3a2418" />
            <ellipse cx={-212} cy={0} rx={30} ry={46} fill="#e5b06a" /><ellipse cx={212} cy={0} rx={30} ry={46} fill="#e5b06a" />
            <path d="M -200 -40 Q -210 260 0 300 Q 210 260 200 -40 Q 190 -230 0 -240 Q -190 -230 -200 -40Z" fill="#f1c27d" />
            <path d="M -215 -60 Q -230 -340 0 -350 Q 230 -340 215 -60 Q 170 -200 40 -230 Q -80 -190 -140 -130 Q -190 -110 -215 -60Z" fill="#3a2418" />
            <path d="M -150 -110 Q -90 -190 20 -190" stroke="#4d3223" strokeWidth={6} fill="none" opacity={0.5} />
            {[-1, 1].map((s) => (<g key={s}>
              <path d={`M ${s * 52} ${-34 - am * 18} Q ${s * 100} ${-62 - am * 18} ${s * 150} ${-36 - am * 10}`} stroke="#3a2418" strokeWidth={14} fill="none" strokeLinecap="round" />
              <ellipse cx={s * 98} cy={4} rx={36} ry={34 * blink} fill="#fff" /><circle cx={s * 98 + Math.sin(f / 40) * 6} cy={6} r={20 * Math.sqrt(blink)} fill="#3b2f2f" /><circle cx={s * 98 + 6} cy={-2} r={6 * blink} fill="#fff" />
              <circle cx={s * 128} cy={92} r={26} fill="#ff8a8a44" />
            </g>))}
            <path d="M 0 40 Q 14 70 0 84" stroke="#c9976a" strokeWidth={8} fill="none" strokeLinecap="round" />
            <g transform="translate(0,150)"><ellipse rx={mouthW} ry={mouthH} fill="#7a2230" />{am > 0.25 && <rect x={-mouthW * 0.7} y={-mouthH + 2} width={mouthW * 1.4} height={Math.min(16, mouthH * 0.4)} rx={5} fill="#fff" />}{am > 0.5 && <ellipse cy={mouthH * 0.5} rx={mouthW * 0.5} ry={mouthH * 0.35} fill="#e86a7a" />}</g>
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1700, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 54, color: "#22304a", background: "#ffffffdd", borderRadius: 40, padding: "18px 24px", opacity: ip(f, [8, 20], [0, 1]) }}>{f < 60 ? "Hi, I'm Maya." : f < 120 ? "Tap the app, your cab arrives in two minutes." : "It's that simple."}</div>
    </AbsoluteFill>
  );
};

export const PROBE_FRAMES = 120 * 3 + 180;
export const Probes: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={120}><Cartoon /></Sequence>
    <Sequence from={120} durationInFrames={120}><Ghibli /></Sequence>
    <Sequence from={240} durationInFrames={120}><Office /></Sequence>
    <Sequence from={360} durationInFrames={180}><Avatar /></Sequence>
  </AbsoluteFill>
);
