import React, {useState, useRef, useEffect} from "react";

import styles from "./View/styles.module.css";

import UID from "../../utils/UID.js";

export function getNewArea(obj){
  return {
    id:UID(),
    left:null,
    top:null, 
    width:null, 
    height:null,
    ...obj
  }
}

export default ({
    reference, // up the tree reference
    onNewArea=(area)=>{ console.log('new area', area) }, // callback on newArea
    onAreaChanged=(area)=>{ console.log('area changed', area) },
    children,
    className,

    areas:passedAreas=[],
    constraints:passedContraints={}

  }) => {

  const blankRef = useRef();

  const areasContainerEl = reference||blankRef;
  const [renderTimestamp, setRenderTimestamp] = useState();

  const areasRef = useRef([]);

  const areas = passedAreas || areasRef;

  // current target box
  const target = useRef({});
  // object with current action to execute
  const action = useRef({
    fn: function(target, active, type){}
  });

  // active event coordinates set
  const active = useRef({
    sX: null, // start X, Y
    sY: null,
    cX: null, // current X, Y
    cY: null
  });

  // canvas area offset 
  const offset = useRef({
    x:0, y:0 
  });

  // reset to default
  function resetToDefault(){
    target.current = {};
    action.current.fn = actions.defaultFn;
  }

  // updating the offset
  function updateOffset(){
    // update canvas offset
    const bbox = areasContainerEl.current.getBoundingClientRect();
    offset.current.x = bbox.x;
    offset.current.y = bbox.y;
  }
  
  // add new area
  function makeNewArea(){
    const newArea = getNewArea();

    areas.current.push(newArea);

    onNewArea(newArea, areas.current);

    return newArea;
  }

  // CANVAS EVENTS HANDLERS

  // capture onDown and render updates
  function onDown(){
    console.log('on down');
    setRenderTimestamp(Date.now());
  }

  // capture drap start event
  // reset offset and start / end points of active ref
  // trigget drag action of type start
  function onStart(e){
    // update offset
    updateOffset();

    const o = offset.current;
    const a = action.current;

    // refresh current active object
    active.current = {};

    // add start point
    const c = active.current;
    
    c.sX = e.clientX - o.x;
    c.sY = e.clientY - o.y;

    // add end point
    c.cX = c.sX;
    c.cY = c.sY;

    //console.log('started:', c);

    a.fn(target, c, 'start');
    setRenderTimestamp(Date.now());
  }

  // capture on finish event
  // reset action to default
  // trigget drag action of type finish
  function onEnd(e){
    const c = active.current;
    const a = action.current;
    console.log('finished. new area is:', active.current);

    a.fn(target, c, 'finish');

    onAreaChanged(target.current, areas.current);

    // reset action
    //resetToDefault();
    setRenderTimestamp(Date.now());
  }

  // capture drag event
  // update end point of active ref
  // trigger drap action of type every
  function onDrag(e){

    const c = active.current;
    const o = offset.current;
    const a = action.current;
    
    c.cX = e.clientX - o.x;
    c.cY = e.clientY - o.y;

    a.fn(target, c, 'every');
    
    //console.log('dragging', e.layerX, e.layerY, c);
    setRenderTimestamp(Date.now());
  }

  // ACTION TYPES

  const actions = {
    cornerResize: function(target, c, type){
      // set start to the opposite side and do draw function
      if(type =='start'){
        const g = target.current;
        // set start to the opposite side and do draw function
        switch(action.current.cornerName){
          case 'nw':
            c.sX = g.left + g.width;
            c.sY = g.top + g.height;
            break;
          case 'ne':
            c.sX = g.left;
            c.sY = g.top + g.height;
            break;
          case 'sw':
            c.sX = g.left + g.width;
            c.sY = g.top;
            break;
          case 'se':
            c.sX = g.left;
            c.sY = g.top;
            break;
        }
      }

      actions.drawTarget(target, c, type)
    },
    sideResize: function(target, c, type){
      const g = target.current;

      // set start to the opposite
      if(type == 'start'){
        switch(action.current.sideName){
          case 'n':
            c.sY = g.top + g.height;
            break;
          case 's':
            c.sY = g.top;
            break;
          case 'w':
            c.sX = g.left + g.width;
            break;
          case 'e':
            c.sX = g.left;
            break;
        }
      }
      
      // draw horizontaly or vertically
      switch(action.current.sideName){
        case 'n':
        case 's':
          g.top = Math.min(c.sY, c.cY);
          g.height = Math.abs(c.sY - c.cY);
          break;
        
        case 'w':
        case 'e':
          target.current.left = Math.min(c.sX, c.cX);
          target.current.width = Math.abs(c.sX - c.cX);
          break;
      }

    },
    dragTarget: function(target, c, type){
      // add refference point offset
      if(type == 'start'){
        c.startX = target.current.left;
        c.startY = target.current.top;
      }

      target.current.left = c.startX + (c.cX - c.sX);
      target.current.top = c.startY + (c.cY - c.sY);
    },

    drawTarget: function(target, c, eventType){
      if(eventType == 'start'){
        // preserve aspect ratio
        target.current.wbyh = (target.current.width||1)/(target.current.height||1);
      }
      // lock proportions
      if(contraints.current['Shift']||contraints.current.preserveAspectRatio){
        
        target.current.left = Math.min(c.sX, c.cX);
        target.current.width = Math.abs(c.sX - c.cX);
        target.current.height = Math.abs(c.sX - c.cX)/target.current.wbyh;

        target.current.top = c.sY > c.cY ? c.sY - target.current.height : c.sY;
      }
      // default
      else {
        target.current.left = Math.min(c.sX, c.cX);
        target.current.top = Math.min(c.sY, c.cY);
        target.current.width = Math.abs(c.sX - c.cX);
        target.current.height = Math.abs(c.sY - c.cY);
      }
      
    },
    // draw make new target and draw it
    defaultFn: (target, c, eventType) => {
      switch(eventType){
        case 'finish':
          // nada
          // target.current = {}
          break;

        case 'start':
          // create new target
          const newTarget = makeNewArea();
          target.current = newTarget;
        default:
          actions.drawTarget(target, c, eventType);
          break;
      }
    }
  }
   

  // SETUP
  // hook event listeners to canvas on stage; 
  // make sure object is destroyed on out
  const hookAreaTrigger = function(){
    const el = areasContainerEl.current;

    let down = false;
    let first = true;
    let lastE = null;

    el.addEventListener('mousedown', () => { down = true; onDown(); })
    el.addEventListener('mouseup', () => { down = false; onEnd(lastE); lastE=null; first = true; })
    el.addEventListener('mousemove', (e) => {

      if(down){
        if(first){
          first = false;
          onStart(e);
        }
        else {
          onDrag(e);
          lastE = e;
        }
      }

    })

    // kill on exit
    return el.remove;
  }
  const contraints = useRef({
    preserveAspectRatio: false, // locks aspect ratio to
    ...passedContraints
  });

  const hookButtonsTrigger = function(){
    window.onkeydown = function(e){
      //console.log('key down', e)

      switch(e.key){
        case 'Shift':
          contraints.current['Shift'] = true;
          break;
        default: 
          break;
      }
    }
    window.onkeyup = function(e){
      
      switch(e.key){
        case 'Shift':
          contraints.current['Shift'] = false;
          break;
        default: 
          break;
      }
    }
  }

  // initialize on enter
  useEffect(hookAreaTrigger, []);
  useEffect(hookButtonsTrigger, []);

  // reset action to default
  useEffect(resetToDefault,[]);

  return (

    <div
      ref={areasContainerEl} 
      className={(className||'')+' '+styles.areasDrawContainer}
      onMouseDown={ e => {
        //console.log('box area down');
        target.current = {}; // only return not null if draged 
        action.current.fn = actions.defaultFn;
      }}>

      {children}

      {areas.current.map( area => (
        <div
          key={area.id}
          onMouseDown={ e => {
            //console.log('box down');
            e.stopPropagation();
            target.current = area; 
            action.current.fn = actions.dragTarget;
          }}
          className={styles.areaBox+' '+(target.current.id == area.id ? styles.activeAreaBox : '')} 
          style={{
            left: area.left + 'px',
            top: area.top + 'px',
            width: area.width + 'px',
            height: area.height + 'px'
          }}>

          {(['nw', 'ne', 'sw', 'se']).map(cornerName => (
            <span
              key={cornerName} 
              className={styles.corner+' '+(styles['corner-'+cornerName])+' '+(action.current.cornerName == cornerName ? styles.active : '')} 
              onMouseDown={ e => {
                e.stopPropagation();
                target.current = area; 
                action.current.fn = actions.cornerResize; 
                action.current.cornerName = cornerName;

                console.log('corner down', cornerName, target, action);
              }}/>
            )
          )}

          {(['n', 'e', 's', 'w']).map(sideName => (
            <span
              key={sideName} 
              className={styles.side+' '+(styles['side-'+sideName])+' '+(action.current.sideName == sideName ? styles.active : '')} 
              onMouseDown={ e => {
                e.stopPropagation();
                target.current = area; 
                action.current.fn = actions.sideResize; 
                action.current.sideName = sideName; 

                console.log('side down', sideName, target, action, actions.sideResize); 
              }}/>
            )
          )}

        </div>
      ))}

    </div>
  )
}