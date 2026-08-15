import Knot, {useHot} from "../classes/Knot/Knot";

import slidesKnot from "./Slides.knot.js";
import tagsIndexKnot from "./TagsIndex.knot.js";
import introDataKnot from "./introData.knot.js";
import windowSizeKnot from "./WindowSize.knot.js";

export const modeKnot = new Knot('about'); // two basic modes or first level state
export const submodeKnot = new Knot(null); // slides/noslides or second level state
export const hoverKnot = new Knot(false);  // header hover
export const messageKnot = new Knot(''); // general message

export {
  slidesKnot,
  tagsIndexKnot,
  introDataKnot,
  windowSizeKnot
}