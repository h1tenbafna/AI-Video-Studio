import React from "react";

export const C = {
  cream: "#23265C", paper: "#F6E7C8", brown: "#1F1B4A", terracotta: "#EE7B5E", mustard: "#F6B93F", teal: "#3E8E9A", tealDark: "#1F5560",
  hill1: "#4F4C98", hill2: "#3C3B84", hill3: "#2D2D6C", sky: "#5B4B9A", red: "#D6483A", skin: "#F0C29C", skin2: "#B5764F",
  wood: "#C98A4B", violet: "#6A57B0", peach: "#F7B58B", night: "#171947",
};
export const W = 1080, H = 1920;
export const SANS = "'Trebuchet MS','Segoe UI',Arial,sans-serif";
export const SERIF = "Georgia,'Times New Roman',serif";

/** Shared SVG defs: paper-fibre texture + soft contact shadow */
export const Defs: React.FC = () => (
  <defs>
    <filter id="fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="3" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0.16 0" result="t" />
      <feComposite in="t" in2="SourceGraphic" operator="in" result="tin" />
      <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="tin" /></feMerge>
    </filter>
    <filter id="deckle" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="9" result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale="7" />
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="6" dy="12" stdDeviation="7" floodColor="#05061f" floodOpacity="0.55" />
    </filter>
    <filter id="blurFar"><feGaussianBlur stdDeviation="5" /></filter>
    <filter id="blurMid"><feGaussianBlur stdDeviation="2.2" /></filter>
    <filter id="shadowSm" x="-20%" y="-20%" width="150%" height="160%">
      <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#05061f" floodOpacity="0.55" />
    </filter>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#05061f" stopOpacity="0.45" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFD78A" stopOpacity="0.95" /><stop offset="100%" stopColor="#FFD78A" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** a cut piece of paper: fibre texture + contact shadow */
export const Cut: React.FC<{ children: React.ReactNode; sm?: boolean; transform?: string }> = ({ children, sm, transform }) => (
  <g transform={transform} filter={sm ? "url(#shadowSm)" : "url(#shadow)"}>
    <g filter="url(#fibre)"><g filter="url(#deckle)">{children}</g></g>
  </g>
);

export const Stage: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = C.cream, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: bg, display: "block" }}>
    <Defs />
    {children}
    <rect width={W} height={H} fill="url(#vig)" pointerEvents="none" />
  </svg>
);

export const Hill: React.FC<{ y: number; fill: string; amp?: number; ph?: number; blur?: "far" | "mid" }> = ({ y, fill, amp = 60, ph = 0, blur }) => {
  let d = `M-120 ${H} L-120 ${y}`;
  for (let x = -120; x <= W + 120; x += 60) d += ` L${x} ${y + Math.sin(x / 170 + ph) * amp}`;
  d += ` L${W + 120} ${H} Z`;
  return <g filter={blur === "far" ? "url(#blurFar)" : blur === "mid" ? "url(#blurMid)" : undefined}><Cut><path d={d} fill={fill} strokeLinejoin="round" /></Cut></g>;
};

export const House: React.FC<{ x: number; y: number; s?: number; wall?: string; roof?: string; lit?: boolean; dim?: boolean }> = ({ x, y, s = 1, wall = C.paper, roof = C.terracotta, lit = true, dim }) => (
  <Cut transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-90} width={140} height={90} rx={8} fill={wall} />
    <path d="M-88 -88 L0 -165 L88 -88 Z" fill={roof} strokeLinejoin="round" stroke={roof} strokeWidth={8} />
    {lit && !dim && <ellipse cx={-35} cy={-50} rx={60} ry={50} fill="url(#glow)" />}
    <rect x={-52} y={-68} width={34} height={34} rx={5} fill={dim ? "#8a7a62" : lit ? C.mustard : "#8a7a62"} />
    <rect x={18} y={-56} width={34} height={56} rx={5} fill={C.brown} />
    <circle cx={44} cy={-28} r={3} fill={C.mustard} />
  </Cut>
);

