export const getDerivative = function(P0, P1, P2, P3, t){
  
  // derivative of cubic Bezier is Qadratic besier
  // where quadratic [P0, P1, P2]Quadratic = [P1-P0, P2-P1, P3-P2]Cubic
  // quadratic matrix: https://pomax.github.io/BezierInfo-2/images/chapters/matrix/1bae50fefa43210b3a6259d1984f6cbc.svg

  return Math.pow((1-t), 2)*(P1-P0) + 2*(1-t)*t*(P2-P1) + Math.pow(t,2)*(P3-P2);

  //alternative 
  /*var a = (-P0+3*P1-3*P2+P3), //t^3
      b = (3*P0-6*P1+3*P2), //t^2
      c = (-3*P0+3*P1);

  console.log( (3*a*t*t + 2*b*t + c)/3 )*/
}

export const getSlope = function(X0, X1, Y0, Y1){
  // slope is m = deltaY/deltaX

  return (Y0-Y1)/(X0-X1);
}

// get point at t (0 to 1) e.g. 0.5
export const getPatT = function(P0, P1, P2, P3, t){

  // return 0 +
  //   + Math.pow(1-t,3)*P0
  //   + 3*Math.pow(1-t,2)*t*P1
  //   + 3*(1-t)*Math.pow(t,2)*P2
  //   + Math.pow(t,3)*P3;
  
  var a = (-P0+3*P1-3*P2+P3)*Math.pow(t,3),
      b = (3*P0-6*P1+3*P2)*Math.pow(t,2),
      c = (-3*P0+3*P1)*Math.pow(t,1),
      d = P0;


  /*
  (-P0+3*P1-3*P2+P3)*t^3 +
  (3*P0-6*P1+3*P2)*t^2 +
  (-3*P0+3*P1)*t^1 +
  P0
  */

  return a+b+c+d;
}

const isWithinOne = value => value < 1 && value > 0;
const oddpow = (v,p) => v < 0 
  ? -Math.pow(-v, p)
  : Math.pow(v, p);

export const getTatP_real_roots = function(P0, P1, P2, P3, value=0){
  
  // according to https://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm#5%20all%20the%20roots%20are%20real%20and%20different
  // we can solve x^3+a*x^2+b*x+c=0 
  // we have A*t^3+B*t^2+C*t+D=value, where
  //         A = (-P0+3*P1-3*P2+P3)*Math.pow(t,3),
  //         B = (3*P0-6*P1+3*P2)*Math.pow(t,2),
  //         C = (-3*P0+3*P1)*Math.pow(t,1),
  //         D = P0;
  // let format to fit above form:
  // => a=B, b=C, c=D,
  // A*x^3+a*x^2+b*x+c=value
  // => x^3/A+ax^2/A+bx/A+(c-value)/A = 0

  const A = (-P0+3*P1-3*P2+P3);
      // = (-P0+3*P1-3*P2+P3), //*Math.pow(t, 3),
  const a = (3*P0-6*P1+3*P2)/A, //*Math.pow(t, 2),
        b = (-3*P0+3*P1)/A, //*Math.pow(t, 1),
        c = (P0-value)/A;
  
  // our ideal equation is
  // t^3 + p*t + q = 0;

  // where 
  //   p = (3*b - a^2)/3,
  //   q = (2*a^3-9*a*b+27*c)/27

  const p = (3*b - Math.pow(a,2) )/3,
        q = (2*Math.pow(a,3) - 9*a*b + 27*c)/27;

  const delta = Math.pow(q/2,2) + Math.pow(p/3,3);

  
  // if delta === zero => 
  // x1 = 2*( (-q/2)^1/3 ) - a/3
  // x2 = (q/2)^1/3 - a/3
  // x3 = x2

  if(delta === 0){
    // NOT TESTED
    const values = [
      2*( oddpow((-q/2),1/3) ) - a/3,
      oddpow((q/2),1/3) - a/3
      ];

    //console.warn('NOT TESTED: delta, results', delta, values);

    return values.filter(isWithinOne);
  }

  // if delta > zero =>
  
  // let 
  // u = (-q/2+delta^1/2)^1/3
  // v = (q/2+delta^1/2)^1/3
  // let i = imaginary number

  // x1 = u - v - a/3
  // x2 = 0.5*(u-v) + (u+v)*(3^1/3)/2*i - a/3
  // x3 = 0.5*(u-v) - (u+v)*(3^1/3)/2*i - a/3

  else if(delta > 0){
    // we will omit complex numbers, so
    const u = oddpow( ( -q/2 + Math.sqrt(delta) ),1/3),
          v = oddpow( ( q/2 + Math.sqrt(delta) ),1/3);

    const values = [u - v - a/3].filter(isWithinOne);

    //console.log('delta, values', delta, values);

    return values;
  }
  
  // if delta < zero =>
  // let r = ((-p/3)^3)^1/2;
  // let cos(phi) = q / ( 2 * (( -q/3 )^1/3)^1/2 )
  // and restrain cos phi values between -1 & 1
  // -> phi = acos( cos(phi) );
  
  // x1 = 2*r^1/3 * cos( phi / 3 ) - a/3
  // x2 = 2*r^1/3 * cos( (phi + 2*PI)/3 ) - a/3
  // x3 = 2*r^1/3 * cos( (phi + 4*PI)/3 ) - a/3
  else if(delta < 0){
    const r = Math.sqrt(Math.pow((-p/3),3));
    
    const cosphi = - q / ( 2 * Math.sqrt( Math.pow(( -p/3 ),3) ) );
    
    const phi = Math.acos(
        cosphi > 1 ? 1 : cosphi < -1 ? -1 : cosphi
      );

    const r132 = oddpow(r,1/3)*2;

    const values = [
      r132 * Math.cos( phi / 3 ) - a/3,
      r132 * Math.cos( (phi + 2*Math.PI)/3 ) - a/3,
      r132 * Math.cos( (phi + 4*Math.PI)/3 ) - a/3
    ];

    //console.log('delta, values', delta, values);

    return values.filter(isWithinOne);
  }
}

export const getTatP_Cardano = function(P0, P1, P2, P3, value){
  // we are looking to get precentage value,
  // so to simplify things, lets make sure that all values are positive;
  // add them all to get longest diviation

  const a = (-P0+3*P1-3*P2+P3), //*Math.pow(t, 3),
        b = (3*P0-6*P1+3*P2), //*Math.pow(t, 2),
        c = (-3*P0+3*P1), //*Math.pow(t, 1),
        d = P0;

  console.log('a,b,c,d', a,b,c,d, value);

  // ax^3+bx^2+cx+d=value => ax^3+bx^2+cx+(d-value)=0
  const dV = d - value;

  // for ax^3+bx^2+cx+d=0
  // cubic formula is:
  // {q + [q^2 + (r-p^2)^3]^1/2}^1/3   +   {q - [q^2 + (r-p^2)^3]^1/2}^1/3   +   p
  // where
  // p = -b/(3a),   q = p^3 + (bc-3ad)/(6a^2),   r = c/(3a)

  // define vars
  const p = -b/(3*a), 
        q = Math.pow(p,3) + (b*c-3*a*dV)/( 6*Math.pow(a,2) ), 
        r = c/(3*a);

  console.log('p,q,r',p,q,r);

  /* Formula in JS:

    Math.pow( 
      (q + Math.pow( 
            ( Math.pow(q,2) 
            + Math.pow( 
                (r- Math.pow(p,2) 
              ), 3) ), 
            1/2) 
      ), 1/3 )
    +
    Math.pow( 
      (q - Math.pow( 
            ( Math.pow(q,2) 
            + Math.pow( 
                (r- Math.pow(p,2) 
              ), 3) ), 
            1/2) 
      ), 1/3 )

    + 
    p 

    according to this: https://www.trans4mind.com/personal_development/mathematics/polynomials/roots.htm#cube_roots_of_unity
    cubic root of number's abs can be one of the 3
    a) value*1
    b) value( -1/2 - Math.pow(3,1/3)/2 )
    c) value( -1/2 + Math.pow(3,1/3)/2 )

    so:
  */

  const k = 0 +
    Math.pow(
      Math.abs(
        Math.pow(q,2) +
        Math.pow( 
          r- Math.pow(p,2), 3)
      ), 1/2);

  const add = q + k;
  const addSign = add < 0 ? -1 : 1;
  const subt = q - k;
  const subtSign = subt < 0 ? -1 : 1;

  const t = addSign*Math.pow(Math.abs(add), 1/3) + subtSign*Math.pow(Math.abs(subt), 1/3) + p;

  console.log('t is', t, getPatT(P0, P1, P2, P3, t));

  return t;
}

const getGuideIntersect = function(P0,P1,P2,P3, pOpposite){
  // intersection curve's y intersection for guide in x


}

