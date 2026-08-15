import JointsControlGroup from "./JointsControlGroup";
import PathJoint from "./PathJoint";
import {
  getPointSector,
  pointsDistance,
  pointAtSegmentDistance
}  from "../utils/helpers.js";

const _getShiftDistance = function(point, center, distance=0, fraction=1){
  /* 
    assume sectors
    2 | 3   -- | +-     y
    -----   -------   x-|-+
    1 | 0   -+ | ++     +
  */

  const opp = point[0]-center[0];
  const adj = point[1]-center[1];
  
  const cs = getPointSector([opp, adj]);
  const hyp = Math.sqrt(adj*adj+opp*opp);
  const alpha = Math.atan( Math.abs(opp/adj) );
  const newHyp = (hyp+distance)*fraction;
  
  const shiftX = Math.sin(alpha)*(newHyp-hyp) * (cs % 3 ? -1 : 1);
  const shiftY = Math.cos(alpha)*(newHyp-hyp) * (cs > 1 ? -1 : 1);
  
  return [shiftX, shiftY];
}

export default class PointsGroup {
  
  constructor(...points){
    this.points = []
    this.center = [0,0]
    this.anchors = [0,1]; // see where anchor points are

    this.points.push(...points);
  }

  setProp(name, value){
    this[name] = value;
    return this;
  }

  setCenter(x, y){
    this.center[0] = x;
    this.center[1] = y;

    return this;
  }

  clone(){
    // declare new points arrray
    const newPoints = [];
    // copy each point
    this.forEach(point => {
      const newPoint = [...point];
      // carry over named values of the array
      Object.entries(point).forEach( ([name, value]) => {
        newPoint[name] = value
      })
      // store to new points
      newPoints.push(newPoint);
    })
    // declare new group with new points
    const newGroup = new PointsGroup(...newPoints);
    // set attributes based on current group omiting "points" prop
    Object.entries(this).forEach( ([name, value]) => {
      if(name == "points") return;
      newGroup.setProp(name, value);
    })

    return newGroup;
  }

  shift(x, y){
    this.points.forEach(point => {
      point[0] += x;
      point[1] += y;
    });

    return this;
  }

  scaleWAnchors(distance=0, fraction=1){
    const center = this.center;

    for (let i = this.anchors[0]; i < this.points.length; i+=this.anchors[1]) {
      const point = this.points[i];
      const jointPoints = [point];

      const currentDistance = pointsDistance(center, point);
      const newDistance = (currentDistance + distance)*fraction;
      const finalFraction = newDistance / currentDistance;

      if(this.anchors[1] > 1) {
        if(i+1< this.points.length){
          jointPoints.push(this.points[i+1]);
        }
        if(i>0){
          jointPoints.push(this.points[i-1]);
        }
      }

      //console.log('jointPoints', jointPoints, finalFraction);

      jointPoints.forEach( point => {
        const distance = pointsDistance(center, point);
        const newPoint = pointAtSegmentDistance(center, point, distance*finalFraction);

        //console.log(point, newPoint, finalFraction);

        point[0] = newPoint[0];
        point[1] = newPoint[1];
      })

    }

    return this;
  }

  scaleByAnchors(distance=0, fraction=1){
    const center = this.center;

    for (let i = this.anchors[0]; i < this.points.length; i+=this.anchors[1]) {
      const point = this.points[i];
      const handles = []; 

      if(this.anchors[1] > 1) {
        if(i+1< this.points.length){
          handles.push(this.points[i+1]);
        }
        if(i>0){
          handles.push(this.points[i-1]);
        }
      }
      
      const [shiftX, shiftY] = _getShiftDistance(point, center, distance, fraction);

      //console.log('shiftX', shiftX);
      //console.log('shiftY', shiftY);

      ([...handles,point]).forEach(p => {
        p[0] += shiftX;
        p[1] += shiftY;
      })
    }

    return this;
  }

  scale(distance=0, fraction=1){
    const center = this.center;

    this.points.forEach(point => {

      const [shiftX, shiftY] = _getShiftDistance(point, center, distance, fraction);
      
      point[0] += shiftX;
      point[1] += shiftY;

    })

    return this;
  }

  distort(konstant = 0.000002){

    const center = this.center;

    const k = konstant; //0.000002; // for a 500 0.000002/500 -> per pixel

    function distort(ru){
      const rd = ru*(1-k*Math.pow(ru,2));
      return rd;
    }

    this.points.forEach(point => {
      const ru = pointsDistance(center, point);
      const rd = distort(ru);
      const pointD = pointAtSegmentDistance(center, point, rd);

      point[0] = pointD[0];
      point[1] = pointD[1];
    })

    return this;
  }

  forEach(fn = function(){}){
    for(let i = 0; i < this.points.length; i++){
      fn(this.points[i],i)
    }
  }

  forAnchors(fn = function(){}){
    let count = 0;

    for (let i = this.anchors[0]; i < this.points.length; i+=this.anchors[1]) {
      fn(this.points[i], count++, i);
    }
  }

  mapAnchors(fn = a => a){
    const map = [];
    
    this.forAnchors( (anchor, i) => map.push(fn(anchor,i)) )

    return map;
  }

  forHandles(fn = function(){}){
    let count = 0;

    for (
      let i = 0;
      i < this.points.length; 
      i++) {

      if(i === this.anchors[0] || ( (i-this.anchors[0]) % this.anchors[1] ) === 0 ) continue;

      fn(this.points[i], count++, i);
    }
  }

  forHandlesWAnchors(fn = function(){}){
    let count = 0;

    for (
      let i = 0;
      i < this.points.length; 
      i++) {

      if(i == this.anchors[0] || !( (i-this.anchors[0]) % this.anchors[1] ) ) continue;

      // closest anchor if previous is anchor => previos, otherwise next
      const anchor = (i-1 == this.anchors[0] || !( (i-1-this.anchors[0]) % this.anchors[1] ) )
        ? this.points[i-1]
        : (i+1 == this.anchors[0] || !( (i+1-this.anchors[0]) % this.anchors[1] ) )
          ? this.points[i+1]
          : null;

      fn(this.points[i], count++, i, anchor);
    }
  }

  mapHandles(fn = h => h){
    const map = [];
    
    this.forHandles( (handle, i) => map.push(fn(handle, i)) )

    return map;
  }

  
}