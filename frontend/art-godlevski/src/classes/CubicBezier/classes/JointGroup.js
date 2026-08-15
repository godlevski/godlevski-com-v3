import PathJoint from "./PathJoint";
import {
  getPointSector,
  pointsDistance,
  pointAtSegmentDistance,
  pointAtSegmentT,
  pointToLineIntP
 }  from "../utils/helpers.js";

export default class JointsGroup {

  constructor(...joints){
    this.joints = []
    this.center = [0,0]

    this.pushJoints(...joints);
  }

  pushJoints(...js){

    const {joints} = this;

    js.forEach( source => {
      const joint = source instanceof PathJoint 
              ? source
              : new PathJoint(source);
      
      joints.push(joint);
      
    });

    return this;
  }

  clone(){
    const newJoints = [];

    this.forEach( joint => {
      const newJoint = new PathJoint({
        handleF: joint.handleF ? [...joint.handleF] : null,
        handleB: joint.handleB ? [...joint.handleB] : null,
        anchor: joint.anchor ? [...joint.anchor] : null
      });

      newJoints.push(newJoint);
    })

    const newGroup = new JointsGroup(...newJoints);
    
    // set attributes based on current group omiting "points" prop
    Object.entries(this).forEach( ([name, value]) => {
      if(name == "joints") return;
      newGroup.setProp(name, value);
    })

    return newGroup;
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

  shift(x, y){
    this.forAllPoints(point => {
      point[0] += x;
      point[1] += y;
    });

    return this;
  }

  _getShiftDistance(anchor, center, distance=0, fraction=1){
    
    
    // return [
    //   anchor[0] - targetPoint[0], 
    //   anchor[1] - targetPoint[1]
    //   ];
  }

  getCentrallyMappedJoints(){
    
    if(this.joints.length < 2) {
      return {
        high: [this.joints[0]],
        low: [this.joints[0]]
      }
    }

    let prevHeight = pointsDistance(this.center, this.joints[1].anchor);
    const high = [];
    const low = [];

    this.joints.forEach((joint,i,joints) => {

      const height = pointsDistance(this.center, joint.anchor);

      if(prevHeight > height){
        low.push(joint);
      }
      else if(prevHeight < height) {
        high.push(joint);
      }

      prevHeight = height;
    });

    return {
      high,
      low
    }
  }

  distort(konstant=-0.000001, anchorsOnly=false){
    const center = this.center;

    const k = konstant; //0.000002; // for a 500 0.000002/500 -> per pixel

    function distort(ru){
      const rd = ru*(1-k*Math.pow(ru,2));
      return rd;
    }

    function adjust(point, scale){
      const pointD = pointAtSegmentT(center, point, scale);

      point[0] = pointD[0];
      point[1] = pointD[1];
    };

    this.forEach(joint => {

      const ru = pointsDistance(center, joint.anchor);
      const rd = distort(ru);

      const scale = ru/rd;

      if(!anchorsOnly){
        joint.forEach( point => adjust(point, scale))
      }
      else {
        adjust(joint.anchor, scale)
      }
      
    })

    return this;
  }

  scaleIt(distance=0, fraction=1, anchorsOnly=false){
    const center = this.center;

    this.joints.forEach(joint => {
      /* 
        assume sectors
        2 | 3   -- | +-     y
        -----   -------   x-|-+
        1 | 0   -+ | ++     +


      */
      
      const length = pointsDistance(joint.anchor, center);
      const scale = distance ? (length + distance) / length : fraction;

      const targetPoint = pointAtSegmentT(center, joint.anchor, scale);
      
      joint.anchor[0] = targetPoint[0];
      joint.anchor[1] = targetPoint[1];  

      if(joint.handleB && !anchorsOnly){
        const handleB = pointAtSegmentT(center, joint.handleB, scale );  
        joint.handleB[0] = handleB[0];
        joint.handleB[1] = handleB[1];
      }

      if(joint.handleF && !anchorsOnly){
        const handleF = pointAtSegmentT(center, joint.handleF, scale );  
        joint.handleF[0] = handleF[0];
        joint.handleF[1] = handleF[1];
      }

    })

    return this;
  }

  forEach(fn){
    this.joints.forEach((joint, i) => {
      fn(joint, i)
    })
  }

  forAllPoints(fn= function(){}){
    this.joints.forEach((joint) => {
      if(joint.handleB) fn(joint.handleB)
      if(joint.anchor) fn(joint.anchor)
      if(joint.handleF) fn(joint.handleF)
    })
  }

  forAnchors(fn= function(){}){
    this.joints.forEach((joint, i) => {
      if(joint.anchor) fn(joint.anchor, i)
    })
  }

  forHandles(fn = function(){}){
    this.joints.forEach((joint, i) => {
      if(joint.handleF) fn(joint.handleF, i)
      if(joint.handleB) fn(joint.handleB, i)
    })
  }

  // -- CATMULL ROM IMPLEMENTATION or relative handles
  // this calculates catmul rom handles for current anchor alignment
  // compares it to stored default catmull rom values
  // and applys calculated offset to handles

  // imagine you have some handles alignment to go with your points, its coming from source path or else
  // then you calculate catmul rom for this normal position and store offsets (x and y difference of catmull handles versus ones you have)
  // then you move your anchors in space, and want your handles to adjust to your movement
  // so you calculate catmul rom again, see what changed in catmulls and apply similar change to your handles

  // returns catmulRomHandles
  getCatmullRomHandles(tension=0.5, pair=true){
    const tens = tension * 12;
    const {joints} = this;
    
    const handlePairs = [];
    
    for (let i = 0; i < joints.length - 1; i++) {
      const i0 = joints[ i-1 >= 0 ? i-1 : i ].anchor;
      const i1 = joints[ i ].anchor;
      const i2 = joints[ i + 1 ].anchor;
      const i3 = joints[ i + 2 < joints.length ? i + 2 : i + 1].anchor;

      /*const handleF = [
        (-i0[0] + i1[0] * tens + i2[0]) / tens,
        (-i0[1] + i1[1] * tens + i2[1]) / tens
      ];

      const handleB = [
        (i1[0] + i2[0] * tens - i3[0]) / tens,
        (i1[1] + i2[1] * tens - i3[1]) / tens
      ];
      the same as:
      */

      const handleF = [
        i1[0] + ( i2[0]-i0[0] )/tens,
        i1[1] + ( i2[1]-i0[1] )/tens
      ];

      const handleB = [
        i2[0] - ( i3[0]-i1[0] )/tens,
        i2[1] - ( i3[1]-i1[1] )/tens
      ];

      handlePairs.push(pair ? [handleF, handleB] : handleF, handleB );
    }

    return handlePairs;
  }

  // accept function to run with catmullRome handles for each joint 
  forCatmullRomHandles(fn, tension=0.5, pair=true){
    const tens = tension * 12;
    const {joints} = this;

    const handlePairs = [];
    
    for (let i = 0; i < joints.length - 1; i++) {
      const i0 = joints[ i-1 >= 0 ? i-1 : i ].anchor;
      const i1 = joints[ i ].anchor;
      const i2 = joints[ i + 1 ].anchor;
      const i3 = joints[ i + 2 < joints.length ? i + 2 : i + 1].anchor;

      /*const handleF = [
        (-i0[0] + i1[0] * tens + i2[0]) / tens,
        (-i0[1] + i1[1] * tens + i2[1]) / tens
      ];

      const handleB = [
        (i1[0] + i2[0] * tens - i3[0]) / tens,
        (i1[1] + i2[1] * tens - i3[1]) / tens
      ];
      the same as:
      */

      const handleF = [
        i1[0] + ( i2[0]-i0[0] )/tens,
        i1[1] + ( i2[1]-i0[1] )/tens
      ];

      const handleB = [
        i2[0] - ( i3[0]-i1[0] )/tens,
        i2[1] - ( i3[1]-i1[1] )/tens
      ];

      //i1.catmullF = handleF;
      //i2.catmullB = handleB;

      if(fn){

        if(i==0){
          fn( joints[i], [...joints[i].anchor], handleF);
        }
        else {
          fn( joints[i], handlePairs[handlePairs.length-1], handleF);
        }
        
        if(i == joints.length - 2){
          fn(joints[ i+1 ], handleB, handleF);
        }
      }

      handlePairs.push(handleF, handleB);
    }

    return handlePairs;
  }

  // calculate and save current catmullRom offset relative to actual joints values
  preserveCatmullRomOffset(){
    this.forCatmullRomHandles( (joint, catmullB, catmullF) => {
    
      const handleB = joint.handleB || [], 
            handleF = joint.handleF || [];

      handleB['catmullOffset'] = [
        handleB[0]-catmullB[0],
        handleB[1]-catmullB[1]
      ]

      handleF['catmullOffset'] = [
        handleF[0]-catmullF[0],
        handleF[1]-catmullF[1]
      ]

    });

    return this;
  }

  // adjusts handles positions by preserves catmullRome offsets
  adjustJointHandlesByCatmullRomOffset(){
    this.forCatmullRomHandles( (joint, catmullB, catmullF) => {
      
      const {anchor} = joint;
      const handleB = joint.handleB;
      const handleF = joint.handleF;

      if(handleB){
        handleB[0] = catmullB[0] + handleB['catmullOffset'][0];
        handleB[1] = catmullB[1] + handleB['catmullOffset'][1];
      }

      if(handleF){
        handleF[0] = catmullF[0] + handleF['catmullOffset'][0];
        handleF[1] = catmullF[1] + handleF['catmullOffset'][1];
      }

      if(!handleB||!handleF) return;

      // bring this segment to cross the anchor
      // find perpendicular intersect with line
      const int = pointToLineIntP(anchor, handleB, handleF)
      
      const ox = anchor[0]-int[0];
      const oy = anchor[1]-int[1];

      if(isNaN(ox)||isNaN(oy)){
        console.warn('int, handleB, handleF, ox, oy, anchor, handleB, handleF', int, joint, ox, oy, anchor, handleB, handleF);
        return;
      }
      // apply to Handles
      handleB[0] += ox;
      handleB[1] += oy;

      handleF[0] += ox;
      handleF[1] += oy;

    });
  }

}