// get t at point t being (0 to 1) e.g. 0.5 
export const getTatP = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, Xn,Yn){
  var a = (-X0+3*X1-3*X2+X3), //*Math.pow(t, 3),
      b = (3*X0-6*X1+3*X2), //*Math.pow(t, 2),
      c = (-3*X0+3*X1), //*Math.pow(t, 1),
      d = X0, 

      f = (-Y0+3*Y1-3*Y2+Y3), //*Math.pow(t, 3),
      g = (3*Y0-6*Y1+3*Y2), //*Math.pow(t, 2),
      k = (-3*Y0+3*Y1), //*Math.pow(t, 1),
      l = Y0;
  /*

  Xn = a*t^3 + b*t^2 + c*t + d
  Yn = f*t^3 + g*t^2 + k*t + l

  a*t^3 =  - a*g/f*t^2 - a*k/f*t - a*l/f + a*Yn/f  

  0 =  t^2*(b - a*g/f) + t*(c - a*k/f) + (a*Yn/f - a*l/f + d - Xn)

  t = (  -(c - a*k/f) +- sqrt( (c - a*k/f)^2 - 4*(b - a*g/f)*(d + a*Yn/f - a*l/f - Xn) )  )/(2*(b - a*g/f))
  
  if all of point's xs and ys are given positive values ->

  t = (  -(c - a*k/f) + sqrt( (c - a*k/f)^2 - 4*(b - a*g/f)*(d + a*Yn/f - a*l/f - Xn) )  )/(2*(b - a*g/f))
  
  /////

  // ax3+bx2+cx+d=0
  Xn = a*t^3 + b*t^2 + c*t + d
  
  // p = -b/(3a),   q = p3 + (bc-3ad)/(6a2),   r = c/(3a)

  var p = -b/(3a),   q = Math.pow(p,3) + (bc-3ad)/( 6*Math.pow(a,2) ),   r = c/(3a);

  t   =   + Math.pow( (q + Math.pow(( Math.pow(q,2) + Math.pow( (r-Math.pow(p,2)) ,3) )),1/2) )), 1/3)
      + Math.pow( (q - Math.pow(( Math.pow(q,2) + Math.pow( (r-Math.pow(p,2)) ,3) )),1/2) )), 1/3)
      + p;     

      + Math.pow( (q + Math.pow( (Math.pow(q,2) + Math.pow( (r-Math.pow(p,2) ),3) ) ,1/2)) ,1/3)    
  
  // Math.pow( (q + Math.pow( (Math.pow(q,2) + Math.pow( (r- Math.pow(p,2) ), 3) ) , 1/2) ), 1/3 )
  */

  var p = -b/(3*a), 
      q = Math.pow(p,3) + (b*c-3*a*(d-Xn))/( 6*Math.pow(a,2) ), 
      r = c/(3*a);

  //Math.pow( (q + Math.pow( (Math.pow(q,2) + Math.pow( (r- Math.pow(p,2) ), 3) ) , 1/2) ), 1/3 )
  var tt0   = + Math.pow( Math.abs(q + Math.pow( (Math.pow(q,2) + Math.pow( ( r-Math.pow(p,2) ),3) ) , 1/2)) ,1/3)
  var tt1    =  + Math.pow( Math.abs(q - Math.pow( (Math.pow(q,2) + Math.pow( ( r-Math.pow(p,2) ),3) ) , 1/2)) ,1/3)
  var tt2    = + p; 

  /*console.log(a,b,c,d);
  console.log(p,q,r);
  console.log(tt0, tt1, tt2);*/
  
  var t1 = ( - ( c - a*k/f ) + Math.sqrt( Math.pow( (c - a*k/f), 2) - 4*( b - a*g/f )*( d + a*Yn/f - a*l/f - Xn ) ) )/( 2*( b - a*g/f ) ),
      t2 = ( - ( c - a*k/f ) - Math.sqrt( Math.pow( (c - a*k/f), 2) - 4*( b - a*g/f )*( d + a*Yn/f - a*l/f - Xn ) ) )/( 2*( b - a*g/f ) );

  return (t1>0&&t1<1) ? t1 : t2;
}

export const getExT = function(P0, P1, P2, P3){

  var  a = (-P0+3*P1-3*P2+P3)*3, //t^2
      b = (3*P0-6*P1+3*P2)*2, //t
      c = (-3*P0+3*P1)*1, 

      t1,t2;

  if(P1 == P2) return [0.5];

  t1 = ( -b+Math.sqrt(Math.pow(b,2)-4*a*c) ) / ( 2*a );
  t2 = ( -b-Math.sqrt(Math.pow(b,2)-4*a*c) ) / ( 2*a );

  return [ t1, t2 ];
}

//var eY = getExT(50, 2.5, 87.5, 50);

//console.log(eY);

// var p3x = getP2(20, 2.5, 50, 80, eY[1]),
//   p3y = getP2(50, 2.5, 87.5, 50, eY[1]);

// console.log(p3x, p3y);

// l, f - angles in rad for c-a and c-b

const toRad = function(deg){
  return deg * Math.PI/180;
}

export const rotatePointsGroup = function(center, angle/*+30deg -40deg*/, ...points){
  const [CX, CY] = center;
  // sector shift
  // translation angle rad
  const arad = toRad( (angle < 0 ? 360 + (angle % 360) : angle ) );

  return points.map( point => {
    
    const [X,Y] = point;
    
    if(X==CX && Y == CY) return [X, Y];

    // distance to center
    const x = X - CX;
    const y = Y - CY;
    // hypotenuse
    const d = Math.sqrt(x*x+y*y);

    

    /*console.log('--');
    console.log('X, Y', X, Y);
    console.log('CX, CY', CX, CY);
    console.log('x, y', x, y);*/

    /* 
      assume sectors
      2 | 3   -- | +-     y
      -----   -------   x-|-+
      1 | 0   -+ | ++     +

    */  

    // current sector 
    const cs = Math.abs( (y >= 0 ? 0 : 3) + (x >= 0 ? 0 : -1) );
    // current angle (angle to closest axes anticlockwise)
    // tan(rad) = opp/adj 
    // y/x for sector 0,2; x/y for sector 1,3;
    // -> tan(a) = ( cs % 2 ? x/y : y/x  ) => a = atan(n)
    const a = Math.abs( Math.atan( cs % 2 ? x/y : y/x ) );
    // sum of input and current value
    const rotated = a + arad;  
    // sectors shifted (factor out 90 out of the result)
    const ss = Math.floor( rotated / ( 90 * Math.PI/180 ) );
    // new sector we ended up with: sectors we shifted plus the one we started at
    const ns = ( cs + ss ) % 4;
    // new angle with respect to closest axis anticlockwise
    const na = rotated - ss * ( 90 * Math.PI/180 );

    /*console.log('hypotenuse', d);
    console.log('current sector', cs);
    console.log('sector shift', ss);
    console.log('new sector', ns);
    console.log('current angle', a);
    console.log('rotating angle', arad);
    console.log('rotated', rotated);
    console.log('new angle', na);*/
    
    // new point
    return ns % 2  
      ? // 1,3
      [
        (ns % 3 ? -1 : 1)*Math.sin(na)*d + CX,  // x,
        (ns > 1 ? -1 : 1)*Math.cos(na)*d + CY  // y
      ]
      : // 0,2
      [
        (ns % 3 ? -1 : 1)*Math.cos(na)*d + CX, // x
        (ns > 1 ? -1 : 1)*Math.sin(na)*d + CY  // y
      ]
  })

}

export const findKP1P2withP0P6zero = (P0, P1, P2, P3, P4, P5, P6) => {
  //console.log('points are', P0, P1, P2, P3, P4, P5, P6);

  const p2a= (k, p1) => ((3*k*p1-6*Math.pow(k,2)*p1+3*Math.pow(k,3)*p1-P3)/(3*(-1+k)*Math.pow(k,2)))
  const p1a= (k, T) => (P1/(k*Math.pow((-1+T),2))-(2*P1*T)/(Math.pow(k,2)*Math.pow((-1+T),2))+(P2*T)/(Math.pow(k,2)*Math.pow((-1+T),2))+(P3*T)/(3*(-1+k)*Math.pow(k,2)*Math.pow((-1+T),2))+(P1*Math.pow(T,2))/(Math.pow(k,3)*Math.pow((-1+T),2))-(P2*Math.pow(T,2))/(Math.pow(k,3)*Math.pow((-1+T),2))+(P3*Math.pow(T,2))/(3*Math.pow(k,3)*Math.pow((-1+T),2))-(P3*Math.pow(T,2))/(3*(-1+k)*Math.pow(k,2)*Math.pow((-1+T),2)))/(1-(2*T)/((-1+k)*Math.pow((-1+T),2))+T/((-1+k)*k*Math.pow((-1+T),2))+(k*T)/((-1+k)*Math.pow((-1+T),2))+(2*Math.pow(T,2))/((-1+k)*Math.pow((-1+T),2))-Math.pow(T,2)/((-1+k)*k*Math.pow((-1+T),2))-(k*Math.pow(T,2))/((-1+k)*Math.pow((-1+T),2)))

  //const p2b= (k, p1) => ((-p1+k*p1)/k)
  //const p1b= (k, T) => (-(P3/(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))+(P6*Math.pow(T,3))/(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))-((-3*P3+3*P4)*(-k+T))/((1-k)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-((3*P3-6*P4+3*P5)*Math.pow((-k+T),2))/(Math.pow((1-k),2)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-((-P3+3*P4-3*P5)*Math.pow((-k+T),3))/(Math.pow((1-k),3)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))))/(1-(3*Math.pow(T,2))/(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))+(3*Math.pow(T,2))/(k*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))+(3*Math.pow(T,3))/(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))-(3*Math.pow(T,3))/(k*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))))

  const p2b = (k, p1) => ((3*k*p1-6*Math.pow(k,2)*p1+3*Math.pow(k,3)*p1-P3)/(3*(-1+k)*Math.pow(k,2)))
  const p1b = (k, T) => (-(P3/(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-(P3*Math.pow(T,2))/((-1+k)*Math.pow(k,2)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))+(P3*Math.pow(T,3))/((-1+k)*Math.pow(k,2)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))+(P6*Math.pow(T,3))/(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))-((-3*P3+3*P4)*(-k+T))/((1-k)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-((3*P3-6*P4+3*P5)*Math.pow((-k+T),2))/(Math.pow((1-k),2)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-((-P3+3*P4-3*P5)*Math.pow((-k+T),3))/(Math.pow((1-k),3)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))))/(1+(6*Math.pow(T,2))/((-1+k)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-(3*Math.pow(T,2))/((-1+k)*k*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-(3*k*Math.pow(T,2))/((-1+k)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))-(6*Math.pow(T,3))/((-1+k)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))+(3*Math.pow(T,3))/((-1+k)*k*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3)))+(3*k*Math.pow(T,3))/((-1+k)*(-3*T+6*Math.pow(T,2)-3*Math.pow(T,3))))


  // start guessing k
  const getDiff = (k) => Math.abs( p1a(k, k/2)-p1b(k, k+(1-k)/2) );

  let margin = 1;

  // set starting point
  let k = 0.1;
  let diff = getDiff(k);
  
  // set search step and direction
  let step = 0.1;
  let dir = getDiff(k+step) > diff ? -1 : 1;

  // config safety limits to prevent inifinite loops
  let i=0, limit = 100;

  while( diff >= margin && i < limit ){
    k += dir*step;

    const newDiff = getDiff(k); 
    //console.log(k+' step '+i+' made '+(dir > 0 ?'forward':'backward')+' resulting the diff of '+newDiff);
    
    if(!newDiff){
      dir *= -1;
      step *= 0.5;
      continue;
    }

    // if difference increases, change direction and descrease step to 50%
    if(newDiff > diff) {
      dir *= -1;
      step *= 0.5;
    }
    
    diff = newDiff;
    i++;
  }

  //console.log('k is', k);
  const p1 = p1a(k,k/2);
  const p2 = p2a(k, p1);
  //console.log('-> p1, p2', p1, p2);

  return [k, p1, p2];
}

