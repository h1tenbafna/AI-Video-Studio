import React from "react";
import { C, Origin, P3, iso, pts, clamp, eo, back } from "./lib";

export type BoxKind = "fab" | "cloud" | "rack" | "lab" | "phone" | "chip" | "plain";

type BoxProps = {
  o: Origin; // screen origin + scale
  w: number;
  d: number;
  h: number;
  t: number; // 0..1 build progress: lines draw on, then fills, then it snaps
  kind?: BoxKind;
  at?: P3; // world offset (used for nested parts)
  dim?: number; // 0..1 fade to outline-only (used for "older chip")
  ghost?: boolean; // show a dashed "planned" outline before it is built
};

const line = (o: Origin, a: P3, b: P3, key: string, stroke = C.mid, sw = 2.5, op = 0.8) => {
  const [x1, y1] = iso(o, a);
  const [x2, y2] = iso(o, b);
  return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={sw} opacity={op} strokeLinecap="round" />;
};

export const IsoBox: React.FC<BoxProps> = ({ o, w, d, h, t, kind = "plain", at = [0, 0, 0], dim = 0, ghost = false }) => {
  const [ax, ay, az] = at;
  const draw = clamp(t / 0.55);
  const fill = clamp((t - 0.4) / 0.5) * (1 - dim * 0.85);
  const snap = clamp((t - 0.35) / 0.45);
  // parts slide in along their axis and snap with a short overshoot
  const dy = (1 - back(snap)) * -46;
  const oo: Origin = { x: o.x, y: o.y + dy, s: o.s };
  const W = (x: number, y: number, z: number): P3 => [ax + x, ay + y, az + z];

  const top = pts(oo, [W(0, 0, h), W(w, 0, h), W(w, d, h), W(0, d, h)]);
  const left = pts(oo, [W(0, d, 0), W(w, d, 0), W(w, d, h), W(0, d, h)]);
  const right = pts(oo, [W(w, d, 0), W(w, 0, 0), W(w, 0, h), W(w, d, h)]);
  const sw = 3.5;
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw } as const;
  const details: React.ReactNode[] = [];
  const dOp = clamp((t - 0.7) / 0.3);

  if (kind === "cloud") {
    for (let k = 1; k <= 3; k++) details.push(line(oo, W(w, d, (h * k) / 4), W(w, 0, (h * k) / 4), `ch${k}`));
    for (let k = 1; k <= 4; k++) details.push(line(oo, W((w * k) / 5, d, 10), W((w * k) / 5, d, h - 10), `cv${k}`, C.mid, 2, 0.5));
  } else if (kind === "rack") {
    for (let k = 1; k <= 5; k++) details.push(line(oo, W((w * k) / 6, d, 8), W((w * k) / 6, d, h - 8), `rv${k}`));
    for (let k = 1; k <= 3; k++) details.push(line(oo, W(w, d - (d * k) / 4, 8), W(w, d - (d * k) / 4, h - 8), `rr${k}`, C.mid, 2, 0.5));
  } else if (kind === "chip") {
    // pins along the left and right edges, grid on top
    for (let k = 1; k <= 7; k++) {
      details.push(line(oo, W((w * k) / 8, d, 0), W((w * k) / 8, d, h), `pl${k}`));
      details.push(line(oo, W(w, d - (d * k) / 8, 0), W(w, d - (d * k) / 8, h), `pr${k}`));
    }
    for (let k = 1; k <= 3; k++) {
      details.push(line(oo, W((w * k) / 4, 0, h), W((w * k) / 4, d, h), `gx${k}`, C.mid, 2, 0.45));
      details.push(line(oo, W(0, (d * k) / 4, h), W(w, (d * k) / 4, h), `gy${k}`, C.mid, 2, 0.45));
    }
  } else if (kind === "phone") {
    const inset = 10;
    details.push(
      <polygon key="scr" points={pts(oo, [W(inset, d, inset + 6), W(w - inset, d, inset + 6), W(w - inset, d, h - inset), W(inset, d, h - inset)])} fill={C.navy} opacity={0.9} />,
    );
  }

  const ghostOp = ghost ? 0.4 * (1 - clamp(t / 0.3)) : 0;
  const ghostEl =
    ghostOp > 0 ? (
      <g opacity={ghostOp}>
        {[left, right, top].map((pp, i) => (
          <polygon key={i} points={pp} fill="none" stroke={C.navy} strokeWidth={3} strokeDasharray="12 10" strokeLinejoin="round" />
        ))}
      </g>
    ) : null;
  if (t <= 0) return <g>{ghostEl}</g>;
  const cloudIcon =
    kind === "cloud" ? (
      (() => {
        const [cx, cy] = iso(oo, [ax + w / 2, ay + d / 2, az + h]);
        const op = clamp((t - 0.7) / 0.3);
        return (
          <g opacity={op} transform={`translate(${cx} ${cy - 46})`}>
            <path d="M -46 18 a 24 24 0 0 1 4 -46 a 32 32 0 0 1 58 -8 a 26 26 0 0 1 28 54 z" fill={C.white} stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
          </g>
        );
      })()
    ) : null;
  return (
    <g>
      {ghostEl}
      <polygon points={left} fill={C.faceLeft} fillOpacity={fill} stroke={C.navy} strokeWidth={sw} strokeLinejoin="round" {...dash} />
      <polygon points={right} fill={C.faceRight} fillOpacity={fill} stroke={C.navy} strokeWidth={sw} strokeLinejoin="round" {...dash} />
      <polygon points={top} fill={C.tag} fillOpacity={fill} stroke={C.navy} strokeWidth={sw} strokeLinejoin="round" {...dash} />
      <g opacity={dOp * (1 - dim * 0.7)}>{details}</g>
      {kind === "fab" && (
        <IsoBox o={{ x: o.x, y: o.y + dy, s: o.s }} w={w * 0.5} d={d * 0.5} h={22} at={[ax + w * 0.25, ay + d * 0.25, az + h]} t={clamp((t - 0.55) / 0.45)} kind="chip" />
      )}
      {cloudIcon}
      {kind === "lab" && <Dome o={oo} cx={ax + w / 2} cy={ay + d / 2} z={az + h} r={Math.min(w, d) * 0.36} t={clamp((t - 0.6) / 0.4)} />}
    </g>
  );
};

