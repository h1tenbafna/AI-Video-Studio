// Shared overlay theme (text-on-plate kit). Each project picks a theme through props.
export type Theme = { tag: string; ink: string; mid: string; accent: string; white: string; shadow: string };
export const THEMES: Record<string, Theme> = {
  tabletop: { tag: "#FBF1DC", ink: "#35210F", mid: "#7B5B3A", accent: "#E4572E", white: "#FFFFFF", shadow: "#35210F55" },
  neon: { tag: "#0E1226", ink: "#E8F4FF", mid: "#7FD6FF", accent: "#FF3D8B", white: "#FFFFFF", shadow: "#00E5FF55" },
  chalk: { tag: "#1E2A24", ink: "#F4F1E6", mid: "#C9D6BF", accent: "#FFD84A", white: "#FFFFFF", shadow: "#00000066" },
};
export const FONT = "Space Grotesk, system-ui, sans-serif";
export const FPS = 30;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const prog = (t: number, s: number, d: number) => clamp((t - s) / d);
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const back = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const SCENE = { s1: [0, 4.7], s2: [4.7, 24.0], s3: [24.0, 32.0], s4: [32.0, 40.0] } as const;
export const T = { s1: 0.2, s2: 4.7, s3: 11.85, s4: 17.5, s5: 24.0, s6: 32.0 };
// Blender scene start frames (global) used to index anchor arrays.
export const SF: Record<string, number> = { "1": 1, "2": 142, "3": 721, "4": 961 };