export const joinCurvesAtK = (k, P0, P1, P2, P3, P4, P5, P6) => {
    
  //let k = 0.3;

  const p2fn = (p1, k) => ((P0-3*k*P0+3*Math.pow(k, 2)*P0-Math.pow(k, 3)*P0+3*k*p1-6*Math.pow(k, 2)*p1+3*Math.pow(k, 3)*p1-P3+Math.pow(k, 3)*P6)/(3*(-1+k)*Math.pow(k, 2)))
  const p1fn = k => ((0.16*P0)/(-1.0+k)-1.2*k*P0-(0.544*k*P0)/(-1.0+k)+0.48*Math.pow(k,2)*P0+(0.672*Math.pow(k,2)*P0)/(-1.0+k)-0.064*Math.pow(k,3)*P0-(0.352*Math.pow(k,3)*P0)/(-1.0+k)+(0.064*Math.pow(k,4)*P0)/(-1.0+k)-0.4*(-3.0*P0+3.0*P1)-0.16*(3.0*P0-6.0*P1+3.0*P2)-(0.16*P3)/(-1.0+k)+(0.064*k*P3)/(-1.0+k)-0.064*(-1.0*P0+3.0*P1-3.0*P2+P3)+0.064*Math.pow(k,3)*P6+(0.16*Math.pow(k,3)*P6)/(-1.0+k)-(0.064*Math.pow(k,4)*P6)/(-1.0+k))/(-1.2*k-(0.48*k)/(-1.0+k)+0.96*Math.pow(k,2)+(1.152*Math.pow(k,2))/(-1.0+k)-0.192*Math.pow(k,3)-(0.864*Math.pow(k,3))/(-1.0+k)+(0.192*Math.pow(k,4))/(-1.0+k))

  const p1 = ( p1fn(k) ).toFixed(3)*1; 
  const p2 = ( p2fn(p1, k) ).toFixed(3)*1;

  //console.log('p1, p2', p1, p2);

  return [P0, p1, p2 ,P6];

}

export const joinByControlPoint = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, X4,X5,X6,X7, Y4,Y5,Y6,Y7 ){
  // distance to the starting point
  const h1 = Y1-Y0;
  const h2 = Y2-Y3;
  const h3 = Y5-Y4;
  const h4 = Y6-Y7;

  const c1 = X1-X0;
  const c2 = X2-X3;
  const c3 = X5-X4;
  const c4 = X6-X7;

  /*
  console.log('h1', h1);
  console.log('h2', h2);
  console.log('c1', c1);
  console.log('c2', c2);
  */

  /* 
    assume sectors
    2 | 3   -- | +-     y
    -----   -------   x-|-+
    1 | 0   -+ | ++     +

  */  

  // current sectors for l & f 
  const lSector = Math.abs( (h1 >= 0 ? 0 : 3) + (c1 >= 0 ? 0 : -1) );
  const fSector = Math.abs( (h2 >= 0 ? 0 : 3) + (c2 >= 0 ? 0 : -1) );
  const kSector = Math.abs( (h3 >= 0 ? 0 : 3) + (c3 >= 0 ? 0 : -1) );
  const jSector = Math.abs( (h4 >= 0 ? 0 : 3) + (c4 >= 0 ? 0 : -1) );

  const l = Math.abs( Math.atan(
      // get angle to closest axis counter-clockwise
      lSector % 2 
      // sector 1 & 3 
      ? c1/h1 
      // sector 0 & 2
      : h1/c1
      ) 
    ) 
    // make angle absolute by adding 90 degrees * number of previous sectors respectively
    + lSector * ( 90 * Math.PI/180 );

  const f = Math.abs( Math.atan(
      // get angle to closest axis counter-clockwise
      fSector % 2 
      // sector 1 & 3 
      ? c2/h2 
      // sector 0 & 2
      : h2/c2
      ) 
    ) 
    // make angle absolute by adding degrees respectively
    + fSector * ( 90 * Math.PI/180 );

  const k = Math.abs( Math.atan(
      // get angle to closest axis counter-clockwise
      kSector % 2 
      // sector 1 & 3 
      ? c3/h3 
      // sector 0 & 2
      : h3/c3
      ) 
    ) 
    // make angle absolute by adding 90 degrees * number of previous sectors respectively
    + kSector * ( 90 * Math.PI/180 );

  const j = Math.abs( Math.atan(
      // get angle to closest axis counter-clockwise
      jSector % 2 
      // sector 1 & 3 
      ? c4/h4 
      // sector 0 & 2
      : h4/c4
      ) 
    ) 
    // make angle absolute by adding degrees respectively
    + jSector * ( 90 * Math.PI/180 );
  

  /*
  console.log('l degrees are', l / (Math.PI/180));
  console.log('f degrees are', f / (Math.PI/180));
  */
      
  const a = Math.sqrt( Math.pow( h1 ,2) + Math.pow( c1 , 2) );
  const b = Math.sqrt( Math.pow( h2 ,2) + Math.pow( c2 , 2) );
  const c = Math.sqrt( Math.pow( h3 ,2) + Math.pow( c3 , 2) );
  const d = Math.sqrt( Math.pow( h4 ,2) + Math.pow( c4 , 2) );

  const x1 = (Math.cos(l)*a+X0);
  const x2 = (Math.cos(f)*b+X3);
  const x3 = (Math.cos(k)*c+X4);
  const x4 = (Math.cos(j)*d+X7);

  const y1 = (Math.sin(l)*a+Y0);
  const y2 = (Math.sin(f)*b+Y3);
  const y3 = (Math.sin(k)*c+Y4);
  const y4 = (Math.sin(j)*d+Y7);


  let t = 0.5;

  const Tx1 = 0
  + (-X0+3*x1-3*x2+X3)*Math.pow(t, 3)
  + (3*X0-6*x1+3*x2)*Math.pow(t, 2)
  + (-3*X0+3*x1)*Math.pow(t, 1)
  + X0;

  const Ty1 = 0
  + (-Y0+3*y1-3*y2+Y3)*Math.pow(t, 3)
  + (3*Y0-6*y1+3*y2)*Math.pow(t, 2)
  + (-3*Y0+3*y1)*Math.pow(t, 1)
  + Y0;

  const Tx2 = 0
  + (-X4+3*x3-3*x4+X7)*Math.pow(t, 3)
  + (3*X4-6*x3+3*x4)*Math.pow(t, 2)
  + (-3*X4+3*x3)*Math.pow(t, 1)
  + X4;

  const Ty2 = 0
  + (-Y4+3*y3-3*y4+Y7)*Math.pow(t, 3)
  + (3*Y4-6*y3+3*y4)*Math.pow(t, 2)
  + (-3*Y4+3*y3)*Math.pow(t, 1)
  + Y4;

  return [Tx1, Ty1, Tx2, Ty2];
}

export const getPatTang = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, t){
  
  // distance to the starting point
  const h1 = Y1-Y0;
  const h2 = Y2-Y3;
  const c1 = X1-X0;
  const c2 = X2-X3;

  /*
  console.log('h1', h1);
  console.log('h2', h2);
  console.log('c1', c1);
  console.log('c2', c2);
  */

  /* 
    assume sectors
    2 | 3   -- | +-     y
    -----   -------   x-|-+
    1 | 0   -+ | ++     +

  */  

  // current sectors for l & f 
  const lSector = Math.abs( (h1 >= 0 ? 0 : 3) + (c1 >= 0 ? 0 : -1) );
  const fSector = Math.abs( (h2 >= 0 ? 0 : 3) + (c2 >= 0 ? 0 : -1) );

  const l = Math.abs( Math.atan(
      // get angle to closest axis counter-clockwise
      lSector % 2 
      // sector 1 & 3 
      ? c1/h1 
      // sector 0 & 2
      : h1/c1
      ) 
    ) 
    // make angle absolute by adding 90 degrees * number of previous sectors respectively
    + lSector * ( 90 * Math.PI/180 );

  const f = Math.abs( Math.atan(
      // get angle to closest axis counter-clockwise
      fSector % 2 
      // sector 1 & 3 
      ? c2/h2 
      // sector 0 & 2
      : h2/c2
      ) 
    ) 
    // make angle absolute by adding degrees respectively
    + fSector * ( 90 * Math.PI/180 );
  

  /*
  console.log('l degrees are', l / (Math.PI/180));
  console.log('f degrees are', f / (Math.PI/180));
  */
      
  const a = Math.sqrt( Math.pow( h1 ,2) + Math.pow( c1 , 2) );
  const b = Math.sqrt( Math.pow( h2 ,2) + Math.pow( c2 , 2) );

  const x1 = (Math.cos(l)*a+X0);
  const x2 = (Math.cos(f)*b+X3);

  const Tx = 0
  + (-X0+3*x1-3*x2+X3)*Math.pow(t, 3)
  + (3*X0-6*x1+3*x2)*Math.pow(t, 2)
  + (-3*X0+3*x1)*Math.pow(t, 1)
  + X0;

  /*
  derivative is

  3 (-1 + t) ((a - 3 a t) Math.sin(l) + 2 t (Y0 - Y3)) + 3 b (2 - 3 t) t Math.sin(f)

  */

  const y1 = (Math.sin(l)*a+Y0);
  const y2 = (Math.sin(f)*b+Y3);

  const Ty = 0
  + (-Y0+3*y1-3*y2+Y3)*Math.pow(t, 3)
  + (3*Y0-6*y1+3*y2)*Math.pow(t, 2)
  + (-3*Y0+3*y1)*Math.pow(t, 1)
  + Y0;

  /*

  derivative is:

  3 (b t (-2 + 3 t) Math.cos[f] + (-1 + t) (2 t (X0 - X3) + a (-1 + 3 t) Math.cos[l]))

  integral is:

  sqrt( ( 3 (-1 + t) ((a - 3 a t) sin(l) + 2 t (Y0 - Y3)) + 3 b (2 - 3 t) t sin(f) )^2 + ( 3 (b t (-2 + 3 t) cos(f) + (-1 + t) (2 t (X0 - X3) + a (-1 + 3 t) cos(l))) )^2 )
  
  const dxdydt = t => null//?

  */


  /*console.log('x1', x1);
  console.log('y1', y1);

  console.log('x2', x2);
  console.log('y2', y2);*/

  //console.log('getPatT dxdt', dxdt(1), dxdt(0));
  //console.log('getPatT dydt', dydt(1), dydt(0));
  //console.log('getPatT dxdydt(1), dxdydt(0)', dxdydt(1), dxdydt(0));
  //console.log('getPatT dxdydt(1) - dxdydt(0)', dxdydt(1) - dxdydt(0));

  return [ Tx, Ty ];
}


