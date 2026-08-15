import {useEffect, useRef} from "react";

import Listeners from "./listeners.js";

class WindowResize extends Listeners {

  constructor(){
    super();

    const th = this;

    this.latest = this.getCurrent();

    // Create single event listener, to get body bb box on resize and call listeners with it
    window.addEventListener('resize', function(){
      const bBox = th.getCurrent();

      th.latest = bBox;

      th.fire(bBox);
    });

    return th;
  }

  getCurrent = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  }) //document.getElementsByTagName('body')[0].getBoundingClientRect();
}


const resizeListeners = new WindowResize(); //{fn, id}

const useResizeEffect = function(fn){
  const timeout = useRef();
  const init = useRef(false);
  const listener = useRef();

  // add listener right away
  // if(!init.current){
  //   init.current = true;
  //   console.error('init');
  //   listener.current = resizeListeners.addListener(function(){
  //     clearTimeout(timeout.current);
  //     timeout.current = setTimeout(fn, 5);
  //   });
  // }
  
  useEffect(function(){
    // destroy listener on unmount

    const l = resizeListeners.addListener(function(){
      clearTimeout(timeout.current);
      timeout.current = setTimeout(fn, 5);
    }, fn);

    listener.current = l;
    
    return function(){
      //console.error('removing listener', listener.current, [...resizeListeners.listeners], listener.current.remove(), [...resizeListeners.listeners]);
      listener.current.remove()
    }
  },[]);

  return listener;
}

export default resizeListeners;
export {
  useResizeEffect
}

