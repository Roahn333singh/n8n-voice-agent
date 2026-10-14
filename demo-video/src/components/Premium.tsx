import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {COLORS} from "../config";
import {SANS, SERIF} from "../theme";
import {fadeUp, pop} from "./anim";

export const Ambient: React.FC<{dark?: boolean; accent?: string}> = ({dark = false, accent = COLORS.gold}) => {
  // Stable light positions keep the composition from appearing to drift.
  const x = 72;
  const y = 22;
  return <AbsoluteFill style={{overflow: "hidden", background: dark ? "#21172A" : COLORS.paper}}>
    <AbsoluteFill style={{background: dark
      ? `radial-gradient(ellipse at ${x}% ${y}%, ${accent}24 0%, transparent 48%), radial-gradient(ellipse at 10% 95%, #85529C30, transparent 58%), linear-gradient(135deg, #21172A, #33223B 55%, #18121F)`
      : `radial-gradient(ellipse at ${x}% ${y}%, ${accent}16 0%, transparent 50%), radial-gradient(ellipse at 12% 85%, #DDD0E94A, transparent 60%), linear-gradient(135deg, #FDFBF7, #F8F4EE)`}} />
    <AbsoluteFill style={{opacity: dark ? 0.065 : 0.13, backgroundImage: `linear-gradient(${dark ? "#FFFFFF" : "#B8A68A"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "#FFFFFF" : "#B8A68A"} 1px, transparent 1px)`, backgroundSize: "96px 96px", maskImage: "radial-gradient(ellipse at 85% 50%, black, transparent 76%)"}} />
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: "absolute", opacity: dark ? 0.18 : 0.13}}>
      <g fill="none" stroke={accent} strokeWidth="1">
        <circle cx="1510" cy="440" r="610" /><circle cx="1510" cy="440" r="670" />
        <path d="M0 982C490 890 1160 1100 1920 838" />
      </g>
    </svg>
  </AbsoluteFill>;
};

export const SceneLabel: React.FC<{brand: string; text: string; number: string; dark?: boolean; accent: string}> = ({brand, text, number, dark = false, accent}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return <div style={{position: "absolute", top: 52, left: 96, right: 96, display: "flex", alignItems: "center", justifyContent: "space-between", color: dark ? "#F7F0E5" : COLORS.plum, ...fadeUp(pop(f, fps, 5), 12)}}>
    <div style={{display: "flex", alignItems: "center", gap: 16}}>
      <div style={{width: 40, height: 40, border: `1px solid ${accent}`, transform: "rotate(45deg)", borderRadius: 10, display: "grid", placeItems: "center"}}><span style={{transform: "rotate(-45deg)", fontFamily: SERIF, fontSize: 25, color: accent}}>{brand.slice(0, 1)}</span></div>
      <span style={{fontSize: 23, fontWeight: 600, letterSpacing: 1.3}}>{brand}</span>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: 20, fontSize: 20, letterSpacing: 3, textTransform: "uppercase", opacity: 0.72}}><span>{text}</span><span style={{height: 1, width: 64, background: accent}} /><span style={{color: accent, fontVariantNumeric: "tabular-nums"}}>{number}</span></div>
  </div>;
};

