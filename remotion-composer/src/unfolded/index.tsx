import React from "react";
import { Still, Composition, registerRoot } from "remotion";
import { PropShot } from "./PropShot";
import shot04 from "./shots/shot04.json";
import film from "./shots/film.json";
import { Film } from "./Film";
import { Still1, Still2, Still3, Still4 } from "./scenes";
import { LookShadow, LookMap, LookSketch, LookCollage } from "./looks";
const S = [Still1, Still2, Still3, Still4];
const L: [string, React.FC][] = [["ULookShadow", LookShadow], ["ULookMap", LookMap], ["ULookSketch", LookSketch], ["ULookCollage", LookCollage]];
const Root: React.FC = () => (<>
  {S.map((C, i) => <Still key={i} id={`UStill${i + 1}`} component={C} width={1080} height={1920} />)}
  {L.map(([id, C]) => <Still key={id} id={id} component={C} width={1080} height={1920} />)}
  <Composition id="UShot04" component={PropShot as any} durationInFrames={shot04.frames} fps={30} width={1080} height={1920} defaultProps={shot04.props as any} />
  <Composition id="UFilm" component={Film as any} durationInFrames={film.frames} fps={30} width={1080} height={1920} defaultProps={film.props as any} />
</>);
registerRoot(Root);
