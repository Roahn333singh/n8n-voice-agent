import {loadFont as loadJakarta} from "@remotion/google-fonts/PlusJakartaSans";
import {loadFont as loadGeist} from "@remotion/google-fonts/Geist";
import {loadFont as loadSora} from "@remotion/google-fonts/Sora";
import {loadFont as loadSpaceGrotesk} from "@remotion/google-fonts/SpaceGrotesk";
import {loadFont as loadBricolage} from "@remotion/google-fonts/BricolageGrotesque";
import {loadFont as loadInstrument} from "@remotion/google-fonts/InstrumentSerif";
import {SERIF} from "./theme";

type Line = {size: number; tracking: number};

type Spec = {
  load: () => string;
  weight?: number;
  italic: boolean;
  opening: Line;
  closing: Line;
  pass: Line & {weight: number};
};

export type HeadlineFont = Omit<Spec, "load"> & {fontFamily: string};

const latin = {subsets: ["latin" as const]};

const SPECS: Record<string, Spec> = {
  playfair: {
    load: () => SERIF,
    italic: true,
    opening: {size: 80, tracking: -2},
    closing: {size: 106, tracking: -3.2},
    pass: {size: 50, tracking: 0, weight: 600},
  },
  jakarta: {
    load: () => {
      loadJakarta("italic", {weights: ["700"], ...latin});
      return loadJakarta("normal", {weights: ["700"], ...latin}).fontFamily;
    },
    weight: 700,
    italic: true,
    opening: {size: 73, tracking: -2.6},
    closing: {size: 100, tracking: -3.6},
    pass: {size: 46, tracking: -1.2, weight: 700},
  },
  geist: {
    load: () => {
      loadGeist("italic", {weights: ["600"], ...latin});
      return loadGeist("normal", {weights: ["600"], ...latin}).fontFamily;
    },
    weight: 600,
    italic: true,
    opening: {size: 78, tracking: -3},
    closing: {size: 107, tracking: -4.3},
    pass: {size: 48, tracking: -1.4, weight: 600},
  },
  sora: {
    load: () => loadSora("normal", {weights: ["600"], ...latin}).fontFamily,
    weight: 600,
    italic: false,
    opening: {size: 72, tracking: -2.8},
    closing: {size: 97, tracking: -3.8},
    pass: {size: 44, tracking: -1.2, weight: 600},
  },
  spacegrotesk: {
    load: () => loadSpaceGrotesk("normal", {weights: ["600"], ...latin}).fontFamily,
    weight: 600,
    italic: false,
    opening: {size: 75, tracking: -2.7},
    closing: {size: 102, tracking: -3.7},
    pass: {size: 48, tracking: -1.2, weight: 600},
  },
  bricolage: {
    load: () => loadBricolage("normal", {weights: ["700"], ...latin}).fontFamily,
    weight: 700,
    italic: false,
    opening: {size: 73, tracking: -2.6},
    closing: {size: 100, tracking: -3.6},
    pass: {size: 50, tracking: -1.2, weight: 700},
  },
  instrument: {
    load: () => {
      loadInstrument("italic", {weights: ["400"], ...latin});
      return loadInstrument("normal", {weights: ["400"], ...latin}).fontFamily;
    },
    italic: true,
    opening: {size: 98, tracking: -1.9},
    closing: {size: 118, tracking: -2.4},
    pass: {size: 58, tracking: -0.6, weight: 400},
  },
};

const loaded = new Map<string, string>();

export const headlineFont = (name: string): HeadlineFont => {
  const key = name in SPECS ? name : "playfair";
  const {load, ...spec} = SPECS[key];
  if (!loaded.has(key)) loaded.set(key, load());
  return {...spec, fontFamily: loaded.get(key)!};
};
