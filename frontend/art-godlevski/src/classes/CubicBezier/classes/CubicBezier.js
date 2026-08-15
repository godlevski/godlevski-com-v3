import {
  rotatePointsGroup,
  getPatT,
  getTatP,
  getTatP_Cardano,
  getTatP_real_roots,
  getExT,
  getPatTang,
  getP2,
  getP1,
  getDerivative,
  getLengthNS,
  getLengthGaussLegendre,
  getLengthAtTGaussLegendre,
  getAccumulationAtAxisGaussLegendre,
  getLengthProbe,
  joinByControlPoint,
  joinCurvesAtK,
  findKP1P2withP0P6zero
} from "../utils/formulas";

export default class CubicBezier {
  constructor(p0,p1,p2,p3){
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    this.class = CubicBezier;
  }

  copy(){
    return new this.class([...this.p0], [...this.p1], [...this.p2], [...this.p3]);
  }
  /* rotate */

  rotate(deg, center=[0,0]){
    const [p0, p1, p2, p3] = rotatePointsGroup(center, deg, this.p0, this.p1, this.p2, this.p3);

    /*console.log('rotate current points are', this.p0, this.p1, this.p2, this.p3);
    console.log('rotate new points are', p0, p1, p2, p3);*/

    this["p0"] = p0;
    this["p1"] = p1;
    this["p2"] = p2;
    this["p3"] = p3;

    return this;
  }

  offset(x, y){
    this.p0[0] -= x; this.p0[1] -= y;
    this.p1[0] -= x; this.p1[1] -= y;
    this.p2[0] -= x; this.p2[1] -= y;
    this.p3[0] -= x; this.p3[1] -= y;

    return this;
  }

  getPathString(){
    return 'M'+this.p0[0]+','+this.p0[1]+'C'+this.p1[0]+','+this.p1[1]+', '+this.p2[0]+','+this.p2[1]+', '+this.p3[0]+','+this.p3[1];
  }

