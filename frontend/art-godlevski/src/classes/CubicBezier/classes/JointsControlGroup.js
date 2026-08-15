import JointGroup from "./JointGroup";
import PathJoint from "./PathJoint";
import {rotatePoint, absoluteAngle} from "../utils/helpers";

// dependant on Snap
export default class JointsControlGroup extends JointGroup {

  constructor(paper, ...joints){
    super(...joints);

    // tie to snap instance
    // const {paper} = window;
    this.paper = paper;
    this.group = paper.group();

    this.scale = 1;
    this.lockHandlesLength = false;

    // bind scale
    this.updateScale();
    window.onresize = () => {
      this.updateScale();
    }
  }
  
 /* bind = function(name, fn){
    if( (this._allowedCallbacks).indexOf(name) < 0 ) return;
    if( typeof fn != 'function' ) return;

    this[name] = fn;
  }

  _allowedCallbacks = ['onChange'];*/
  onChange(){};

  updateScale(){
    const {node} = this.paper;
    
    const viewBox = (node.getAttribute('viewBox')+'').split(' ');
    
    const {width, height} = node.getClientRects()[0];

    this.scale = width > height 
      ? (viewBox[3]*1)/height
      : (viewBox[2]*1)/width;

    //console.log('scale is', this.scale);

    return this;
  }

  clearJoint(joint){
    joint.forEach( (p, name, joint) => {
      const el = joint.els[name];
      if(el && typeof el.remove == 'function') el.remove();
    });

    return this;
  }

  stageJoint(joint){
    const onDrag = {
      handleF: this.onHandleDrag,
      handleB: this.onHandleDrag,
      anchor: this.onAnchorDrag
    }
    const {group} = this;

    joint.forEach( (point, name, joint) => {
      const circle = group.circle();
      const [cx, cy] = point;

      const initialValues = {
        initialPosition: null,
        initialHandlesLength: null
      }

      circle
        .attr({
          cx, cy,
          r: 10
        })
        .addClass('drag-'+name)
        .drag( 
          (changeX, changeY) => onDrag[name].call( this, changeX, changeY, joint, initialValues, name),
          () => { 
            initialValues['initialPosition'] = joint.copy()
            initialValues['initialHandlesLength'] = joint.getHandlesLength() 
          }
        );

      joint.els[name] = circle;
    });   

    return this;
  }

  stageControls(){
    this.joints.forEach(joint => {
      this.clearJoint(joint);
      this.stageJoint(joint);
    })
  }

  onAnchorDrag(changeX, changeY, joint, {initialPosition}){
    const {scale} = this;

    joint.forEach( (point, name, joint) => {

      point[0] = initialPosition[name][0] + changeX*scale;
      point[1] = initialPosition[name][1] + changeY*scale;
      
      joint.els[name].attr({
        cx: point[0],
        cy: point[1]
      });

    });

    this.onChange(joint, 'anchor');
  }

  onHandleDrag(changeX, changeY, joint, {initialPosition, initialHandlesLength}, name){
    const {scale} = this;
    
    
    const point = joint[name];

    point[0] = initialPosition[name][0] + changeX*scale;
    point[1] = initialPosition[name][1] + changeY*scale;

    if(this.lockHandlesLength){
      const angle = absoluteAngle(initialPosition[name], joint.anchor);
      const newAngle = absoluteAngle(point, joint.anchor);
      const newPoint = rotatePoint( initialPosition[name], joint.anchor, angle-newAngle, true )
      
      //console.log('angle, newAngle', angle, newAngle, newPoint);

      point[0] = newPoint[0];
      point[1] = newPoint[1];
    }

    joint.els[name].attr({
      cx: point[0],
      cy: point[1]
    });

    const oppositeName = name.match(/F$/) ? 'handleB' : 'handleF';
    const oppositePoint = joint[oppositeName];

    if(oppositePoint) {

      const newHandlesLength = joint.getHandlesLength();
      const oppositeOnDragged = initialHandlesLength[oppositeName]/newHandlesLength[name];
      
      oppositePoint[0] = (joint['anchor'][0] - (point[0]-joint['anchor'][0]) * oppositeOnDragged );
      oppositePoint[1] = (joint['anchor'][1] - (point[1]-joint['anchor'][1]) * oppositeOnDragged );
      
      joint.els[oppositeName].attr({
        cx: oppositePoint[0],
        cy: oppositePoint[1]
      });

    }

    this.onChange(joint, name);
    
  }

  // below is dependant on snap
  drawAnchors(radius=7, attr={}, colorshift=false){
    
    const length = this.points.length/this.anchors[1];
    const group = this.paper.group();

    //console.log('this is', this);
    this.forAnchors(function(point, i){

      const color = [0,0,0];

      if(colorshift !== false){
        const shiftValue = (255*(i/length)); 
        color[colorshift] = shiftValue;
      }
      
      group
        .circle(...point, radius)
        .attr({
          stroke: 'none', 
          strokeWidth: '2',
          fill: 'rgba('+color.join(',')+')',
          ...attr
        })

    })

    return group;
  }

  drawHandles(radius=7, attr={}, colorshift=false){
    
    const length = 2*this.points.length/this.anchors[1];
    const group = this.paper.group();

    if(this.anchors[1] == 1 ) return;

    //console.log('this is', this);
    
    this.forHandles(function(point, i){
      
      const color = [0,0,0];

      if(colorshift !== false){
        const shiftValue = (255*(i/length)); 
        color[colorshift] = shiftValue;
      }
      
      group
        .circle(...point, radius)
        .attr({
          stroke: 'none', 
          strokeWidth: '2',
          fill: 'rgba('+color.join(',')+')',
          ...attr
        })
    });

    return group;
  }
}
/*

let scale = 1;

const { paper } = window;

let dragStart = {};
let change = [];

const getScale = function(){
  
}
const onDragStart = function(e, cx, cy, point){ 
  dragStart = e 
};
const onDragChange = function(changeX, changeY, cx, cy, point){
  
  console.log('change is', changeX, changeY);

  change[0] = changeX;
  change[1] = changeY;

  this.attr({
    cx: changeX + cx,
    cy: changeY + cy
  })
};
const onDragEnd = function(e, cx, cy, point){

  console.log('draged:', ...change);

  //cleanup
  dragStart = {};
  change[0] = 0;
  change[1] = 0;
}

const forEach = (point, type) => {
  
  

}

const anchors = this.getAllEndPoints();
const handles = this.getAllHandles();

anchors.forEach( point => forEach(point, 'anchor') );
handles.forEach( point => forEach(point, 'handle') );*/

