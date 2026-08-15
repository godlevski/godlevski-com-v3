const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export {isFirefox};

const isSafari = (function(){
  return navigator.userAgent.toLowerCase().indexOf('safari/') > -1 && navigator.userAgent.toLowerCase().indexOf('chrome/') < 0;
}())

export {isSafari};

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export {isMobile};

const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);

export {isIos};