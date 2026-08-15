// helpers
function pointToString(point){
  return (Math.round(point[0])+"__"+Math.round(point[1]) ).replace(/\./g,'_')
}

export default class CubicBezierPathElShape {

  constructor(...args){

    this.startPointPathIndex = {}; // path index by start points
    this.endPointsPointIndex = {}; // points index by start/end points
    
    this.chainedPathPools = [];
    this.connectedPointsPools = [];

    this.paths = [];

    this.currentPathPool = [];

    // total length of curves
    this.totalCapturedLength = 0;
  }

  // -----------------------
  // return this functions
  // -----------------------
  pushPath(path, trigger=null){
    this.paths.push(path);
    this.indexPath(path, trigger);

    const length = path.curvesLengthCaptured 
      ? path.totalCapturedLength 
      : path.captureCurvesLength().totalCapturedLength;

    this.totalCapturedLength += length;

    return this;
  }

  clearCurrentPathsPool(){
    this.currentPathPool.splice(0, this.currentPathPool.length, this.paths[0]);

    return this;
  }

  rechainPaths(){
    const index = this.startPointPathIndex;
    const chainedPools = this.chainedPathPools;
    const currentPathPool = this.currentPathPool;

    // clean up
    chainedPools.splice(0,chainedPools.length);
    Object.values(index).forEach( pool => {
      pool.pushed = false;
    })   
    // read all path 
    this.paths.forEach(path => {
      const selectedTargetPools = [];

      path.forAnchors((anchor, i, curve) => {
      
        if(i === 0) return; // if they start from the same point -> those are neighbors and not chained;
        
        const stringValue = pointToString(anchor);
        
        const trigger = {anchor, i, curve, path};

        const targetPool = index[stringValue];

        if( !Array.isArray(targetPool) ) return;
        
        targetPool.trigger = trigger;

        if(!targetPool.pushed) {
          chainedPools.push(targetPool);
          targetPool.pushed = true;
        }
        selectedTargetPools.push(targetPool);

        // add events to path
        // on every new visible curve 
        //    -> push passed start triggers point's pools to current 
        path.onVisiblePoll = function(poll, pollLength){
          selectedTargetPools.forEach( targetPool => {
            if( pollLength > targetPool.trigger.i && !targetPool.triggered ){

              targetPool.triggered = true;
              currentPathPool.push(...targetPool);
            }
          })
           
        }

        if(trigger.i == path.curves.length){
          path.onDrawn = function(){
            if( !targetPool.triggered ){
              //console.log('tagret pool', targetPool)
              targetPool.triggered = true;
              currentPathPool.push(...targetPool);
            }
          }
        }
      
      })
    })
    return this;
  }

  reindexConnectedPoints(){
    const connectedPointsPools = this.connectedPointsPools;

    // clear
    connectedPointsPools.splice(0,connectedPointsPools.length);

    this.paths.forEach(path => {
      
      path.forAnchors( (anchor, i, curve) => {

        const stringValue = pointToString(anchor);
        const target = anchor;//{anchor, i, curve, path};

        const targetPointsPool = this.endPointsPointIndex[stringValue];

        const isArray = Array.isArray(targetPointsPool);
        const pushed = targetPointsPool&&targetPointsPool.pushed;

        //console.log('stringValue', i, stringValue, targetPointsPool);

        if(!pushed&&isArray&&i!==0&&i!==path.curves.length/*totalpoints is one more then curves length*/){
          
          targetPointsPool.target = target;
          targetPointsPool.pushed = true;
          //console.warn('target points pool found', targetPointsPool, i, path.curves.length);

          connectedPointsPools.push(targetPointsPool);
          
        }
        else if(!pushed&&isArray&&targetPointsPool.length>1){
          targetPointsPool.target = target;
          targetPointsPool.pushed = true;
          //console.error('long pool target points pool found', targetPointsPool, i, path.curves.length);

          connectedPointsPools.push(targetPointsPool);
        }
        else if(!pushed&&isArray&&targetPointsPool[0]!=anchor){
          targetPointsPool.target = target;
          targetPointsPool.pushed = true;
          //console.error('SMARGET points pool found', targetPointsPool, i, path.curves.length);

          connectedPointsPools.push(targetPointsPool);
        }
      })
    })

    return this;
  }

  replaceConnectedPointsValuesWithTarget(){
    const connectedPointsPools = this.connectedPointsPools;

    connectedPointsPools.forEach( pool => 
      pool.forEach(point => {
          point[0] = pool.target[0]
          point[1] = pool.target[1]
      }))

    return this;
  }

  // -----------------------
  // 
  // -----------------------
  addToPointPathIndex(point, path){
    const stringValue = pointToString(point);

    const pool = this.startPointPathIndex[stringValue] || [];

    pool.push(path);

    this.startPointPathIndex[stringValue] = pool;
  }

  addToPointPointIndex(point){
    
    const stringValue = pointToString(point);

    const pool = this.endPointsPointIndex[stringValue] || [];

    pool.push(point);

    this.endPointsPointIndex[stringValue] = pool;
  }

  indexPath(path, trigger=null){

    if(trigger){
      this.addToPointPathIndex(trigger, path);
    }
    else {
      const firstCurve = path.curves[0];
      const lastCurve = path.curves[path.curves.length-1];
      
      const firstPoint = firstCurve['p0'];
      const lastPoint = lastCurve['p3'];

      this.addToPointPathIndex(firstPoint, path);
      
      this.addToPointPointIndex(firstPoint, firstCurve, path);
      this.addToPointPointIndex(lastPoint, lastCurve, path); 
    }
    
  }



}