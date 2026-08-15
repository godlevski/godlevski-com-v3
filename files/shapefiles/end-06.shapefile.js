const shape = [
  {
    id: "connector-before",
    string:"M.1,161.76c42.7.08,74.14.12,80.33.12",
    weights:[],
    attrs:{},
  },
  
  {
    string:"M80.43,161.88c275,0,126.59,38.84,1.59,79.44-120,39,0,9.35-30,58.68-34,56,29.82,79.88,111.88,79.88",
    weights:[],
    attrs:{},
  },
  {
    id: "connector-after",
    string:"M163.94,379.88H496.57",
    weights:[],
    attrs:{},
  }
  
]
const defs = '';
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
    easingFn: "cubic-bezier(.5,.25,.45,.68)",
    drawDuration: 2000,
    // offset by distortion before drawing
    distort: true,
    distortionK: -0.000001, 
    scale: 0.97,
    catmull: true,
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