import CubicBezierPath from "./CubicBezierPath";
import CubicBezierPathShape from "./CubicBezierPathShape";

const SUPER = new CubicBezierPath();

export default class CubicBezierPathTiming extends CubicBezierPathShape{

  constructor(...args){
    super();
    this.curves = [];
    this.pushCurves(...args);

    this.parentProto = SUPER;
  }

  pushCurves(...args){
    const proto = this.parentProto;
    
    proto.pushCurves.apply( this, args );

    this.onChange();
  }

  onChange(){

    const {curves} = this;

    this.captureCurvesLength();

    this.start = this.curves[0]['p0'];
    this.end = this.curves[this.curves.length-1]['p3'];

    let highest = null,
        lowest = null;

    curves.forEach( curve => {

      [curve.p0, curve.p3, ...curve.getExP()].forEach(point => {

        if(point[1] > highest || highest == null) highest = point[1];
        if(point[1] < lowest || lowest == null) lowest = point[1];

      })

    })

    this.dimentions = {
      x: Math.abs(this.start[0] - this.end[0]),
      y: Math.abs(highest-lowest),
    }

    this.highest = highest;
    this.lowest = lowest;
  }

  getYatX(X){
    if(X<this.start[0]) return null;
    if(X>this.end[0]) return null;

    const {curves} = this;

    let targetCurve;

    for (let i = 0; i < curves.length; i++) {
      targetCurve = curves[i];
      
      if(X<=targetCurve.p3[0]){
        break;
      }
    }

    //console.log('X, targetCurve', X, targetCurve);

    return targetCurve.getYAtX(X);
  }

  getTatT(t){
    const X = this.start[0] + (this.end[0]-this.start[0])*t;
    const Y = this.getYatX(X);

    //console.log('X, Y', X, Y);

    //window.paper.circle(X, Y, 4).attr({ fill: 'white' });

    // inverted, since computer's 0 is top left 
    return 1-(Y - this.lowest)/(this.dimentions.y)
  }

}