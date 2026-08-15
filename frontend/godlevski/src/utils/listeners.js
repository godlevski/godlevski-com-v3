// straight forward model to handle listeners

import UID from "./UID.js";

export class Listeners {

  constructor(){
    this.listeners = [];
  }

  newListener(fn=() => {return 'sf'}){
    const id = UID();
    const listener = {fn, id};

    // check if listener has legitimate function
    if(typeof listener.fn !== 'function'){
      listener.fn = function(){};
    }
    
    const th = this;

    listener.remove = function(){
      return th.removeListener(id);
    }

    //console.error('new listener', id, fn);

    return listener;
  }

  addListener(fn){
    const listener = this.newListener(fn);

    this.listeners.push(listener);

    return listener;
  }

  addListenerBefore(id, fn){
    const index = this.listeners.findIndex( ({id}) => id == id );

    if(index < 0) return null;

    const listener = this.newListener(fn);

    this.listeners.splice(index, 0, listener);

    return listener;
  }

  removeListener(id){
    let success = false;

    for(let i=0; i < this.listeners.length; i++){
      if(this.listeners[i]['id'] == id){
        this.listeners.splice(i, 1);
        success = true;
        break;
      }
    }

    return [success, this.listeners, id];
  }

  fire(...args){
    this.listeners.forEach( listener => listener.fn(...args) )
  }
}

export default Listeners;