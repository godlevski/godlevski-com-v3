import React from "react";

import {useSpring, animated} from "react-spring";

import {isSafari} from "../../utils/userAgent.js";

// declare currents for transitionate values
const currents = {x: -5000, y:-80, backgroundColor: '#dadada'}
const targetValues = {...currents};


export default ({
  rect,
  
  strokeColor = "#727272",
  className,
  ...args}) => {

    // compare passed values against currents
    for(let key in rect){
      
      const newVal = rect[key];
      if(newVal !== undefined && targetValues[key] !== newVal){
        currents[key] = targetValues[key];
        targetValues[key] = newVal;
      }

    }

    const animation = useSpring({
      ...targetValues, 
      from: {...currents},
      
    });

    const {targetColor} = useSpring({
      targetColor: targetValues.backgroundColor,
      from: {
        targetColor: currents.backgroundColor
      }
    })

    return (
      <>
        <svg 
          version="1.1"
          id="gridSvg"
          className={className} 
          xmlns="http://www.w3.org/2000/svg"
          width="100%" height="100%"
          pointerEvents="none"
          overflow="visible"
          {...args}>

          <defs>
            <pattern id="gridBox" width="0.004" height="0.004" patternUnits="objectBoundingBox">
              <g stroke={strokeColor}>
                <rect fill="none" strokeWidth="0.1" width="80" height="80" opacity={isSafari ? "0.9" : '1'}/>
                <line strokeWidth="0.1" x1="0" y1="0" x2="80" y2="80" opacity={isSafari ? "0.3" : '1'} />
                <line strokeWidth="0.1" x1="80" y1="0" x2="0" y2="80" opacity={isSafari ? "0.3" : '1'} />
              </g>
            </pattern>
          </defs>
          
          <animated.rect 
            fill="url(#gridBox)"
            width="20000px" 
            height="20000px"
            {...rect}
            x={animation.x}
            y={animation.y}/>

        </svg>

      </>
      )
  }