// get new p2 for new section from P0 to N0(N being the breaking point)
// where p3t is a breaking point in 0 to 1 (e.g. 0.5)
export const getP2 = function(P0, P1, P2, P3, p3t){

  var t = 0.9, // any number between 0 > t > 1
    t0 = t*p3t,

    p1,p2,p3,p4;


  p1 =   P0 - (P0-P1)*p3t; // decrese p1 to p3t precent 
    
  p3 =   + (-P0+3*P1-3*P2+P3)*Math.pow(p3t, 3)
      + (P0-2*P1+P2)*3*Math.pow(p3t, 2)
      + (-P0+P1)*3*p3t
      + P0;
    
  //console.log('p1: '+p1);

  p2 =   (
        + (-P0+3*P1-3*P2+P3)*Math.pow(t0, 3)
        + (P0-2*P1+P2)*3*Math.pow(t0, 2)
        + (-P0+P1)*3*t0

        - (-P0+3*p1+p3)*Math.pow(t, 3)
        - (P0-2*p1)*3*Math.pow(t, 2)
        - (-P0+p1)*3*t

      ) / (

        + 3*Math.pow(t, 2)
        - 3*Math.pow(t, 3)
      
      );
        

  return p2;
}

/*var x = getP2(0,5,5,10, 0.7886751345948129, 0.7), //7.47822
  y = getP2(5,0,10,5, 0.7886751345948129, 0.7);  //6.44144

console.log(x, y);*/
/* 
  results (p0,p1,p2,p3, t) at:

  // 1
  x = 0,5,5,10, 0.7886751345948129 
  y = 5,0,10,5, 0.7886751345948129
  :
  x = 0, 3.9433756729740645, 4.77670900630739,   7.405626121623441
  y = 5, 1.0566243270259355, 6.443375672974069,   6.443375672974065

  // 2
  x = 20,2.5,50,80, 0.8089481286936021
  y = 50,2.5,87.5,50, 0.8089481286936021

  x = 20, 5.8434077478619635, 34.22262536532115, 61.46435649530995
  y = 50, 11.574963887053897, 59.857540200594464, 59.857540200594485
*/

// p3t = is point to break at

// get new p1 for new section from N0 to P0(N being the breaking point)
// where p3t is a breaking point in 0 to 1 (e.g. 0.5)
export const getP1 = function(P0, P1, P2, P3, p3t){

  var t = 0.9, // any number between 0 > t > 1
    t0 = p3t+(1-p3t)*t, 

    p0,p1,p2,p3;


  p2 =   P3 - (P3-P2)*(1-p3t); 
    //p2 = ,
  p0 =   + (-P0+3*P1-3*P2+P3)*Math.pow(p3t, 3)
      + (P0-2*P1+P2)*3*Math.pow(p3t, 2)
      + (-P0+P1)*3*p3t
      + P0;
    
    /*console.log('p2: '+p2);
    console.log('p0: '+p0);*/

  p1 =   (
        + (-P0+3*P1-3*P2+P3)*Math.pow(t0, 3)
        + (3*P0-6*P1+3*P2)*Math.pow(t0, 2)
        + (-3*P0+3*P1)*Math.pow(t0, 1)
        + P0

        - (-p0-3*p2+P3)*Math.pow(t, 3)
        - (3*p0+3*p2)*Math.pow(t, 2)
        - (-3*p0)*Math.pow(t, 1)
        - p0
      ) / (

        + 3*Math.pow(t, 3)
        - 6*Math.pow(t, 2)
        + 3*Math.pow(t, 1)
        
      );
      
    
  return p1;
}

/*var x = getP1(20,2.5,50,80, 0.8089481286936021), //7.47822
  y = getP1(50,2.5,87.5,50, 0.8089481286936021);  //6.44144

console.log(x, y);*/

/* 
  results (p0,p1,p2,p3, t) at 

  //1
  x = 0,5,5,10, 0.7886751345948129 
  y = 5,0,10,5, 0.7886751345948129
  :
  x = 7.405626121623441, 8.110042339640744, 8.943375672974064, 10
  y = 6.443375672974065, 6.443375672974187, 6.0566243270259355, 5

  //2
  x = 20,2.5,50,80, 0.8089481286936021
  y = 50,2.5,87.5,50, 0.8089481286936021

  x = 61.46435649530995, 67.89812341484622, 74.26844386080806, 80
  y = 59.857540200594485, 59.857540200592844, 57.16444517398992, 50
*/

let testPath;

export const getLengthNS = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3){
  
  const path = testPath || document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute( 'd', 'M'+X0+','+Y0+'C'+X1+','+Y1+','+X2+','+Y2+','+X3+','+Y3 );

  return path.getTotalLength();
}

export const getAccumulationAtAxisGaussLegendre = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, axis='x'/*,lps*/){  
  
  // accoding to this video: https://www.youtube.com/watch?v=riEx7TcLfzk
  // area between parametric curve and x axis is  
  // integral of t = fy(t)*fx'(t)
  
  const f = t => {
    // shift interval
    const td = 0.5+0.5*t;

    if(axis == 'x'){
      const f1x = getDerivative(X0,X1,X2,X3, td)
      const fy = getPatT(Y0,Y1,Y2,Y3, td);

      return fy*f1x;
    }
    
    if(axis == 'y'){
      const f1y = getDerivative(Y0,Y1,Y2,Y3, td)
      const fx = getPatT(X0,X1,X2,X3, td);
      // its alwas negative on a positive side .. dunno why
      return -1*fx*f1y;
    }
  };

  // console.log('accumulation to '+axis+' axis')

  return ( // 64 lps
      + 0.0486909570091397*f(-0.0243502926634244 ) 
      + 0.0486909570091397*f(0.0243502926634244 ) 
      + 0.0485754674415034*f(-0.0729931217877990 ) 
      + 0.0485754674415034*f(0.0729931217877990 ) 
      + 0.0483447622348030*f(-0.1214628192961206 ) 
      + 0.0483447622348030*f(0.1214628192961206 ) 
      + 0.0479993885964583*f(-0.1696444204239928 ) 
      + 0.0479993885964583*f(0.1696444204239928 ) 
      + 0.0475401657148303*f(-0.2174236437400071 ) 
      + 0.0475401657148303*f(0.2174236437400071 ) 
      + 0.0469681828162100*f(-0.2646871622087674 ) 
      + 0.0469681828162100*f(0.2646871622087674 ) 
      + 0.0462847965813144*f(-0.3113228719902110 ) 
      + 0.0462847965813144*f(0.3113228719902110 ) 
      + 0.0454916279274181*f(-0.3572201583376681 ) 
      + 0.0454916279274181*f(0.3572201583376681 ) 
      + 0.0445905581637566*f(-0.4022701579639916 ) 
      + 0.0445905581637566*f(0.4022701579639916 ) 
      + 0.0435837245293235*f(-0.4463660172534641 ) 
      + 0.0435837245293235*f(0.4463660172534641 ) 
      + 0.0424735151236536*f(-0.4894031457070530 ) 
      + 0.0424735151236536*f(0.4894031457070530 ) 
      + 0.0412625632426235*f(-0.5312794640198946 ) 
      + 0.0412625632426235*f(0.5312794640198946 ) 
      + 0.0399537411327203*f(-0.5718956462026340 ) 
      + 0.0399537411327203*f(0.5718956462026340 ) 
      + 0.0385501531786156*f(-0.6111553551723933 ) 
      + 0.0385501531786156*f(0.6111553551723933 ) 
      + 0.0370551285402400*f(-0.6489654712546573 ) 
      + 0.0370551285402400*f(0.6489654712546573 ) 
      + 0.0354722132568824*f(-0.6852363130542333 ) 
      + 0.0354722132568824*f(0.6852363130542333 ) 
      + 0.0338051618371416*f(-0.7198818501716109 ) 
      + 0.0338051618371416*f(0.7198818501716109 ) 
      + 0.0320579283548516*f(-0.7528199072605319 ) 
      + 0.0320579283548516*f(0.7528199072605319 ) 
      + 0.0302346570724025*f(-0.7839723589433414 ) 
      + 0.0302346570724025*f(0.7839723589433414 ) 
      + 0.0283396726142595*f(-0.8132653151227975 ) 
      + 0.0283396726142595*f(0.8132653151227975 ) 
      + 0.0263774697150547*f(-0.8406292962525803 ) 
      + 0.0263774697150547*f(0.8406292962525803 ) 
      + 0.0243527025687109*f(-0.8659993981540928 ) 
      + 0.0243527025687109*f(0.8659993981540928 ) 
      + 0.0222701738083833*f(-0.8893154459951141 ) 
      + 0.0222701738083833*f(0.8893154459951141 ) 
      + 0.0201348231535302*f(-0.9105221370785028 ) 
      + 0.0201348231535302*f(0.9105221370785028 ) 
      + 0.0179517157756973*f(-0.9295691721319396 ) 
      + 0.0179517157756973*f(0.9295691721319396 ) 
      + 0.0157260304760247*f(-0.9464113748584028 ) 
      + 0.0157260304760247*f(0.9464113748584028 ) 
      + 0.0134630478967186*f(-0.9610087996520538 ) 
      + 0.0134630478967186*f(0.9610087996520538 ) 
      + 0.0111681394601311*f(-0.9733268277899110 ) 
      + 0.0111681394601311*f(0.9733268277899110 ) 
      + 0.0088467598263639*f(-0.9833362538846260 ) 
      + 0.0088467598263639*f(0.9833362538846260 ) 
      + 0.0065044579689784*f(-0.9910133714767443 ) 
      + 0.0065044579689784*f(0.9910133714767443 ) 
      + 0.0041470332605625*f(-0.9963401167719553 ) 
      + 0.0041470332605625*f(0.9963401167719553 ) 
      + 0.0017832807216964*f(-0.9993050417357722 ) 
      + 0.0017832807216964*f(0.9993050417357722 ) 
      )
}

