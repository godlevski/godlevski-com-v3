const shape = [
  { 
    id: "connector-before",
    string:"M.52,160.29c61.5,0,131.72,51.72,160,80",
    weights:[1, 0.5],
    attrs:{},
  },
  
  {
    string:"M160.52,240.29c120,120,162,103.82,216.91,48.89,40-40,70.64-37.53,0,0-31.66,16.82-7.51,6.6-27.84,4.09-13.09-1.61-31.57-16.51-50.68-38.08,0,0-7.37-7-15.19-21.2s-12.8-30.06-13.62-40.93c-.55-7.24-2.21-17.42-3.5-26.06-.65-4.33-1.2-8.26-1.48-11.26-.82-9-5.36-16.56-4.53-31s8.53-49.18,8.53-49.18,34.32-13.44,79.23-13.44S420.2,73,423.5,79.62s8.9,39.37,7.25,57.5-4.94,27.19-4.94,27.19c-11.92,36,67.68-7.94,86.75-9.64",
    weights:[0.5, 0.1, 0.1, 0.2, 0.5, 1, 1, 1, 1, 1, 1.1, 1.1, 1.1, 1, 0.3, 0.5],
    attrs:{},
  },
  // eyebrows
  {
    string:"M425.81,164.31c0-22-23.31-35.73-37.08-29.51-21.88,9.89-32.55-8.6-32.55,8.94",
    weights:[0.3,2,0.3],
    attrs:{},
  },
  {
    string:"M266.6,167c-3.73-21.72,14.09-32.85,29-30.95,25.72,3.3,33.43-5.49,33.43,9.89",
    weights:[1, 1.5, 0.3],
    attrs:{},
  },
  // eyes
  {
    triggerPoint: [267,167],
    string:"M329,173s-6.73,8.51-16.43,8.51-28.34-14.3-28.34-14.3,9.32-8.14,21.74-8.65C323.2,157.86,329,173,329,173Z",
    weights:[],
    attrs:{stroke: "none", fill: "black"},
  },
  {
    triggerPoint: [426,164],
    string:"M360.85,173.89s6.91,9,16.87,9,29.08-15.18,29.08-15.18-9.57-8.64-22.31-9.17C366.81,157.82,360.85,173.89,360.85,173.89Z",
    weights:[],
    attrs:{stroke: "none", fill: "black"},
  },
  {
    id: "connector-after",
    string:"M512.56,154.67c11.61-1-4.5,6.53,38.33,6.53",
    weights:[0.5, 1],
    attrs:{},
  },
]
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
    kickVariable: 1,
    // drawing
    easingFn: "cubic-bezier(.07,.25,.2,.25)",
    drawDuration: 4000,
    // offset by distortion before drawing
    distort: true,
    distortionK: -0.000001, 
    scale: 0.97,
    catmull: false,
    snap: false,
    chainTriggerInterval: 100,
    chainTriggerFrequency: 4000,
    kicksCount: 5,
    kicksFrequency: 4000/2 
  },
  shape
};
export default pan;
