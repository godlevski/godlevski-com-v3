export function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function middleColor(hex1, hex2, fraction=0.5){
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  return rgbToHex(
      Math.floor( rgb1.r + (rgb2.r-rgb1.r)*fraction ),
      Math.floor( rgb1.g + (rgb2.g-rgb1.g)*fraction ),
      Math.floor( rgb1.b + (rgb2.b-rgb1.b)*fraction )
    );
}