export const getLengthGaussLegendre = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, lps){
  var a = (-X0+3*X1-3*X2+X3), //t^3
      b = (3*X0-6*X1+3*X2), //t^2
      c = (-3*X0+3*X1), // t^1

      d = (-Y0+3*Y1-3*Y2+Y3), //t^3
      e = (3*Y0-6*Y1+3*Y2), //t^2
      f = (-3*Y0+3*Y1), //t^1

    lps = lps ? lps*1 : 64; // 

  /*   L = Math.sqrt( (dx/dt)^2 + (dy/dt)^2 )*dt
    
    f(x) = a*t^3 + b*t^2 + c*t + X0
    dx/dt = f'(x) =  3*a*t^2 + 2*b*t + c
  
    f(y) = d*t^3 + 3*e*t^2 + 3*f*t + Y0
    dy/dt = f'(y) =  3*d*t^2 + 2*e*t + f
  
  // shifting integral from [0,1] to [-1,1]

    Ld = sqrt( (dx/dtd)^2 + (dy/dtd)^2 )*dt*0.5
    td = 0.5-0.5*t;

  
  var dxdt = function(t){ return 3*a*Math.pow(t,2) + 2*b*t + c },
    dydt = function(t){ return 3*d*Math.pow(t,2) + 2*e*t + f };

  var  intL = function(t){ return Math.sqrt( Math.pow(dxdt(t), 2) + Math.pow(dydt(t), 2) ) };
  */

  // shifting integral from [0,1] to [-1,1] 

  var  intLd = function(t){ var td = 0.5-0.5*t; return Math.sqrt( Math.pow((3*a*Math.pow(td,2) + 2*b*td + c), 2) + Math.pow((3*d*Math.pow(td,2) + 2*e*td + f), 2) )*(0.5); };

  if( lps == 64 ){
  return (
      + 0.0486909570091397*intLd(-0.0243502926634244)
      + 0.0486909570091397*intLd(0.0243502926634244)
      + 0.0485754674415034*intLd(-0.0729931217877990)
      + 0.0485754674415034*intLd(0.0729931217877990)
      + 0.0483447622348030*intLd(-0.1214628192961206)
      + 0.0483447622348030*intLd(0.1214628192961206)
      + 0.0479993885964583*intLd(-0.1696444204239928)
      + 0.0479993885964583*intLd(0.1696444204239928)
      + 0.0475401657148303*intLd(-0.2174236437400071)
      + 0.0475401657148303*intLd(0.2174236437400071)
      + 0.0469681828162100*intLd(-0.2646871622087674)
      + 0.0469681828162100*intLd(0.2646871622087674)
      + 0.0462847965813144*intLd(-0.3113228719902110)
      + 0.0462847965813144*intLd(0.3113228719902110)
      + 0.0454916279274181*intLd(-0.3572201583376681)
      + 0.0454916279274181*intLd(0.3572201583376681)
      + 0.0445905581637566*intLd(-0.4022701579639916)
      + 0.0445905581637566*intLd(0.4022701579639916)
      + 0.0435837245293235*intLd(-0.4463660172534641)
      + 0.0435837245293235*intLd(0.4463660172534641)
      + 0.0424735151236536*intLd(-0.4894031457070530)
      + 0.0424735151236536*intLd(0.4894031457070530)
      + 0.0412625632426235*intLd(-0.5312794640198946)
      + 0.0412625632426235*intLd(0.5312794640198946)
      + 0.0399537411327203*intLd(-0.5718956462026340)
      + 0.0399537411327203*intLd(0.5718956462026340)
      + 0.0385501531786156*intLd(-0.6111553551723933)
      + 0.0385501531786156*intLd(0.6111553551723933)
      + 0.0370551285402400*intLd(-0.6489654712546573)
      + 0.0370551285402400*intLd(0.6489654712546573)
      + 0.0354722132568824*intLd(-0.6852363130542333)
      + 0.0354722132568824*intLd(0.6852363130542333)
      + 0.0338051618371416*intLd(-0.7198818501716109)
      + 0.0338051618371416*intLd(0.7198818501716109)
      + 0.0320579283548516*intLd(-0.7528199072605319)
      + 0.0320579283548516*intLd(0.7528199072605319)
      + 0.0302346570724025*intLd(-0.7839723589433414)
      + 0.0302346570724025*intLd(0.7839723589433414)
      + 0.0283396726142595*intLd(-0.8132653151227975)
      + 0.0283396726142595*intLd(0.8132653151227975)
      + 0.0263774697150547*intLd(-0.8406292962525803)
      + 0.0263774697150547*intLd(0.8406292962525803)
      + 0.0243527025687109*intLd(-0.8659993981540928)
      + 0.0243527025687109*intLd(0.8659993981540928)
      + 0.0222701738083833*intLd(-0.8893154459951141)
      + 0.0222701738083833*intLd(0.8893154459951141)
      + 0.0201348231535302*intLd(-0.9105221370785028)
      + 0.0201348231535302*intLd(0.9105221370785028)
      + 0.0179517157756973*intLd(-0.9295691721319396)
      + 0.0179517157756973*intLd(0.9295691721319396)
      + 0.0157260304760247*intLd(-0.9464113748584028)
      + 0.0157260304760247*intLd(0.9464113748584028)
      + 0.0134630478967186*intLd(-0.9610087996520538)
      + 0.0134630478967186*intLd(0.9610087996520538)
      + 0.0111681394601311*intLd(-0.9733268277899110)
      + 0.0111681394601311*intLd(0.9733268277899110)
      + 0.0088467598263639*intLd(-0.9833362538846260)
      + 0.0088467598263639*intLd(0.9833362538846260)
      + 0.0065044579689784*intLd(-0.9910133714767443)
      + 0.0065044579689784*intLd(0.9910133714767443)
      + 0.0041470332605625*intLd(-0.9963401167719553)
      + 0.0041470332605625*intLd(0.9963401167719553)
      + 0.0017832807216964*intLd(-0.9993050417357722)
      + 0.0017832807216964*intLd(0.9993050417357722)
      );
  }
  else if( lps == 25 ){
  return (
      + 0.1231760537267154*intLd(0.0000000000000000)
      + 0.1222424429903100*intLd(-0.1228646926107104)
      + 0.1222424429903100*intLd(0.1228646926107104)
      + 0.1194557635357848*intLd(-0.2438668837209884)
      + 0.1194557635357848*intLd(0.2438668837209884)
      + 0.1148582591457116*intLd(-0.3611723058093879)
      + 0.1148582591457116*intLd(0.3611723058093879)
      + 0.1085196244742637*intLd(-0.4730027314457150)
      + 0.1085196244742637*intLd(0.4730027314457150)
      + 0.1005359490670506*intLd(-0.5776629302412229)
      + 0.1005359490670506*intLd(0.5776629302412229)
      + 0.0910282619829637*intLd(-0.6735663684734684)
      + 0.0910282619829637*intLd(0.6735663684734684)
      + 0.0801407003350010*intLd(-0.7592592630373576)
      + 0.0801407003350010*intLd(0.7592592630373576)
      + 0.0680383338123569*intLd(-0.8334426287608340)
      + 0.0680383338123569*intLd(0.8334426287608340)
      + 0.0549046959758352*intLd(-0.8949919978782753)
      + 0.0549046959758352*intLd(0.8949919978782753)
      + 0.0409391567013063*intLd(-0.9429745712289743)
      + 0.0409391567013063*intLd(0.9429745712289743)
      + 0.0263549866150321*intLd(-0.9766639214595175)
      + 0.0263549866150321*intLd(0.9766639214595175)
      + 0.0113937985010263*intLd(-0.9955569697904981)
      + 0.0113937985010263*intLd(0.9955569697904981)
      );  
  }
  else {
  return {
    two_point: 
      (
      + 1*intLd( -1/Math.sqrt(3) ) 
      + 1*intLd( 1/Math.sqrt(3) )
      ),
    three_point: 
      (
      + (5/9)*intLd( -Math.sqrt(3/5) ) 
      + (8/9)*intLd( 0 ) 
      + (5/9)*intLd( Math.sqrt(3/5) )
      ),
    four_point: 
      (
      + ((18-Math.sqrt(30))/36)*intLd( -1*Math.sqrt(525+70*Math.sqrt(30))/35 ) 
      + ((18+Math.sqrt(30))/36)*intLd( -1*Math.sqrt(525-70*Math.sqrt(30))/35 ) 
      + ((18+Math.sqrt(30))/36)*intLd( +1*Math.sqrt(525-70*Math.sqrt(30))/35 ) 
      + ((18-Math.sqrt(30))/36)*intLd( +1*Math.sqrt(525+70*Math.sqrt(30))/35 )
      ),
    five_point: 
      (
      + (128/225)*intLd( 0 )
      + (322+13*Math.sqrt(70))/900*intLd( +(1/3)*Math.sqrt(5-2*Math.sqrt(10/7)) )
      + (322+13*Math.sqrt(70))/900*intLd( -(1/3)*Math.sqrt(5-2*Math.sqrt(10/7)) )
      + (322-13*Math.sqrt(70))/900*intLd( +(1/3)*Math.sqrt(5+2*Math.sqrt(10/7)) )
      + (322-13*Math.sqrt(70))/900*intLd( -(1/3)*Math.sqrt(5+2*Math.sqrt(10/7)) )
      ),
    ten_point:
      (
      +0.2955242247147529*intLd(-0.1488743389816312)
      + 0.2955242247147529*intLd(0.1488743389816312)
      + 0.2692667193099963*intLd(-0.4333953941292472)
      + 0.2692667193099963*intLd(0.4333953941292472)
      + 0.2190863625159820*intLd(-0.6794095682990244)
      + 0.2190863625159820*intLd(0.6794095682990244)
      + 0.1494513491505806*intLd(-0.8650633666889845)
      + 0.1494513491505806*intLd(0.8650633666889845)
      + 0.0666713443086881*intLd(-0.9739065285171717)
      + 0.0666713443086881*intLd(0.9739065285171717)
      ),
    fifteen_point:
      (
      + 0.2025782419255613*intLd(0.0000000000000000)
      + 0.1984314853271116*intLd(-0.2011940939974345)
      + 0.1984314853271116*intLd(0.2011940939974345)
      + 0.1861610000155622*intLd(-0.3941513470775634)
      + 0.1861610000155622*intLd(0.3941513470775634)
      + 0.1662692058169939*intLd(-0.5709721726085388)
      + 0.1662692058169939*intLd(0.5709721726085388)
      + 0.1395706779261543*intLd(-0.7244177313601701)
      + 0.1395706779261543*intLd(0.7244177313601701)
      + 0.1071592204671719*intLd(-0.8482065834104272)
      + 0.1071592204671719*intLd(0.8482065834104272)
      + 0.0703660474881081*intLd(-0.9372733924007060)
      + 0.0703660474881081*intLd(0.9372733924007060)
      + 0.0307532419961173*intLd(-0.9879925180204854)
      + 0.0307532419961173*intLd(0.9879925180204854)
      ),
    twenty_point:
      (
      + 0.1527533871307258*intLd(-0.0765265211334973)
      + 0.1527533871307258*intLd(0.0765265211334973)
      + 0.1491729864726037*intLd(-0.2277858511416451)
      + 0.1491729864726037*intLd(0.2277858511416451)
      + 0.1420961093183820*intLd(-0.3737060887154195)
      + 0.1420961093183820*intLd(0.3737060887154195)
      + 0.1316886384491766*intLd(-0.5108670019508271)
      + 0.1316886384491766*intLd(0.5108670019508271)
      + 0.1181945319615184*intLd(-0.6360536807265150)
      + 0.1181945319615184*intLd(0.6360536807265150)
      + 0.1019301198172404*intLd(-0.7463319064601508)
      + 0.1019301198172404*intLd(0.7463319064601508)
      + 0.0832767415767048*intLd(-0.8391169718222188)
      + 0.0832767415767048*intLd(0.8391169718222188)
      + 0.0626720483341091*intLd(-0.9122344282513259)
      + 0.0626720483341091*intLd(0.9122344282513259)
      + 0.0406014298003869*intLd(-0.9639719272779138)
      + 0.0406014298003869*intLd(0.9639719272779138)
      + 0.0176140071391521*intLd(-0.9931285991850949)
      + 0.0176140071391521*intLd(0.9931285991850949)
      ),
    twenty_five_point:
      (
      + 0.1231760537267154*intLd(0.0000000000000000)
      + 0.1222424429903100*intLd(-0.1228646926107104)
      + 0.1222424429903100*intLd(0.1228646926107104)
      + 0.1194557635357848*intLd(-0.2438668837209884)
      + 0.1194557635357848*intLd(0.2438668837209884)
      + 0.1148582591457116*intLd(-0.3611723058093879)
      + 0.1148582591457116*intLd(0.3611723058093879)
      + 0.1085196244742637*intLd(-0.4730027314457150)
      + 0.1085196244742637*intLd(0.4730027314457150)
      + 0.1005359490670506*intLd(-0.5776629302412229)
      + 0.1005359490670506*intLd(0.5776629302412229)
      + 0.0910282619829637*intLd(-0.6735663684734684)
      + 0.0910282619829637*intLd(0.6735663684734684)
      + 0.0801407003350010*intLd(-0.7592592630373576)
      + 0.0801407003350010*intLd(0.7592592630373576)
      + 0.0680383338123569*intLd(-0.8334426287608340)
      + 0.0680383338123569*intLd(0.8334426287608340)
      + 0.0549046959758352*intLd(-0.8949919978782753)
      + 0.0549046959758352*intLd(0.8949919978782753)
      + 0.0409391567013063*intLd(-0.9429745712289743)
      + 0.0409391567013063*intLd(0.9429745712289743)
      + 0.0263549866150321*intLd(-0.9766639214595175)
      + 0.0263549866150321*intLd(0.9766639214595175)
      + 0.0113937985010263*intLd(-0.9955569697904981)
      + 0.0113937985010263*intLd(0.9955569697904981)
      ),
    thirty_points:
      (
      + 0.1028526528935588*intLd(-0.0514718425553177)
      + 0.1028526528935588*intLd(0.0514718425553177)
      + 0.1017623897484055*intLd(-0.1538699136085835)
      + 0.1017623897484055*intLd(0.1538699136085835)
      + 0.0995934205867953*intLd(-0.2546369261678899)
      + 0.0995934205867953*intLd(0.2546369261678899)
      + 0.0963687371746443*intLd(-0.3527047255308781)
      + 0.0963687371746443*intLd(0.3527047255308781)
      + 0.0921225222377861*intLd(-0.4470337695380892)
      + 0.0921225222377861*intLd(0.4470337695380892)
      + 0.0868997872010830*intLd(-0.5366241481420199)
      + 0.0868997872010830*intLd(0.5366241481420199)
      + 0.0807558952294202*intLd(-0.6205261829892429)
      + 0.0807558952294202*intLd(0.6205261829892429)
      + 0.0737559747377052*intLd(-0.6978504947933158)
      + 0.0737559747377052*intLd(0.6978504947933158)
      + 0.0659742298821805*intLd(-0.7677774321048262)
      + 0.0659742298821805*intLd(0.7677774321048262)
      + 0.0574931562176191*intLd(-0.8295657623827684)
      + 0.0574931562176191*intLd(0.8295657623827684)
      + 0.0484026728305941*intLd(-0.8825605357920527)
      + 0.0484026728305941*intLd(0.8825605357920527)
      + 0.0387991925696271*intLd(-0.9262000474292743)
      + 0.0387991925696271*intLd(0.9262000474292743)
      + 0.0287847078833234*intLd(-0.9600218649683075)
      + 0.0287847078833234*intLd(0.9600218649683075)
      + 0.0184664683110910*intLd(-0.9836681232797472)
      + 0.0184664683110910*intLd(0.9836681232797472)
      + 0.0079681924961666*intLd(-0.9968934840746495)
      + 0.0079681924961666*intLd(0.9968934840746495)
      ),
    thirty_two_points:
      (
      + 0.0965400885147278*intLd(-0.0483076656877383)
      + 0.0965400885147278*intLd(0.0483076656877383)
      + 0.0956387200792749*intLd(-0.1444719615827965)
      + 0.0956387200792749*intLd(0.1444719615827965)
      + 0.0938443990808046*intLd(-0.2392873622521371)
      + 0.0938443990808046*intLd(0.2392873622521371)
      + 0.0911738786957639*intLd(-0.3318686022821277)
      + 0.0911738786957639*intLd(0.3318686022821277)
      + 0.0876520930044038*intLd(-0.4213512761306353)
      + 0.0876520930044038*intLd(0.4213512761306353)
      + 0.0833119242269467*intLd(-0.5068999089322294)
      + 0.0833119242269467*intLd(0.5068999089322294)
      + 0.0781938957870703*intLd(-0.5877157572407623)
      + 0.0781938957870703*intLd(0.5877157572407623)
      + 0.0723457941088485*intLd(-0.6630442669302152)
      + 0.0723457941088485*intLd(0.6630442669302152)
      + 0.0658222227763618*intLd(-0.7321821187402897)
      + 0.0658222227763618*intLd(0.7321821187402897)
      + 0.0586840934785355*intLd(-0.7944837959679424)
      + 0.0586840934785355*intLd(0.7944837959679424)
      + 0.0509980592623762*intLd(-0.8493676137325700)
      + 0.0509980592623762*intLd(0.8493676137325700)
      + 0.0428358980222267*intLd(-0.8963211557660521)
      + 0.0428358980222267*intLd(0.8963211557660521)
      + 0.0342738629130214*intLd(-0.9349060759377397)
      + 0.0342738629130214*intLd(0.9349060759377397)
      + 0.0253920653092621*intLd(-0.9647622555875064)
      + 0.0253920653092621*intLd(0.9647622555875064)
      + 0.0162743947309057*intLd(-0.9856115115452684)
      + 0.0162743947309057*intLd(0.9856115115452684)
      + 0.0070186100094701*intLd(-0.9972638618494816)
      + 0.0070186100094701*intLd(0.9972638618494816)
      ),
    fourty_points:
      (
      + 0.0775059479784248*intLd(-0.0387724175060508)
      + 0.0775059479784248*intLd(0.0387724175060508)
      + 0.0770398181642480*intLd(-0.1160840706752552)
      + 0.0770398181642480*intLd(0.1160840706752552)
      + 0.0761103619006262*intLd(-0.1926975807013711)
      + 0.0761103619006262*intLd(0.1926975807013711)
      + 0.0747231690579683*intLd(-0.2681521850072537)
      + 0.0747231690579683*intLd(0.2681521850072537)
      + 0.0728865823958041*intLd(-0.3419940908257585)
      + 0.0728865823958041*intLd(0.3419940908257585)
      + 0.0706116473912868*intLd(-0.4137792043716050)
      + 0.0706116473912868*intLd(0.4137792043716050)
      + 0.0679120458152339*intLd(-0.4830758016861787)
      + 0.0679120458152339*intLd(0.4830758016861787)
      + 0.0648040134566010*intLd(-0.5494671250951282)
      + 0.0648040134566010*intLd(0.5494671250951282)
      + 0.0613062424929289*intLd(-0.6125538896679802)
      + 0.0613062424929289*intLd(0.6125538896679802)
      + 0.0574397690993916*intLd(-0.6719566846141796)
      + 0.0574397690993916*intLd(0.6719566846141796)
      + 0.0532278469839368*intLd(-0.7273182551899271)
      + 0.0532278469839368*intLd(0.7273182551899271)
      + 0.0486958076350722*intLd(-0.7783056514265194)
      + 0.0486958076350722*intLd(0.7783056514265194)
      + 0.0438709081856733*intLd(-0.8246122308333117)
      + 0.0438709081856733*intLd(0.8246122308333117)
      + 0.0387821679744720*intLd(-0.8659595032122595)
      + 0.0387821679744720*intLd(0.8659595032122595)
      + 0.0334601952825478*intLd(-0.9020988069688743)
      + 0.0334601952825478*intLd(0.9020988069688743)
      + 0.0279370069800234*intLd(-0.9328128082786765)
      + 0.0279370069800234*intLd(0.9328128082786765)
      + 0.0222458491941670*intLd(-0.9579168192137917)
      + 0.0222458491941670*intLd(0.9579168192137917)
      + 0.0164210583819079*intLd(-0.9772599499837743)
      + 0.0164210583819079*intLd(0.9772599499837743)
      + 0.0104982845311528*intLd(-0.9907262386994570)
      + 0.0104982845311528*intLd(0.9907262386994570)
      + 0.0045212770985332*intLd(-0.9982377097105593)
      + 0.0045212770985332*intLd(0.9982377097105593)
      ),
    fourty_five_points:
      (
      + 0.0690418248292320*intLd(0.0000000000000000)
      + 0.0688773169776613*intLd(-0.0689869801631442)
      + 0.0688773169776613*intLd(0.0689869801631442)
      + 0.0683845773786697*intLd(-0.1376452059832530)
      + 0.0683845773786697*intLd(0.1376452059832530)
      + 0.0675659541636075*intLd(-0.2056474897832637)
      + 0.0675659541636075*intLd(0.2056474897832637)
      + 0.0664253484498425*intLd(-0.2726697697523776)
      + 0.0664253484498425*intLd(0.2726697697523776)
      + 0.0649681957507234*intLd(-0.3383926542506022)
      + 0.0649681957507234*intLd(0.3383926542506022)
      + 0.0632014400738199*intLd(-0.4025029438585419)
      + 0.0632014400738199*intLd(0.4025029438585419)
      + 0.0611335008310665*intLd(-0.4646951239196351)
      + 0.0611335008310665*intLd(0.4646951239196351)
      + 0.0587742327188417*intLd(-0.5246728204629161)
      + 0.0587742327188417*intLd(0.5246728204629161)
      + 0.0561348787597865*intLd(-0.5821502125693532)
      + 0.0561348787597865*intLd(0.5821502125693532)
      + 0.0532280167312690*intLd(-0.6368533944532233)
      + 0.0532280167312690*intLd(0.6368533944532233)
      + 0.0500674992379520*intLd(-0.6885216807712006)
      + 0.0500674992379520*intLd(0.6885216807712006)
      + 0.0466683877183734*intLd(-0.7369088489454904)
      + 0.0466683877183734*intLd(0.7369088489454904)
      + 0.0430468807091650*intLd(-0.7817843125939062)
      + 0.0430468807091650*intLd(0.7817843125939062)
      + 0.0392202367293025*intLd(-0.8229342205020863)
      + 0.0392202367293025*intLd(0.8229342205020863)
      + 0.0352066922016090*intLd(-0.8601624759606642)
      + 0.0352066922016090*intLd(0.8601624759606642)
      + 0.0310253749345155*intLd(-0.8932916717532418)
      + 0.0310253749345155*intLd(0.8932916717532418)
      + 0.0266962139675777*intLd(-0.9221639367190004)
      + 0.0266962139675777*intLd(0.9221639367190004)
      + 0.0222398475505787*intLd(-0.9466416909956291)
      + 0.0222398475505787*intLd(0.9466416909956291)
      + 0.0176775352579376*intLd(-0.9666083103968947)
      + 0.0176775352579376*intLd(0.9666083103968947)
      + 0.0130311049915828*intLd(-0.9819687150345405)
      + 0.0130311049915828*intLd(0.9819687150345405)
      + 0.0083231892962182*intLd(-0.9926499984472037)
      + 0.0083231892962182*intLd(0.9926499984472037)
      + 0.0035826631552836*intLd(-0.9986036451819367)
      + 0.0035826631552836*intLd(0.9986036451819367)
      ),
    sixty_four_points:
      (
      + 0.0486909570091397*intLd(-0.0243502926634244)
      + 0.0486909570091397*intLd(0.0243502926634244)
      + 0.0485754674415034*intLd(-0.0729931217877990)
      + 0.0485754674415034*intLd(0.0729931217877990)
      + 0.0483447622348030*intLd(-0.1214628192961206)
      + 0.0483447622348030*intLd(0.1214628192961206)
      + 0.0479993885964583*intLd(-0.1696444204239928)
      + 0.0479993885964583*intLd(0.1696444204239928)
      + 0.0475401657148303*intLd(-0.2174236437400071)
      + 0.0475401657148303*intLd(0.2174236437400071)
      + 0.0469681828162100*intLd(-0.2646871622087674)
      + 0.0469681828162100*intLd(0.2646871622087674)
      + 0.0462847965813144*intLd(-0.3113228719902110)
      + 0.0462847965813144*intLd(0.3113228719902110)
      + 0.0454916279274181*intLd(-0.3572201583376681)
      + 0.0454916279274181*intLd(0.3572201583376681)
      + 0.0445905581637566*intLd(-0.4022701579639916)
      + 0.0445905581637566*intLd(0.4022701579639916)
      + 0.0435837245293235*intLd(-0.4463660172534641)
      + 0.0435837245293235*intLd(0.4463660172534641)
      + 0.0424735151236536*intLd(-0.4894031457070530)
      + 0.0424735151236536*intLd(0.4894031457070530)
      + 0.0412625632426235*intLd(-0.5312794640198946)
      + 0.0412625632426235*intLd(0.5312794640198946)
      + 0.0399537411327203*intLd(-0.5718956462026340)
      + 0.0399537411327203*intLd(0.5718956462026340)
      + 0.0385501531786156*intLd(-0.6111553551723933)
      + 0.0385501531786156*intLd(0.6111553551723933)
      + 0.0370551285402400*intLd(-0.6489654712546573)
      + 0.0370551285402400*intLd(0.6489654712546573)
      + 0.0354722132568824*intLd(-0.6852363130542333)
      + 0.0354722132568824*intLd(0.6852363130542333)
      + 0.0338051618371416*intLd(-0.7198818501716109)
      + 0.0338051618371416*intLd(0.7198818501716109)
      + 0.0320579283548516*intLd(-0.7528199072605319)
      + 0.0320579283548516*intLd(0.7528199072605319)
      + 0.0302346570724025*intLd(-0.7839723589433414)
      + 0.0302346570724025*intLd(0.7839723589433414)
      + 0.0283396726142595*intLd(-0.8132653151227975)
      + 0.0283396726142595*intLd(0.8132653151227975)
      + 0.0263774697150547*intLd(-0.8406292962525803)
      + 0.0263774697150547*intLd(0.8406292962525803)
      + 0.0243527025687109*intLd(-0.8659993981540928)
      + 0.0243527025687109*intLd(0.8659993981540928)
      + 0.0222701738083833*intLd(-0.8893154459951141)
      + 0.0222701738083833*intLd(0.8893154459951141)
      + 0.0201348231535302*intLd(-0.9105221370785028)
      + 0.0201348231535302*intLd(0.9105221370785028)
      + 0.0179517157756973*intLd(-0.9295691721319396)
      + 0.0179517157756973*intLd(0.9295691721319396)
      + 0.0157260304760247*intLd(-0.9464113748584028)
      + 0.0157260304760247*intLd(0.9464113748584028)
      + 0.0134630478967186*intLd(-0.9610087996520538)
      + 0.0134630478967186*intLd(0.9610087996520538)
      + 0.0111681394601311*intLd(-0.9733268277899110)
      + 0.0111681394601311*intLd(0.9733268277899110)
      + 0.0088467598263639*intLd(-0.9833362538846260)
      + 0.0088467598263639*intLd(0.9833362538846260)
      + 0.0065044579689784*intLd(-0.9910133714767443)
      + 0.0065044579689784*intLd(0.9910133714767443)
      + 0.0041470332605625*intLd(-0.9963401167719553)
      + 0.0041470332605625*intLd(0.9963401167719553)
      + 0.0017832807216964*intLd(-0.9993050417357722)
      + 0.0017832807216964*intLd(0.9993050417357722)
      )
    };
  };
}

