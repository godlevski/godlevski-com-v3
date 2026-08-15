// FABRIK IMPLEMENTATION

export const step = function(mount, point, length){
  // adjust point against 'mount point' 
  // by drawing a line from a mount point to an old point's position
  // and measuring segment length on it
  const projectedPoint = pointAtSegmentDistance( mount, point, length );

  // apply calculated values to mutable point array
  point[0] = projectedPoint[0];
  point[1] = projectedPoint[1];
}

// Adjust point's x,y coordinates using Forward and Backward Reaching Inverse Kinematics 
export default function adjustMiddlePoints(points, mountstart=true, mountfinish=true){

  const round = function(){
    // run step function 
    // though every, but first and last points in the slice

    // start to finish
    for (let i = 1; i < points.length-1; i++) {
      step( points[i-1], points[i], length )
    }
    // include end point unless omitted
    if(!mountfinish){
      step( points[points.length-2], points[points.length-1], length )
    }

    // finish to start
    for (let i = points.length-2; i > 0; i--) {
      step( points[i+1], points[i], length )
    }
    // include start point unless omited
    if(!mountstart){
      step( points[1], points[0], length )
    }
  }
  
  // invoke round
  round();

}