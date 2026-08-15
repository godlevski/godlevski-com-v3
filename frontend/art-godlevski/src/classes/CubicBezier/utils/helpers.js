// ---------------------------------------------------------
// SIGNLE HELPERS (depend on some of above)
// ---------------------------------------------------------
export const getPointSector = (point, center=[0,0]) =>
  /* 
    assume sectors
    2 | 3   -- | +-     y
    -----   -------   x-|-+
    1 | 0   -+ | ++     +
  */
  // over y -> add 3, over x -> minusone; absolute
  Math.abs( ( (point[1]-center[1]) >= 0 ? 0 : 3) + ( (point[0]-center[0]) >= 0 ? 0 : -1) );

export const triangleHeightTo = function(b, c, d, heightTo){
    const p = 0.5 * ( b + c + d );
    return (
      2 * Math.sqrt( 
        p * 
        (p-b) *
        (p-c) *
        (p-d)  
      ) 
    )/ heightTo
}

export const pointsDistance  = function(p0, p1){
  return Math.sqrt(Math.pow(p0[0]-p1[0], 2) + Math.pow(p0[1]-p1[1], 2))
}

export const rotatePoint = function(point, center, degrees, israd){
  const deg = degrees < 0 ? (360 + degrees % 360) : degrees % 360;
  const rad = israd ? degrees : deg * Math.PI/180 * -1;

  const dx = point[0]-center[0];
  const dy = point[1]-center[1];

  return [
    dx * Math.cos(rad) + dy * Math.sin(rad) + center[0],
    - dx * Math.sin(rad) + dy * Math.cos(rad) + center[1]
  ]
}

export const middlePoint = function(p0, p1){
  const dX = Math.max(p0[0],p1[0])-Math.min(p0[0],p1[0]);
  const middleX = Math.min(p0[0],p1[0])+dX/2;

  const dY = Math.max(p0[1],p1[1])-Math.min(p0[1],p1[1]);
  const middleY = Math.min(p0[1],p1[1])+dY/2;

  return [middleX, middleY];
}

export const pointAtSectionT = function(t, p1, p2){
  return [
    p1[0] + (p2[0]-p1[0]) * t, 
    p1[1] + (p2[1]-p1[1]) * t 
  ]
}


export const getSlope = function(p0, p1){
  // slope is m = deltaY/deltaX

  return (p0[1]-p1[1])/(p0[0]-p1[0]);
}

export const getYatLinesX = function(p0, p1, X){
  // line formula y = m*x + b;
  // where 
  //  m is a slope: deltaY/deltaX
  //  b is where line intersects Y axis = (0,b) 
  
  // slope 
  const m = (p0[1]-p1[1])/(p0[0]-p1[0]);
  // b = y-m*x;
  const b = p0[1]-m*p0[0];

  return m*X+b;
}

export const getPerdendicularOffsetAtDistance = function(p0, p1, distance=0){
  // offset is hypotenuse distance
  const o = distance;
  
  // slope is delta y / delta x
  const dx = p0[0]-p1[0];
  
  if(dx === 0){
    // this is a vertical line, we can't divide by zero, 
    // but perpendicular to vertical line — horizontal line
    // so intersect is at [p0[0],point[1]]
    return [o,0];
  }
  const dy = (p0[1]-p1[1]);
  const m = dy/dx;
  
  // perpendicular slope is m*mp = -1 => 
  const mp = -1/m;

  // we are looking for point on a distance where o^2 = odx^2 + ody^2
  // long story short
  console.log('mp', mp);

  const odx = o / Math.sqrt(2+mp*mp);
  const ody = mp * odx;

  console.log('odx, ody', odx, ody);

  return [odx * (mp < 0 ? -1 : 1) * (dx < 0 ? -1 : 1), ody * (mp < 0 ? -1 : 1) * (dx < 0 ? -1 : 1)];
}

