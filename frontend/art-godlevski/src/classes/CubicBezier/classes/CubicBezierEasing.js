import CubicBezier from "./CubicBezier";

export default class CubicBezierEasing {

  constructor(p1x,p1y,p2x,p2y){
    
    this.curve = null;

    this.lib = {
      "ease": [.25,.1,.25,1],
      "linear": [0,0,1,1],
      "ease-in": [.42,0,1,1],
      "ease-out": [0,0,.58,1],
      "ease-in-out": [.42,0,.58,1]
    }

    if(typeof p1x === 'string'){
      this.pushString(p1x)
    }
    else {
      this.pushPoints(p1x,p1y,p2x,p2y)
    }

  }

  easing(t){
    return t >=1 ? 1 : t <=0 ? 0 : this.curve.getXAtY(t);
  }

  pushPoints(p1x,p1y,p2x,p2y){
    this.curve = new CubicBezier([0,0],[p1x,p1y],[p2x,p2y],[1,1])
  }

  pushString(string){
    const bezier = /^cubic-bezier\(([\-\d\.\,]+)\)/gi.exec(string);
    const preset = this.lib[string];
    const points = [];

    if(bezier){
      bezier[1].split(',').forEach( t => points.push(t*1) )
    }
    else if(preset){
      points.push(...preset)
    }

    this.pushPoints(...points)

  }

}