export const sliceAtT = function(P0,P1,P2,P3, t, invert=false){
  const ti = !invert ? 1-t : t;

  const p0p1 = P0 + (P1-P0) * ti;
  const p1p2 = P1 + (P2-P1) * ti;
  const p2p3 = P2 + (P3-P2) * ti;

  const p23p12 = p0p1 + (p1p2-p0p1) * ti;
  const p12p23 = p1p2 + (p2p3-p1p2) * ti;

  const p = p23p12 + (p12p23-p23p12) * ti;

  return [p, p12p23, p2p3, P3];
}

export const getLengthAtTGaussLegendre = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, t, lps=64){
  
  // get middle points using catledjio method
  const p0p1X = X0 + (X1-X0) * t;
  const p1p2X = X1 + (X2-X1) * t;
  const p2p3X = X2 + (X3-X2) * t;

  const p01p12X = p0p1X + (p1p2X-p0p1X) * t;
  const p12p23X = p1p2X + (p2p3X-p1p2X) * t;

  const pX = p01p12X + (p12p23X-p01p12X) * t;

  // get middle points using catledjio method
  const p0p1Y = Y0 + (Y1-Y0) * t;
  const p1p2Y = Y1 + (Y2-Y1) * t;
  const p2p3Y = Y2 + (Y3-Y2) * t;

  const p01p12Y = p0p1Y + (p1p2Y-p0p1Y) * t;
  const p12p23Y = p1p2Y + (p2p3Y-p1p2Y) * t;

  const pY = p01p12Y + (p12p23Y-p01p12Y) * t;


  return getLengthGaussLegendre(
      X0, p0p1X, p01p12X, pX,
      Y0, p0p1Y, p01p12Y, pY
    )
}

