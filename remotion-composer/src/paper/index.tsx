import React from "react";
import { Composition, Still, registerRoot } from "remotion";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7 } from "./scenes";
import { PaperExplainer, TOTAL_FRAMES } from "./PaperExplainer";

const S = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];
const Root: React.FC = () => (
  <>
    <Composition id="PaperExplainer" component={PaperExplainer} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
    {S.map((C, i) => <Still key={i} id={`PaperStill${i + 1}`} component={C} width={1080} height={1920} />)}
  </>
);
registerRoot(Root);
