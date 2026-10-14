import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {COLORS, FPS} from "../config";
import {SANS} from "../theme";
import {clamp} from "./anim";
import {Ambient} from "./Premium";

export const TRANSITION_FRAMES = 12;
type Props = {seconds: number; background?: string; color?: string; accent?: string; exit?: boolean; backdrop?: React.ReactNode; children: React.ReactNode};
export const SceneShell: React.FC<Props> = ({seconds, background = COLORS.paper, color = COLORS.ink, accent = COLORS.gold, exit = true, backdrop, children}) => {
  const frame = useCurrentFrame(); const total = Math.round(seconds * FPS);
  const entry = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const out = exit ? interpolate(frame, [total, total + TRANSITION_FRAMES], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}) : 0;
  return <AbsoluteFill>
    <AbsoluteFill style={{background, opacity: entry}}><Ambient dark={background !== COLORS.paper} accent={accent} />{backdrop}</AbsoluteFill>
    <AbsoluteFill style={{fontFamily: SANS, color, opacity: entry * (1 - out)}}>{children}</AbsoluteFill>
  </AbsoluteFill>;
};
