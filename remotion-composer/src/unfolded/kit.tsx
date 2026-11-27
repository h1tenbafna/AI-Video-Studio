import React from "react";

export const U = {
  sheet: "#DCE7E2", sheet2: "#C9DAD3", ink: "#123B47", inkSoft: "#2C5A66", gold: "#FFC93C", coral: "#F2705F", sky: "#7DB9D8",
  white: "#F7F4EA", wood: "#B88A5A", woodDark: "#8A6238", skin: "#F0C29C", skin2: "#B5764F", teal: "#1F6B7A", tealDeep: "#0E4552",
  robe: "#6D5BA8", glue: "#FFF1B8",
};
export const W = 1080, H = 1920;
export const SANS = "'Trebuchet MS','Segoe UI',Arial,sans-serif";

export const Defs: React.FC = () => (
  <defs>
    <filter id="fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8 0.3" numOctaves="3" seed="7" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0.14 0" result="t" />
      <feComposite in="t" in2="SourceGraphic" operator="in" result="tin" />
      <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="tin" /></feMerge>
    </filter>
    <filter id="deckle" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale="5" />
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="-6" dy="12" stdDeviation="8" floodColor="#0a2a33" floodOpacity="0.38" />
    </filter>
    <filter id="shadowSm" x="-20%" y="-20%" width="150%" height="160%">
      <feDropShadow dx="-3" dy="6" stdDeviation="3.5" floodColor="#0a2a33" floodOpacity="0.4" />
    </filter>
    <filter id="blurFar"><feGaussianBlur stdDeviation="9" /></filter>
    <filter id="blurMid"><feGaussianBlur stdDeviation="3.5" /></filter>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="62%" stopColor="#0a2a33" stopOpacity="0" /><stop offset="100%" stopColor="#0a2a33" stopOpacity="0.38" />
    </radialGradient>
    <radialGradient id="warm" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.9" /><stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="keylight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFF3C9" stopOpacity="0.38" /><stop offset="0.6" stopColor="#FFF3C9" stopOpacity="0" />
    </linearGradient>
  </defs>
);

export const Cut: React.FC<{ children: React.ReactNode; sm?: boolean; transform?: string; blur?: "far" | "mid" }> = ({ children, sm, transform, blur }) => (
  <g transform={transform} filter={blur ? (blur === "far" ? "url(#blurFar)" : "url(#blurMid)") : undefined}>
    <g filter={sm ? "url(#shadowSm)" : "url(#shadow)"}>
      <g filter="url(#fibre)"><g filter="url(#deckle)">{children}</g></g>
    </g>
  </g>
);

export const Stage: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = U.sheet, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: bg, display: "block" }}>
    <Defs />
    {children}
    <rect width={W} height={H} fill="url(#keylight)" pointerEvents="none" />
    <rect width={W} height={H} fill="url(#vig)" pointerEvents="none" />
  </svg>
);

export const T: React.FC<{ x: number; y: number; size: number; fill?: string; children: React.ReactNode; weight?: number | string; anchor?: "start" | "middle" | "end"; ls?: number; stroke?: string }> = ({ x, y, size, fill = U.ink, children, weight = 800, anchor = "middle", ls = 0, stroke }) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} fontFamily={SANS} letterSpacing={ls} stroke={stroke} strokeWidth={stroke ? 10 : 0} paintOrder="stroke" strokeLinejoin="round">{children}</text>
);

/** Style B caption: bold, two lines, active word gold, dark outline. Lines are real text runs so spacing is natural. */
export const Cap: React.FC<{ lines: { w: string; on?: boolean }[][]; y?: number }> = ({ lines, y = 1290 }) => (
  <g>
    {lines.map((ln, li) => (
      <text key={li} x={W / 2} y={y + li * 92} fontSize={76} fontWeight={800} textAnchor="middle" fontFamily={SANS} stroke={U.ink} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round" xmlSpace="preserve">
        {ln.map((t, i) => <tspan key={i} fill={t.on ? U.gold : U.white}>{t.w}{i < ln.length - 1 ? " " : ""}</tspan>)}
      </text>
    ))}
  </g>
);

/** Crease: original folded-paper mascot. Diamond body, two ear flaps, dot eyes, one crease smile. */
export const Crease: React.FC<{ x: number; y: number; s?: number; mood?: "smile" | "wince" | "wow"; flip?: boolean; rot?: number }> = ({ x, y, s = 1, mood = "smile", flip, rot = 0 }) => (
  <Cut sm transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-70 -40 L-48 -118 L-10 -62 Z" fill={U.coral} />
    <path d="M70 -40 L48 -118 L10 -62 Z" fill="#D95A49" />
    <path d="M0 -76 L78 -4 L0 78 L-78 -4 Z" fill={U.coral} />
    <path d="M0 -76 L0 78" stroke="#B94435" strokeWidth={3} opacity={0.55} />
    <path d="M-78 -4 L78 -4" stroke="#B94435" strokeWidth={3} opacity={0.35} />
    <path d="M0 -76 L78 -4 L0 -4 Z" fill="#FFFFFF" opacity={0.14} />
    <circle cx={-24} cy={-14} r={mood === "wow" ? 10 : 7.5} fill={U.ink} />
    <circle cx={24} cy={-14} r={mood === "wow" ? 10 : 7.5} fill={U.ink} />
    {mood === "smile" && <path d="M-16 20 Q0 38 16 20" stroke={U.ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
    {mood === "wince" && <path d="M-16 30 Q0 16 16 30" stroke={U.ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
    {mood === "wow" && <ellipse cx={0} cy={28} rx={9} ry={12} fill={U.ink} />}
  </Cut>
);

/** paper scientist: white coat, round glasses, one arm pouring */
export const Scientist: React.FC<{ x: number; y: number; s?: number; pour?: boolean }> = ({ x, y, s = 1, pour }) => (
  <Cut sm transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-40} width={16} height={44} rx={7} fill={U.ink} /><rect x={6} y={-40} width={16} height={44} rx={7} fill={U.ink} />
    <path d="M-40 -30 L-34 -150 Q0 -172 34 -150 L40 -30 Z" fill={U.white} stroke={U.sheet2} strokeWidth={4} strokeLinejoin="round" />
    <path d="M0 -150 L0 -34" stroke={U.sheet2} strokeWidth={4} />
    <rect x={-14} y={-148} width={28} height={14} rx={6} fill={U.coral} />
    <circle cx={0} cy={-190} r={36} fill={U.skin} />
    <path d="M-38 -192 Q-40 -236 0 -232 Q40 -236 38 -192 Q24 -214 0 -212 Q-24 -212 -38 -192 Z" fill="#3A2A22" />
    <circle cx={-14} cy={-186} r={12} fill="none" stroke={U.ink} strokeWidth={4} /><circle cx={14} cy={-186} r={12} fill="none" stroke={U.ink} strokeWidth={4} /><path d="M-2 -186 L2 -186" stroke={U.ink} strokeWidth={4} />
    <path d="M-10 -168 Q0 -160 10 -168" stroke={U.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    {/* pouring arm */}
    <g transform={`rotate(${pour ? -62 : -20} 30 -138)`}><rect x={26} y={-146} width={16} height={86} rx={8} fill={U.white} stroke={U.sheet2} strokeWidth={3} /></g>
  </Cut>
);
