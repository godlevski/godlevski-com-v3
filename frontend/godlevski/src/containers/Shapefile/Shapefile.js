// bezier and related classes
import {CubicBezier} from "../../classes/CubicBezier/CubicBezier";
import {CubicBezierPathEl} from "../../classes/CubicBezier/CubicBezier";
import {JointGroup} from "../../classes/CubicBezier/CubicBezier";
import {PointsGroup} from "../../classes/CubicBezier/CubicBezier";
// chained step animation
import Iteration, {Animation} from "../../classes/CubicBezier/classes/Iteration.js";
// spring mechanism to calculate new position based on distance to preserved target position and velocity
import {PointsCentralSpring} from "../../classes/CubicBezier/CubicBezier.js";

import {CubicBezierEasing} from "../../classes/CubicBezier/CubicBezier";

import {CubicBezierPathElShape} from "../../classes/CubicBezier/CubicBezier";

// triggers to add impulse to spring
import {chainTrigger, chainTriggerPoints, kickstart} from "../../classes/CubicBezier/utils/triggers.js";

import {
  pointsDistance,
  pointAtSegmentDistance,
  middlePoint
} from "../../classes/CubicBezier/utils/helpers";

// REACT
import React, {useRef, useState, useEffect} from "react";

import styles from "./Shapefile.module.css";

import {animated, SpringValue} from "react-spring";

import {useResizeEffect} from "../../utils/windowResize";

import {isFirefox} from "../../utils/userAgent";

// ---------------------------------------------------------------------------------
// REACT PATTERNS AND INVOKATIONS
// ---------------------------------------------------------------------------------
// mini helper to deal with outer points, namely update their path's handles when available
const ConnectorPoint = function ConnectorPoint(inp=[null,null]){
  const th = [];

  if(typeof inp[0] == 'number') th[0] = inp[0];
  if(typeof inp[1] == 'number') th[1] = inp[1];

  th.update = function(p=[0,0]){
    if(p[0]) th[0] = p[0];
    if(p[1]) th[1] = p[1];

    const {path} = th;
    
    if(path){
      const middle = middlePoint(path.p0,path.p3);
      //console.log('middle is', path, middle);
      path.p1[0] = middle[0];
      path.p1[1] = path.p0[1];

      path.p2[0] = middle[0];
      path.p2[1] = path.p3[1];
    }
  }

  return th;
}

const Anchor = function Anchor(){
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

  rect.setAttribute('x',0);
  rect.setAttribute('y',0);
  rect.setAttribute('width',0);
  rect.setAttribute('height',0);

  rect.setAttribute('stroke','none');
  rect.setAttribute('fill','none');

  return rect;
}

