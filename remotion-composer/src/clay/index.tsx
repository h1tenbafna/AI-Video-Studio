import React from "react";
import { Composition, registerRoot } from "remotion";
import { ClayEpisode, ClayProps } from "./ClayEpisode";

const defaults: ClayProps = {
  plate: "plate.mp4", frames: 180, hook: "Why is the sky blue?", brand: "clayrifying",
  words: [], sources: [], end: { start: 4.6, lines: ["follow for more", "clayrifying"] },
  captionY: 1400, hookUntil: 3.5,
};
const Root: React.FC = () => (
  <Composition id="ClayEpisode" component={ClayEpisode as React.FC<any>} fps={30} width={1080} height={1920}
    durationInFrames={defaults.frames} defaultProps={defaults}
    calculateMetadata={({ props }: any) => ({ durationInFrames: props.frames })} />
);
registerRoot(Root);
