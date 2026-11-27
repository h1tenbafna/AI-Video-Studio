// Episode entry for the blueprint explainer theme. Render with:
//   npx remotion render src/explainers/<id>/index.tsx Episode <out.mp4> --concurrency 2
import React from "react";
import { AbsoluteFill, Composition, Sequence, registerRoot } from "remotion";
import { loadSpaceGrotesk } from "../../lib/localFonts";
import { FPS } from "../../blueprint/lib";
import { Sheet, Captions } from "../../blueprint/ui";
import { SCENES, TITLE, TOTAL_SECONDS } from "./timing";
import { SCENE_COMPONENTS } from "./scenes";
import { WORDS } from "./words";

loadSpaceGrotesk(["500", "600", "700", "800"]);
const f = (s: number) => Math.round(s * FPS);

const Episode: React.FC = () => (
  <AbsoluteFill>
    <Sheet title={TITLE} />
    {SCENE_COMPONENTS.map((S, i) => (
      <Sequence key={i} from={f(SCENES[i][0])} durationInFrames={f(SCENES[i][1] - SCENES[i][0])}>
        <S />
      </Sequence>
    ))}
    <Captions words={WORDS} />
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <Composition id="Episode" component={Episode} durationInFrames={f(TOTAL_SECONDS)} fps={FPS} width={1080} height={1920} />
);
registerRoot(Root);
