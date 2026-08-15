import Knot from "../classes/Knot/Knot";


// window size

import windowResize from "../utils/windowResize";

const windowSizeKnot = new Knot(windowResize.getCurrent());

windowResize.addListener(function(bb){
  windowSizeKnot.setState(bb);
});

export default windowSizeKnot;