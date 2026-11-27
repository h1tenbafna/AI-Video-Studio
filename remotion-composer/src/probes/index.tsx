import React from "react";
import { Composition, Still, registerRoot } from "remotion";
import { Cartoon, Ghibli, Office, Avatar, Probes, PROBE_FRAMES } from "./Probes";

const Root: React.FC = () => (
  <>
    <Composition id="LookProbes" component={Probes} durationInFrames={PROBE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CartoonProbe" component={Cartoon} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="GhibliProbe" component={Ghibli} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="OfficeProbe" component={Office} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="AvatarProbe" component={Avatar} durationInFrames={180} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
