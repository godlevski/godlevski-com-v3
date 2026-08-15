import courierFont from "./assets/fonts/courier/courier-webfont.woff";
import tnLightFont from "./assets/fonts/tn-light/tn-light-webfont.woff";

const head = document.getElementsByTagName('head')[0];

//console.log('head is', head);

function createFontPreloadLink(fontHref){
  const fontLink = document.createElement('link');

  fontLink.setAttribute('rel', 'preload');
  fontLink.setAttribute('href', fontHref);
  fontLink.setAttribute('as', 'font');
  fontLink.setAttribute('type', 'font/woff');

  return fontLink;
}

head.appendChild(createFontPreloadLink(courierFont));
head.appendChild(createFontPreloadLink(tnLightFont));

//console.log(courierFont, tnLightFont);