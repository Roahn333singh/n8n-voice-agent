import {useCurrentFrame, useVideoConfig} from "remotion";
import type {Theme} from "../palette";
import {fadeUp, pop} from "./anim";

export const glass: React.CSSProperties = {
  background: "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
};

export const accentText = (g: readonly [string, string, string]): React.CSSProperties => ({
  fontStyle: "italic",
  background: `linear-gradient(95deg, ${g[0]} 0%, ${g[1]} 55%, ${g[2]} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  paddingRight: 14,
});

const Logo: React.FC<{T: Theme}> = ({T}) => (
  <div style={{width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(145deg, ${T.cta[0]}, ${T.cta[2]})`, boxShadow: "0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)"}}>
    <svg width={28} height={28} viewBox="0 0 28 28">
      {[5, 10, 15, 20].map((x, i) => (
        <rect key={x} x={x - 1.5} y={14 - [5, 9, 7, 4][i]} width={3} height={[5, 9, 7, 4][i] * 2} rx={1.5} fill={T.ctaText} />
      ))}
    </svg>
  </div>
);

export const TopBar: React.FC<{T: Theme; name: string; right: string}> = ({T, name, right}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: "absolute", top: 50, left: 96, right: 96, display: "flex", alignItems: "center", justifyContent: "space-between", ...fadeUp(pop(f, fps, 3), 12)}}>
      <div style={{display: "flex", alignItems: "center", gap: 16}}>
        <Logo T={T} />
        <span style={{fontSize: 27, fontWeight: 800, letterSpacing: 0.3, color: "#FFFFFF"}}>{name}</span>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 18, fontSize: 19, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: T.textMuted}}>
        <span style={{height: 1, width: 56, background: T.accent}} />
        {right}
      </div>
    </div>
  );
};
