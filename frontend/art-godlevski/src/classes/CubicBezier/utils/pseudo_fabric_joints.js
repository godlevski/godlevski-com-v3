import {
  getPointSector,
  pointsDistance,
  circlesIntersect,
  pointAtSegmentDistance} from "./helpers.js";

/*
  Example usage:
  
  controls.onChange = (joint, pointName) => {

    //console.log(joint, pointName);
    const joints = controls.controlJoints;
    const jointIndex = joints.indexOf(joint);

    adjustMiddleJoints(joints.slice(0, jointIndex+1), ties.slice(0,jointIndex))
    adjustMiddleJoints(joints.slice(jointIndex), ties.slice(jointIndex))
    
    shape.update();
    controls.stageControls();

  };

*/

const step = function(mount, target, anchor, handle, tie, joint, mountJ){
  const targetLength = pointsDistance( target, anchor );
  const handleLength = pointsDistance( handle, anchor );
  const minAnchorDist = tie + targetLength - targetLength *0.001;
  let shouldUpdate = false;

  /*console.log(joint, mountJ);
  console.log(pointsDistance(mount, anchor) > tie + targetLength, pointsDistance(mount, target) > tie)
  */
  stage.clear();

  if( pointsDistance(mount, anchor) > minAnchorDist ){
  
    const newAnchor = pointAtSegmentDistance( mount, anchor, minAnchorDist );

    anchor[0] = newAnchor[0];
    anchor[1] = newAnchor[1];

    shouldUpdate = true
  
  /*  const newTarget = pointAtSegmentDistance( newAnchor, mount, targetLength );
    const newHandle = pointAtSegmentDistance( newTarget, newAnchor, targetLength + handleLength );
    
    const {stage} = window;

    stage.circle(...newAnchor, 4).attr({fill: "yellow"});
    stage.circle(...newTarget, 4).attr({fill: "cyan"});
    stage.circle(...newHandle, 4).attr({fill: "red"});

    console.log('New Points',newAnchor,
newTarget,
newHandle);

    target[0] = newTarget[0];
    target[1] = newTarget[1];

    anchor[0] = newAnchor[0];
    anchor[1] = newAnchor[1];

    handle[0] = newHandle[0];
    handle[1] = newHandle[1];
  */
  }
  
  if( shouldUpdate || pointsDistance(mount, target) > tie ){

    const intersect = circlesIntersect(mount, tie, anchor, targetLength);
    
    if(!intersect) return;

    const newTarget = pointsDistance( intersect[0], target ) < pointsDistance( intersect[1], target )
      ? intersect[0]
      : intersect[1];

    if(!newTarget[0]) return;

    const newHandle = pointAtSegmentDistance( newTarget, anchor, targetLength + handleLength );

    /*console.log('New ~ISH Points ',newTarget,
newHandle, intersect);*/

    target[0] = newTarget[0];
    target[1] = newTarget[1];

    handle[0] = newHandle[0];
    handle[1] = newHandle[1];
  }
  // check distance 
  //   if to far -> move center & rotate handles
  // else rotate target and handle

}

export const adjustJoint = function(prevJoint, joint, tie, isforward=true){
  
  if(isforward ){
    step(prevJoint["handleF"], joint["handleB"], joint["anchor"], joint["handleF"], tie, joint, prevJoint);
  }
  
  if(!isforward){
    step(prevJoint["handleB"], joint["handleF"], joint["anchor"], joint["handleB"], tie, joint, prevJoint);
  }
  
}

export const adjustMiddleJoints = function(joints, ties, reverse = false, mountstart=true, mountfinish=true){

  const round = function(){
    // run step function 
    // though every, but first and last points in the slice
    const def_tie = 100;

    //console.log(joints);
    if(!reverse){
      // start to finish
      for (let i = 1; i < joints.length-1; i++) {
        const tie = ties ? ties[i-1] : def_tie;
        //console.log(tie);
        adjustJoint( joints[i-1], joints[i], 150, true)
      }
      // include end point unless omitted
      if(!mountfinish){
        const tie = ties ? ties[ties.length-1] : def_tie;
        adjustJoint( joints[joints.length-2], joints[joints.length-1], 150, true)
      }
    }
    else {
      // finish to start
      for (let i = joints.length-2; i > 0; i--) {
        const tie = ties ? ties[i] : def_tie;
        adjustJoint( joints[i+1], joints[i], 150, false)
      }
      // include start point unless omited
      if(!mountstart){
        const tie = ties ? ties[0] : def_tie;
        //console.log(tie);
        adjustJoint( joints[1], joints[0], 150, false)
      }
    }
    
  }
 
  // invoke round
  round();
}