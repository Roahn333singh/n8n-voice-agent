import {interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {useAudioData, visualizeAudio} from "@remotion/media-utils";
import {BrandProps, CALL_AUDIO, CALL_START_OFFSET, COLORS, TIMELINE} from "../config";
import {CALL_SECONDS, CAPTIONS, Caption} from "../captions";
import {CALL_FEEDBACK} from "../callFeedback";
import {SERIF} from "../theme";
import {SceneShell} from "../components/SceneShell";
import {SceneLabel} from "../components/Premium";
import {CheckIcon, HeadsetIcon, PersonIcon} from "../components/Icons";
import {bump, clamp, fadeUp, pop, popIn, SHADOW} from "../components/anim";

type Speaker = Caption["speaker"];

const BARS = 32;
const CAPTION_HOLD = 0.3;
const CAPTION_FADE = 0.18;
const RELEASE_FRAMES = 6;
const PLUM_ON_DARK = "#B98BD0";
const LAST = CAPTIONS.length - 1;
const CALL_DONE = CAPTIONS[LAST].end + CAPTION_HOLD;

const activeCaptionIndex = (t: number) => CAPTIONS.findIndex((c, i) =>
  t >= c.start && t < Math.min(c.end + CAPTION_HOLD, CAPTIONS[i + 1]?.start ?? Infinity),
);

const answerEnd = (question: RegExp, fallbackIndex: number) => {
  const q = CAPTIONS.findIndex((c) => c.speaker === "meera" && question.test(c.text));
  const a = q >= 0 ? CAPTIONS.findIndex((c, i) => i > q && c.speaker === "customer") : -1;
  return CAPTIONS[a >= 0 ? a : fallbackIndex].end;
};

const speakerLevel = (speaker: Speaker, t: number) =>
  Math.max(
    0,
    ...CAPTIONS.filter((c) => c.speaker === speaker).map((c) =>
      interpolate(t, [c.start - 0.1, c.start + 0.15, c.end + 0.1, c.end + 0.35], [0, 1, 1, 0], clamp),
    ),
  );

const personalise = (text: string, props: BrandProps) =>
  text.replace(/Aurelia Perfumes/g, props.brand).replace(/Oud Royale/g, props.product);

const formatTimer = (seconds: number) => {
  const s = Math.floor(Math.max(0, seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const Waveform: React.FC<{values: number[]; color: string}> = ({values, color}) => (
  <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 92}}>
    {values.map((v, i) => (
      <div key={i} style={{width: 5, height: 8 + v * 80, borderRadius: 3, background: color}} />
    ))}
  </div>
);

const PhoneMockup: React.FC<{props: BrandProps; callT: number; values: number[]; barColor: string}> = ({props, callT, values, barColor}) => {
  const ended = callT > CALL_SECONDS;
  const brandSize = Math.max(20, Math.min(26, Math.floor((26 * 18) / Math.max(18, props.brand.length))));
  return (
    <div
      style={{
        width: 360,
        height: 620,
        borderRadius: 56,
        background: "linear-gradient(120deg, #B8ACBD, #34303A 22%, #17131B 60%, #938498)",
        border: "2px solid #B1A6B8",
        padding: 12,
        boxSizing: "border-box",
        boxShadow: "0 32px 65px #00000055, inset 0 0 0 3px #211925",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 44,
          background: `radial-gradient(ellipse at 70% 15%, #765886 0%, transparent 60%), linear-gradient(160deg, #422C4E, #1B1023)`,
          boxShadow: "inset 0 0 0 1px #FFFFFF18",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "54px 24px 30px",
          boxSizing: "border-box",
        }}
      >
        <div style={{position: "absolute", top: 22, width: 90, height: 22, borderRadius: 18, background: "#151019", boxShadow: "inset 0 1px 0 #FFFFFF15"}} />
        <div style={{fontSize: 20, letterSpacing: 3, textTransform: "uppercase", opacity: ended ? 0.9 : 0.7, color: ended ? "#F3B8B2" : "#FFFFFF"}}>
          {ended ? "Call ended" : "On call"}
        </div>
        <div
          style={{
            marginTop: 30,
            width: 116,
            height: 116,
            borderRadius: 58,
            background: `linear-gradient(135deg, #F2D99E, ${props.accent})`,
            boxShadow: `0 0 0 10px ${props.accent}12, 0 15px 35px #00000025`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: ended ? 0.6 : 1,
          }}
        >
          <HeadsetIcon size={64} color="#FFFFFF" />
        </div>
        <div style={{marginTop: 22, fontSize: 38, fontWeight: 700}}>{props.agentName}</div>
        <div
          style={{
            marginTop: 4,
            height: 34,
            lineHeight: "34px",
            maxWidth: "100%",
            fontSize: brandSize,
            opacity: 0.75,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {props.brand}
        </div>
        <div style={{marginTop: 14, fontSize: 34, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: props.accent}}>
          {formatTimer(Math.min(callT, CALL_SECONDS))}
        </div>
        <div style={{flex: 1, display: "flex", alignItems: "center"}}>
          <Waveform values={values} color={barColor} />
        </div>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            background: COLORS.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: ended ? 0.45 : 1,
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24">
            <path d="M3 14.5c5-5 13-5 18 0l-2.2 2.2-3.3-1.4v-2.6a10 10 0 0 0-7 0v2.6l-3.3 1.4z" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const SpeakerAvatar: React.FC<{label: string; color: string; level: number; energy: number; icon: React.ReactNode}> = ({
  label,
  color,
  level,
  energy,
  icon,
}) => {
  const ring = level * (12 + 10 * energy);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 16}}>
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: 75,
          background: `linear-gradient(140deg, ${interpolateColors(level, [0, 1], ["#53415F", color])}, ${interpolateColors(level, [0, 1], ["#302439", color])})`,
          border: "1px solid #FFFFFF22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 0 ${ring}px ${color}2E, 0 0 0 ${ring * 2}px ${color}12`,
          transform: `scale(${0.94 + 0.12 * level})`,
        }}
      >
        {icon}
      </div>
      <div style={{fontSize: 36, fontWeight: 700, color: interpolateColors(level, [0, 1], ["#E9E0EF", color])}}>{label}</div>
    </div>
  );
};

const NoteRow: React.FC<{label: string; value: string; p: number; flash: number; accent: string}> = ({label, value, p, flash, accent}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 78,
      margin: "0 -16px",
      padding: "0 16px",
      borderRadius: 14,
      borderBottom: `2px solid ${COLORS.line}`,
      background: `${accent}${Math.round(flash * 0x38).toString(16).padStart(2, "0")}`,
      gap: 20,
    }}
  >
    <div style={{fontSize: 25, color: COLORS.inkSoft}}>{label}</div>
    <div style={{position: "relative", minWidth: 160, display: "flex", justifyContent: "flex-end"}}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          width: 140,
          height: 14,
          marginTop: -7,
          borderRadius: 7,
          background: COLORS.line,
          transformOrigin: "100% 50%",
          transform: `scaleX(${Math.max(0, 1 - p * 3)})`,
        }}
      />
      <div style={{fontSize: 31, fontWeight: 600, color: COLORS.plum, whiteSpace: "nowrap", ...fadeUp(interpolate(p, [0.25, 1], [0, 1], {extrapolateLeft: "clamp"}), 16)}}>
        {value}
      </div>
    </div>
  </div>
);

