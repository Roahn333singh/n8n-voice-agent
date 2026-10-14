import {Composition} from "remotion";
import {Explainer} from "./Explainer";
import {defaultBrandProps, FPS, HEIGHT, TOTAL_SECONDS, WIDTH} from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Explainer"
      component={Explainer}
      durationInFrames={TOTAL_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaultBrandProps}
    />
  );
};