const Dome: React.FC<{ o: Origin; cx: number; cy: number; z: number; r: number; t: number }> = ({ o, cx, cy, z, r, t }) => {
  const [x, y] = iso(o, [cx, cy, z]);
  const rx = r * o.s * 1.2;
  const ry = rx * 0.5;
  return (
    <g opacity={t}>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.white} stroke={C.navy} strokeWidth={3} />
      <path d={`M ${x - rx} ${y} A ${rx} ${rx * 0.95} 0 0 1 ${x + rx} ${y}`} fill={C.tag} stroke={C.navy} strokeWidth={3} transform={`translate(0 ${-4})`} />
      <circle cx={x} cy={y - rx * 0.45} r={rx * 0.16} fill={C.orange} stroke={C.navy} strokeWidth={2.5} />
    </g>
  );
};

// A straight arrow drawn on, with tokens (chips or $ coins) flowing along it.
export const FlowArrow: React.FC<{
  from: [number, number];
  to: [number, number];
  t: number; // 0..1 draw-on
  time: number; // seconds, for token flow
  color: string;
  token: "chip" | "coin";
  count?: number;
  w?: number;
}> = ({ from, to, t, time, color, token, count = 1, w = 6 }) => {
  if (t <= 0) return null;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = 18;
  const draw = eo(t);
  const ex = x1 + (x2 - x1) * draw;
  const ey = y1 + (y2 - y1) * draw;
  const tokens: React.ReactNode[] = [];
  if (t >= 1) {
    for (let i = 0; i < count; i++) {
      const ph = (time * 0.45 + i / count) % 1;
      const px = x1 + (x2 - x1) * ph;
      const py = y1 + (y2 - y1) * ph;
      const op = Math.sin(ph * Math.PI);
      tokens.push(
        token === "coin" ? (
          <g key={i} opacity={op}>
            <circle cx={px} cy={py} r={20} fill={C.orange} stroke={C.navy} strokeWidth={3} />
            <text x={px} y={py + 8} textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight={800} fontSize={24} fill={C.navy}>$</text>
          </g>
        ) : (
          <g key={i} opacity={op}>
            <rect x={px - 16} y={py - 16} width={32} height={32} rx={3} fill={C.white} stroke={C.navy} strokeWidth={3} />
            <rect x={px - 7} y={py - 7} width={14} height={14} fill="none" stroke={C.mid} strokeWidth={2} />
          </g>
        ),
      );
    }
  }
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={C.navy} strokeWidth={w + 4} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      {t > 0.85 && (
        <g>
          <polygon
            points={`${x2},${y2} ${x2 - head * Math.cos(a - 0.45)},${y2 - head * Math.sin(a - 0.45)} ${x2 - head * Math.cos(a + 0.45)},${y2 - head * Math.sin(a + 0.45)}`}
            fill={color}
            stroke={C.navy}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </g>
      )}
      {tokens}
    </g>
  );
};