export const pointToLineIntP = function(point, p0, p1){
  const dx = p0[0]-p1[0];
  if(dx === 0){
    // this is a vertical line, we can't divide by zero, 
    // but perpendicular to vertical line — horizontal line
    // so intersect is at [p0[0],point[1]]
    return [p0[0],point[1]];
  }
  // slope is delta y / delta x
  const m = (p0[1]-p1[1])/dx;
  // b is where line intersects Y axis = (0,b)
  const b = p0[1] - m * p0[0];

  // perpendicular slope is m*mp = -1 => 
  const mp = -1/m;


  // point[1] = mp*point[0] + bp
  const bp = (point[1] - mp*point[0]);
  // two lines intersect where x and y is equal =>
  // m * x + b = mp * x + bp; =>
  // (m-mp)*x + (b-bp) = 0 =>

  const x = - (b-bp)/(m-mp);
  const y = m * x + b;

  return [x,y];
}



export const pointAtSegmentDistance = function(p0, p1, distance){
  
  if(distance == 0) return [...p0];

  const dx = p1[0]-p0[0];
  const dy = p1[1]-p0[1];
  const givenDistance = Math.sqrt(dx*dx+dy*dy);
  const t = distance/givenDistance;

  return [
    p0[0] + dx * t, 
    p0[1] + dy * t
  ];
}

export const pointAtSegmentT = function(p0, p1, t){
  const dx = p1[0]-p0[0];
  const dy = p1[1]-p0[1];

  return [
    p0[0] + dx * t, 
    p0[1] + dy * t
  ];
}

export const pointOnAngle = function(rad, r, center){
  return [
    center[0] + Math.cos(rad) * r,
    center[1] + Math.sin(rad) * r,
  ]
}

export const segmentsIntersection = function(p0, p1, p2, p3){
  // f(x) -> y = mx+b (m:slope, b:y at x=0)
  const m1 = (p1[1]-p0[1])/(p1[0]-p0[0]);
  const m2 = (p3[1]-p2[1])/(p3[0]-p2[0]);

  //console.log(p0, p1, p2, p3);

  const b1 = p0[1] - (m1*p0[0]);
  const b2 = p2[1] - (m2*p2[0]);

  const ix = (b2-b1)/(m1-m2);
  const iy = m2*ix+b2;

  //console.log('ix is...', ix, b2);

  /*console.log('slope, b:', m1, b1);
  console.log('ix, iy', ix, iy);*/

  return [ix, iy];
}

// ---------------------------------------------------------
// COMPOSITE HELPERS (depend on some of above)
// ---------------------------------------------------------
export const absoluteAngle =  function(p0, p1){
  const sector = getPointSector(p1, p0);
  const offset = sector * 90 * Math.PI/180;
  const dx = p1[0]-p0[0];
  const dy = p1[1]-p0[1];

  const angleToAxisCC = Math.atan( Math.abs (
    sector % 2
    // sector 1,3
    ? dx/dy
    // sector 0,2
    : dy/dx
    ));

  return offset + angleToAxisCC;
}


export const circlesIntersect = function( c1, r1, c2, r2 ){

  // consider https://mathworld.wolfram.com/Circle-CircleIntersection.html
  const R = r1;
  const r = r2;
  const dx = pointsDistance( c1, c2 );

  //circles too far appart
  if( dx >= R + r ) return null;
  // smaller circle fully contained in a bigger circle
  if( dx < Math.max(R,r) && (dx + Math.min(R,r)) < Math.max(R,r)) return null;

  const x = (dx*dx - r*r + R*R) / (2 * dx);
  const y = Math.sqrt( R*R - x*x );

  const rad = absoluteAngle( c1, c2 );

  
  
  // consider rotation helper
  return [
    [x * Math.cos(-rad) + y * Math.sin(-rad) + c1[0],
     - x * Math.sin(-rad) + y * Math.cos(-rad) + c1[1]],

    [x * Math.cos(-rad) + (-y) * Math.sin(-rad) + c1[0],
     - x * Math.sin(-rad) + (-y) * Math.cos(-rad) + c1[1]]
  ];
 
}

