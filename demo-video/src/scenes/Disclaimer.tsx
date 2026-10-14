import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {BrandProps, TIMELINE} from "../config";
import {CALL_FEEDBACK} from "../callFeedback";
import {SceneShell} from "../components/SceneShell";
import {FloorGlow, QrTile, Slab} from "../components/Depth";
import {accentText, glass, TopBar} from "../components/Brand";
import {CheckIcon, HeadsetIcon} from "../components/Icons";
import {clamp, fadeUp, pop} from "../components/anim";
import {SERIF} from "../theme";
import {headlineFont} from "../fonts";
import {backdrop, paletteOf} from "../palette";

const ivory = "#FFF8EC";

const CardHead: React.FC<{n: string; label: string; color: string}> = ({n, label, color}) => (
  <div style={{display: "flex", alignItems: "center", gap: 12, fontSize: 17, fontWeight: 800, letterSpacing: 2.6, color}}>
    <span style={{display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 15, border: `1.5px solid ${color}`, fontSize: 14, letterSpacing: 0}}>{n}</span>
    {label}
  </div>
);

export const Disclaimer: React.FC<BrandProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = paletteOf(props.palette);
  const H = headlineFont(props.headlineFont);
  const hasBookingUrl = /^https:\/\//i.test(props.bookingUrl.trim());

  const settle = interpolate(frame, [0, fps * 2.6], [0, 1], clamp);
  const ease = 1 - Math.pow(1 - settle, 3);
  const rotY = -32 + 10 * ease;
  const rotX = 13 - 4 * ease;

  const card = (delay: number, z: number): React.CSSProperties => {
    const p = pop(frame, fps, delay);
    return {opacity: p, transform: `translate3d(0, ${(1 - p) * 36}px, ${z - (1 - p) * 240}px)`};
  };

  const bars = Array.from({length: 34}, (_, i) => {
    const a = Math.abs(Math.sin(i * 0.71 + frame * 0.23));
    const b = 0.55 + 0.45 * Math.sin(i * 0.37 + frame * 0.09);
    return 8 + 46 * a * b;
  });

  const facts = [
    {dot: T.accent, text: "Real recorded call"},
    {dot: T.accent2, text: `Demo brand: ${props.brand}`},
    {dot: T.accent, text: "Works for any product"},
  ];

  return (
    <SceneShell seconds={TIMELINE.disclaimer.duration} background={T.base} color={ivory} accent={T.accent} backdrop={<div style={{position: "absolute", inset: 0, background: backdrop(T, 74, 52)}} />}>
      <TopBar T={T} name={props.serviceName} right="AI feedback calls for D2C brands" />

      <div style={{position: "absolute", left: 120, top: 190, width: 900}}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 18px", borderRadius: 40, ...glass, fontSize: 18, fontWeight: 700, letterSpacing: 3.4, color: T.accent, ...fadeUp(pop(frame, fps, 4))}}>
          <span style={{width: 8, height: 8, borderRadius: 4, background: T.accent, boxShadow: `0 0 12px ${T.accent}`}} />
          FOR D2C &amp; E-COMMERCE BRANDS
        </div>
        <div style={{fontFamily: H.fontFamily, fontWeight: H.weight, fontSize: H.opening.size, lineHeight: 1.06, letterSpacing: H.opening.tracking, marginTop: 28, whiteSpace: "nowrap", ...fadeUp(pop(frame, fps, 10))}}>
          Every customer, called.
          <br />
          <span style={{...accentText(T.gold), fontStyle: H.italic ? "italic" : "normal"}}>Every answer, captured.</span>
        </div>
        <div style={{marginTop: 28, width: 840, fontSize: 30, lineHeight: 1.42, color: T.textSoft, ...fadeUp(pop(frame, fps, 24))}}>
          An AI voice agent calls your customers after delivery and saves their rating, their words and a summary to your Google Sheet.
        </div>
        <div style={{display: "flex", gap: 12, marginTop: 32}}>
          {facts.map((f, i) => (
            <div key={f.text} style={{display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 14, whiteSpace: "nowrap", ...glass, fontSize: 19, fontWeight: 600, color: T.chip, ...fadeUp(pop(frame, fps, 36 + i * 6))}}>
              <span style={{width: 10, height: 10, borderRadius: 3, transform: "rotate(45deg)", background: f.dot}} />
              {f.text}
            </div>
          ))}
        </div>

        {hasBookingUrl && (
          <div style={{display: "flex", alignItems: "center", gap: 24, marginTop: 48, ...fadeUp(pop(frame, fps, 56))}}>
            <div style={{padding: 8, borderRadius: 22, ...glass}}>
              <QrTile url={props.bookingUrl.trim()} size={128} pad={10} radius={14} level="L" />
            </div>
            <div>
              <div style={{fontSize: 17, fontWeight: 800, letterSpacing: 3, color: T.accent}}>FREE 30-MINUTE LIVE DEMO</div>
              <div style={{fontSize: 27, fontWeight: 600, marginTop: 8}}>Scan to book anytime</div>
              <div style={{fontSize: 20, color: T.textMuted, marginTop: 6}}>The same code is at the end of the video</div>
            </div>
          </div>
        )}
      </div>

      <FloorGlow x={1440} y={900} w={900} h={170} color="rgba(0,0,0,0.55)" opacity={pop(frame, fps, 14)} />
      <FloorGlow x={1440} y={560} w={820} h={620} color={T.glow} opacity={pop(frame, fps, 14)} />

      <div style={{position: "absolute", left: 1010, top: 150, width: 860, height: 780, perspective: 2300, perspectiveOrigin: "35% 45%"}}>
        <div style={{position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`}}>
          <Slab width={580} height={330} depth={28} radius={26} edge="#DAD5CC" edgeDark="#7E786E" style={{left: 250, top: 10, ...card(14, -190)}} faceStyle={{background: "linear-gradient(160deg, #FFFFFF, #F2EFEA)", color: "#1C1B1A"}}>
            <div style={{height: 64, background: "#1E8E3E", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", color: "#FFFFFF"}}>
              <div style={{display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700}}>
                <div style={{width: 22, height: 26, borderRadius: 4, background: "#FFFFFF", display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: 2, padding: 4}}>
                  {[0, 1, 2].map((r) => <div key={r} style={{background: "#1E8E3E", borderRadius: 1}} />)}
                </div>
                Feedback
              </div>
              <span style={{fontSize: 15, fontWeight: 800, letterSpacing: 2}}>03 · YOUR SHEET</span>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "180px 90px 1fr", padding: "14px 26px 8px", fontSize: 15, fontWeight: 700, color: "#7C776F", letterSpacing: 1}}>
              <span>CUSTOMER</span><span>SCORE</span><span>SUMMARY</span>
            </div>
            <div style={{margin: "0 14px", display: "grid", gridTemplateColumns: "180px 90px 1fr", alignItems: "center", padding: "14px 12px", borderRadius: 12, background: T.note[0], boxShadow: `inset 0 0 0 2px ${T.accent}`, fontSize: 19, fontWeight: 600}}>
              <span>{props.customerName}</span>
              <span style={{display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 20, background: "#2E9D6A", color: "#FFFFFF", fontWeight: 800}}>{CALL_FEEDBACK.score}</span>
              <span style={{fontSize: 17, color: "#4A4741"}}>{CALL_FEEDBACK.summary}</span>
            </div>
            {[0, 1].map((r) => (
              <div key={r} style={{margin: "10px 26px 0", display: "grid", gridTemplateColumns: "180px 90px 1fr", alignItems: "center", opacity: 0.55}}>
                <div style={{height: 12, width: 120, borderRadius: 6, background: "#DEDAD3"}} />
                <div style={{height: 28, width: 28, borderRadius: 14, background: "#E7E3DC"}} />
                <div style={{height: 12, width: 210, borderRadius: 6, background: "#DEDAD3"}} />
              </div>
            ))}
          </Slab>

          <Slab width={540} height={250} depth={28} radius={28} edge={T.callEdge} edgeDark={T.callEdgeDark} style={{left: 40, top: 280, ...card(22, 0)}} faceStyle={{background: `linear-gradient(150deg, ${T.callFace[0]}, ${T.callFace[1]})`, border: "1px solid rgba(255,255,255,0.16)", padding: "24px 28px", color: ivory}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <CardHead n="01" label="THE CALL" color={T.accent} />
              <div style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(210,84,75,0.18)", color: "#FF9B91", fontSize: 15, fontWeight: 800, letterSpacing: 2}}>
                <span style={{width: 8, height: 8, borderRadius: 4, background: "#FF6B5E"}} />
                LIVE
              </div>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: 20}}>
              <div style={{width: 64, height: 64, borderRadius: 32, display: "grid", placeItems: "center", background: `linear-gradient(145deg, ${T.cta[0]}, ${T.cta[2]})`, boxShadow: `0 0 0 6px ${T.glow}`}}>
                <HeadsetIcon size={34} color={T.ctaText} />
              </div>
              <div>
                <div style={{fontSize: 26, fontWeight: 700}}>{props.agentName} is calling</div>
                <div style={{fontSize: 18, color: T.callSub, marginTop: 4}}>For {props.brand} · after delivery</div>
              </div>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 5, height: 60, marginTop: 14}}>
              {bars.map((h, i) => (
                <div key={i} style={{width: 8, height: h, borderRadius: 4, background: i % 9 < 5 ? T.accent : T.accent2, opacity: 0.9}} />
              ))}
            </div>
          </Slab>

          <Slab width={470} height={225} depth={28} radius={26} edge={T.noteEdge[0]} edgeDark={T.noteEdge[1]} style={{left: 350, top: 500, ...card(32, 170)}} faceStyle={{background: `linear-gradient(150deg, ${T.note[0]}, ${T.note[1]})`, padding: "22px 26px", color: T.noteInk}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <CardHead n="02" label="THE ANSWERS" color={T.noteLabel} />
              <div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 700, color: "#2E9D6A"}}>
                <CheckIcon size={20} color="#2E9D6A" /> Saved
              </div>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 18}}>
              <div style={{position: "relative", width: 88, height: 88, flexShrink: 0}}>
                <svg width={88} height={88} viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="8" />
                  <circle cx="44" cy="44" r="38" fill="none" stroke="#2E9D6A" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 38 * CALL_FEEDBACK.score) / 10} 999`} transform="rotate(-90 44 44)" />
                </svg>
                <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 28, fontWeight: 800}}>{CALL_FEEDBACK.score}</div>
              </div>
              <div>
                <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 24, lineHeight: 1.25}}>&ldquo;{CALL_FEEDBACK.quote}&rdquo;</div>
                <div style={{fontSize: 16, color: T.noteMuted, marginTop: 8}}>Score out of 10 · would buy again</div>
              </div>
            </div>
          </Slab>
        </div>
      </div>
    </SceneShell>
  );
};
