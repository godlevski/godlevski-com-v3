import React, {useEffect, useState, useRef} from "react";

import Listeners from "../../utils/listeners.js";

//import UID from "@utils/UID";

export default class Knot {
  constructor(state){
    this.state = state;
    this.listeners = new Listeners();
  }
  
  setState(state){
    this.state = state;
    this.listeners.fire(state);
  }
}

// useHot hook for Listeners object
export const useHot = ({state, listeners}) => {
  // if(listeners instanceof Listeners){
  //   throw Error("listeners has to be instance of class Listeners from utils");
  // }
  // declare local state
  const [localState, setLocalState] = useState(state);
  const listenerRef = useRef();

  // bind listener on component's mount, remove listener on unmount
  useEffect(function bindOnMount(){

    // add listener to knot listeners object
    const listener = listeners.addListener(function globalChangeListener(state){
      // change local state
      setLocalState(state);
    });

    listenerRef.current = listener;

    return listener.remove
  }, []);

  function setGlobalState(state){
    listeners.fire(state);
  }

  // return state like pattern
  return [localState, setGlobalState, listenerRef];
}