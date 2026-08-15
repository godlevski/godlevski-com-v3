import React from "react";
import consolidateSections from "../../utils/consolidateSections";

import {useSpring, animated} from "react-spring";

const currents = {
  x: 0, y: 0, z: 0, 
  targetColor: '#000000',
  svgStyle: {
          position:'absolute', 
          left:'50%',
          marginLeft: '200px',
          top: '160px',
        },
  expanded: false
}

const savedTarget = {...currents};

const defaultBreaks = {
  x: [ [-13, 13] ],
  y: [ [-13, 13] ],
  z: [ [-13, 13] ]
}

export default ({

    className,

    color = "#000000",
    
    animateTo, // {x: degees, y: degree, z: degrees}

    coordinateLength = 10000, 

    breaksX = [], // length pairs to omit when drawing coordinates, e.g. [-10, 10]
    breaksY = [],
    breaksZ = [],

    style,

    expanded = false,

    ...args

  }) => {

  animateTo.targetColor = color;
  animateTo.svgStyle = style;
  animateTo.expanded = expanded;

  // update target and currents
  // if stated target is different from
  // current target

  for(let key in currents){
    const newTarget = animateTo[key];
    if(savedTarget[key] !== newTarget){
      
      // update departure point 
      // and target point
      currents[key] = savedTarget[key];
      savedTarget[key] = newTarget;
    }
  }

  // 
  const suppliedBreaks = {
    x: breaksX,
    y: breaksY,
    z: breaksZ
  }

  // consolidate line breaks
  // and convert it to dash info
  const dashes = {};

  for(let key in defaultBreaks){
    const consolidated = consolidateSections(...defaultBreaks[key], ...suppliedBreaks[key]);

    consolidated.splice(0,0,[-1*coordinateLength/2]);
    consolidated.push([+1*coordinateLength/2]);

    const dashed = consolidated
                        // flat out everything into single values numbers array
                        .reduce( (accumulator, br) => {
                          accumulator.push(...br);
                          return accumulator;
                        }, [])
                        
                        // map out values into length's sequence for dashes
                        .reduce( (reducer, curVal, i, values) => 
                          (i!==values.length-1)
                          ?
                          reducer + " " + (values[i+1] - curVal)
                          :
                          reducer, "");

    dashes[key] = dashed;
  }

  // axis rotation
  const {x, y, z, targetColor} = useSpring({
    ...animateTo,
    from: {...currents}
  })

  const svgStyle = useSpring({
    to:{...animateTo.svgStyle},
    from: {...currents.svgStyle}
  })

  // axis expansion
  const {c} = useSpring({
    c: expanded*1,
    from: {c: savedTarget.expanded*1},
    config: expanded ? {duration: 2000} : {duration: 300}
  })

  return (
    <>
    <animated.svg version="1.1"
      id="Pin"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      x="0px" y="0px"
      width="20px" height="20px"
      viewBox="0 0 20 20"
      overflow="visible"
      pointerEvents="none"
      {...args}
      style={svgStyle}
      >


      <defs>
        <clipPath id="boundaries">
          <animated.circle cx="0" cy="0" r={c.to(c=> `${c*(coordinateLength/2)}`)}/>
        </clipPath>
      </defs>
      
      <g>
    
        <animated.rect fill={targetColor} x="-1.29" y="-1.29" transform="matrix(0.7071 -0.7071 0.7071 0.7071 4.271623e-13 5.765137e-13)" width="2.58" height="2.58"/>
        <animated.path fill={targetColor} d="M0,3.67L-3.67,0L0-3.67L3.67,0L0,3.67z M-2.96,0L0,2.96L2.96,0L0-2.96L-2.96,0z"/>
        
        <rect x="-0.12" y="-10" width="0.25" height="2.65"/>
        <rect x="-0.12" y="7.35" width="0.25" height="2.65"/>
        <rect x="-10" y="-0.12" width="2.65" height="0.25"/>
        <rect x="7.35" y="-0.12" width="2.65" height="0.25"/>
      
      </g>

      {/* axes */}

      <animated.g 
        stroke={targetColor} 
        strokeWidth="1px" 
        clipPath="url(#boundaries)">

        <animated.line 
          x1={-1*coordinateLength/2} 
          x2={+1*coordinateLength/2} 
          y1={0} y2={0}

          strokeDasharray={dashes.x}
          transform={x.to(x=> `rotate(${x})`)}
          />

        <animated.line 
          x1={-1*coordinateLength/2} 
          x2={+1*coordinateLength/2} 
          y1={0} y2={0}
          
          strokeDasharray={dashes.y}
          transform={y.to(y=> `rotate(${y})`)}
          />

        <animated.line 
          x1={-1*coordinateLength/2} 
          x2={+1*coordinateLength/2} 
          y1={0} y2={0}
          
          strokeDasharray={dashes.z}
          transform={z.to(z=> `rotate(${z})`)}
          />

      </animated.g>

      
      
    </animated.svg>
    </>);
};