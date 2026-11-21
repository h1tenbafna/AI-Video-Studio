// Blueprint-isometric theme + small helpers. Everything is a pure function of time.
export const C = {
  paper: "#8FB8E0",
  navy: "#0B2A4A",
  mid: "#14508C",
  tag: "#DCEBF7",
  white: "#FFFFFF",
  orange: "#FF7A1A",
  faceLeft: "#F4F9FD",
  faceRight: "#B6D2EC",
};

export const FONT = "Space Grotesk, system-ui, sans-serif";
export const FPS = 30;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// progress of t inside [start, start+dur]
export const prog = (t: number, start: number, dur: number) => clamp((t - start) / dur);
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const back = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export type P3 = [number, number, number];
export type Origin = { x: number; y: number; s: number };
const COS30 = Math.cos(Math.PI / 6);
// isometric projection: x to the right-down, y to the left-down, z up
export const iso = (o: Origin, p: P3): [number, number] => [
  o.x + (p[0] - p[1]) * COS30 * o.s,
  o.y + ((p[0] + p[1]) * 0.5 - p[2]) * o.s,
];
export const pts = (o: Origin, ps: P3[]) => ps.map((p) => iso(o, p).join(",")).join(" ");

// Section anchors on the final timeline (seconds), from the real narration lengths.
export const T = {
  s1: 0.2,
  s2: 4.7,
  s3: 11.85,
  s4: 17.5,
  s5: 24.0,
  s6: 32.0,
};
export const SCENE = { s1: [0, 4.7], s2: [4.7, 24.0], s3: [24.0, 32.0], s4: [32.0, 40.0] } as const;
