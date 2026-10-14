import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {BrandProps, TIMELINE} from "../config";
import {SceneShell} from "../components/SceneShell";
import {PerfumeBottle} from "../components/Premium";
import {FloorGlow, QrTile, Slab} from "../components/Depth";
import {accentText, glass, TopBar} from "../components/Brand";
import {ArrowRightIcon, CheckIcon} from "../components/Icons";
import {clamp, fadeUp, pop} from "../components/anim";
import {headlineFont} from "../fonts";
import {backdrop, paletteOf} from "../palette";

const ivory = "#FFF8EC";

const BENEFITS = [
  {title: "Catch unhappy customers", sub: "before they post a review"},
  {title: "No new software", sub: "answers land in your Google Sheet"},
  {title: "Your brand, your questions", sub: "for any product you sell"},
];

export const Offer: React.FC<BrandProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = paletteOf(props.palette);
  const H = headlineFont(props.headlineFont);
  const hasBookingUrl = /^https:\/\//i.test(props.bookingUrl.trim());

  const settle = interpolate(frame, [0, fps * 2.8], [0, 1], clamp);
  const ease = 1 - Math.pow(1 - settle, 3);
  const passIn = pop(frame, fps, 12);
  const rotY = -30 + 15 * ease;
  const rotX = 10 - 5 * ease;
  const sheen = interpolate(frame, [fps * 2.6, fps * 4.2], [-40, 140], clamp);

  return (
    <SceneShell seconds={TIMELINE.offer.duration} background={T.base} color={ivory} accent={T.accent} exit={false} backdrop={<div style={{position: "absolute", inset: 0, background: backdrop(T, 76, 50)}} />}>
      <TopBar T={T} name={props.serviceName} right="Book your free demo" />

      <div style={{position: "absolute", left: 120, top: 186, width: 1000}}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 18px", borderRadius: 40, ...glass, fontSize: 18, fontWeight: 700, letterSpacing: 3.4, color: T.accent, ...fadeUp(pop(frame, fps, 4))}}>
          <span style={{width: 8, height: 8, borderRadius: 4, background: T.accent, boxShadow: `0 0 12px ${T.accent}`}} />
          FREE · 30 MINUTES · GOOGLE MEET
        </div>
        <div style={{fontFamily: H.fontFamily, fontWeight: H.weight, fontSize: H.closing.size, lineHeight: 1.0, letterSpacing: H.closing.tracking, marginTop: 28, ...fadeUp(pop(frame, fps, 10))}}>
          Hear from
          <br />
          <span style={{...accentText(T.gold), fontStyle: H.italic ? "italic" : "normal"}}>every customer.</span>
        </div>
        <div style={{marginTop: 26, width: 880, fontSize: 29, lineHeight: 1.42, color: T.textSoft, ...fadeUp(pop(frame, fps, 24))}}>
          In a free live demo, we show you a real call, the answers it captures and the sheet it fills, set up for your brand.
        </div>

        <div style={{display: "flex", gap: 16, marginTop: 36}}>
          {BENEFITS.map((b, i) => (
            <div key={b.title} style={{width: 300, padding: "20px 22px", borderRadius: 20, ...glass, ...fadeUp(pop(frame, fps, 38 + i * 8))}}>
              <div style={{width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: T.accent}}>
                <CheckIcon size={20} color={T.ctaText} />
              </div>
              <div style={{fontSize: 24, fontWeight: 700, marginTop: 14, lineHeight: 1.2}}>{b.title}</div>
              <div style={{fontSize: 19, color: T.textMuted, marginTop: 6, lineHeight: 1.3}}>{b.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display: "flex", alignItems: "center", gap: 34, marginTop: 42, ...fadeUp(pop(frame, fps, 66))}}>
          <div style={{width: 660, height: 96, borderRadius: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", boxSizing: "border-box", background: `linear-gradient(120deg, ${T.cta[0]}, ${T.cta[1]} 62%, ${T.cta[2]})`, boxShadow: `inset 0 2px 1px rgba(255,255,255,0.7), 0 4px 0 ${T.ctaEdge[0]}, 0 9px 0 ${T.ctaEdge[1]}, 0 24px 40px rgba(0,0,0,0.45)`, color: T.ctaText}}>
            <span style={{fontSize: 30, fontWeight: 800}}>{props.contactLine}</span>
            <ArrowRightIcon size={36} color={T.ctaText} />
          </div>
          <div>
            <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 2.6, color: T.textMuted}}>YOUR HOST</div>
            <div style={{fontSize: 28, fontWeight: 700, marginTop: 4}}>{props.contactName}</div>
            <div style={{fontSize: 19, color: T.textMuted, marginTop: 2}}>{props.company || props.serviceName}</div>
          </div>
        </div>
      </div>

      <FloorGlow x={1500} y={960} w={760} h={140} color="rgba(0,0,0,0.6)" opacity={passIn} />
      <FloorGlow x={1500} y={540} w={900} h={860} color={T.glow} opacity={passIn} />

      <div style={{position: "absolute", left: 1180, top: 120, width: 640, height: 860, perspective: 2400, perspectiveOrigin: "30% 50%"}}>
        <div style={{position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${(1 - passIn) * -260}px)`, opacity: passIn}}>
          <Slab width={560} height={800} depth={34} radius={38} edge={T.paperEdge[0]} edgeDark={T.paperEdge[1]} style={{left: 40, top: 20}} faceStyle={{background: `linear-gradient(160deg, ${T.paper[0]} 0%, ${T.paper[1]} 60%, ${T.paper[2]} 100%)`, color: T.paperInk}}>
            <div style={{position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sheen - 18}%, rgba(255,255,255,0.6) ${sheen}%, transparent ${sheen + 18}%)`, pointerEvents: "none"}} />
            <div style={{padding: "34px 40px 0"}}>
              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 3, color: T.paperLabel}}>LIVE DEMO PASS</div>
                <div style={{padding: "8px 16px", borderRadius: 30, background: T.badge[0], color: T.badge[1], fontSize: 17, fontWeight: 800, letterSpacing: 1.5}}>FREE</div>
              </div>
              <div style={{fontFamily: H.fontFamily, fontSize: H.pass.size, lineHeight: 1.06, fontWeight: H.pass.weight, letterSpacing: H.pass.tracking, marginTop: 22}}>
                See it work
                <br />
                for your brand.
              </div>
              <div style={{display: "flex", gap: 10, marginTop: 20}}>
                {["30 minutes", "Google Meet", "No payment"].map((t) => (
                  <div key={t} style={{display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 12, background: T.paperChip, fontSize: 16, fontWeight: 700, color: T.paperInk}}>
                    <CheckIcon size={16} color={T.paperInk} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div style={{margin: "26px 0 0", borderTop: `2px dashed ${T.paperChip}`}} />
            {hasBookingUrl ? (
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 26}}>
                <QrTile url={props.bookingUrl.trim()} size={304} pad={18} radius={22} />
                <div style={{fontSize: 24, fontWeight: 800, letterSpacing: 2, marginTop: 20}}>SCAN TO BOOK</div>
                <div style={{fontSize: 18, color: T.paperMuted, marginTop: 6}}>Scan · pick a time · meet live</div>
              </div>
            ) : (
              <div style={{display: "grid", placeItems: "center", height: 420}}>
                <PerfumeBottle brand={props.brand} product={props.product} accent={props.accent} size={280} id="offer" />
              </div>
            )}
          </Slab>
        </div>
      </div>

      <div style={{position: "absolute", left: 120, bottom: 64, display: "flex", alignItems: "center", gap: 12, fontSize: 21, color: T.textFooter, ...fadeUp(pop(frame, fps, 90))}}>
        <CheckIcon size={22} color={T.accent} />
        Only customers who agreed to be contacted are called. Your data stays in your Google Sheet.
      </div>
    </SceneShell>
  );
};