  /* Get point at t */
  getPatT(t){

    const tX = getPatT(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t);
    const tY = getPatT(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t);
    
    return [tX, tY];
  }
  /* Get t at point */
  getTatP(p){
    return getTatP(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1],
      p[0], p[1] );
  }
  getTatX_Cardano(x){
    return getTatP_Cardano(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0], x
      )
  }

  getTatY_Cardano(y){
    return getTatP_Cardano(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], y
      )
  }

  getTatX(x){
    return getTatP_real_roots(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0], x
      )
  }

  getTatY(y){
    return getTatP_real_roots(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], y
      )
  }

  getXAtY(y){
    const t = getTatP_real_roots(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0], y
      );

    if(t.length < 1) return null;

    return getPatT(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], t[0]);
  }

  getYAtX(x){
    const t = getTatP_real_roots(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0], x
      );

    if(t.length < 1) return null;

    return getPatT(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], t[0]); 
  }
  getDerivative(t){
    return [
      getDerivative(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t),
      getDerivative(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)
    ]
  }

  getTangentAtT(t, length=1){
    
    const qx = getDerivative(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t);
    const qy = getDerivative(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t);
    
    const d = Math.sqrt(qx*qx + qy*qy);
    
    return [ qx/d*length, qy/d*length ];
  }

  getTangentPointAtT(t, length=1, invercePoint = false){
    const pointX = getPatT(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t);
    const pointY = getPatT(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t);

    const qx = getDerivative(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t);
    const qy = getDerivative(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t);
    
    const d = Math.sqrt(qx*qx + qy*qy);

    const tpx = pointX+qx/d*length;
    const tpy = pointY+qy/d*length;
    
    return invercePoint 
    ? [
        [ 
          tpx, 
          tpy
        ],

        [
          pointX + (tpx - pointX) *-1, // inverted over anchor point
          pointY + (tpy - pointY) *-1 // inverted over anchor point
        ]
      ]
    : [ 
        tpx, 
        tpy
      ];
  }

  getNormaleAtAnchor(length=1, p = 'p0'){
    const point = this[p];
    const t = p == 'p0' ? 0 : 1;

    // if handles are on anchors => get temp arbritary points
    const p1 = this.p0[0] == this.p1[0] && this.p0[1] == this.p1[1] ?
      this.getPatT(0.01) : this.p1;

    const p2 = this.p3[0] == this.p2[0] && this.p3[1] == this.p2[1] ?
      this.getPatT(0.99) : this.p2;

    const qx = getDerivative(this.p0[0], p1[0], p2[0], this.p3[0], t);
    const qy = getDerivative(this.p0[1], p1[1], p2[1], this.p3[1], t);
    
    const d = Math.sqrt(qx*qx + qy*qy) || 1;

    return [
      (-qy/d*length), // normale is [-y, x] -> 90 deg rotation of tangent 
      (+qx/d*length)
    ]
  }

  getNormalePointAtAnchor(length=1, p = 'p0'){
    const point = this[p];
    const t = p == 'p0' ? 0 : 1;

    const qx = getDerivative(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t);
    const qy = getDerivative(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t);
    
    const d = Math.sqrt(qx*qx + qy*qy);

    return [
      (point[1]-qy/d*length), // normale is [-y, x] -> 90 deg rotation of tangent 
      (point[0]+qx/d*length)
    ]
  }

  splitAtT(t){
    const p10 = [...this.p0]
    const p11 = [
      this.p0[0]+(this.p1[0]-this.p0[0])*t,
      this.p0[1]+(this.p1[1]-this.p0[1])*t
    ]
    const p12 = [
      getP2(
        this.p0[0], this.p1[0], this.p2[0], this.p3[0], t),
      getP2(
        this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)
    ];
    const p13 = [
      getPatT(
        this.p0[0], this.p1[0], this.p2[0], this.p3[0], t),
      getPatT(
        this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)
      ];

    const c1 = new CubicBezier(p10, p11, p12, p13);

    const p20 = [...p13]
    const p21 = [
      getP1(
        this.p0[0], this.p1[0], this.p2[0], this.p3[0], t),
      getP1(
        this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)
    ]
    const p22 = [
      this.p3[0]+(this.p2[0]-this.p3[0])*(1-t),
      this.p3[1]+(this.p2[1]-this.p3[1])*(1-t)
    ];
    const p23 = [...this.p3];

    const c2 = new CubicBezier(p20, p21, p22, p23);

    return [c1, c2];
  }
  /* Get extremes */
  getExTXY(){
    const x = getExT(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0]);
    const y = getExT(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1]);
    return [x,y];
  }

  getExP(){
    const x = getExT(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0]);
    const y = getExT(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1]);

    const points = ([]).concat(x,y).filter(v => v > 0 && v <1).sort((v1,v2)=> v1-v2);
    
    //console.log('points', points);

    return points.map(t => 
      [
        getPatT(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t), 
        getPatT(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)      
      ]
      );
  }

  rejoinWith(curve){
    if(!(curve instanceof CubicBezier)) return;

    // if difference of end of this + start of curve (x+y)
    // less then 
    // difference end of curve start of this (x+y)
    const forward = 
      (Math.abs(this.p3[0]-curve.p0[0]) + Math.abs(this.p3[1]-curve.p0[1]))
      <
      (Math.abs(this.p0[0]-curve.p3[0]) + Math.abs(this.p0[1]-curve.p3[1]));

    //console.log('joining forward:', forward);

    const [first, second] = forward 
      ? [this.copy(), curve.copy()] 
      : [curve.copy(), this.copy()];

    const offsetX = first.p0[0]*-1;
    const offsetY = first.p0[1]*-1;

    //console.log('offsetX offsetY', offsetX, offsetY);

    first.offset(offsetX, offsetY);
    second.offset(offsetX, offsetY);

    /* 
      assume sectors
      2 | 3   -- | +-     y
      -----   -------   x-|-+
      1 | 0   -+ | ++     +

    */
    const cs = Math.abs( (second.p3[1] < 0 ? 3 : 0) - (second.p3[0] < 0 ? 1 : 0) );
    
    //console.log('cs', cs);

    const h = Math.abs( second.p3[1] );
    const w = Math.abs( second.p3[0] );

    //console.log('w h', w, h);

    const atan = Math.atan(h/w);

    const toXDeg =
      ((cs % 2
            // 1, 3
            ? (90*Math.PI/180) - atan
            // 0, 1
            : atan )
      
            + (90*Math.PI/180) * cs) * 180 / Math.PI;
    const toYDeg = (toXDeg-90);

    //console.log('toXDeg', toXDeg);

    const {p0,p1,p2,p3} = first;
    const {p0:p4,p1:p5,p2:p6,p3:p7} = second;

    //console.log('p0,p7', p0,p7);

    /*const rotatedXc0 = rotatePointsGroup([0,0], -1*toYDeg, p0,p1,p2,p3);
    const rotatedXc1 = rotatePointsGroup([0,0], -1*toYDeg, p4,p5,p6,p7);*/

    const rotatedYc0 = rotatePointsGroup([0,0], -1*toXDeg, p0,p1,p2,p3);
    const rotatedYc1 = rotatePointsGroup([0,0], -1*toXDeg, p4,p5,p6,p7);
    
    //console.log('rotatedYc0, rotatedYc1', rotatedYc0, rotatedYc1);

    /*const [k1, p1xA, p2xA] = findKP1P2withP0P6zero(
        rotatedXc0[0][0], rotatedXc0[1][0], rotatedXc0[2][0], rotatedXc0[3][0], 
        rotatedXc1[1][0], rotatedXc1[2][0], rotatedXc1[3][0]
      );

    const [k2, p1yA, p2yA] = findKP1P2withP0P6zero(
        rotatedYc0[0][1], rotatedYc0[1][1], rotatedYc0[2][1], rotatedYc0[3][1],
        rotatedYc1[1][1], rotatedYc1[2][1], rotatedYc1[3][1]
      );*/

    //console.log('p1xA, p2xA, p1yA, p2yA', p1xA, p2xA, p1yA, p2yA);


    const [k] = findKP1P2withP0P6zero(
        rotatedYc0[0][1], rotatedYc0[1][1], rotatedYc0[2][1], rotatedYc0[3][1],
        rotatedYc1[1][1], rotatedYc1[2][1], rotatedYc1[3][1]
      );

    //console.log('k is', k);

    const newPointsX = joinCurvesAtK(k, p0[0],p1[0],p2[0],p3[0],p5[0],p6[0],p7[0]);
    const newPointsY = joinCurvesAtK(k, p0[1],p1[1],p2[1],p3[1],p5[1],p6[1],p7[1]);

    //console.log('New Points, newPointsX, newPointsY', newPointsX, newPointsY);

    const resultingCurve = new CubicBezier(
      [
        newPointsX[0], newPointsY[0]
      ],
      [
        newPointsX[1], newPointsY[1]
      ],
      [
        newPointsX[2], newPointsY[2]
      ],
      [
        newPointsX[3], newPointsY[3]
      ]
    );

    resultingCurve.offset(
      offsetX*-1,
      offsetY*-1
      );

    return resultingCurve;

    /*const p1p2XOffset = rotatePointsGroup(
      [0,0],
      toYDeg,

      p1p2XOffsetRotated[0]
      )*/

    //console.log('rotatedX, rotatedY', rotatedX, rotatedY);
    
    //return [new CubicBezier(...rotatedXc0), new CubicBezier(...rotatedXc1), new CubicBezier(...rotatedYc0), new CubicBezier(...rotatedYc1)];

  }

  sliceAtT(t){
    // const xs = sliceAtT(this.p0[0], this.p1[0], this.p2[0], this.p3[0], t);
    // const ys = sliceAtT(this.p0[1], this.p1[1], this.p2[1], this.p3[1], t);

    // return [this.p]
  }

  getPatTang(t){
    return getPatTang(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1],
      t );
  }
  getP2(n){
    const x = getP2(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0], n);
    const y = getP2(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], n);
    return [x,y];
  }
  getP1(n){
    const x = getP1(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0], n);
    const y = getP1(
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], n);
    return [x,y];
  }

  bezlenSnap(){
    // return bezlenSnap(
    //   this.p0[0], this.p1[0], this.p2[0], this.p3[0],
    //   this.p0[1], this.p1[1], this.p2[1], this.p3[1]);
  }

  getXAccumulationGaussLegendre(){
    return getAccumulationAtAxisGaussLegendre(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], 'y')
  }

  getYAccumulationGaussLegendre(){
    return getAccumulationAtAxisGaussLegendre(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], 'x')
  }
  getLengthNS(){
    return getLengthNS(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1])
  }

  getLengthGaussLegendre(lps=64 /*test points*/){
    return getLengthGaussLegendre(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], lps);
  }
  getLengthAtTGaussLegendre(t, lps=64){
    return getLengthAtTGaussLegendre(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1], t, lps);
  }
  getLengthProbe(){
    return getLengthProbe(
      this.p0[0], this.p1[0], this.p2[0], this.p3[0],
      this.p0[1], this.p1[1], this.p2[1], this.p3[1] );
  }

  newCurveAtLength(targetLength=0, errorMargin=3 /*in px*/){

    if(!targetLength) return new this.class(this.p0, this.p0, this.p0, this.p0); 

    const limit = 100;

    const totalLength = this.capturedLength || this.getLengthGaussLegendre();

    let direction = 1,
        prevDirection = 1,
        step = 0.1,
        t = 0,
        lengthAtT = 0,
        steps =0;

    // set t to rought approximate based on length's ratios

    t = targetLength/totalLength;
    lengthAtT = this.getLengthAtTGaussLegendre(t)

    //console.log('starting:', t, lengthAtT);

    while(
      steps++ < limit &&
      targetLength &&
      Math.abs(targetLength-lengthAtT) > errorMargin){

      // step up current t
      t = t + direction * step;
      
      if( t < 0 ) t = 0;

      // get length at new t
      lengthAtT = this.getLengthAtTGaussLegendre(t)
      // adjust direction
      if(lengthAtT > targetLength){
        prevDirection = direction;
        direction = -1;
      }
      else {
        prevDirection = direction;
        direction = 1;
      }
      // if direction has changed -> decrease step;
      if(prevDirection != direction){
        step *= 0.8;
      }

      //console.log('step made', step, t, lengthAtT, targetLength);
    }

    const p1 = [
      this.p0[0]+(this.p1[0]-this.p0[0])*t,
      this.p0[1]+(this.p1[1]-this.p0[1])*t
    ]
    const p2 = [
      getP2(
        this.p0[0], this.p1[0], this.p2[0], this.p3[0], t),
      getP2(
        this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)
    ];
    const p3 = [
      getPatT(
        this.p0[0], this.p1[0], this.p2[0], this.p3[0], t),
      getPatT(
        this.p0[1], this.p1[1], this.p2[1], this.p3[1], t)
      ];

    //console.log('newCurveAtLength derived at t for new curve, lenght at t is', '\n\t', t, '\n\t', this.getLengthGaussLegendre(null, t));

    return new this.class(this.p0, p1, p2, p3)
  }
}