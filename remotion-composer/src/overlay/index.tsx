import React from "react";
import { AbsoluteFill, Composition, OffthreadVideo, Sequence, registerRoot, staticFile } from "remotion";
import { loadSpaceGrotesk } from "../lib/localFonts";
import { FPS, SCENE, THEMES } from "./theme";
import { Captions, ThemeCtx } from "./ui";
import { AnchorCtx, Anchors, Scene1, Scene2, Scene3, Scene4 } from "./scenes";

loadSpaceGrotesk(["500", "600", "700", "800"]);
const f = (s: number) => Math.round(s * FPS);
type Props = { theme: string; plate: string; anchors: Anchors };
const Explainer: React.FC<Props> = ({ theme, plate, anchors }) => (
  <ThemeCtx.Provider value={THEMES[theme] ?? THEMES.tabletop}>
    <AnchorCtx.Provider value={anchors}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <OffthreadVideo src={staticFile(plate)} />
        <Sequence from={f(SCENE.s1[0])} durationInFrames={f(SCENE.s1[1] - SCENE.s1[0])}><Scene1 /></Sequence>
        <Sequence from={f(SCENE.s2[0])} durationInFrames={f(SCENE.s2[1] - SCENE.s2[0])}><Scene2 /></Sequence>
        <Sequence from={f(SCENE.s3[0])} durationInFrames={f(SCENE.s3[1] - SCENE.s3[0])}><Scene3 /></Sequence>
        <Sequence from={f(SCENE.s4[0])} durationInFrames={f(SCENE.s4[1] - SCENE.s4[0])}><Scene4 /></Sequence>
        <Captions />
      </AbsoluteFill>
    </AnchorCtx.Provider>
  </ThemeCtx.Provider>
);
const Root: React.FC = () => (
  <Composition id="OverlayExplainer" component={Explainer} durationInFrames={40 * FPS} fps={FPS} width={1080} height={1920} defaultProps={{ theme: "tabletop", plate: "plate.mp4", anchors: {} as Anchors }} />
);
registerRoot(Root);
