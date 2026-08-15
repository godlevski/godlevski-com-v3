export class asyncImage extends Image{
  loadSrc(src){
    return loadSrc(src, this);
  }
}

export function loadSrc(src, img){
  
  const promise = new Promise((resolve, reject) => {
    img.onload = () => resolve(img)
    img.onerror = reject
  })

  img.src = src;

  return promise;
}

export const getCroped64 = function(img, sXp, sYp, eXp, eYp, twidth, theight, quality=0.95){
  const aspectR = (eXp-sXp)/(eYp-sYp);
  const targetW = twidth || aspectR*theight;
  const targetH = theight || twidth/aspectR;

  const canv = document.createElement('canvas');
  const ctx = canv.getContext('2d');

  canv.width = targetW;
  canv.height= targetH;

  //img.src = src;
  //  const img = new Image();
  // try {
  //   await loadSrc(src, img);
  // }
  // catch (err) {
  //   console.error('error loading image');
  //   return null;
  // }

  // crop area in px
  const {width, height} = img; 
  const sX = (sXp * width)/100;
  const sY = (sYp * height)/100;
  const eX = (eXp * width)/100;
  const eY = (eYp * height)/100;

  // origin width is image width minus offseted area
  const oW = width - sX + (eX-width);
  const oH = height - sY + (eY-height);

  //console.log('img, sX, sY, oW, oH,', img, sX, sY, oW, oH);

  ctx.drawImage(img, 
    sX, 
    sY, 
    oW, 
    oH, 

    // target
    0, 0, targetW, targetH);

  const newBase64 = canv.toDataURL('image/jpeg', quality);

  return newBase64;

}

export default getCroped64;