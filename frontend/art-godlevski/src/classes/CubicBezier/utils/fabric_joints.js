import {
  getPointSector,
  pointsDistance, 
  pointAtSegmentDistance}  from "./helpers.js";

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

export const step = function(mount, point, length){
  // adjust point against 'mount point' 
  // by drawing a line from a mount point to an old point's position
  // and measuring segment length on it
  const projectedPoint = pointAtSegmentDistance( mount, point, length );

  // apply calculated values to mutable point array
  point[0] = projectedPoint[0];
  point[1] = projectedPoint[1];
}

export const adjustJoint = function(prevJoint, joint, tie, isforward=true){
  
  const jointLength = pointsDistance(joint.handleB, joint.handleF);
  const jointAnchorToHandleFLength = pointsDistance(joint.anchor, joint.handleF);

  if(isforward && pointsDistance(prevJoint["handleF"], joint["handleB"]) > tie ){
    step(prevJoint["handleF"], joint["handleB"], tie);
    step(joint["handleB"], joint["handleF"], jointLength); 
  }
  
  if(!isforward && pointsDistance(prevJoint["handleB"], joint["handleF"]) > tie ){
    step(prevJoint["handleB"], joint["handleF"], tie);
    step(joint["handleF"], joint["handleB"], jointLength);
  }

  // adjust anchor
  const newAnchorPosition = pointAtSegmentDistance( joint["handleF"], joint["handleB"], jointAnchorToHandleFLength )
  
  joint.anchor[0] = newAnchorPosition[0];
  joint.anchor[1] = newAnchorPosition[1];
  
}


export const adjustMiddleJoints = function(joints, ties, mountstart=true, mountfinish=true){

  const round = function(){
    // run step function 
    // though every, but first and last points in the slice
    const def_tie = 100;

    //console.log(ties);

    // start to finish
    for (let i = 1; i < joints.length-1; i++) {
      const tie = ties ? ties[i-1] : def_tie;
      //console.log(tie);
      adjustJoint( joints[i-1], joints[i], tie, true)
    }
    // include end point unless omitted
    if(!mountfinish){
      const tie = ties ? ties[ties.length-1] : def_tie;
      adjustJoint( joints[joints.length-2], joints[joints.length-1], tie, true)
    }

    // finish to start
    for (let i = joints.length-2; i > 0; i--) {
      const tie = ties ? ties[i] : def_tie;
      adjustJoint( joints[i+1], joints[i], tie, false)
    }
    // include start point unless omited
    if(!mountstart){
      const tie = ties ? ties[0] : def_tie;
      //console.log(tie);
      adjustJoint( joints[1], joints[0], tie, false)
    }
  }
 
  // invoke round
  round();
}