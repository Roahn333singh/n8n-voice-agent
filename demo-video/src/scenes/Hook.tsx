import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {BrandProps, COLORS, TIMELINE} from "../config";
import {SERIF} from "../theme";
import {SceneShell} from "../components/SceneShell";
import {SceneLabel, PerfumeBottle, DeliveryBox} from "../components/Premium";
import {CheckIcon, ChatIcon} from "../components/Icons";
import {Reveal} from "../components/Reveal";
import {clamp, fadeUp, pop, SHADOW} from "../components/anim";

export const Hook: React.FC<BrandProps> = (props) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const art = pop(f, fps, 8); const delivered = pop(f, fps, 28); const question = pop(f, fps, 80);
  const bottle = pop(f, fps, 20);
  return <SceneShell seconds={TIMELINE.hook.duration} accent={props.accent}>
    <SceneLabel brand={props.brand} text="After the delivery" number="01" accent={props.accent} />
    <div style={{position: "absolute", left: 96, top: 174, width: 810, height: 740, borderRadius: 56, border: "1px solid #FFFFFF", background: "linear-gradient(145deg, #F0E6D780, #FFFFFFB0)", boxShadow: SHADOW, opacity: art}}>
      <svg width={810} height={740} style={{position: "absolute"}}><defs><radialGradient id="hook-stage"><stop stopColor={props.accent} stopOpacity="0.24" /><stop offset="1" stopColor={props.accent} stopOpacity="0" /></radialGradient></defs><circle cx="400" cy="320" r="310" fill="url(#hook-stage)" /><g fill="none" stroke={props.accent} strokeOpacity="0.26"><circle cx="400" cy="320" r="274" /><circle cx="400" cy="320" r="300" /></g><ellipse cx="430" cy="649" rx="280" ry="44" fill="#D6C5AD" opacity="0.3" /></svg>
      <div style={{position: "absolute", left: 100, top: 270, transform: `translateY(${(1 - art) * 14}px)`}}><DeliveryBox accent={props.accent} /></div>
      <div style={{position: "absolute", left: 374, top: 87, transform: `translateY(${(1 - bottle) * 18}px) rotate(7deg)`, opacity: bottle}}><PerfumeBottle brand={props.brand} product={props.product} accent={props.accent} size={340} id="hook" /></div>
      <div style={{position: "absolute", top: 42, left: 38, display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", padding: "15px 22px", borderRadius: 22, boxShadow: "0 8px 26px #3B234610", color: COLORS.green, fontSize: 25, fontWeight: 600, ...fadeUp(delivered)}}><CheckIcon size={32} color={COLORS.green} />Order delivered</div>
      <div style={{position: "absolute", right: -30, bottom: 58, width: 350, padding: 26, borderRadius: 28, background: COLORS.plum, color: "#FFFFFF", boxShadow: "0 24px 50px #3B23462A", transform: `translateY(${(1 - question) * 14}px)`, opacity: question}}>
        <div style={{display: "flex", gap: 14, alignItems: "center", color: props.accent, fontSize: 22, fontWeight: 600}}><ChatIcon size={32} color={props.accent} />The missing conversation</div>
        <div style={{fontFamily: SERIF, fontSize: 35, marginTop: 14, lineHeight: 1.22}}>How did they really feel?</div>
      </div>
    </div>
    <div style={{position: "absolute", left: 1014, top: 265, width: 780}}>
      <div style={{fontSize: 21, fontWeight: 600, letterSpacing: 4, color: props.accent, marginBottom: 24, ...fadeUp(delivered)}}>THE CUSTOMER JOURNEY CONTINUES</div>
      <div style={{fontFamily: SERIF, fontSize: 118, fontWeight: 600, lineHeight: 1.06, letterSpacing: -4}}><Reveal p={pop(f, fps, 38)}>Delivered.</Reveal><br /><Reveal p={pop(f, fps, 65)}><span style={{color: COLORS.plum}}>Now <span style={{fontStyle: "italic", color: props.accent}}>what?</span></span></Reveal></div>
      <div style={{height: 3, width: interpolate(f, [98, 125], [0, 144], clamp), background: props.accent, margin: "40px 0 32px"}} />
      <div style={{fontSize: 36, lineHeight: 1.5, color: COLORS.inkSoft, maxWidth: 620, ...fadeUp(pop(f, fps, 110))}}>Most customers never<br />fill in a feedback form.</div>
    </div>
  </SceneShell>;
};
