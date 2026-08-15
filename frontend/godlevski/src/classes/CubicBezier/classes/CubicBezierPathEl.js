import CubicBezierPath from "./CubicBezierPath";



export default class CubicBezierPathEl extends CubicBezierPath {

  constructor(...args){
    super(...args);
    //const {paper} = window;

    this.t = 1;
    this.center = [0,0];
    this.curvesLengthCaptured = false;

    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // callbacks
    // fires when visibly drawn curves poll change
    this.onVisiblePoll = function(poll, pollLength){}
    this.currentPollLength = null;
    this.lengthUsed = null;

    this.onDrawn = function(){}
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

  attr(obj){
    const {pathEl} = this;

    Object.entries(obj).forEach(([name, value]) => {
      const attributeName = name.replace(/([A-Z])/g, '-$1').toLowerCase();

      pathEl.setAttribute(attributeName, value);
    })

    return this;
  }

  update(){
    if(!this.pathEl) return;
    if(!this.curvesLengthCaptured) this.captureCurvesLength();

    const {t} = this;
    const useT = 
      t < 0 ? 0 
        : t > 1 ? 1
          : t;

    const length = this.maxLength !== undefined 
        ? this.maxLength
        : useT * this.totalCapturedLength;

    const useLength = length !== false && length !== NaN && length < this.totalCapturedLength;

    let d, curves;

    if(useLength){

      const [string, poll] = this._weighted
            ? this.getPathLineStringAtLengthWPoll(length)
            : this.getPathStringAtLengthWPoll(length);

      d = string;
      curves = poll;

      if(this.currentPollLength != poll.length){
        this.onVisiblePoll(poll, poll.length);
      }

      this.currentPollLength = poll.length;
      this.lengthUsed = true;
 
    }
    else {
      const string = this._weighted
            ? this.getPathLineString()
            : this.getPathString();

      d = string;

      if(this.lengthUsed){
        this.onVisiblePoll(this.curves, this.curves.length);
        this.onDrawn();
        this.lengthUsed = false;
      }
      
    }

    this.pathEl.setAttribute("d", d);

    return this;
  }

}