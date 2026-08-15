const shape = [ 
  
  {
    id: "connector-before",
    string: "M4.97 161.2 L 280.68 240.51",
    weights: [1, 0.1],
    attrs: {
      fill: "black"
    }
  },
  
  // rain bow
  {
    string: "M280.68 240.51 L 560.15 99.78",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-red)"
    }
  },
  {
    string: "M280.68 240.51 L 560.15 109.96",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-orange)"
    }
  },
  {
    string: "M280.68 240.51 L 560.15 120.14",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-yellow)"
    }
  },
  {
    string: "M280.68 240.51 L 560.15 130.32",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-green)"
    }
  },
  {
    string: "M280.68 240.51 L 560.15 140.5",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-aqua)"
    }
  },
  {
    string: "M280.68 240.51 L 560.15 150.68",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-blue)"
    }
  },
  // triangles
  {
    
    string: "M280.27 320.62 L 419.22 320.62 L 349.75 200.29 L 280.27 320.62Z",
    weights: [0.2,2,1,0.2],
    attrs: {
      fill: "#ec008c",
    }
  },
  {
    string: "M280.27 320.62 L 141.33 320.62 L 210.8 200.29 L 280.27 320.62Z",
    weights: [0.2,2,1,0.2],
    attrs: {
      fill: "#fff575",
    }
  },
  {
    string: "M349.75 200.29 L 280.27 79.96 L 210.8 200.29 L 349.75 200.29Z",
    weights: [0.2,2,1,0.2],
    attrs: {
      fill: "#00aeef",
    }
  },
  {
    triggerPoint: [281, 241],
    string: "M210.8 200.29 L 280.27 320.62 L 349.75 200.29 L 210.8 200.29Z",
    weights: [0.2,2,1,0.2],
    attrs: {
      fill: "black"
    }
  },
  // connector
  {
    id: "connector-after",
    string: "M280.68 240.51 L 560.15 160.86",
    weights: [0.1, 1],
    attrs: {
      fill: "url(#gradient-violet)"
    }
  }
];

const defs = `
    
    <linearGradient id="gradient-red" x1="280.63" y1="170.15" x2="560.2" y2="170.15" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="red"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gradient-orange" x1="280.63" y1="175.24" x2="560.2" y2="175.24" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ff8000"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gradient-yellow" x1="280.64" y1="190.5" x2="560.19" y2="190.5" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="yellow"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gradient-green" x1="280.64" y1="185.41" x2="560.19" y2="185.41" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="green"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gradient-aqua" x1="280.64" y1="195.59" x2="560.19" y2="195.59" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="aqua"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gradient-blue" x1="280.64" y1="195.59" x2="560.19" y2="195.59" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="blue"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gradient-violet" x1="280.65" y1="200.68" x2="560.18" y2="200.68" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f803ff"/>
      <stop offset="1" stop-color="#000"/>
    </linearGradient>
    
  `;
  export default {
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
      drawDuration: 22000,
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
    defs,
    shape
  }
