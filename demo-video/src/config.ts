import {CALL_SECONDS} from "./captions";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Leave two seconds after the recording for the saved-feedback confirmation.
export const CALL_START_OFFSET = 1;
export const CALL_AUDIO = "audio/new-call.wav";
const realCallDuration = Math.max(40, Math.ceil(CALL_SECONDS + CALL_START_OFFSET + 2));
const openingDuration = 7;
const offerDuration = 10;
const resultsFrom = openingDuration + 28 + realCallDuration;

export const TIMELINE = {
  disclaimer: {from: 0, duration: openingDuration},
  hook: {from: openingDuration, duration: 7},
  problem: {from: openingDuration + 7, duration: 9},
  howItWorks: {from: openingDuration + 16, duration: 12},
  realCall: {from: openingDuration + 28, duration: realCallDuration},
  results: {from: resultsFrom, duration: 11},
  offer: {from: resultsFrom + 11, duration: offerDuration},
} as const;

export const TOTAL_SECONDS = TIMELINE.offer.from + TIMELINE.offer.duration;

export type BrandProps = {
  brand: string;
  product: string;
  customerName: string;
  agentName: string;
  company: string;
  contactName: string;
  contactLine: string;
  bookingUrl: string;
  accent: string;
  palette: string;
  serviceName: string;
  music: string;
  headlineFont: string;
};

// Input props: override per prospect with --props='{"brand":"...","product":"..."}'.
// The bundled call says "Aurelia Perfumes" and "Oud Royale"; captions in the RealCall
// scene swap brand/product names so personalised versions still read naturally.
export const defaultBrandProps: BrandProps = {
  brand: "Aurelia Perfumes",
  product: "Oud Royale",
  customerName: "Rohan Singh",
  agentName: "Meera",
  company: "",
  contactName: "Rohan Singh",
  contactLine: "Book a free 30-minute live demo",
  bookingUrl: "https://voiceagent.zohobookings.in/488248000000028078",
  accent: "#C8A24A",
  // Opening and closing page colours: volt (yellow & black), crimson, ruby, wine, oxblood, noir, midnight, emerald.
  palette: "volt",
  // Your service name, shown at the top of the opening and closing pages. "brand" is the demo client.
  serviceName: "Voice Agent",
  // Background music, a file in public/audio/music/: warm-piano, bright-uplift, lofi-chill, modern-tech, acoustic-hopeful.
  music: "acoustic-hopeful",
  // Opening and closing headline font: playfair, jakarta, geist, sora, spacegrotesk, bricolage, instrument.
  headlineFont: "bricolage",
};

export const COLORS = {
  ink: "#1B1A22",
  inkSoft: "#4A4858",
  paper: "#FBF8F2",
  card: "#FFFFFF",
  line: "#E8E2D6",
  gold: "#C8A24A",
  plum: "#3B2346",
  green: "#2E9D6A",
  amber: "#E0A23B",
  red: "#D2544B",
  sheetGreen: "#1E8E3E",
};
