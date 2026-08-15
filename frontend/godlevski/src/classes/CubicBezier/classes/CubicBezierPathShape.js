import CubicBezierPath from "./CubicBezierPath";
import PointsGroup from "./PointsGroup";

export default class CubicBezierPathShape extends CubicBezierPath {

  constructor(paper, ...args){
    super(...args);
    //const {paper} = window;

    this.pointsGroup = new PointsGroup()

    this.map = []
    this.center = [0,0]

    this.group = null

    this.pathEl = null;

    this.paper = paper;
    this.group = paper.group();
  }

  pushMap(map){

    this.map.push(...map)
    return this;
  }

  setCenter(x, y){
    this.center[0] = x;
    this.center[1] = y;
    
    return this;
  }

  getPointsGroup(what, handles=true){
    switch (what) {
      case "high":
      case "low":
        return (
            new PointsGroup(
              ...( handles 
                ? this.getMappedPointsMeshWHandles(what)
                : this.getMappedEndPoints(what)
              )
            )
          )
          .setProp('anchors', handles ? [1,3] : 1)
          .setProp('center', this.center);

      case "handles":
        return (
            new PointsGroup(...this.getAllHandles())
          )
          .setProp('center', this.center);
      case "all": 
        return (
            new PointsGroup(...this.getAllEndPointsAndHandles())
          )
          .setProp('center', this.center)
          .setProp('anchors', [0,3]);
      default:
        return (
            new PointsGroup(...this.getAllEndPoints())
          )
          .setProp('center', this.center);
    }
  }

  getMappedEndPoints(mode='high'){
    const points = this.getAllEndPoints();
    const map = this.map;
    
    const filter = mode == 'high' ? 1 : 0;

    return points.filter( (point,i) => map[i] === filter );
  }

  getMappedPointsMeshWHandles(mode){
    const mesh = [];
    const map = this.map;
    const filter = mode == 'high'
      ? 1
      : 0;

    for (
      let curve = 0, point = 0; 
      curve < this.curves.length; 
      curve += point, point = (!point)*1) {

      if(map[curve+point] === filter){
        
        if(curve + point == 0){
          mesh.push([0,0])
        }

        if(point == 1){
          mesh.push( this.curves[curve]['p2'] );

          if(curve+1 == this.curves.length){
            mesh.push( 
              this.curves[curve]['p3'],
              [0,0]
            )
          }
        }
        else {
          mesh.push( 
            this.curves[curve]['p0'],
            this.curves[curve]['p1'] );
        }
    
      }

    }

    return mesh;
  }

  

  update(){
    if(!this.pathEl) return;
    if(!this.curvesLengthCaptured) this.captureCurvesLength();
    
    const {t} = this;
    const length = this.maxLength !== undefined 
        ? this.maxLength
        : t * this.totalCapturedLength;

    const useLength = length && length != this.totalCapturedLength;

    this.pathEl.attr({
      d: useLength
        ? this.getPathLineStringAtLength(length)
        : this.getPathLineString() 
    })

    return this;
  }

  stage(attr={}){
    if(this.pathEl) this.pathEl.remove();
    const { paper } = this;

    this.pathEl = paper
      .path(this.getPathLineString())
      .attr({
        fill: 'white',
        stroke: 'none',
        ...attr
      });

    return this;
  }

  draw(attr={}){

    const paper = this.group;

    return paper
      .path(this.getPathString())
      .attr({
        fill: 'none',
        stroke: 'white',
        ...attr
      });
  }

  drawDev(){
    const paper = this.group;

    return [

      this.getPointsGroup('endPoints').drawAnchors(7, {
            stroke: 'none', 
            strokeWidth: '2',
            fillOpacity: '0.5'
        }, 1),


      this.getPointsGroup('handles').drawAnchors(5, {
            stroke: 'none', 
            strokeWidth: '2',
            fill: '#316eaf',
            fillOpacity: '0.3'
        })

    ]

    /*this.getAllEndPoints().forEach( (point, i, {length}) => 
      paper
        .circle(...point, 7)
        .attr({
          stroke: 'none', 
          strokeWidth: '2',
          fill: 'rgba(0,'+(255*i/length)+',0,0.3)'
        }) 
    );*/  
  }

  onJointChange(joint){

    console.log('joint updated', joint);

    this.update();

    return this;
  }
}