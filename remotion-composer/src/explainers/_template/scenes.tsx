// Episode scenes. The LOOK is fixed (blueprint kit); the OBJECTS and MOTION are new per topic.
// Rules (see .claude/skills/explainer/SKILL.md):
//  - every scene shows the narrated action literally (mute test), synced to a T anchor
//  - lines draw on before fills, parts snap with overshoot (IsoBox does this from t 0..1)
//  - every name / number is a PartTag or Callout with a leader line, never a floating caption
//  - orange (#FF7A1A) only for shapes, arrows and chips, never for text
//  - every on-screen fact carries a source `foot` (30 px minimum) when it is a statistic
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, clamp, eo, eio, prog, iso, back } from "../../blueprint/lib";
import { IsoBox, FlowArrow } from "../../blueprint/iso";
import { PartTag, StepRail, Callout } from "../../blueprint/ui";
import { SCENES } from "./timing";

// keep imports used so the template type-checks while scenes are being written
void [FONT, clamp, eio, back, StepRail, FlowArrow];

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps; // seconds since this Sequence started
};
export const useFade = (dur: number) => {
  const t = useT();
  return Math.min(eo(prog(t, 0, 0.25)), 1 - eo(prog(t, dur - 0.25, 0.25)));
};
// right-face midpoint of an iso box: where a PartTag leader line should land
export const tgt = (o: { x: number; y: number; s: number }, w: number, d: number, h: number): [number, number] =>
  iso(o, [w, d / 2, h / 2]);

const dur = (i: number) => SCENES[i][1] - SCENES[i][0];

// Example scene 1: one object builds, a tag draws on. Replace with the topic's objects.
export const Scene1: React.FC = () => {
  const t = useT();
  const fade = useFade(dur(0));
  const o = { x: 420, y: 900, s: 1.4 };
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <IsoBox o={o} w={200} d={160} h={140} t={prog(t, 0.1, 1.4)} kind="plain" />
      </svg>
      <PartTag target={tgt(o, 200, 160, 140)} x={560} y={560} w={460} index="1" title="THE THING" role={["what it does"]} t={prog(t, 1.2, 1.1)} />
    </AbsoluteFill>
  );
};

// Example scene 2: a big figure with a source foot.
export const Scene2: React.FC = () => {
  const t = useT();
  const fade = useFade(dur(1));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Callout x={140} y={700} w={800} t={prog(t, 0.2, 1.0)} big="$0" small={["a figure the narrator says"]} foot="Source name, year" footSize={30} />
    </AbsoluteFill>
  );
};

export const SCENE_COMPONENTS: React.FC[] = [Scene1, Scene2];
void C;