/** paper person: hair, coat, scarf, posable arms. armF = forward raise in degrees (0 down, 90 forward, 170 up) */
export const Person: React.FC<{ x: number; y: number; s?: number; body?: string; flip?: boolean; arm?: "up" | "out" | "down"; armF?: number; armB?: number; hat?: string; small?: boolean; skin?: string; hair?: string; style?: "short" | "bun" | "long" | "bald"; scarf?: string; glow?: boolean; phone?: boolean }> = ({ x, y, s = 1, body = C.teal, flip, arm = "down", armF, armB = 8, hat, small, skin = C.skin, hair = "#2A1A14", style = "short", scarf = C.mustard, glow, phone }) => {
  const k = (small ? 0.65 : 1) * s;
  const f = armF ?? (arm === "up" ? 165 : arm === "out" ? 90 : 8);
  return (
    <Cut sm transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <rect x={-16} y={-34} width={13} height={36} rx={6} fill={C.brown} />
      <rect x={3} y={-34} width={13} height={36} rx={6} fill={C.brown} />
      <ellipse cx={-9} cy={2} rx={12} ry={6} fill="#0d0e30" /><ellipse cx={11} cy={2} rx={12} ry={6} fill="#0d0e30" />
      <rect x={-6} y={-102} width={13} height={64} rx={6} fill={body} opacity={0.75} transform={`rotate(${armB} 0 -100)`} />
      {style === "long" && <rect x={-30} y={-168} width={60} height={86} rx={26} fill={hair} />}
      <path d="M-27 -30 L-24 -108 Q0 -124 24 -108 L27 -30 Z" fill={body} stroke={body} strokeWidth={10} strokeLinejoin="round" />
      <rect x={-6} y={-96} width={12} height={62} rx={6} fill="#000" opacity={0.12} />
      <rect x={-22} y={-122} width={44} height={16} rx={8} fill={scarf} />
      <rect x={-6} y={-102} width={14} height={66} rx={7} fill={body} stroke="#000" strokeOpacity={0.12} strokeWidth={2} transform={`translate(0 0) rotate(${-f} 0 -100)`} />
      <circle cx={0} cy={-142} r={26} fill={skin} />
      {style !== "bald" && <path d="M-28 -140 Q-30 -176 0 -174 Q30 -176 28 -140 Q18 -158 -4 -156 Q-20 -154 -28 -140 Z" fill={hair} />}
      {style === "bun" && <circle cx={-4} cy={-178} r={13} fill={hair} />}
      {hat && <g><path d="M-30 -150 Q0 -192 30 -150 Z" fill={hat} /><rect x={8} y={-156} width={32} height={9} rx={4} fill={hat} /></g>}
      <circle cx={10} cy={-140} r={3.4} fill={C.brown} />
      <circle cx={14} cy={-128} r={5} fill={C.terracotta} opacity={0.35} />
      {phone && <g transform={`rotate(${-f} 0 -100)`}><rect x={-4} y={-52} width={22} height={34} rx={5} fill="#DDEBFF" transform="rotate(10 8 -35)" /><ellipse cx={8} cy={-40} rx={34} ry={30} fill="#BFD8FF" opacity={0.35} /></g>}
      {glow && <ellipse cx={12} cy={-134} rx={36} ry={30} fill="url(#glow)" opacity={0.7} />}
    </Cut>
  );
};

export const Thread: React.FC<{ x1: number; y1: number; x2: number; y2: number; sag?: number; color?: string; dash?: string; w?: number; glow?: boolean; op?: number; draw?: number }> = ({ x1, y1, x2, y2, sag = 50, color = C.mustard, dash, w = 7, glow = true, op = 1, draw }) => {
  const dd = draw === undefined ? undefined : `${draw} 1.01`;
  const d = `M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + sag} ${x2} ${y2}`;
  return (
    <g opacity={op}>
      {glow && <path d={d} pathLength={draw === undefined ? undefined : 1} strokeDasharray={dd} stroke="#FFD78A" strokeWidth={w + 14} fill="none" opacity={0.35} strokeLinecap="round" />}
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" pathLength={draw === undefined ? undefined : 1} strokeDasharray={draw === undefined ? dash : dd} />
    </g>
  );
};

