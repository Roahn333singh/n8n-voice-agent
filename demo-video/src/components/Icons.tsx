import {COLORS} from "../config";

type IconProps = {size?: number; color?: string; accent?: string};

export const ParcelIcon: React.FC<IconProps & {accent?: string}> = ({size = 200, accent = COLORS.gold}) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 200 170">
    <rect x="8" y="34" width="184" height="130" rx="10" fill="#D6A469" />
    <rect x="0" y="18" width="200" height="34" rx="8" fill="#E6BA80" />
    <rect x="86" y="18" width="28" height="146" fill="#F2D9B0" />
    <rect x="24" y="86" width="50" height="34" rx="5" fill="#FFFFFF" opacity="0.92" />
    <rect x="31" y="95" width="34" height="5" rx="2.5" fill={accent} />
    <rect x="31" y="106" width="24" height="5" rx="2.5" fill="#C9B79F" />
  </svg>
);

const SheetFrame: React.FC = () => (
  <>
    <rect x="14" y="8" width="92" height="104" rx="12" fill="#FFFFFF" stroke={COLORS.sheetGreen} strokeWidth="5" />
    <rect x="14" y="8" width="92" height="26" rx="12" fill={COLORS.sheetGreen} />
    <rect x="14" y="22" width="92" height="12" fill={COLORS.sheetGreen} />
  </>
);

export const SheetIcon: React.FC<IconProps & {rows?: number[]}> = ({size = 140, rows = [1, 1, 1]}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <SheetFrame />
    <line x1="48" x2="48" y1="40" y2="102" stroke="#BFE3CB" strokeWidth="4" />
    {[52, 70, 88].map((y, i) => (
      <line key={y} x1="24" x2={24 + 72 * Math.max(0, Math.min(1, rows[i]))} y1={y} y2={y} stroke="#9ED4B0" strokeWidth="4" strokeLinecap="round" />
    ))}
  </svg>
);

export const PhoneIcon: React.FC<IconProps & {waves?: number}> = ({size = 140, color = COLORS.plum, accent = COLORS.gold, waves = 1}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect x="30" y="8" width="52" height="104" rx="12" fill={color} />
    <rect x="36" y="20" width="40" height="76" rx="5" fill="#FFFFFF" opacity="0.95" />
    <circle cx="56" cy="104" r="4" fill="#FFFFFF" opacity="0.7" />
    <path d="M92 40 Q102 56 92 72" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.35 + 0.65 * waves} />
    <path d="M102 30 Q118 56 102 82" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.15 + 0.45 * waves} />
  </svg>
);

export const ChartSheetIcon: React.FC<IconProps & {grow?: number[]}> = ({size = 140, accent = COLORS.gold, grow = [1, 1, 1]}) => {
  const bars = [
    {x: 28, h: 28, fill: accent},
    {x: 53, h: 44, fill: COLORS.plum},
    {x: 78, h: 56, fill: COLORS.sheetGreen},
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <SheetFrame />
      {bars.map((b, i) => {
        const h = Math.max(0, b.h * grow[i]);
        return <rect key={b.x} x={b.x} y={100 - h} width="14" height={h} rx="3" fill={b.fill} />;
      })}
    </svg>
  );
};

export const StarIcon: React.FC<IconProps> = ({size = 48, color = COLORS.gold}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"
      fill={color}
      strokeLinejoin="round"
    />
  </svg>
);

