import React, {useRef, useEffect} from "react";

import onresize from "../../utils/windowResize.js";

export default ({cssClipPath="", children, ...args}) => {
  const el = useRef();
  const expressions = [...cssClipPath.matchAll(/\$\{(([\d\+\-\*\/\%]|cx|cy)*?)\}/g)]; //pattern with digit, sign or variable c

  function evalBBox(bbox){
    const {width, height} = bbox;

    let clipPathString = cssClipPath;
    const centerX = width*1/2;
    const centerY = height*1/2;

    expressions.forEach(function(exp){
      const val = eval( exp[1].replace('cx', centerX).replace('cy', centerY) );

      clipPathString = clipPathString.replace(exp[0], val);
    });

    return clipPathString;
  }

  useEffect(function(){
    const listener = onresize.createListener(function(bbox){
      const {current} = el;
      if(!current) return;

      const pathString = evalBBox(bbox);

      console.log(pathString);

      el.current.style.setProperty('clip-path', pathString);
    })

    return listener.remove;
  });

  const pathString = evalBBox(onresize.latest)

  return React.createElement('div',
    {
      ref: el,
      style: {
        clipPath: evalBBox(onresize.latest)
      },
      ...args,
      children
    });
}