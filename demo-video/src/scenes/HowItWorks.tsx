import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {BrandProps, COLORS, TIMELINE} from "../config";
import {SERIF} from "../theme";
import {SceneShell} from "../components/SceneShell";
import {SceneLabel} from "../components/Premium";
import {HeadsetIcon, CheckIcon, ArrowRightIcon} from "../components/Icons";
import {fadeUp, pop, clamp, SHADOW} from "../components/anim";

const OrdersPreview: React.FC<{product: string; accent: string; f: number}> = ({product, accent, f}) => <div style={{width: 400, height: 225, borderRadius: 20, background: "#FFFFFF", border: "1px solid #E2E7E1", overflow: "hidden", boxShadow: "0 14px 25px #3B234610"}}>
  <div style={{background: "#E7F3EB", padding: "17px 22px", color: COLORS.sheetGreen, fontSize: 21, fontWeight: 600, display: "flex", justifyContent: "space-between"}}><span>Delivered orders</span><span>✓</span></div>
  {["Customer", "Product", "Ready to call"].map((v, i) => <div key={v} style={{height: 49, display: "flex", alignItems: "center", padding: "0 22px", borderBottom: "1px solid #EFEBE4", gap: 14, opacity: interpolate(f, [i * 8, i * 8 + 16], [0, 1], clamp)}}><div style={{width: 6, height: 6, borderRadius: 3, background: accent}} /><span style={{fontSize: 18, color: COLORS.inkSoft, width: 150}}>{v}</span><span style={{fontSize: 19, fontWeight: 600, color: COLORS.plum}}>{i === 1 ? product : i === 2 ? "Yes" : "Name + phone"}</span></div>)}
</div>;

const CallPreview: React.FC<{name: string; accent: string; f: number}> = ({name, accent, f}) => <div style={{width: 400, height: 225, borderRadius: 24, background: "linear-gradient(140deg, #4C3258, #24162C)", color: "#FFFFFF", padding: 26, boxSizing: "border-box", boxShadow: "0 18px 36px #3B234628"}}>
  <div style={{display: "flex", gap: 18, alignItems: "center"}}><div style={{width: 70, height: 70, borderRadius: 24, background: `${accent}26`, border: `1px solid ${accent}66`, display: "grid", placeItems: "center"}}><HeadsetIcon size={38} color={accent} /></div><div><div style={{fontSize: 25, fontWeight: 600}}>{name}</div><div style={{fontSize: 18, opacity: 0.65, marginTop: 4}}>Customer feedback call</div></div></div>
  <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 70, marginTop: 20}}>{Array.from({length: 27}, (_, i) => <div key={i} style={{width: 6, borderRadius: 4, background: accent, height: 8 + Math.abs(Math.sin(f * 0.12 + i * 0.7)) * 42 * Math.sin((i + 1) / 28 * Math.PI)}} />)}</div>
</div>;

const AnswerPreview: React.FC<{accent: string; f: number}> = ({accent, f}) => <div style={{width: 400, height: 225, borderRadius: 20, background: "#FFFFFF", border: "1px solid #E9E2D8", padding: 24, boxSizing: "border-box", boxShadow: "0 14px 25px #3B234610"}}>
  <div style={{fontSize: 20, color: COLORS.plum, fontWeight: 600, display: "flex", gap: 10, alignItems: "center"}}><CheckIcon size={26} color={COLORS.green} />Feedback captured</div>
  {["Rating", "Their exact words", "A concise summary"].map((s, i) => <div key={s} style={{display: "flex", alignItems: "center", gap: 14, marginTop: 21, opacity: interpolate(f, [i * 10, i * 10 + 18], [0, 1], clamp)}}><div style={{width: 29, height: 29, borderRadius: 9, background: `${accent}20`, color: accent, fontSize: 17, display: "grid", placeItems: "center"}}>✓</div><span style={{fontSize: 22, color: COLORS.inkSoft}}>{s}</span></div>)}
</div>;

export const HowItWorks: React.FC<BrandProps> = (props) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const steps = [
    {number: "01", title: "Add your orders.", sub: "Name, phone and product —\nfrom your existing sheet.", at: 22, preview: <OrdersPreview product={props.product} accent={props.accent} f={f - 30} />},
    {number: "02", title: "Start a conversation.", sub: `${props.agentName} calls each customer\nfor a friendly, 2-minute chat.`, at: 78, preview: <CallPreview name={props.agentName} accent={props.accent} f={f - 78} />},
    {number: "03", title: "See what matters.", sub: "Answers land straight back\nin your feedback sheet.", at: 136, preview: <AnswerPreview accent={props.accent} f={f - 146} />},
  ];
  return <SceneShell seconds={TIMELINE.howItWorks.duration} accent={props.accent}>
    <SceneLabel brand={props.brand} text="How it works" number="03" accent={props.accent} />
    <div style={{position: "absolute", top: 155, left: 96, ...fadeUp(pop(f, fps, 0))}}><div style={{fontFamily: SERIF, fontSize: 91, fontWeight: 600, letterSpacing: -2}}>Your sheet. <span style={{fontStyle: "italic", color: COLORS.plum}}>A real conversation.</span></div><div style={{fontSize: 30, color: COLORS.inkSoft, marginTop: 20}}>A simple path from delivered orders to useful feedback.</div></div>
    <div style={{position: "absolute", left: 96, top: 370, display: "flex", gap: 66}}>
      {steps.map((s, i) => <div key={s.number} style={{position: "relative", width: 532, height: 565, borderRadius: 36, padding: 42, boxSizing: "border-box", background: "linear-gradient(140deg, #FFFFFF, #FFFCF7)", border: "1px solid #FFFFFF", boxShadow: SHADOW, ...fadeUp(pop(f, fps, s.at), 38)}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30}}><span style={{fontSize: 21, fontWeight: 600, letterSpacing: 3, color: props.accent}}>STEP {s.number}</span><span style={{fontFamily: SERIF, fontSize: 50, color: "#E9E1D5"}}>{s.number}</span></div>
        <div style={{display: "flex", justifyContent: "center"}}>{s.preview}</div>
        <div style={{fontSize: 33, fontWeight: 600, color: COLORS.plum, marginTop: 34, letterSpacing: -0.8}}>{s.title}</div>
        <div style={{fontSize: 26, lineHeight: 1.45, whiteSpace: "pre-line", color: COLORS.inkSoft, marginTop: 14}}>{s.sub}</div>
        {i < 2 && <div style={{position: "absolute", right: -55, top: 257, width: 44, height: 44, borderRadius: 22, background: props.accent, color: "white", boxShadow: "0 6px 16px #C8A24A33", display: "grid", placeItems: "center", opacity: interpolate(f, [s.at + 40, s.at + 56], [0, 1], clamp)}}><ArrowRightIcon size={26} color="white" /></div>}
      </div>)}
    </div>
  </SceneShell>;
};
