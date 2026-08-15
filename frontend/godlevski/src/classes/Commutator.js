
class Commutator {
  constructor (map){
    this.peers = {
      ...map
    }
  }

  peers = {}

  listeners = {
    //earsIndex: '',
    ears: {},
    rootEars: {}
  }

  addListener = (namechain, func) => { // type?, function
    if(!namechain){
      console.error('first argument must be namechain value'); 
      return null;
    } 

    if(typeof func !== 'function'){
      console.error('last argument must be a function');
      return null
    }

    const uid = (Date.now()+Math.random()*1000).toFixed(0);
    const rootName = namechain.replace(/\..*$/, '');

    // create if doesnt exist
    // and recreate earsIndex
    if (!this.listeners.ears[namechain]) {
      this.listeners.ears[namechain] = {};
      //this.listeners.earsIndex = '|'+Object.keys(this.listeners.ears).join('||')+'|';
    }

    if(!this.listeners.rootEars[rootName]) {
      this.listeners.rootEars[rootName] = {};
    }

    // add listener
    this.listeners.rootEars[rootName][uid] = func;
    this.listeners.ears[namechain][uid] = func;

    return uid;
  }

  removeListener = (namechain, uid) => {
    if(!uid) return false;

    const rootName = namechain.replace(/\..*$/, '');

    const ear = this.listeners.ears[namechain];
    const rootEar = this.listeners.rootEars[rootName];

    // delete self from root ear
    if (rootEar && rootEar[uid]) {
      delete rootEar[uid];
    }

    // return result of deleting from ear
    return ear && ear[uid]
      ? delete ear[uid]
      : false;
  }

  // Call all listener functions on a given namechain
  call = (namechain, isOnRoot) => {
    let resolvedListeners = {};

    // if called on root
    // e.g. on root connect or disconnect
    // make a call on rootEars of corresponinf root name
    if(isOnRoot) {
      const rootName = namechain.replace(/\..*$/, '');

      resolvedListeners = this.listeners.rootEars[rootName];
    }

    // otherwise
    // figure out all ears we need to call 
    // e.g. name.chain.value => triggers
    // name and name.chain and name.chain.value
    // resolver listener's functions from every matched ear
    // call them all
    else {
      
      resolvedListeners = this.listeners.ears[namechain];
      

      /*
        const chain = namechain.split('.');
        const ears = this.listeners.ears[namechain];
        for(let i=0, current=''; i<chain.length; i++){
        current += (i ? '.' : '') + chain[i];

        const earForCurrent = ears[current];

        if( earForCurrent ) {
          for( let uid in earForCurrent ){
            resolvedListeners[uid] = earForCurrent[uid];
          }
        }
      }*/

    }

    if(  !resolvedListeners || 
        typeof resolvedListeners !== 'object') {
      
      resolvedListeners = {};
    }
    
    // call it
    Object.values(resolvedListeners).forEach(listenerFunction => listenerFunction() )
  }

  connect = (callsign, peer) => {
    // add peer to peers
    this.peers[callsign] = peer;
    // report event
    this.call(callsign, true);
  }

  disconnect = (callsign) => {
    this.peers[callsign] = null;
    // report event
    this.call(callsign, true);
  }

  set = (name, value) => {
    const route = name.split('.');
    const targetName = route.splice(route.length-1,1)[0];

    // console.log(route, targetName);

    // follow the route through
    // to get taget value
    const targetNode = route.reduce( (node, name) => {
      
      if(!node[name] || typeof node[name] !== 'object') {
        node[name] = {};
      }

      return node[name];
    }, this.peers);

    targetNode[targetName] = value;

    this.call(name);

    //console.log('name & val are:', name, value);

    return value;
  }

  say = (name, ...args) => {
    const route = name.replace(/\(\)$/, '').split('.');
    const isFunction = name.match(/\(\)$/);

    // follow the route through
    // to get taget value
    const target = route.reduce( (node, name) => {
      
      return typeof node === 'object' 
        ? node && node[name]
        : undefined

    }, this.peers);
    
    // if found and is a function -> call it
    if(isFunction && target){
      return target(...args);
    }
    // #TODO is a function but does not exist -> set call it when, if appears
    /*
    else if(isFunction && !target) {}
    */
    // if arguments passed -> set value to the first argument
    else if(!isFunction && args.length) {
      return this.set(name, args[0]);
    }
    // return whats found
    else {
      return target;
    }

  }

  createJack = (callsign) => {
    if( !this.peers[callsign] ){
        this.peers[callsign] = null;
    }

    const jack = {
      connect: peer => {
        this.connect(callsign, peer)
        return jack;
      },
      disconnect: () => {
        this.disconnect(callsign)
        return jack;
      },
      set: (name, value) => {
        this.set(`${callsign}.${name}`, value);
        return jack;
      },
      say: (name, ...args) => this.say(`${callsign}.${name}`, ...args),

      createListener: (...args) => { // name?, funct
        const namechain = callsign + (typeof args[0] === 'string' ? '.'+args[0] : '');
        const func = args[args.length-1];

        const uid = this.addListener( namechain , () => {
          //console.log(jack, namechain);
          func( this.say(namechain) );
        });

        return {
          uid,
          remove: () => {
            this.removeListener(namechain, uid);
          }
        }
      }
      

    }

    return jack;
  }
}

export default Commutator;