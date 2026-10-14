import {loadFont as loadInter} from "@remotion/google-fonts/Inter";
import {loadFont as loadPlayfair} from "@remotion/google-fonts/PlayfairDisplay";

export const {fontFamily: SANS} = loadInter("normal", {weights: ["400", "500", "600", "700", "800"], subsets: ["latin"]});
export const {fontFamily: SERIF} = loadPlayfair("normal", {weights: ["500", "600", "700"], subsets: ["latin"]});
loadPlayfair("italic", {weights: ["600", "700"], subsets: ["latin"]});