function Shapefile({
  shapefile,
  reference=null,
  className,
  x=0,
  y=0,
  shapefileObjRef={current: {}},

  viewBoxValues=[0,0,0,0],
  startToEndOffset, // from the start of parent svg to an end of the page

  showFull=false, // forces draw animation to a 100
  restage=false    // force restage = redraw
}){

  const genericRef = useRef(); 
  const svgEl = reference || genericRef;
  const [staged, setStaged] = useState(false);
  const stagedShapefile = useRef();

  const xRef = useRef();

  xRef.current = x;

  useEffect(function updateXRef(){
    //console.log('new x', x);
    xRef.current = x;
  }, [x]);

  const viewBoxValuesRef = useRef();

  useEffect(function updateViewBoxRefValues(){
    viewBoxValuesRef.current = viewBoxValues;
  },[viewBoxValues])

  // anchor to get svg's start position to an end of the screen

  const anchorEl = useRef(new Anchor());
  
  // HELPERS


  const clearSvg = function(svg){
    const not = (attribute) => !(/^(class|x|y)$/g).exec(attribute);

    Object.values(svg.attributes).forEach( ({name}) => not(name) ? svg.removeAttribute(name) : null );

    svg.innerHTML = null;
  }

  // added connector points

  const getNewStartPoint = function(currentStartPoint=[0,0]){
    const anchorBB = anchorEl.current.getBoundingClientRect();
    const startX = anchorBB.x;

    const startY = currentStartPoint[1];
    // value of entire svg's offset to the right (when its a next slide)
    const x = xRef.current;
    const offsetX = x instanceof SpringValue ? x.get() : x;

    const newStartPoint = new ConnectorPoint([
      Math.min(-startX + (!isFirefox ? offsetX : 0), 0), 
      startY]);

    //console.log('new Start Point', shapefile.id, x.key, offsetX, startX, newStartPoint);

    //console.log('new start point calc', -startX+offsetX, -startX, offsetX);

    newStartPoint.weight = currentStartPoint.weight;

    return newStartPoint;
  }

  const getNewEndPoint = function(currentEndPoint=[0,0]){
    //const anchorBB = anchorEl.current.getBoundingClientRect();
    
    //const startX = window.innerWidth - anchorBB.x;

    //const [,,viewBoxWidth] = viewBoxValuesRef.current || [];
    //console.log('viewBoxWidth', viewBoxWidth, window.innerWidth - anchorBB.x, endX)

    const endY = currentEndPoint[1];
    //const x = xRef.current;
    // value of entire svg's offset to the right (when its a next slide)
    //const offsetX = x instanceof SpringValue ? x.get() : x;

    const newEndPoint = new ConnectorPoint([

      // as long as distance from the start of the parent canvas to the end of the screen
      startToEndOffset.current, 

      //Math.max(startX + (!isFirefox ? offsetX : 0), viewBoxWidth*1),
      endY]); // see bug at https://bugzilla.mozilla.org/show_bug.cgi?id=1753834

    newEndPoint.weight = currentEndPoint.weight;

    //console.log('new End Point', shapefile.id, x.key, newEndPoint ) //offsetX, endX, anchorBB.x, newEndPoint, viewBoxWidth, startToEndOffset);

    return newEndPoint;
  }

  // METHODS
  
  function addStartPoint(){
    const staged = stagedShapefile.current;
    if(!staged) return;

    // add start and end points to connectors to match the screen edges
    const startConnector = staged.idIndex['connector-before'];
    if(!startConnector) return;

    const startPath = startConnector['path'];

    const currentStartPoint = startPath.curves[0]['p0'];
    const newStartPoint = getNewStartPoint(currentStartPoint);

    const additionalPath = new CubicBezier(newStartPoint, [currentStartPoint[0], newStartPoint[1]], [newStartPoint[0],currentStartPoint[1]], currentStartPoint);

    newStartPoint.path = additionalPath;

    startPath.curves.splice(0,0,additionalPath);

    const currentLength = startPath.totalCapturedLength
    startPath.captureCurvesLength();

    const lengthDiff = startPath.totalCapturedLength - currentLength;

    staged.pathShape.totalCapturedLength += lengthDiff;

    staged.calculateDrawingCurrents();

    return newStartPoint;
  }

  function addEndPoint(){
    const staged = stagedShapefile.current;
    if(!staged) return;

    const endConnector = staged.idIndex['connector-after'];
    if(!endConnector) return;

    const endPath = endConnector['path'];

    const currentEndPoint = endPath.curves[endPath.curves.length-1]['p3'];
    const newEndPoint = getNewEndPoint(currentEndPoint);

    const additionalPath = new CubicBezier(currentEndPoint, [newEndPoint[0],currentEndPoint[1]], [currentEndPoint[0], newEndPoint[1]], newEndPoint);

    newEndPoint.path = additionalPath;

    endPath.curves.push(additionalPath);

    const currentLength = endPath.totalCapturedLength
    endPath.captureCurvesLength();

    const lengthDiff = endPath.totalCapturedLength - currentLength;

    staged.pathShape.totalCapturedLength += lengthDiff;

    staged.calculateDrawingCurrents();

    return newEndPoint;
  }

  // UPDATE ADDED POINT'S Xs (and Y's, on window resize for example)
  function updateEndPointsCoordinates(){
    const staged = stagedShapefile.current;

    //console.error('updating points, offset is', x.get(), xRef.current.get() )

    if(!staged) return;

    const {startPoint, endPoint} = staged;

    if(startPoint){
      const newStartPoint = getNewStartPoint(startPoint);

      startPoint.update(newStartPoint)
    }

    if(endPoint){
      const newEndPoint = getNewEndPoint(endPoint);

      endPoint.update(newEndPoint)
    }
  }

  // hook resize
  useResizeEffect(updateEndPointsCoordinates);

  // STAGE SHAPEFILE
  function stageShapefileToSvgElementOnMount(){

    //console.log('STAGING SHAPEFILE', (shapefile&&shapefile.id));

    const svg = svgEl.current;
    // clear svg
    clearSvg(svg)
    
    svg.appendChild(anchorEl.current);

    const staged = stageShapefile({
      svgEl: svg,
      shapefile
    });  

    stagedShapefile.current = staged;

    const startPoint = addStartPoint();
    const endPoint = addEndPoint();

    staged.startPoint = startPoint;
    staged.endPoint = endPoint;

    setStaged(true);

    staged.resetPlayback();
    staged.playIn(function(){});

    // return iterations kill function for unmount
    return staged.killOnOut
  }

  useEffect(stageShapefileToSvgElementOnMount, [shapefile]);
  // if the file never unmounted, but needs fresh run of animation and end points reset and such
  useEffect(function restageAtRequest(){
    if(restage){
      //console.log('RESTAGING', shapefile&&shapefile.id);
      stageShapefileToSvgElementOnMount();
    }
  },[restage]);

  // CONNECTOR POINTS REFFERENCE 
  useEffect(function hanglocalStartAndEndPointsToPassedRef(){
    shapefileObjRef.current = stagedShapefile.current;
    //console.log('HOOKING STAGED:', (shapefile&&shapefile.id), {s:stagedShapefile.current});
  }, [shapefileObjRef])


  // IF CLEAR ACTION REQUESTED
  useEffect(function jumpToDrawEnd(){
    if(!showFull || !stagedShapefile.current) return;

    // stop drawing timed iterator
    stagedShapefile.current.tRunner.stop();

    // unrestrict path length
    stagedShapefile.current.pathShape.paths.forEach(path => {
      path.maxLength += path.totalCapturedLength;
    })

  }, [showFull, staged]);

  //console.log('my x is', x.get(), shapefile.id, x);

  return <animated.svg
            className={(className+' ')} 
            ref={svgEl}
            x={x}
            y={y}>    
         </animated.svg>;
}

