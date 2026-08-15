import CubicBezierEasing from "./CubicBezierEasing";

export default class Iteration{
  
  constructor(fn=function(){}, playing, updateRate=50){
    this.updateRate = updateRate; //how often to iterate onFrame fn
    this.onFrame = fn; //function to run on ever iteration
    this.playing = playing || false; //playing status

    this.timeout = null;

    if(this.playing) this.play(); 
  }
  
  step(){
    if(this.playing){
      clearTimeout(this.timeout);
      this.onFrame();
      this.timeout = setTimeout(() => {
        this.step();
      }, this.updateRate)
    }

    return this;
  }

  play(){
    this.playing = true;
    this.step();

    return this;
  }

  stop(){
    this.playing = false;
    clearTimeout(this.timeout);

    return this;
  }
}

class Animation {

  constructor(fn=()=>{}, dur=1000, 
    { duration=null,
      // css language names
      timingFunction="linear",
      direction="normal",
      iterationCount=1,

      onFinish=()=>{},
      onStart=()=>{},
      onStop=()=>{},
      onPlay=()=>{},
      onFrame=null,

      frameRate=20
    }){

    const ifn = (...args) => this.onFrameRunner(...args);

    this.onFrame = onFrame||fn;
    
    this.onFinish = onFinish;
    this.onStart = onStart;

    this.onStop = onStop;
    this.onPlay = onPlay;

    this.iteration = new Iteration(ifn, false, 1000/frameRate);
    this.duration = duration != null ? duration : dur;

    this.setEasing(timingFunction); 
    
    this.direction = direction;
    this.iterationCount = iterationCount;

    // 
    this.inverse = false;

    // preserve preious t to calculate diff in t
    this.prevT = 0;
    this.startTime = null;
    this.elapsedTime = 0;
  }

  setEasing(easing){
    this.easingFn = new CubicBezierEasing(easing);
  }

  start(){

    this.currentIteration = 1;

    this.inverse = (
      this.direction == "reverse" ||
      this.direction == "alternate-reverse") ? true : false;

    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.onStart();
    this.onPlay();
    this.iteration.play();

    return this;
  }

  play(){
    this.onPlay();
    this.iteration.play();

    return this;
  }

  // this stops iterator variables
  pause(){
    this.onStop();
    this.iteration.stop();

    return this;
  }

  // this drops elapsedTime to zero
  stop(){
    this.onStop();
    this.elapsedTime = 0;
    this.iteration.stop();

    return this;
  }

  resume(){
    // this will need to finish
    this.startTime = Date.now()-this.elapsedTime;

    this.onPlay();
    this.iteration.play();

    return this;
  }

  jumpTo(tToApply){
    const tDiff = tToApply - this.prevT;

    this.onFrame(tToApply, tDiff);

    return this;
  }

  onFrameRunner(){
    const now = Date.now();
    const elapsedTime = (now - this.startTime);
    const T = elapsedTime/this.duration;
    const t = this.easingFn.easing(T);

    const tToApply = this.inverse ? 1 - t : t;
    const tDiff = tToApply - this.prevT;

    this.prevT = tToApply;
    this.elapsedTime = elapsedTime;

    if(T >= 1){

      if( this.iterationCount == "infinite" ||
          this.currentIteration < this.iterationCount*1 ){

        this.currentIteration++;

        if(this.direction == "alternate" || this.direction == "alternate-reverse"){
          this.inverse = !this.inverse;
        }

        this.startTime = Date.now();

        this.onFrame(tToApply, tDiff);
      }
      else {
        this.onFrame(tToApply, tDiff);
        this.stop();
        this.onFinish();
      }

    } else {

      this.onFrame(tToApply, tDiff);

    }
  }
}

export {Animation}