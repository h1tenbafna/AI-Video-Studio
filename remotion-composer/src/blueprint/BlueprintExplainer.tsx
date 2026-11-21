import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { loadSpaceGrotesk } from "../lib/localFonts";
import { FPS, SCENE } from "./lib";
import { Sheet, Captions } from "./ui";
import { Scene1, Scene2, Scene3, Scene4 } from "./scenes";

loadSpaceGrotesk(["500", "600", "700", "800"]);

const f = (s: number) => Math.round(s * FPS);
export const TOTAL_FRAMES = 40 * FPS;

export const BlueprintExplainer: React.FC = () => (
  <AbsoluteFill>
    <Sheet />
    <Sequence from={f(SCENE.s1[0])} durationInFrames={f(SCENE.s1[1] - SCENE.s1[0])}><Scene1 /></Sequence>
    <Sequence from={f(SCENE.s2[0])} durationInFrames={f(SCENE.s2[1] - SCENE.s2[0])}><Scene2 /></Sequence>
    <Sequence from={f(SCENE.s3[0])} durationInFrames={f(SCENE.s3[1] - SCENE.s3[0])}><Scene3 /></Sequence>
    <Sequence from={f(SCENE.s4[0])} durationInFrames={f(SCENE.s4[1] - SCENE.s4[0])}><Scene4 /></Sequence>
    <Captions />
  </AbsoluteFill>
);