// --------------------------------------------------
// SHAPEFILE INTERFACE and CUBIC BEZIER CLASSES USAGE
// declare all functions local to generic svgEl here
// --------------------------------------------------

const defaultAttrs = {
  weightedPath: {fill:"black", stroke:"none"},
  unWeightedPath: {fill:"none", stroke:"black"}
}

function stageShapefile({
  shapefile,
  svgEl:svgElInput
}){

  // make/set root element
  const svgEl = svgElInput || document.createElementNS("http://www.w3.org/2000/svg", "svg");

  //console.log('svgElInput', svgElInput)
  const svgAttrs = shapefile.settings.svgAttrs || {}
  
  const forbidden = function(name){
    return name == 'x' || name == 'y';
  }

  Object.entries( shapefile.svgAttrs ).forEach( ([name, value]) => {
    if(forbidden(name)) return;
    svgEl.setAttribute(name, value)
  });

  const {settings} = shapefile;
  const center = settings.center || [267, 202];

  // CREATE defs

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  defs.innerHTML = shapefile.defs;

  svgEl.appendChild(defs);

  // STAGE SHAPEFILE

  function stageinput({ string, weights, attrs, ...other }){

    const path = (new CubicBezierPathEl())
      .pushPathString(string)
      .pushWeights(weights)
      .attr({
        fill:"none",
        ...(weights && weights.length ? defaultAttrs.weightedPath : defaultAttrs.unWeightedPath),
        ...(attrs||{})
        
      })
      .setProp('id', other.id);

    // STAGE ELEMENT TO SVG
    svgEl.appendChild(path.pathEl);

    // PUSH IT TO SHAPES
    return {
      path,
      attrs,
      ...other
    }
  }
  
  // make PathShape objects
  const allPaths = [];
  const allPoints = [];
  const allJoints = [];

  const idIndex = {
    "connector-before": null,
    "connector-after": null
  }

  // const allPoints = [];
  // const allTimedPoints = [];

  shapefile.shape.forEach( pathinput => {
    const staged = stageinput(pathinput);

    // PUSH TO ALL POINTS
    allPoints.push( ...staged.path.getAllEndPoints() );
    allJoints.push( ...staged.path.getAllJoints() );

    allPaths.push(staged);

    if(staged.id){
      idIndex[staged.id] = staged;
    }
  });

  // remove first and last point
  allPoints.splice(0,1);
  allPoints.splice(allPoints.length-1,allPoints.length);

  allJoints.splice(0,1);
  allJoints.splice(allJoints.length-1,allJoints.length);

  // create group
  const allPointsGroup = (new PointsGroup(...allPoints)).setCenter(...center);
  const allJointsGroup = (new JointGroup(...allJoints))
    .setCenter(...center)
    .preserveCatmullRomOffset(); // anchors start at 1 since first and last end points removed

  // MAKE PATH SHAPE
  const pathShape = (new CubicBezierPathElShape());
  
  allPaths.forEach( ({path, triggerPoint}) => pathShape.pushPath(path, triggerPoint));

  pathShape
    .rechainPaths()
    .clearCurrentPathsPool()

    .reindexConnectedPoints()

  // MAKE SPRING
  const spring = (new PointsCentralSpring(allPoints))
    .setCenter(center)
    .preserveTarget()
    .applyForceStep(); // this adds unexisting velocity and current height variables to anchor points

  // INSTRUCTIONS: ADD BASE ITERATION
  const instructions = [];

  instructions.push(() => spring.applyForceStep());
  instructions.push(() => pathShape.replaceConnectedPointsValuesWithTarget());

  //console.log('settings', settings);

  // if preserve catmul
  if(settings.catmull){
    instructions.push(() => allJointsGroup.adjustJointHandlesByCatmullRomOffset())
  }

  instructions.push(() => allPaths.forEach(({path}) => path.update()));

  const onFrame = function(){

    instructions.forEach(fn => fn());

  }
  // declare iteration
  const movement = (new Iteration(onFrame, false));

  // DRAW CHAIN SHAPE
  const easingFn = settings.easingFn;
  const drawDuration = settings.drawDuration || 18000;

  // --
  const drawingCurrents = {}

  const timeMs = drawDuration; // time in seconds
  const fps = 20;    // frame per second

  function calculateDrawingCurrents(totalCapturedLength=pathShape.totalCapturedLength){
    
    const totalLength = totalCapturedLength;
    const totalFrames = (timeMs/1000)*fps;

    const normalTAdvancement = 1/totalFrames; // t advancement before accounting for easing and delay for execution
    const normalLAdvancement = totalLength/totalFrames; // advancement in distance

    drawingCurrents.totalLength = totalLength;
    drawingCurrents.totalFrames = totalFrames;

    drawingCurrents.normalTAdvancement = normalTAdvancement;
    drawingCurrents.normalLAdvancement = normalLAdvancement;

  }

  calculateDrawingCurrents()
  
  
  const tRunner = new Animation(advancement, null, {
    duration: timeMs,
    timingFunction: easingFn,
    frameRate: fps
  })

  let totalAdvancement = 1;

  // set up callbacks for length calc

  pathShape.paths.forEach( path => {
    const fn = path.onDrawn || function(){};

    path.onDrawn = function(...args){
      
      totalAdvancement += path.totalCapturedLength;
      
      fn.apply(path, args);

      path.onDrawn = fn;
    }
  })

  function advancement(t, tDiff){
    // use esased tDiff to calculate length advancement, based on evenly precalculated length and time step
    // e.g. if normalTAdvancement -> normalLAdvancement
    const lAdvancement = tDiff/drawingCurrents.normalTAdvancement * drawingCurrents.normalLAdvancement;

    if(totalAdvancement >= drawingCurrents.totalLength){
      tRunner.stop();
      //console.log('DRAWN');
    }

    pathShape.currentPathPool.forEach( (path) => { 
      path.setProp('maxLength', path.maxLength += lAdvancement);
    });

  }

  // DISTORTION
  
  //allPointsGroup.forEach( point => snap.circle(...point, 1).attr({ fill: "green", stroke: "none" }) );
  if(settings.distort){
    const distortionK = settings.distortionK || -0.000001;
    const scale = settings.scale || 0.97;

    allJointsGroup.distort(distortionK, true).scaleIt(null, scale, true)
  }

  //allPointsGroup.forEach( point => snap.circle(...point, 1).attr({ fill: "red", stroke: "none" }) );

  // SNAP: PRESET FROM SNAP IF SET
  const presetSnapCenter = center;

  function presetFromSnap(path, snap){
    path.forAnchors( (anchor, i) => {
      const velocity = snap[i*2];
      const height = snap[i*2+1];
      //console.log('velocity, height', velocity, height);
      const newPoint = pointAtSegmentDistance(presetSnapCenter, anchor, height);

      anchor[0] = newPoint[0];
      anchor[1] = newPoint[1];
      anchor.velocity = velocity;
    });
  }

  if(settings.snap){
    allPaths.forEach( ({path, snap}) => {
      if(!snap) return;

      presetFromSnap(path, snap);
    })
  }

  // ROLL IN TRIGGERS
  const variable = settings.kickVariable;
  
  const chainTriggerInterval = settings.chainTriggerInterval || 500;
  const chainTriggerFrequency = settings.chainTriggerFrequency || 4000;
  
  const kicksCount = settings.kicksCount || 10;
  const kicksFrequency = settings.kicksFrequency || chainTriggerFrequency/2;

  function kick(){

    allPoints.forEach(point => {
        
        if(Math.random() > 0.3) return;

        point.velocity += Math.random() > 0.5
         ? Math.random() * -variable
         : Math.random() * variable
      });

  }

  function chainTrigger(){
   chainTriggerPoints(allPoints, chainTriggerInterval, variable); 
  }

  let kickInt, chainInt;

  function setTriggers(){
    chainTrigger();
    chainInt = setInterval(chainTrigger, chainTriggerFrequency);

    let count = 0;
    kickInt = setInterval(function(){
      kick()
      count++
      if(count == kicksCount) clearInterval(kickInt);
    }, kicksFrequency/2);
  }

  function killTriggers(){
    clearInterval(chainInt);
    clearInterval(kickInt);
  }

  function resetPlayback(){
    // reset to 0
    const startAt = 0;
    //allPaths.forEach(shape => shape.path.setProp('maxLength', shape.path.totalCapturedLength).update());
    allPaths.forEach(shape => shape.path.setProp('maxLength', startAt).update());
  }

  function playIn(){

    // roll in triggers
    setTriggers();

    // animate
    movement.play();
    tRunner.start();
  }
  
  // stop timeouts and interval loops before unmounting/dismissing instance
  function killOnOut(){
    killTriggers();
    movement.stop();
    tRunner.stop();

    //console.log('KILLING ON OUT', (shapefile&&shapefile.id), {s:stage})
  }

  const stage = {
    svg: svgEl,
    resetPlayback,
    playIn,
    killOnOut,
    pathShape,
    idIndex, 
    tRunner,
    calculateDrawingCurrents
  }

  return stage;
}

export default Shapefile;