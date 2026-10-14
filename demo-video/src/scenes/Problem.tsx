import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {BrandProps, COLORS, TIMELINE} from "../config";
import {SERIF} from "../theme";
import {SceneShell} from "../components/SceneShell";
import {SceneLabel} from "../components/Premium";
import {FaceAvatar, StarIcon, ReturnIcon, WarningIcon, ClockIcon, DollarIcon} from "../components/Icons";
import {fadeUp, pop, SHADOW, clamp} from "../components/anim";

export const Problem: React.FC<BrandProps> = (props) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const risks = [
    {label: "1-star review", detail: "A poor experience becomes public.", Icon: StarIcon, color: COLORS.amber, at: 34},
    {label: "Return request", detail: "A concern turns into a lost order.", Icon: ReturnIcon, color: COLORS.red, at: 68},
    {label: "Never buys again", detail: "A customer quietly disappears.", Icon: WarningIcon, color: COLORS.plum, at: 102},
  ];
  return <SceneShell seconds={TIMELINE.problem.duration} accent={props.accent}>
    <SceneLabel brand={props.brand} text="The blind spot" number="02" accent={props.accent} />
    <div style={{position: "absolute", top: 138, left: 96, width: 1690, ...fadeUp(pop(f, fps, 0))}}>
      <div style={{fontFamily: SERIF, fontSize: 78, fontWeight: 600, letterSpacing: -2, lineHeight: 1.15}}>The unhappy customer<br /><span style={{color: COLORS.plum, fontStyle: "italic"}}>you never heard from.</span></div>
    </div>
    <div style={{position: "absolute", left: 178, top: 375, width: 500, height: 410, display: "grid", placeItems: "center", ...fadeUp(pop(f, fps, 12))}}>
      <div style={{position: "absolute", width: 370, height: 370, borderRadius: "50%", background: "radial-gradient(circle, #E5D7EB, #F2EAF580)", boxShadow: "inset 0 0 0 1px #FFFFFF, 0 24px 70px #3B234616"}} />
      <div style={{position: "relative", transform: "scale(1.28)"}}><FaceAvatar size={240} mood="sad" /></div>
      <div style={{position: "absolute", bottom: -2, background: "#FFFFFF", border: "1px solid #E8E2D6", borderRadius: 20, padding: "14px 28px", fontSize: 25, fontWeight: 600, color: COLORS.inkSoft, boxShadow: SHADOW}}>No feedback. No visibility.</div>
    </div>
    <svg width={1920} height={1080} style={{position: "absolute", pointerEvents: "none"}}><path d="M625 584H780M780 425V744M780 425H884M780 584H884M780 744H884" fill="none" stroke={props.accent} strokeWidth="2" strokeDasharray="6 8" strokeDashoffset={-f * 0.55} opacity={interpolate(f, [22, 40], [0, 0.55], clamp)} /></svg>
    <div style={{position: "absolute", left: 884, right: 96, top: 365, display: "flex", flexDirection: "column", gap: 20}}>
      {risks.map(({label, detail, Icon, color, at}) => <div key={label} style={{height: 140, boxSizing: "border-box", background: "linear-gradient(115deg, #FFFFFF, #FFFEFB)", border: "1px solid #FFFFFF", borderRadius: 26, padding: "25px 30px", display: "flex", alignItems: "center", gap: 26, boxShadow: SHADOW, ...fadeUp(pop(f, fps, at), 24)}}>
        <div style={{width: 80, height: 80, borderRadius: 24, background: `${color}12`, border: `1px solid ${color}22`, display: "grid", placeItems: "center"}}><Icon size={43} color={color} /></div>
        <div><div style={{fontSize: 34, fontWeight: 600, color: COLORS.plum}}>{label}</div><div style={{fontSize: 25, color: COLORS.inkSoft, marginTop: 6}}>{detail}</div></div>
      </div>)}
    </div>
    <div style={{position: "absolute", left: 96, right: 96, bottom: 64, height: 138, borderRadius: 28, display: "flex", alignItems: "center", gap: 22, padding: "0 38px", boxSizing: "border-box", background: "linear-gradient(110deg, #35243F, #4A3352)", color: "white", boxShadow: SHADOW, ...fadeUp(pop(f, fps, 156), 28)}}>
      <ClockIcon size={60} color="#E7D6ED" /><DollarIcon size={62} color={props.accent} />
      <div style={{fontSize: 36, fontWeight: 500, marginLeft: 8}}>Calling every customer by hand is <span style={{color: "#F0D593"}}>slow and costly.</span></div>
    </div>
  </SceneShell>;
};
