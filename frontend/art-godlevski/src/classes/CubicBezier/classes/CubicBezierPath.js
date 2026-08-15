import CubicBezier from "./CubicBezier";

import SvgArcToCubicBezier from "../assets/SvgArcToCubicBezier.js";
import {svgpathcurvesToValues} from "../utils/svgpathcurveToPoints.js";

export default class CubicBezierPath {

  constructor(...curves){

    this.z = false
    this.curves = []

    this.curvesLengthCaptured = false;
    this.totalCapturedLength = null;
    
    this.pushCurves(...curves);
    
  }

  copy(){
    const newCurves = this.curves.map( curve => curve.copy() );
    return new CubicBezierPath(newCurves);
  }

  /* Import Export operations */
  pushCurves(...curves){
    let prevCurve = this.curves[this.curves.length-1];

    curves.forEach(curve => {
      
      let instanceCurve;

      if(curve instanceof CubicBezier){
        instanceCurve = curve.copy();
      }
      else if(Array.isArray( curve )){
        instanceCurve = new CubicBezier(...curve);
      }

      // make sure points are the same array instances
      if(prevCurve){
        instanceCurve.p0 = prevCurve.p3;
      };

      prevCurve = instanceCurve;

      this.curves.push( instanceCurve );
    })

    return this;
  }

  pushWeights(anchorWeightsMap=[]){
    this.forAnchors( (anchor, i) => {
      anchor.weight = anchorWeightsMap[i];
    });
    if(anchorWeightsMap.length) this._weighted = true;
    return this;
  }

