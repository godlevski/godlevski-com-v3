export function kickstart(jointGroup, stepMs=200){

  setTimeout( function(){
    
    const group = 3;

    jointGroup.forAnchors( (anchor,i) => {
      
        if(!(i % group)) return;

        anchor.velocity += Math.random() > 0.5 
            ? 8 * Math.random()
            : -8 * Math.random();

    })

  }, stepMs);

  setTimeout( function(){
    
    const group = 7;

    jointGroup.forAnchors( (anchor,i) => {
      
        if(!(i % group)) return;

        anchor.velocity += Math.random() > 0.5 
            ? 10 * Math.random()
            : -10 * Math.random();

    })

  }, stepMs*2);

  setTimeout( function(){
    
    const group = 2;

    jointGroup.forAnchors( (anchor,i) => {
      
        if(!(i % group)) return;

        anchor.velocity += Math.random() > 0.5 
            ? 15 * Math.random()
            : -15 * Math.random();

    })

  }, stepMs*3);

  
}

export function chainTrigger(jointGroup, stepMs=200){

  jointGroup.forAnchors( (anchor,i) => {
    setTimeout( function(){
      anchor.velocity += Math.random() > 0.5 
        ? 10 * Math.random()
        : -10 * Math.random();

    }, stepMs*i); 
  })

}

export function chainTriggerPoints(points, stepMs=200, variable=10){

  points.forEach( (point, i) => {
    setTimeout( function(){
      point.velocity += Math.random() > 0.5 
        ? variable * Math.random()
        : -variable * Math.random();

      //console.log('timer i off', i);

    }, stepMs*i); 


  })
   

}