// All artwork is vector geometry; it remains sharp at both 1080p and 4K.
export const PerfumeBottle: React.FC<{brand: string; product: string; accent: string; size?: number; id: string}> = ({brand, product, accent, size = 400, id}) => <svg width={size} height={size * 1.25} viewBox="0 0 400 500" fill="none">
  <defs>
    <linearGradient id={`${id}-glass`} x1="85" y1="140" x2="327" y2="415" gradientUnits="userSpaceOnUse"><stop stopColor="#F3D490" stopOpacity="0.83" /><stop offset="0.24" stopColor="#D2A558" stopOpacity="0.43" /><stop offset="0.61" stopColor="#936127" stopOpacity="0.88" /><stop offset="1" stopColor="#E7C888" /></linearGradient>
    <linearGradient id={`${id}-metal`} x1="122" y1="40" x2="280" y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#68471D" /><stop offset="0.28" stopColor="#F4DEAA" /><stop offset="0.55" stopColor={accent} /><stop offset="0.8" stopColor="#F2D693" /><stop offset="1" stopColor="#755221" /></linearGradient>
    <linearGradient id={`${id}-cap`} x1="130" y1="32" x2="270" y2="95" gradientUnits="userSpaceOnUse"><stop stopColor="#4B344E" /><stop offset="0.42" stopColor="#211626" /><stop offset="1" stopColor="#664168" /></linearGradient>
    <linearGradient id={`${id}-shine`} x1="104" y1="177" x2="295" y2="360" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity="0.7" /><stop offset="0.3" stopColor="white" stopOpacity="0.06" /><stop offset="1" stopColor="white" stopOpacity="0.22" /></linearGradient>
  </defs>
  <ellipse cx="200" cy="467" rx="129" ry="17" fill="#1B1022" opacity="0.13" />
  <rect x="126" y="35" width="148" height="89" rx="11" fill={`url(#${id}-cap)`} stroke="#A792AA" strokeWidth="1" />
  <path d="M142 45h114M144 55h112" stroke="white" strokeOpacity="0.12" /><rect x="124" y="110" width="152" height="16" rx="3" fill={`url(#${id}-metal)`} />
  <rect x="157" y="126" width="86" height="39" rx="5" fill={`url(#${id}-metal)`} />
  <path d="M157 151L113 168C94 176 85 194 85 218V420C85 441 99 454 119 454H281C301 454 315 441 315 420V218C315 194 306 176 287 168L243 151Z" fill={`url(#${id}-glass)`} stroke="#F8E1AA" strokeWidth="3" />
  <path d="M112 214C112 198 120 188 141 181L165 172M112 229V410" stroke="white" strokeOpacity="0.6" strokeWidth="7" strokeLinecap="round" /><path d="M299 230V417" stroke="#6A441C" strokeOpacity="0.45" strokeWidth="7" />
  <rect x="94" y="215" width="213" height="230" rx="20" fill={`url(#${id}-shine)`} />
  <rect x="111" y="251" width="178" height="138" rx="3" fill="#FBF6E9" stroke={accent} strokeWidth="2" />
  <path d="M122 263h156M122 377h156" stroke={accent} strokeOpacity="0.5" />
  <text x="200" y="286" textAnchor="middle" fontFamily={SANS} fontSize={Math.min(11, 145 / Math.max(1, brand.length) * 1.5)} letterSpacing="1.3" fill="#6D512C">{brand.toUpperCase()}</text>
  <text x="200" y="328" textAnchor="middle" fontFamily={SERIF} fontSize={Math.min(25, 160 / Math.max(1, product.length) * 1.65)} fontWeight="600" fill="#34233C">{product}</text>
  <text x="200" y="355" textAnchor="middle" fontFamily={SANS} fontSize="10" letterSpacing="2.2" fill="#8B7048">EAU DE PARFUM</text>
  <path d="M112 430h176" stroke="#FFF4D5" strokeWidth="3" strokeOpacity="0.65" />
</svg>;

export const DeliveryBox: React.FC<{accent: string}> = ({accent}) => <svg width={400} height={340} viewBox="0 0 400 340">
  <defs><linearGradient id="delivery-front" x1="80" y1="140" x2="275" y2="305"><stop stopColor="#C8A47F" /><stop offset="1" stopColor="#987151" /></linearGradient><linearGradient id="delivery-top"><stop stopColor="#E6CCAC" /><stop offset="1" stopColor="#C9AC88" /></linearGradient></defs>
  <ellipse cx="202" cy="310" rx="170" ry="22" fill="#3B2346" opacity="0.15" />
  <path d="M36 111L157 42L354 111L232 185Z" fill="url(#delivery-top)" stroke="#AB865F" strokeWidth="2" />
  <path d="M36 111L232 185V306L36 229Z" fill="url(#delivery-front)" stroke="#97704F" strokeWidth="2" />
  <path d="M232 185L354 111V232L232 306Z" fill="#AC8662" stroke="#8E6645" strokeWidth="2" />
  <path d="M108 70L301 143L301 202L277 216V157L84 84Z" fill={accent} opacity="0.88" />
  <path d="M69 150L179 190V251L69 211Z" fill="#F9F3E8" />
  <g stroke="#816C55" strokeWidth="3"><path d="M82 170l72 26M82 182l55 20M82 194l37 14" /></g>
  <path d="M269 223v34m-7-27l7-7 7 1M319 193v34m-7-27l7-7 7 1" fill="none" stroke="#6F5037" strokeWidth="3" />
</svg>;
