import {
  pointsDistance,
  pointAtSegmentDistance
}  from "../utils/helpers.js";

export default class PointsCenterSpring {

  constructor(points=[]){
    this.center = [0,0];
    this.points = [...points];

    this.settings = {
      K: 0.23, // sprint konstant
      D: 0.25, // dumpening factor
      M: 1, // mass
      S: 0.001 // spread of the waves across points can be 0 to 0.5;
    }

  }

  pushPoints(points){
    points.forEach(point => this.points.push(point))
  }

  setCenter(point){
    if(!Array.isArray(point)) console.error('invalid argument, center not set');
    this.center[0] = point[0];
    this.center[1] = point[1];

    return this;
  }

  // this calculates height to center and stores it to point
  preserveTarget(points){
    this.points.forEach(point => {
      point['targetHeight'] = pointsDistance(point, this.center);
      point['targetPoint'] = [
          point[0],
          point[1]
        ];
    })
    
    return this;
  }

  // -- SPRING IMPLEMENTTION
  // when calculated frame by frame
  // spring formula will give you next frame towards normale position
  // based on current velocity and give you new velocity value for next frame
  _applyForceToPoint(point){

    // const {K,D,M,S} = this.settings;
    // const center = this.center;

    const velocity = point.velocity || 0;
    
    const {targetPoint, targetHeight} = point;
    const currentHeight = pointsDistance(point, this.center);
    const dd = targetHeight - currentHeight;

    // new acceleration and velocity
    const acceleration = -(this.settings.K/this.settings.M)*dd - this.settings.D*velocity;
    point['velocity'] = velocity + acceleration;

    // update point  
    const acceleratedPoint = pointAtSegmentDistance(targetPoint, this.center, dd+velocity);

    //if(acceleration) console.log('acceleration is', acceleration);

    point[0] = acceleratedPoint[0];
    point[1] = acceleratedPoint[1];

  }

  applyForceStep(){
    this.points.forEach(point => this._applyForceToPoint(point) );

    return this;
  }


}