import React, {useRef, useEffect} from "react";

//import src from "./loading.gif";

import styles from "./Loading.module.css";

import {animated} from "react-spring";

import {
  // bezier and related classes
  CubicBezierPathEl,
  JointGroup,
  PointsGroup,
  // chained step animation
  Iteration,
  // spring mechanism to calculate new position based on distance to preserved target position and velocity
  PointsCentralSpring} from "../../classes/CubicBezier/CubicBezier";

// input
import ShapePan from "../../lineshapes/loading-shape.js";

// triggers to add impulse to spring
import {chainTrigger, kickstart} from "../../classes/CubicBezier/utils/triggers.js";

// ------------------------------------------------
// -- SETTINGS
const center = [ 300, 288 ];

export default ({
  className,
   
  scheme="black", // "white", "blue"
  size="medium", // large, small
  position="centered", // flat

  ...attrs}) => {
  const {
    svgAttrs,
    shapesWeights, 
    shapeStrings
  } = ShapePan;
  // make shape objects
  const shapes = [];
  
  shapeStrings.forEach( (string, i) => {

    const elRef = useRef();

    const path = (new CubicBezierPathEl())
      .pushPathString(string)
      .pushWeights(shapesWeights[i])

    // SETUP SPRING
    const spring = (new PointsCentralSpring(path.getAllEndPoints()))
      .setCenter(center)
      .preserveTarget();

    // PRESET CATMULL
    const controls = (new JointGroup( ...path.getAllJoints() ))
      .setCenter(...center)
      .preserveCatmullRomOffset();
    
    // PUSH IT TO SHAPES
    shapes.push({
      elRef,
      path,
      controls,
      //anchors: path.getAllEndPoints(),
      center,
      spring
    })

  });

  // calculates new point and handles values and updates path's d value
  function onFrame(){
    shapes.forEach(shape => {
      
      // calculate new anchor position, based on current position to sping's target
      shape.spring.applyForceStep();
      // calculate handles based on new catmul rom handles relative to default catmull rom
      shape.controls.adjustJointHandlesByCatmullRomOffset();

      // render to path element
      // update D element of the path
      shape.path.update();
    })
  }

  // adds velocity to points as in gives energy to spring mechanism
  function triggerFrame(){
    shapes.forEach(shape => {
      chainTrigger(shape.controls)
    })
  }

  // -- Iterate Above
  const animation = new Iteration(onFrame, true);
  const trigger = new Iteration(triggerFrame, true, 2500);

  // kickstart motion 
  shapes.forEach(shape => {
    kickstart(shape.controls);
  })


  useEffect(function stageBezierPath(){
    
    // STAGE ELEMENT TO SVG
    shapes.forEach(shape => {

      shape.path.pathEl = shape.elRef.current;

    }) 

    // stop timeouts on unmount
    return function(){
      animation.stop();
      trigger.stop();
    }

  },[])
  

  return <animated.svg 
      className={
        styles.svgBody+" "+
        styles["scheme-"+scheme]+" "+
        styles["size-"+size]+" "+
        styles["position-"+position]+" "+

        (className||"")+" "
      } 
      overflow="visible"
      {...svgAttrs}
      {...attrs}>
      {shapes.map( (shape, i) => <path key={i} ref={shape.elRef} /> )}
    </animated.svg>
    {/*<img className={className} src={src} style={{maskImage:`image(url(${src}))`}} />*/}
    
  
}