export const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; rot?: number; children?: React.ReactNode; r?: number }> = ({ x, y, w, h, fill = C.paper, rot = 0, children, r = 22 }) => (
  <Cut transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={fill} />
    {children}
  </Cut>
);

export const T: React.FC<{ x: number; y: number; size: number; fill?: string; children: React.ReactNode; weight?: number | string; anchor?: "start" | "middle" | "end"; font?: string; ls?: number }> = ({ x, y, size, fill = C.brown, children, weight = 800, anchor = "middle", font = SANS, ls = 0 }) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} fontFamily={font} letterSpacing={ls}>{children}</text>
);

/** multi-line text helper */
export const Lines: React.FC<{ x: number; y: number; size: number; lh?: number; lines: string[]; fill?: string; weight?: number | string; font?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, size, lh = 1.25, lines, fill, weight, font, anchor }) => (
  <>{lines.map((l, i) => <T key={i} x={x} y={y + i * size * lh} size={size} fill={fill} weight={weight} font={font} anchor={anchor}>{l}</T>)}</>
);

export const SourceTag: React.FC<{ x: number; y: number; text: string; fill?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, text, fill = C.brown, anchor = "middle" }) => (
  <T x={x} y={y} size={30} weight={600} fill={fill} anchor={anchor}>{text}</T>
);

/** caption strip, active word as terracotta chip */
export const Caption: React.FC<{ words: string[]; active: number }> = ({ words, active }) => {
  // naive layout: one line, centered
  const size = 58, cw = size * 0.52;
  const widths = words.map((w) => w.length * cw + 40);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = W / 2 - total / 2;
  const fit = Math.min(1, 960 / (total + 72));
  return (
    <g transform={`translate(${W / 2} 1618) scale(${fit}) translate(${-W / 2} -1618)`}><Cut sm>
      <rect x={W / 2 - total / 2 - 36} y={1560} width={total + 72} height={116} rx={30} fill={C.paper} />
      {words.map((w, i) => {
        const cx = x + widths[i] / 2; x += widths[i];
        return (
          <g key={i}>
            {i === active && <rect x={cx - widths[i] / 2} y={1578} width={widths[i]} height={80} rx={20} fill={C.terracotta} />}
            <T x={cx} y={1637} size={size} fill={i === active ? C.paper : C.brown} weight={800}>{w}</T>
          </g>
        );
      })}
    </Cut></g>
  );
};

export const Title: React.FC<{ text: string; fill?: string; ink?: string }> = ({ text, fill = C.paper, ink = C.brown }) => (
  <Cut sm>
    <rect x={90} y={96} width={900} height={112} rx={20} fill={fill} />
    <T x={W / 2} y={172} size={58} fill={ink} ls={6}>{text}</T>
  </Cut>
);

export const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 40 }) => (
  <Cut sm>
    <circle cx={x} cy={y} r={r} fill={C.mustard} />
    <circle cx={x} cy={y} r={r * 0.7} fill="none" stroke="#B07F1E" strokeWidth={5} />
    <T x={x} y={y + r * 0.32} size={r * 0.95} fill="#8a5d10">$</T>
  </Cut>
);

/** v2/v3-style annotation: pill tag with a leader line to a dot on the object */
export const PillTag: React.FC<{ x: number; y: number; tx: number; ty: number; text: string; fill?: string; ink?: string; size?: number }> = ({ x, y, tx, ty, text, fill = C.paper, ink = C.brown, size = 36 }) => {
  const w = text.length * size * 0.56 + 44;
  return (
    <g>
      <path d={`M${x} ${y} L${tx} ${ty}`} stroke={fill} strokeWidth={4} />
      <circle cx={tx} cy={ty} r={9} fill={C.mustard} stroke={fill} strokeWidth={4} />
      <Cut sm><rect x={x - w / 2} y={y - size * 0.95} width={w} height={size * 1.6} rx={size * 0.5} fill={fill} /></Cut>
      <T x={x} y={y + size * 0.1} size={size} fill={ink} weight={800}>{text}</T>
    </g>
  );
};
export const Light: React.FC<{ x: number; y: number; rx?: number; ry?: number; op?: number }> = ({ x, y, rx = 160, ry = 120, op = 1 }) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#glow)" opacity={op} />;