export const RealCall: React.FC<BrandProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audioData = useAudioData(staticFile(CALL_AUDIO));

  const callFrame = frame - CALL_START_OFFSET * fps;
  const callT = callFrame / fps;
  const toFrame = (callSeconds: number) => Math.round((CALL_START_OFFSET + callSeconds) * fps);

  const meeraLevel = speakerLevel("meera", callT);
  const customerLevel = speakerLevel("customer", callT);
  const talking = Math.max(meeraLevel, customerLevel);
  const customerShare = meeraLevel + customerLevel === 0 ? 0 : customerLevel / (meeraLevel + customerLevel);

  const spectrumAt = (f: number) =>
    audioData && f >= 0 && f < CALL_SECONDS * fps
      ? visualizeAudio({fps, frame: f, audioData, numberOfSamples: BARS})
      : new Array<number>(BARS).fill(0);
  const held = new Array<number>(BARS / 2).fill(0);
  for (let k = 0; k < RELEASE_FRAMES; k++) {
    const s = spectrumAt(callFrame - k);
    const decay = 1 - k / RELEASE_FRAMES;
    for (let i = 0; i < held.length; i++) held[i] = Math.max(held[i], s[i] * decay);
  }
  const gain = 1.25 * (1 + 0.8 * customerShare);
  const half = held.map((v, i) => {
    const idle = talking * (0.07 + 0.05 * Math.sin(frame * 0.45 + i * 0.9));
    return Math.min(1, Math.pow(v, 0.6) * gain + idle);
  });
  const bars = [...half].reverse().concat(half);
  const energy = half.reduce((a, b) => a + b, 0) / half.length;

  const barColor = talking === 0 ? "#BDB6C6" : interpolateColors(customerShare, [0, 1], [props.accent, PLUM_ON_DARK]);

  const idx = activeCaptionIndex(callT);
  const caption = idx >= 0 ? CAPTIONS[idx] : undefined;
  const captionIn = caption ? interpolate(callT, [caption.start, caption.start + CAPTION_FADE], [0, 1], clamp) : 0;
  const captionOut = caption
    ? interpolate(callT, [caption.end + CAPTION_HOLD - CAPTION_FADE, caption.end + CAPTION_HOLD], [0, 1], clamp)
    : 0;
  const tagColor = caption?.speaker === "customer" ? COLORS.plum : props.accent;

  const notes = [
    {label: "Overall experience", value: CALL_FEEDBACK.experience, at: answerEnd(/overall experience/i, 8)},
    {label: "Others notice the scent", value: CALL_FEEDBACK.noticed, at: answerEnd(/notice/i, 13)},
    {label: "Would buy again", value: CALL_FEEDBACK.buyAgain, at: answerEnd(/buy .* again/i, 19)},
    {label: "Recommend score", value: `${CALL_FEEDBACK.score} / 10`, at: answerEnd(/recommend/i, 23)},
  ].map((n) => ({...n, p: pop(frame, fps, toFrame(n.at)), flash: bump(frame, toFrame(n.at), toFrame(n.at) + 30)}));

  const summaryFrame = toFrame(CAPTIONS[LAST].start + 1);
  const savedFrame = toFrame(CALL_DONE);
  const summary = pop(frame, fps, summaryFrame, 18);
  const saved = pop(frame, fps, savedFrame, 10);
  const savedPulse = interpolate(frame, [savedFrame + 4, savedFrame + 28], [0, 1], clamp);
  const done = pop(frame, fps, savedFrame + 4, 18);

  const label = pop(frame, fps, 0, 18);
  const phone = pop(frame, fps, 4, 16);
  const notesCard = pop(frame, fps, 10, 16);

  return (
    <SceneShell seconds={TIMELINE.realCall.duration} background={COLORS.plum} color="#FFFFFF" accent={props.accent}>
      <SceneLabel brand={props.brand} text="Hear the experience" number="04" accent={props.accent} dark />
      <div style={{position: "absolute", top: 104, left: 0, right: 0, display: "flex", justifyContent: "center", ...fadeUp(label, 20)}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 24px",
            borderRadius: 40,
            background: "#FFFFFF0A",
            border: "1px solid #FFFFFF20",
            fontSize: 23,
            fontWeight: 600,
            color: "#F3EBD9",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: callT < CALL_SECONDS ? COLORS.red : COLORS.green,
              opacity: callT < CALL_SECONDS ? 0.55 + 0.45 * Math.cos((frame / fps) * Math.PI * 1.6) : 1,
            }}
          />
          A real call recording
        </div>
      </div>

      <div style={{position: "absolute", left: 96, top: 170, ...popIn(phone)}}>
        <PhoneMockup props={props} callT={callT} values={bars} barColor={barColor} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 470,
          width: 600,
          top: 170,
          height: 620,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          ...fadeUp(phone),
        }}
      >
        <SpeakerAvatar label={props.agentName} color={props.accent} level={meeraLevel} energy={energy} icon={<HeadsetIcon size={80} />} />
        <SpeakerAvatar label="Customer" color={PLUM_ON_DARK} level={customerLevel} energy={energy} icon={<PersonIcon size={80} />} />
      </div>

      <div
        style={{
          position: "absolute",
          right: 96,
          top: 170,
          width: 700,
          height: 620,
          boxSizing: "border-box",
          padding: "30px 36px",
          background: "linear-gradient(140deg, #FFFFFF, #F7F2E9)",
          border: "1px solid #FFFFFF90",
          color: COLORS.ink,
          borderRadius: 32,
          boxShadow: "0 26px 65px #00000024",
          display: "flex",
          flexDirection: "column",
          ...popIn(notesCard),
        }}
      >
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, marginBottom: 6}}>
          <div style={{fontFamily: SERIF, fontSize: 42, fontWeight: 600}}>Live notes</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px 9px 10px",
              borderRadius: 30,
              background: "#E5F4EC",
              color: COLORS.green,
              fontSize: 20,
              fontWeight: 600,
              boxShadow: savedPulse > 0 && savedPulse < 1 ? `0 0 0 ${savedPulse * 18}px rgba(46,157,106,${0.35 * (1 - savedPulse)})` : "none",
              ...popIn(saved),
            }}
          >
            <CheckIcon size={34} color={COLORS.green} />
            Saved to sheet
          </div>
        </div>
        {notes.map((n) => (
          <NoteRow key={n.label} label={n.label} value={n.value} p={n.p} flash={n.flash} accent={props.accent} />
        ))}
        <div style={{marginTop: 24, ...fadeUp(summary, 16)}}>
          <div style={{fontSize: 19, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: props.accent}}>Summary</div>
          <div style={{marginTop: 10, fontSize: 28, lineHeight: 1.3, color: COLORS.ink}}>
            Liked {props.product}'s floral and spicy scent, would buy again, and rated it {CALL_FEEDBACK.score}/10.
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 812,
          height: 222,
          boxSizing: "border-box",
          padding: "26px 38px",
          background: "linear-gradient(140deg, #FFFFFF, #F7F2E9)",
          border: "1px solid #FFFFFF90",
          color: COLORS.ink,
          borderRadius: 32,
          boxShadow: "0 26px 65px #00000024",
          borderLeft: `10px solid ${callT > CALL_DONE ? COLORS.green : talking === 0 ? "#BDB6C6" : interpolateColors(customerShare, [0, 1], [props.accent, COLORS.plum])}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          ...fadeUp(phone),
        }}
      >
        {callT > CALL_DONE && (
          <div style={{display: "flex", alignItems: "center", gap: 24, fontSize: 38, fontWeight: 600, color: COLORS.ink, ...fadeUp(done, 14)}}>
            <CheckIcon size={60} color={COLORS.green} />
            Call complete. Every answer is saved to your sheet.
          </div>
        )}
        {caption && (
          <div style={{opacity: captionIn * (1 - captionOut), transform: `translateY(${(1 - captionIn) * 16 - captionOut * 10}px)`}}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 18px",
                borderRadius: 20,
                background: tagColor,
                color: "#FFFFFF",
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              {caption.speaker === "meera" ? props.agentName : "Customer"}
            </div>
            <div style={{marginTop: 13, fontSize: 38, fontWeight: 500, lineHeight: 1.28, color: COLORS.ink}}>{personalise(caption.text, props)}</div>
          </div>
        )}
      </div>
    </SceneShell>
  );
};