  pushPathString(pathstring){
    const string = pathstring.replace(',',' ').replace(/\s{0,}([a-z])\s{0,}/gi, '$1').replace(/\s+/g, ',')
      
    //const [base] = string.match(/M[\d\.\-\,]*/g) || [null];
    //const start = (base+'').replace('M', '').split(',').map(n => n*1);
    const curveStrings = string.match(/[mcsalhv][\d\.\-\,]*/gi) || [];
    
    const curves = [];

    let prevBase = [0,0];
    let prevLast = prevBase;

    let count = 0;

    //console.warn('string is', string);

    curveStrings.forEach(string => {

      const [type] = string.match(/^[a-z]/gi) || [];
      // if letter is lowercase -> its relative
      let isRelative = type.match(/[mcsalhv]/) ? true : false;

      const lowercaseType = (type+'').toLowerCase()

      const points = string
              // replace number[minus sign]number to number,-number
              .replace(/(\d)\-/g, '$1,-')
              // reaplace decimal[dot]number to descimal,0.number
              .replace(/(\.\d+)\./g,'$1,0.')
              .replace(/[mcsalhv]/gi, '')
              .split(',')
              .map(n => n*1);

      //console.log('--- string', string);

      // its a move tag 
      if(lowercaseType == 'm'){
        // move prevlast
        prevLast[0] = (isRelative ? prevLast[0] : 0) + points[0];
        prevLast[1] = (isRelative ? prevLast[1] : 0) + points[1];

        // add line to commands
        for(let i=2;i<points.length;i+=2){
          const point = [
            (isRelative ? prevLast[0] : 0) + points[i],
            (isRelative ? prevLast[1] : 0) + points[i+1]
          ];

          curves.push( new CubicBezier(prevLast, prevLast, point, point) );

          prevLast = point;
        }

        prevBase = prevLast;

      } 
      // ITS A CURVE
      else if(lowercaseType === "s"||lowercaseType === "c"||lowercaseType === "a"){


        // rewrite points values if curve is an arc
        // arc values are relative to each other recusively, 
        // in addition to the first point being relative to previous curve
        if(lowercaseType == 's'){
          const cubicPoints = [];
          
          const prevCurve = curves[curves.length-1];

          let prevHandle = prevCurve ? prevCurve.p2 : prevLast;
          let prevAnchor = prevCurve ? prevCurve.p3 : prevLast;

          let base = isRelative
                 ? [0,0]
                 : prevAnchor

          //if(!prevCurve) return; // add in conditions if prev curve doesnt exist

          //console.log('string, points', string, points);

          for (let i = 0; i < points.length; i+=4) {

            const newHandleX = base[0] + -1*(prevHandle[0]-prevAnchor[0]);
            const newHandleY = base[1] + -1*(prevHandle[1]-prevAnchor[1]);

            const handleX = points[i];
            const handleY = points[i+1];

            const anchorX = points[i+2];
            const anchorY = points[i+3];

            cubicPoints.push(
              // derived handle
              newHandleX, newHandleY,
              // given handle
              handleX, handleY,
              // given anchor
              anchorX, anchorY
              );
            
            prevHandle = [handleX, handleY];
            prevAnchor = [anchorX, anchorY];
            
            // update if anchor is not relative
            if(!isRelative){
              base = [
                anchorX,
                anchorY];
            }

          }

          //console.log('>>>>> '+points.length+' points', points);
          //console.log('>>>>> '+cubicPoints.length+' new points', cubicPoints);
          
          points.splice(0, points.length, ...cubicPoints);
          
        }
        else if(lowercaseType == 'a'){
          const values = [];
          const localPrevLast = [...prevLast];

          //console.warn('its an arc', string, points, curveStrings);

          for(i=0;i<points.length; i+=7){
            const [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = points.slice(i,i+7);

            const options = {
              px: localPrevLast[0],
              py: localPrevLast[1],
              cx: x + (isRelative ? localPrevLast[0] : 0),
              cy: y + (isRelative ? localPrevLast[1] : 0),
              rx,
              ry,
              xAxisRotation,
              largeArcFlag,
              sweepFlag,
            }

            const svgpathCurves = SvgArcToCubicBezier(options);

            values.push(...svgpathcurvesToValues(svgpathCurves));

            //console.log('options, svgpathCurves, values, localPrevLast', isRelative, points, options, svgpathCurves, values, [...localPrevLast]);
            
            localPrevLast[0] = values[values.length-2];
            localPrevLast[1] = values[values.length-1];
          }
          
          //console.log('curves.length, curves', curves.length, curves);

          points.splice(0, points.length, ...values);
          isRelative = false; 
        }

        // rewrite point values if passage is a line
        for (var i = 0; i < points.length; i+=6) {
          const curve = [];

          const p0 = prevLast;
          const p1 = [
            isRelative ? points[i+0]+prevLast[0]-0.000000001 : points[i+0], 
            isRelative ? points[i+1]+prevLast[1]-0.000000001 : points[i+1]];

          const p2 = [
            isRelative ? points[i+2]+prevLast[0]-0.000000001 : points[i+2], 
            isRelative ? points[i+3]+prevLast[1]-0.000000001 : points[i+3]];

          const p3 = [
            isRelative ? points[i+4]+prevLast[0]-0.000000001 : points[i+4], 
            isRelative ? points[i+5]+prevLast[1]-0.000000001 : points[i+5]];

          // ***** -0.000000001 is for some odd effect where i had prevLast[0] = 144.15999999999997 and points[i+0] -> 30 
          // it would return 144.15999999999997 for the plus operation
          //console.log('p0, p1, p2, p3', prevLast[0], (prevLast[0]-0.000000001+30), points[i+0], points[i+0]+prevLast[0] );

          //console.log( (++count) +' points are:', p0, p1, p2, p3);
          //console.log( (count) +' source is:', points[i+0], points[i+1], points[i+2], points[i+3], points[i+4], points[i+5]);

          prevLast = p3;
          //console.log('points are', p0, p1, p2, p3);

          curves.push( new CubicBezier(p0, p1, p2, p3) );
          
        }
        
      }
      
      // ITS A LINE -> CONVERT TO CURVE
      else if (lowercaseType === "l"){
        for(let i = 0; i < points.length; i+=2){
          const newEndPoint = [
            isRelative ? points[i]+prevLast[0]-0.000000001 : points[i],
            isRelative ? points[i+1]+prevLast[1]-0.000000001 : points[i+1]];

          const p0 = prevLast;
          const p1 = [...prevLast];
          const p2 = [...newEndPoint];
          const p3 = newEndPoint;

          prevLast = newEndPoint;

          //console.log('points', p0, p1, p2, p3);

          curves.push( new CubicBezier(p0, p1, p2, p3) );
        }

      }

      // ITS A HORIZONTAL FUCKING LINE -> CONVERT TO CURVE
      else if (lowercaseType === "h"){
        const newEndPoint = [
          isRelative ? points[0]+prevLast[0]-0.000000001 : points[0],
          prevLast[1]
        ];

        const p0 = prevLast;
        const p1 = [...prevLast];
        const p2 = [...newEndPoint];
        const p3 = newEndPoint;

        prevLast = newEndPoint;

        curves.push( new CubicBezier(p0, p1, p2, p3) );
      }

      // ITS A VERTICAL FUCKING LINE -> CONVERT TO CURVE
      else if (lowercaseType === "v"){
        const newEndPoint = [
          prevLast[0],
          isRelative ? points[1]+prevLast[1]-0.000000001 : points[1],
        ];

        const p0 = prevLast;
        const p1 = [...prevLast];
        const p2 = [...newEndPoint];
        const p3 = newEndPoint;

        prevLast = newEndPoint;

        curves.push( new CubicBezier(p0, p1, p2, p3) );
      }



      prevBase = prevLast;

    });

    // equate last to first if path is closed
    if(string.match(/z/i)){
      this.z = true;
      curves[curves.length-1]["p3"] = curves[0]["p0"];
    }

    curves.forEach(curve => {
      this.curves.push(curve)
    });

    return this;
  }

  getPathString(){
    let d = '';
    const {curves} = this;

    if(!curves.length) return d;

    d += 'M'+curves[0]['p0'][0]+','+curves[0]['p0'][1];

    curves.forEach( curve => {

      d +=  'C'+  (curve['p1'][0]).toFixed(2)*1 +','+ (curve['p1'][1]).toFixed(2)*1 
            +','+ (curve['p2'][0]).toFixed(2)*1 +','+ (curve['p2'][1]).toFixed(2)*1 
            +','+ (curve['p3'][0]).toFixed(2)*1 +','+ (curve['p3'][1]).toFixed(2)*1 ;
    
    });

    return d;
  }

  getPathLineString_(){

    let d = '';
    const {curves} = this;

    if(!curves.length) return d;

    // move to zero
    d += 'M'+curves[0]['p0'][0]+','+curves[0]['p0'][1];

    for (let i = 0; i < curves.length; i++) {
      const curve = curves[i];

      d +=  'C'+  (curve['p1'][0]).toFixed(2)*1 +','+ (curve['p1'][1]).toFixed(2)*1 
            +','+ (curve['p2'][0]).toFixed(2)*1 +','+ (curve['p2'][1]).toFixed(2)*1 
            +','+ (curve['p3'][0]).toFixed(2)*1 +','+ (curve['p3'][1]).toFixed(2)*1 ;
    
    };

    // move to last point
    const lastPoint = curves[curves.length-1];

    const p3Weight = lastPoint['p3'].weight || 0;
    const p3Normale = lastPoint.getNormaleAtAnchor(p3Weight, 'p3');

    const p0Weight = lastPoint['p0'].weight || 0;
    const p0Normale = lastPoint.getNormaleAtAnchor(p0Weight, 'p0');

    //console.warn('p0Weight, p3Weight, \n p0Normale, \n p3Normale', `\n  `, p0Weight, p3Weight, `\n  `, p0Normale, `\n  `, p3Normale);
    
    //console.warn(p0Weight, p0Normale, p3Weight, p3Normale);

    d += 'L' + (lastPoint['p3'][0]+p3Normale[0]).toFixed(2)*1 + ',' + (lastPoint['p3'][1]+p3Normale[1]).toFixed(2)*1;

    // run through anchors in inverse
    for (let i = curves.length-1; i >= 0; i--) {
      const curve = curves[i];

      const p3Weight = curve['p3'].weight || 0;
      const p3Normale = curve.getNormaleAtAnchor(p3Weight, 'p3');
      
      let p0Weight, p0Normale;
      // get normale based on curve prior to last
      if(i>0){
        const nextCurve = curves[i-1];
        p0Weight = nextCurve['p3'].weight || 0;
        p0Normale = nextCurve.getNormaleAtAnchor(p0Weight, 'p3');
        //if(i == curves.length-1){ console.log('  -', i,'-  ', p0Weight, p0Normale, p3Weight, p3Normale) }
        //console.log('  -', i,'-  ', 'p0Weight, p3Weight, \n p0Normale, \n p3Normale', `\n  `, p0Weight, p3Weight, `\n  `, p0Normale, `\n  `, p3Normale);
      }
      // get normale based on last curve
      else {
        p0Weight = curve['p0'].weight || 0;
        p0Normale = curve.getNormaleAtAnchor(p0Weight, 'p0');
      }



      d += 'C'+ (curve['p2'][0]+p3Normale[0]).toFixed(2)*1 +','+ (curve['p2'][1]+p3Normale[1]).toFixed(2)*1
            +','+ (curve['p1'][0]+p0Normale[0]).toFixed(2)*1 +','+ (curve['p1'][1]+p0Normale[1]).toFixed(2)*1 
            +','+ (curve['p0'][0]+p0Normale[0]).toFixed(2)*1 +','+ (curve['p0'][1]+p0Normale[1]).toFixed(2)*1 
    
    };

    //d += 'z';

    //console.timeEnd("getPathString");

    return d;
  }

  getPathLineString(){

    let d = '';
    const {curves} = this;

    if(!curves.length) return d;

    function preserveNormales(curve, prevCurve){

      const p3Weight = curve['p3'].weight || 0;
      curve['p3'].normale = curve.getNormaleAtAnchor(p3Weight, 'p3');
      curve['p3'].normale[0] /= 2;
      curve['p3'].normale[1] /= 2;

      if(prevCurve){
        curve['p0'].normale = prevCurve['p3']['normale'];
      }

      else {
        const p0Weight = curve['p0'].weight || 0;
        curve['p0'].normale = curve.getNormaleAtAnchor(p0Weight, 'p0');
        curve['p0'].normale[0] /= 2;
        curve['p0'].normale[1] /= 2;
      }

    }

    // preserve normales for start curve 
    preserveNormales(curves[0]);

    // move to zero
    d += 'M'+(curves[0]['p0'][0]+curves[0]['p0']['normale'][0])+','+(curves[0]['p0'][1]+curves[0]['p0']['normale'][1]);

    for (let i = 0; i < curves.length; i++) {
      const curve = curves[i];

      preserveNormales(curve, curves[i-1]);

      d +=  'C'+  (curve['p1'][0]+curve['p0']['normale'][0]).toFixed(2)*1 +','+ (curve['p1'][1]+curve['p0']['normale'][1]).toFixed(2)*1 
            +','+ (curve['p2'][0]+curve['p3']['normale'][0]).toFixed(2)*1 +','+ (curve['p2'][1]+curve['p3']['normale'][1]).toFixed(2)*1 
            +','+ (curve['p3'][0]+curve['p3']['normale'][0]).toFixed(2)*1 +','+ (curve['p3'][1]+curve['p3']['normale'][1]).toFixed(2)*1 ;
    
    };

    // move to last point
    const lastCurve = curves[curves.length-1];

    

    //console.warn('p0Weight, p3Weight, \n p0Normale, \n p3Normale', `\n  `, p0Weight, p3Weight, `\n  `, p0Normale, `\n  `, p3Normale);
    
    //console.warn(p0Weight, p0Normale, p3Weight, p3Normale);

    d += 'L' + (lastCurve['p3'][0]-lastCurve['p3']['normale'][0]).toFixed(2)*1 + ',' + (lastCurve['p3'][1]-lastCurve['p3']['normale'][1]).toFixed(2)*1;

    // run through anchors in inverse
    for (let i = curves.length-1; i >= 0; i--) {
      const curve = curves[i];

      d += 'C'+ (curve['p2'][0]-curve['p3']['normale'][0]).toFixed(2)*1 +','+ (curve['p2'][1]-curve['p3']['normale'][1]).toFixed(2)*1
            +','+ (curve['p1'][0]-curve['p0']['normale'][0]).toFixed(2)*1 +','+ (curve['p1'][1]-curve['p0']['normale'][1]).toFixed(2)*1 
            +','+ (curve['p0'][0]-curve['p0']['normale'][0]).toFixed(2)*1 +','+ (curve['p0'][1]-curve['p0']['normale'][1]).toFixed(2)*1 
    
    };

    //d += 'z';

    //console.timeEnd("getPathString");

    return d;
  }

  // d at length

  getPathStringAtLength(length){
    const newCurvesPoll = this.getPathCurvesPollAtLength(length);

    return this.getPathString.call({curves: newCurvesPoll});
  }

  getPathStringAtLengthWPoll(length){
    const newCurvesPoll = this.getPathCurvesPollAtLength(length);

    return [this.getPathString.call({curves: newCurvesPoll}), newCurvesPoll];
  }

  getPathLineStringAtLength(length){
    const newCurvesPoll = this.getPathCurvesPollAtLength(length);

    return this.getPathLineString.call({curves: newCurvesPoll});
  }

  getPathLineStringAtLengthWPoll(length){
    const newCurvesPoll = this.getPathCurvesPollAtLength(length);

    return [this.getPathLineString.call({curves: newCurvesPoll}), newCurvesPoll];
  }

  

  captureCurvesLength(){

    const {curves} = this;
    const th = this;

    th.totalCapturedLength = 0;

    curves.forEach(curve => {
      curve.capturedLength = curve.getLengthGaussLegendre();
      th.totalCapturedLength += curve.capturedLength;
    })

    this.curvesLengthCaptured = true;

    return this;
  }

  getPathCurvesPollAtLength(targetLength=0, errorMargin=3){
    
    if(!this.curvesLengthCaptured){
      this.captureCurvesLength();
    }

    if(targetLength <= 0) return [];

    const {curves} = this;
    
    let totalLength = 0, newCurvesPoll =[];

    for (let i = 0; i < curves.length; i++) {
      const curve = curves[i];
      const newTotal = totalLength + curve.capturedLength;
      
      // if new over the search point => break
      if(targetLength > newTotal){
        newCurvesPoll.push(curve);
        totalLength = newTotal;
      }
      else {
        break;
      }
    }
    
    const missingLength = targetLength - totalLength;
    const targetCurve = curves[newCurvesPoll.length];

    if(!missingLength || !targetCurve) return newCurvesPoll;

    const targetCut = targetCurve.newCurveAtLength(missingLength, errorMargin);

    const middlePointRatio = missingLength/targetCurve.capturedLength;
    const middleWeight = targetCurve['p0'].weight + (targetCurve['p3'].weight - targetCurve['p0'].weight) * middlePointRatio;

    targetCut['p3'].weight = middleWeight;

    newCurvesPoll.push(targetCut);

    return newCurvesPoll;

  }

  /* Loop through points */
  forAnchors(fn = a => a, invert = false){
    const length = this.curves.length;
    const {curves} = this;

    if(!invert){
      for (let i = 0; i < curves.length; i++) {
        const curve = curves[i];
        fn( curve.p0, i, curve );
      }
      if(!this.z){
        fn( this.curves[length-1]['p3'], length, this.curves[length-1])
      }
    }
    else {
      for (let i = length-1; i >= 0; i--) {
        const curve = curves[i];
        fn( curve.p3, i+1, curve );
      }
      if(!this.z){
        fn( this.curves[0]['p0'], 0, this.curves[0])
      }
    }

  }

  /* Extract points operations */

  getAllEndPoints(){
    const points = [];

    this.curves.forEach( curve => {
      points.push(curve.p0)
    });

    if(!this.z){
      points.push( this.curves[this.curves.length-1]['p3'] )
    }

    return points;
  }

  getAllHandles(){
    const handles = [];

    this.curves.forEach( curve => {
      handles.push(curve.p1, curve.p2);
    });

    return handles;
  }

  getAllEndPointsAndHandles(){
    const points = [];

    this.curves.forEach( curve => {
      points.push( curve.p0, curve.p1, curve.p2 );
    })

    if(!this.z){
      points.push( this.curves[this.curves.length-1]['p3'] )
    }

    return points;
  }

  getAllJoints(mode='all'){
    const joints = [
    // handle of first point is 2nd handle of last point if closed
      { /*handleB: [...this.curves[0]['p0']], */
        anchor: this.curves[0]['p0'] }
    ];
    let point = 0;

    this.curves.forEach(curve => {
      joints[point]['handleF'] = curve.p1;

      point++;

      joints[point] = {
        handleB: curve.p2,
        anchor: curve.p3
      };
    })

    // if circled
    if( this.z 
        && this.curves.length > 1
        && this.curves[this.curves.length-1]['p3'][0] == this.curves[0]['p0'][0]
        && this.curves[this.curves.length-1]['p3'][1] == this.curves[0]['p0'][1]
        ){
      joints[0]['handleB'] = joints[point]['handleB'];
      joints.splice(point, 1);
    }
    else {
      //joints[point]['handleF'] = [...joints[point]['anchor']]
    }

    return joints;
  }


}