export const getLengthProbe = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3){
  var a = (-X0+3*X1-3*X2+X3), //t^3
      b = (3*X0-6*X1+3*X2),   //t^2
      c = (-3*X0+3*X1),     //t^1
                  // + X0
      d = (-Y0+3*Y1-3*Y2+Y3), //t^3
      e = (3*Y0-6*Y1+3*Y2),   //t^2
      f = (-3*Y0+3*Y1),     //t^1
                  // + Y0

      length = 0,
      prevPoint = [X0,Y0], 
      point = function(t){
        var p =[a*Math.pow(t, 3) + b*Math.pow(t, 2) + c*t + X0,
            d*Math.pow(t, 3) + e*Math.pow(t, 2) + f*t + Y0];

        return p;
      };

    for (var i = 0; i <= 100000; i++) {
      var t = i/100000,
        curPoint = point(t), 
        change;

      change =
        Math.sqrt(
          Math.pow(curPoint[0]-prevPoint[0], 2)
          + Math.pow(curPoint[1]-prevPoint[1], 2)
        );

      length += change;
      prevPoint = curPoint;

    };

    return length;
}
export const join = function(AX0,AX1,AX2,AX3, AY0,AY1,AY2,AY3, BX0,BX1,BX2,BX3, BY0,BY1,BY2,BY3, t){
  var  a = (-AX0+3*AX1-3*AX2+AX3), //*Math.pow(t, 3),
    b = (3*AX0-6*AX1+3*AX2), //*Math.pow(t, 2),
    c = (-3*AX0+3*AX1), //*Math.pow(t, 1),
    d = AX0, 

    f = (-AY0+3*AY1-3*AY2+AY3), //*Math.pow(t, 3),
    g = (3*AY0-6*AY1+3*AY2), //*Math.pow(t, 2),
    k = (-3*AY0+3*AY1), //*Math.pow(t, 1),
    l = AY0, 

    m = (-BX0+3*BX1-3*BX2+BX3), //*Math.pow(t, 3),
    n = (3*BX0-6*BX1+3*BX2), //*Math.pow(t, 2),
    o = (-3*BX0+3*BX1), //*Math.pow(t, 1),
    p = BX0, 

    r = (-BY0+3*BY1-3*BY2+BY3), //*Math.pow(t, 3),
    s = (3*BY0-6*BY1+3*BY2), //*Math.pow(t, 2),
    v = (-3*BY0+3*BY1), //*Math.pow(t, 1),
    w = BY0;
  /*
    Ax = a*t^3 + b*t^2 + c*t + d
    Ay = f*t^3 + g*t^2 + k*t + l

    Bx = m*t^3 + n*t^2 + o*t + p
    By = r*t^3 + s*t^2 + v*t + w
  */

  /*  PX0 = AX0,
    PX1 = AX0+(AX1-AX0)/t,
    PX2 = BX3+(BX2-BX3)/(1-t),
    PX3 = BX3,

    PY0 = AY0,
    PX1 = AY0+(AY1-AY0)/t,
    PX2 = BY3+(BY2-BY3)/(1-t),
    PY3 = BY3;

  /*
    P = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3

    P = (1-t)^3*A0 + 3*(1-t)^2*t*(A0+(A1-A0)/t) + 3*(1-t)*t^2*(B3+(B2-B3)/(1-t)) + t^3*B3

    P = (1-t)^3*A0 + 3*(1-t)^2*t*(A0+(A1-A0)/t) + 3*(1-t)*t^2*(B3+(B2-B3)/(1-t)) + t^3*B3

    
  */
  
  //console.log('P = '+40+';A0 = '+AX0+'; A1 = '+AX1+'; B3 = '+BX3+'; B2 = '+BX2+';');

  //return Math.pow((1-t), 3)*Px0 + 3*Math.pow((1-t), 2)*t*(AX0+(AX1-AX0)/t) + 3*(1-t)*Math.pow(t, 2)*(BX3+(BX2-BX3)/(1-t)) + Math.pow(t, 3)*Px3;    
  
}

