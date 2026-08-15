export default function svgpathcurveToPoints(svgpathcurve){
  const curve = svgpathcurve;
  const l = Object.entries(curve).length / 2;
  const points = [];

  for(let i = 1; i < l; i++){
    const postfix = i+"";
    
    const point = [  curve["x"+postfix],
                     curve["y"+postfix]];

    points.push(point);
  }
  points.push([  curve["x"],
                 curve["y"]]);

  return points;
}

export const svgpathcurveToValues = function(svgpathcurve){
  const curve = svgpathcurve;
  const l = Object.entries(curve).length / 2;
  const values = [];

  for(let i = 1; i < l; i++){
    const postfix = i+"";
    
    values.push(curve["x"+postfix]);
    values.push(curve["y"+postfix]);
  }
  values.push(curve["x"]);
  values.push(curve["y"]);

  return values;
}

export const svgpathcurvesToValues = function(svgpathcurves){
  const values = [];

  svgpathcurves.forEach(curve => {
    const l = Object.entries(curve).length / 2;

    for(let i = 1; i < l; i++){
    const postfix = i+"";
    
      values.push(curve["x"+postfix]);
      values.push(curve["y"+postfix]);
    }
    values.push(curve["x"]);
    values.push(curve["y"]);
  })

  return values;
}