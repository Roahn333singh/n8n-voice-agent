import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {BrandProps, COLORS, TIMELINE} from "../config";
import {CALL_FEEDBACK} from "../callFeedback";
import {SERIF} from "../theme";
import {SceneShell} from "../components/SceneShell";
import {SceneLabel} from "../components/Premium";
import {CheckIcon, SheetIcon} from "../components/Icons";
import {clamp, fadeUp, pop, SHADOW, bump} from "../components/anim";

type Row = {customer: string; product: string; score: number; said: string; summary: string; sample: boolean};
const COLUMNS = [{label: "Customer", width: 270}, {label: "Product", width: 260}, {label: "Score", width: 120}, {label: "Their words", width: 600}, {label: "Summary", width: 478}];
const scoreColor = (score: number) => score >= 9 ? COLORS.green : score >= 7 ? COLORS.amber : COLORS.red;

export const Results: React.FC<BrandProps> = (props) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const rows: Row[] = [
    {customer: props.customerName, product: props.product, score: CALL_FEEDBACK.score, said: CALL_FEEDBACK.quote, summary: CALL_FEEDBACK.summary, sample: false},
    {customer: "Priya Sharma", product: "Velvet Rose", score: 9, said: "Lasts all day, love it", summary: "Very happy", sample: true},
    {customer: "Arjun Mehta", product: "Amber Nights", score: 3, said: "Smell fades in an hour", summary: "Unhappy with longevity", sample: true},
    {customer: "Neha Kapoor", product: "Citrus Bloom", score: 8, said: "Fresh and light", summary: "Happy", sample: true},
  ];
  const pulse = bump(f, 166, 198);
  return <SceneShell seconds={TIMELINE.results.duration} accent={props.accent}>
    <SceneLabel brand={props.brand} text="The feedback view" number="05" accent={props.accent} />
    <div style={{position: "absolute", top: 144, left: 96, ...fadeUp(pop(f, fps, 0))}}>
      <div style={{fontFamily: SERIF, fontSize: 88, fontWeight: 600, letterSpacing: -2}}>Every answer, <span style={{fontStyle: "italic", color: COLORS.plum}}>in your sheet.</span></div>
      <div style={{fontSize: 29, marginTop: 18, color: COLORS.inkSoft, ...fadeUp(pop(f, fps, 140))}}>Low scores stand out, so your team knows who to call back.</div>
    </div>
    <div style={{position: "absolute", left: 96, right: 96, top: 330, background: "white", border: "1px solid #FFFFFF", borderRadius: 30, overflow: "hidden", boxShadow: SHADOW, ...fadeUp(pop(f, fps, 20), 30)}}>
      <div style={{height: 94, display: "flex", alignItems: "center", gap: 20, padding: "0 30px", boxSizing: "border-box", background: "linear-gradient(105deg, #FFFFFF, #F2F7F2)", borderBottom: "1px solid #E1E7E0"}}>
        <div style={{height: 56, width: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "#E3F1E8"}}><SheetIcon size={34} /></div><div><div style={{fontSize: 28, fontWeight: 600, color: COLORS.plum}}>Feedback</div><div style={{fontSize: 18, color: COLORS.inkSoft, marginTop: 4}}>{props.brand}</div></div>
        <div style={{marginLeft: "auto", padding: "10px 18px", borderRadius: 14, background: "#E8F4EC", display: "flex", gap: 9, alignItems: "center", color: COLORS.green, fontSize: 20, fontWeight: 500}}><CheckIcon size={24} color={COLORS.green} />Connected to your sheet</div>
      </div>
      <div style={{display: "flex", background: "#F7F8F6", height: 58}}>{COLUMNS.map((c, i) => <div key={c.label} style={{width: c.width, padding: "0 24px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: i === 2 ? "center" : "flex-start", fontSize: 20, fontWeight: 600, color: COLORS.inkSoft, borderRight: "1px solid #E7E8E3"}}>{c.label}</div>)}</div>
      {rows.map((r, index) => {
        const at = 40 + index * 26; const p = pop(f, fps, at); const col = scoreColor(r.score);
        const cells = [
          <div><div style={{fontWeight: 600}}>{r.customer}</div><span style={{display: "inline-block", fontSize: 15, fontWeight: 500, marginTop: 8, color: r.sample ? COLORS.inkSoft : COLORS.green, background: r.sample ? "#ECEAF0" : "#E6F4EB", padding: "4px 9px", borderRadius: 7}}>{r.sample ? "SAMPLE" : "RECORDED CALL"}</span></div>,
          r.product,
          <div style={{width: 60, height: 60, borderRadius: 19, color: col, background: `${col}17`, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 31, border: `1px solid ${col}33`, boxShadow: `0 4px 12px ${col}12`, transform: `scale(${pop(f, fps, at + 8)})`}}>{Math.round(interpolate(f, [at + 8, at + 22], [0, r.score], clamp))}</div>,
          <span style={{fontStyle: "italic", color: COLORS.inkSoft}}>“{r.said}”</span>,
          <div style={{display: "flex", alignItems: "center", gap: 14}}><div style={{width: 5, height: 42, borderRadius: 3, background: col, flexShrink: 0}} /><span>{r.summary}</span></div>,
        ];
        return <div key={r.customer} style={{display: "flex", minHeight: 116, borderBottom: "1px solid #EAE6DF", background: r.score <= 6 ? `rgba(210,84,75,${0.055 + pulse * 0.06})` : "#FFFFFF", opacity: Math.min(1, p), transform: `translateX(${(1 - p) * 40}px)`}}>{cells.map((cell, i) => <div key={i} style={{width: COLUMNS[i].width, padding: "18px 24px", boxSizing: "border-box", fontSize: 27, lineHeight: 1.35, color: COLORS.plum, borderRight: "1px solid #EEEAE4", display: "flex", alignItems: "center", justifyContent: i === 2 ? "center" : "flex-start"}}>{cell}</div>)}</div>;
      })}
      <div style={{height: 52, padding: "0 30px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 18, color: COLORS.inkSoft, background: "#FCFBF8"}}><span>First row: real recorded feedback. Other rows: examples.</span><span style={{color: COLORS.sheetGreen}}>Your customer data. Your sheet.</span></div>
    </div>
  </SceneShell>;
};