/*var p1p2 = join(20,20,27.815,40,  10,32.126,32.709,30,  40,55.361,77.681,100,  30,26.496,17.681,40);

console.log(p1p2);*/

export const joinAtT = function(A0,A1,A2,A3, B0,B1,B2,B3){
  var L = 1, l1 = 0.8089481286936021, l2 = 1- l1, // 0.2113248654051871,

  ta = 0.9; 
  var tb = ta; // any number between 0 > t > 1
  

  var t1 = ta*l1,
    t2 = l1 + tb*l2;

  //console.log('t1: '+t1+' t2: '+t2);

  var P1  =
    (
      (
        + (-A0+3*A1-3*A2+A3)*Math.pow(ta, 3)
        + (3*A0-6*A1+3*A2)*Math.pow(ta, 2)
        + (-3*A0+3*A1)*ta
        + A0

        +A0*Math.pow(t1, 3)
        -B3*Math.pow(t1, 3)
        -3*A0*Math.pow(t1, 2)
        +3*A0*t1
        - A0
      )
      -
      (
        + (-B0+3*B1-3*B2+B3)*Math.pow(tb, 3)
        + (3*B0-6*B1+3*B2)*Math.pow(tb, 2)
        + (-3*B0+3*B1)*tb
        + B0

        +A0*Math.pow(t2, 3)
        -B3*Math.pow(t2, 3)
        -3*A0*Math.pow(t2, 2)
        +3*A0*t2
        - A0
      ) * (
        -3*Math.pow(t1, 3)
        +3*Math.pow(t1, 2)
      ) / (
        -3*Math.pow(t2, 3)
        +3*Math.pow(t2, 2)
      )
    ) / (
      + (
        +3*Math.pow(t1, 3)
        -6*Math.pow(t1, 2)
        +3*t1
      )

      - (
        +3*Math.pow(t2, 3)
        -6*Math.pow(t2, 2)
        +3*t2
      ) * (
        -3*Math.pow(t1, 3)
        +3*Math.pow(t1, 2)
      ) / (
        -3*Math.pow(t2, 3)
        +3*Math.pow(t2, 2)
      )
    );

  var P2 =
    (
      + (-B0+3*B1-3*B2+B3)*Math.pow(tb, 3)
      + (3*B0-6*B1+3*B2)*Math.pow(tb, 2)
      + (-3*B0+3*B1)*tb
      + B0

      +A0*Math.pow(t2, 3)
      -B3*Math.pow(t2, 3)
      -3*A0*Math.pow(t2, 2)
      +3*A0*t2
      - A0
    ) / (
      -3*Math.pow(t2, 3)
      +3*Math.pow(t2, 2)
    )
    - P1*(
      +3*Math.pow(t2, 3)
      -6*Math.pow(t2, 2)
      +3*t2
    ) / (
      -3*Math.pow(t2, 3)
      +3*Math.pow(t2, 2)
    );    

  return [P1, P2];
}

/* //1
var x = joinAtT(0, 3.9433756729740645, 4.77670900630739,   7.405626121623441, 
        7.405626121623441, 8.110042339640744, 8.943375672974064, 10),
  y = joinAtT(5, 1.0566243270259355, 6.443375672974069,   6.443375672974065, 
        6.443375672974065, 6.443375672974187, 6.0566243270259355, 5)
*/

/*var x = joinAtT(20, 5.8434077478619635, 34.22262536532115, 61.46435649530995, 
        61.46435649530995, 67.89812341484622, 74.26844386080806, 80)
  y = joinAtT(50, 11.574963887053897, 59.857540200594464, 59.857540200594485,
        59.857540200594485, 59.857540200592844, 57.16444517398992, 50)
*/

//console.log(x, y);

const test1 = function(){
 var  r = 50,
      c = {
        x: 0,
        y: 50
      },
      angle, x, y, 
      length,

      chart = '', 
      quarter;

  const getLength = getLengthGaussLegendre;

  for (let i = 0; i < 360; i+=10) {
    
    if (i>=0   && i<=90){
      angle = i*Math.PI/180;
      x = c.x + r*Math.cos(angle);
      y = c.y - r*Math.sin(angle);

      quarter = 1;
    }
    else
    if (i>90  && i<=180){
      angle = (180-i)*Math.PI/180;
      x = c.x - r*Math.cos(angle);
      y = c.y - r*Math.sin(angle);

      quarter = 2;
    }
    else
    if (i>180 && i<=270){
      angle = (i-180)*Math.PI/180;
      x = c.x - r*Math.cos(angle);
      y = c.y + r*Math.sin(angle);

      quarter = 3;
    }
    else
    if (i>270 && i<=360){
      angle = (360-i)*Math.PI/180;
      x = c.x + r*Math.cos(angle);
      y = c.y + r*Math.sin(angle);

      quarter = 4;
    }

    length = getLength(
      c.x, x, 100, 100,
      c.y, y, 100, 50
    );

    chart += quarter+'\t'+i+'\t'+length+'\t'+x+'\t'+y+'\n';

  };

}



/*

var x = getP2(20, 2.5, 50, 80, 0, )
50, 2.5, 87.5, 50 */


const test = function(X0,X1,X2,X3, Y0,Y1,Y2,Y3, Xn,Yn){
  var  a = (-X0+3*X1-3*X2+X3), //*Math.pow(t, 3),
    b = (3*X0-6*X1+3*X2), //*Math.pow(t, 2),
    c = (-3*X0+3*X1), //*Math.pow(t, 1),
    d = X0, 

    f = (-Y0+3*Y1-3*Y2+Y3), //*Math.pow(t, 3),
    g = (3*Y0-6*Y1+3*Y2), //*Math.pow(t, 2),
    k = (-3*Y0+3*Y1), //*Math.pow(t, 1),
    l = Y0;
  /*

  Xn = a*t^3 + b*t^2 + c*t + d
  Yn = f*t^3 + g*t^2 + k*t + l

  a*t^3 =  - a*g/f*t^2 - a*k/f*t - a*l/f + a*Yn/f  

  0 =  t^2*(b - a*g/f) + t*(c - a*k/f) + (a*Yn/f - a*l/f + d - Xn)

  t = (  -(c - a*k/f) +- sqrt( (c - a*k/f)^2 - 4*(b - a*g/f)*(d + a*Yn/f - a*l/f - Xn) )  )/(2*(b - a*g/f))

  if all of point's xs and ys are given positive values ->

  t = (  -(c - a*k/f) + sqrt( (c - a*k/f)^2 - 4*(b - a*g/f)*(d + a*Yn/f - a*l/f - Xn) )  )/(2*(b - a*g/f))

  */
  
  var  t1 = ( - ( c - a*k/f ) + Math.sqrt( Math.pow( (c - a*k/f), 2) - 4*( b - a*g/f )*( d + a*Yn/f - a*l/f - Xn ) ) )/( 2*( b - a*g/f ) ),
    t2 = ( - ( c - a*k/f ) - Math.sqrt( Math.pow( (c - a*k/f), 2) - 4*( b - a*g/f )*( d + a*Yn/f - a*l/f - Xn ) ) )/( 2*( b - a*g/f ) );

  return (t1>0&&t1<1) ? t1 : t2;
}




