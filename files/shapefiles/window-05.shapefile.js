const shape = [
  
  {
    id: "connector-before",
    string: "M-.43,159.94c120,0-13.86,44.88,106.11,43.27",
    weights: [1, 0.7]
  },
  
  // window
  { 
    triggerPoint: [240, 160],
    string: "M280.02 241.27 L 280.02 79.95 L 200.02 1.29 L 200.02 1.29 L 200.02 321.29",
    weights: [0.01, 2, 3, 3, 0.01]
  },
  {
    string: "M280.02 79.95 L 200.02 1.29 L 200.02 1.29 L 200.02 321.29 L 280.02 241.27",
    attrs: {
      fill: "url(#e2b1566f-6d51-48c3-9e32-174ecd65b59c)"
    }
  },
  // line
  {
    string: "M105.68,203.21c96.65,0,54.27,36.76,93.89-4.27,9.56-9.9,16.68-16.94,40-38.65,153.55-142.89,21.59-54,175.14-54",
    weights: [0.7, 0.3, 0.1, 0.7]
  },
  // connector
  {
    id: "connector-after",
    string: "M414.71,106.26c153.55-2.06-7.78,54.94,145.77,54.94",
    weights: [0.7, 1]
  },
  
]
const defs = //<defs>
    `<linearGradient id="e2b1566f-6d51-48c3-9e32-174ecd65b59c" x1="200.02" y1="161.29" x2="280.02" y2="161.29" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#004a69" stop-opacity="0.1"/>
      <stop offset="0.4" stop-color="#168ab2" stop-opacity="0.1"/>
      <stop offset="0.7" stop-color="#004a69" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#004a69" stop-opacity="0.1"/>
    </linearGradient>`
//  </defs>
const pan = {
  svgAttrs: {
    width: 560,
    height: 400,
    viewBox: '0 0 560 400',
    overflow: 'visible'
  },
  settings: {
    center: [267, 202],
    // energy input into the spring
    kickVariable: 0.5,
    // drawing
    easingFn: "cubic-bezier(.07,.25,.2,.25)",
    drawDuration: 3000,
    // offset by distortion before drawing
    distort: true,
    distortionK: -0.0000005, 
    scale: 0.99,
    catmull: false,
    snap: false,
    chainTriggerInterval: 100,
    chainTriggerFrequency: 4000,
    kicksCount: 5,
    kicksFrequency: 4000/2 
  },
  defs,
  shape,
  timed: []
};
export default pan;