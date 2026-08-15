import {useEffect, useState, useRef} from "react";

export const useConnect = (jack, obj) => {

  function hookUnhookOnMount(){

    jack.connect(obj);

    return function(){
      jack.disconnect();
    }

  }

	useEffect(hookUnhookOnMount, [])
}
													// jack, name?, func 
export const useListener = (jack, ...args) => {
  const name = typeof args[0] === 'string' ? args[0] : '';
  const func = args[args.length-1];
  const fref = useRef();

  // hook it through a ref to have access to new State variables
  fref.current = func;

  function hookUnhookOnMount(){
    
    const listener = jack.createListener(name, function(...args){
       fref.current(...args);
    })

    return function(){
      listener.remove();
    }

  }

  // hook it on mount, unhook on unmount to commutator
	useEffect(hookUnhookOnMount, []);

  // optionally pass in dependencies and invoke on dependency changes
  // so far I cant see why would I complicate it this way instead of keeping ti dead simple
  //const dependencies = Array.isArray(args[args.length-1]) ? args.splice(args.length-1, 1)[0] : [];
  
}

const singulars = {};

export const useListenerSingular = (jack, ...args) => {
  
  const id = jack.callsign + (typeof args[0] == 'string' ? '-' + args[0] : '');

  if(!singulars[id]) singulars[id] = 0;

  const name = typeof args[0] === 'string' ? args[0] : '';
  const func = args[args.length-1];
  const fref = useRef();

  // hook it through a ref to have access to new State variables
  fref.current = func;

  function hookUnhookOnMount(){
    
    singulars[id] += 1;

    if(singulars[id] > 1) return;

    const listener = jack.createListener(name, function(...args){
       fref.current(...args);
    })

    return function(){
      listener.remove();
      singulars[id] -= 1;
    }

  }

  // hook it on mount, unhook on unmount to commutator
  useEffect(hookUnhookOnMount, []);

}

// untested
export const useHot = (jack, path, ...args) => {
  const hot = useState();

  useListener(jack, path, function(){
    hot[1](...args)
  })

  function setHot(what){
    jack.say(path, what);
  }

  return [hot[0], setHot];
}