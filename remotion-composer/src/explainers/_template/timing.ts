// Episode timing. REPLACE these with the real narration placement from edit_decisions
// (each narration segment's start_seconds) once the Kokoro clips exist.
// T = beat anchors (seconds on the final timeline). SCENES = [start, end] per scene.
export const TITLE = "TOPIC SHEET"; // title-block label, about 16 chars, upper case
export const TOTAL_SECONDS = 12;
export const T = { s1: 0.2, s2: 6.0 } as const;
export const SCENES: [number, number][] = [
  [0, 6.0],
  [6.0, 12.0],
];
