export default class Joint {
  constructor(source){
    this.handleF = null;
    this.handleB = null;
    this.anchor = null;

    this.els = {
      handleF: null,
      handleB: null,
      anchor: null
    }

    Object.entries(source).forEach( ([key, value]) => {
       this[key] = value;
    })
  }

  flatten(){
    const res = [];
    if (this.handleB) res.push(this.handleB);
    if (this.anchor) res.push(this.anchor);
    if (this.handleF) res.push(this.handleF);

    return res;
  }

  forEach(fn = function(){}){
    if (this.handleB) fn(this.handleB, 'handleB', this);
    if (this.handleF) fn(this.handleF, 'handleF', this);   
    if (this.anchor) fn(this.anchor, 'anchor', this);
  }

  map(fn = function(){}){
    return {
      handleB: (this.handleB)
        ? fn(this.handleB, 'handleB', this)
        : null,
      handleF: (this.handleF)
        ? fn(this.handleF, 'handleF', this)
        : null,

      anchor: (this.anchor)
        ? fn(this.anchor, 'anchor', this)
        : null, 

      els: {
        handleF: null,
        handleB: null,
        anchor: null
      }
    }
  }

  copy(){
    return this.map( point => [...point] )
  }

  getHandlesLength(){
    const j = this;
    
    const res = {
      handleF: null,
      handleB: null   
    }

    if(j.handleF){
      const fx = j.anchor[0] - j.handleF[0];
      const fy = j.anchor[1] - j.handleF[1];

      res['handleF'] = Math.sqrt( fx*fx + fy*fy );
    }

    if(j.handleB){
      const bx = j.anchor[0] - j.handleB[0];
      const by = j.anchor[1] - j.handleB[1];

      res['handleB'] = Math.sqrt( bx*bx + by*by );
    }
    
    return res;
  }


}