export const ReturnIcon: React.FC<IconProps> = ({size = 48, color = COLORS.plum}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7L4 12l5 5" />
    <path d="M4 12h11a5 5 0 0 1 0 10h-2" />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({size = 48, color = COLORS.red}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2.8L22.5 21H1.5z" fill={color} strokeLinejoin="round" />
    <rect x="11" y="9" width="2.2" height="6.5" rx="1.1" fill="#FFFFFF" />
    <circle cx="12.1" cy="18" r="1.3" fill="#FFFFFF" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({size = 48, color = COLORS.plum}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill={color} />
    <circle cx="8" cy="11" r="1.4" fill="#FFFFFF" />
    <circle cx="12" cy="11" r="1.4" fill="#FFFFFF" />
    <circle cx="16" cy="11" r="1.4" fill="#FFFFFF" />
  </svg>
);

export const ClockIcon: React.FC<IconProps & {angle?: number}> = ({size = 64, color = COLORS.plum, angle = 0}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
    <circle cx="24" cy="24" r="19" />
    <path d="M24 24l8 5" />
    <path d="M24 24v-11" transform={`rotate(${angle} 24 24)`} />
  </svg>
);

export const DollarIcon: React.FC<IconProps> = ({size = 64, color = COLORS.plum}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="19" />
    <path d="M31 16c-1.7-2-4-3-7-3-4 0-7 2.2-7 5.5S20 23 24 24s7 2.5 7 5.5S28 35 24 35c-3 0-5.7-1-8-3" />
    <path d="M24 10v28" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({size = 32, color = COLORS.green}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#FFFFFF" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HeadsetIcon: React.FC<IconProps> = ({size = 64, color = "#FFFFFF"}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="3.6" strokeLinecap="round">
    <path d="M9 28v-4a15 15 0 0 1 30 0v4" />
    <rect x="6" y="26" width="8" height="12" rx="3" fill={color} />
    <rect x="34" y="26" width="8" height="12" rx="3" fill={color} />
    <path d="M38 38c0 4-5 6-11 6" />
  </svg>
);

export const PersonIcon: React.FC<IconProps> = ({size = 64, color = "#FFFFFF"}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
    <circle cx="24" cy="17" r="9" />
    <path d="M7 42c1-9 8-14 17-14s16 5 17 14z" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({size = 36, color = COLORS.plum}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const FaceAvatar: React.FC<{size?: number; mood: "sad" | "happy"; skin?: string; ring?: string}> = ({size = 260, mood, skin = "#E7B98F", ring = COLORS.plum}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <radialGradient id="avatar-bg" cx="35%" cy="20%"><stop stopColor="#FBF5FC" /><stop offset="1" stopColor="#D4BDDE" /></radialGradient>
      <linearGradient id="avatar-skin" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F9D9B9" /><stop offset="0.65" stopColor={skin} /><stop offset="1" stopColor="#BD8866" /></linearGradient>
      <linearGradient id="avatar-coat" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#73517F" /><stop offset="1" stopColor={ring} /></linearGradient>
      <linearGradient id="avatar-hair"><stop stopColor="#5C465B" /><stop offset="1" stopColor="#251B2B" /></linearGradient>
      <clipPath id="avatar-clip"><circle cx="100" cy="100" r="94" /></clipPath>
    </defs>
    <circle cx="100" cy="100" r="96" fill="url(#avatar-bg)" stroke="#FFFFFF" strokeWidth="3" />
    <g clipPath="url(#avatar-clip)">
      <ellipse cx="106" cy="180" rx="69" ry="53" fill="#3B2346" opacity="0.12" />
      <path d="M27 210c4-44 33-66 73-66s69 22 73 66z" fill="url(#avatar-coat)" />
      <path d="M74 145l26 21 27-21-14 44H88z" fill="#F1E8EF" /><path d="M74 145l-7 44 21-6M127 145l7 44-21-6" fill="none" stroke="#B697BE" strokeWidth="1.5" />
      <rect x="85" y="119" width="30" height="37" rx="10" fill="url(#avatar-skin)" /><path d="M85 125c8 8 22 8 30 0v11c-10 7-21 7-30 0z" fill="#9C6A53" opacity="0.22" />
      <ellipse cx="60" cy="93" rx="8" ry="12" fill={skin} /><ellipse cx="140" cy="93" rx="8" ry="12" fill="#CF9A73" />
      <ellipse cx="100" cy="87" rx="42" ry="48" fill="url(#avatar-skin)" />
      <path d="M56 82c-5-33 18-51 44-51s49 15 44 51c-8-13-20-24-43-22-21 2-38 8-45 22z" fill="url(#avatar-hair)" /><path d="M65 55c10-13 29-19 48-13" fill="none" stroke="#A283A3" strokeWidth="3" strokeOpacity="0.28" strokeLinecap="round" />
      <ellipse cx="83" cy="90" rx="4.2" ry="5" fill="#312237" /><ellipse cx="117" cy="90" rx="4.2" ry="5" fill="#312237" /><circle cx="82" cy="88.5" r="1.2" fill="white" /><circle cx="116" cy="88.5" r="1.2" fill="white" />
      <path d="M100 91l-3 14h7" fill="none" stroke="#B47D5D" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="74" cy="106" rx="10" ry="5" fill="#DD997D" opacity="0.4" /><ellipse cx="126" cy="106" rx="10" ry="5" fill="#DD997D" opacity="0.35" />
      {mood === "sad" ? <><path d="M76 78l14 3M124 78l-14 3" stroke="#3D2A3F" strokeWidth="3" strokeLinecap="round" /><path d="M85 118q15-10 30 0" stroke="#744B43" strokeWidth="3" fill="none" strokeLinecap="round" /></> : <path d="M84 111q16 15 32 0" stroke="#744B43" strokeWidth="3" fill="none" strokeLinecap="round" />}
    </g>
  </svg>
);
