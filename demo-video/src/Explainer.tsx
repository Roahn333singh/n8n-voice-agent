import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from "remotion";
import {BrandProps, CALL_AUDIO, CALL_START_OFFSET, FPS, TIMELINE, TOTAL_SECONDS} from "./config";
import {CALL_SECONDS} from "./captions";
import {Hook} from "./scenes/Hook";
import {Disclaimer} from "./scenes/Disclaimer";
import {Problem} from "./scenes/Problem";
import {HowItWorks} from "./scenes/HowItWorks";
import {RealCall} from "./scenes/RealCall";
import {Results} from "./scenes/Results";
import {Offer} from "./scenes/Offer";
import {TRANSITION_FRAMES} from "./components/SceneShell";
import {paletteOf} from "./palette";

const f = (seconds: number) => Math.round(seconds * FPS);

const callFrom = TIMELINE.realCall.from + CALL_START_OFFSET;
const callTo = callFrom + CALL_SECONDS;

export const Explainer: React.FC<BrandProps> = (props) => {
  // The music tracks are mastered near -24 LUFS; this gain keeps them below the voice.
  const musicVolume = (frame: number) => {
    const t = frame / FPS;
    const duck = interpolate(t, [callFrom - 1.5, callFrom, callTo, callTo + 2.5], [1, 0.10, 0.10, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(t, [TOTAL_SECONDS - 3, TOTAL_SECONDS], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return 0.72 * duck * fadeOut;
  };

  const scenes = [
    {key: "disclaimer", t: TIMELINE.disclaimer, el: <Disclaimer {...props} />},
    {key: "hook", t: TIMELINE.hook, el: <Hook {...props} />},
    {key: "problem", t: TIMELINE.problem, el: <Problem {...props} />},
    {key: "howItWorks", t: TIMELINE.howItWorks, el: <HowItWorks {...props} />},
    {key: "realCall", t: TIMELINE.realCall, el: <RealCall {...props} />},
    {key: "results", t: TIMELINE.results, el: <Results {...props} />},
    {key: "offer", t: TIMELINE.offer, el: <Offer {...props} />},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: paletteOf(props.palette).base}}>
      {scenes.map(({key, t, el}, i) => (
        <Sequence
          key={key}
          name={key}
          from={f(t.from)}
          durationInFrames={f(t.duration) + (i < scenes.length - 1 ? TRANSITION_FRAMES : 0)}
        >
          {el}
        </Sequence>
      ))}
      <Audio src={staticFile(`audio/music/${props.music}.mp3`)} volume={musicVolume} />
      <Sequence name="call-audio" from={f(callFrom)} durationInFrames={Math.ceil(CALL_SECONDS * FPS)}>
        <Audio src={staticFile(CALL_AUDIO)} />
      </Sequence>
    </AbsoluteFill>
  );
};
