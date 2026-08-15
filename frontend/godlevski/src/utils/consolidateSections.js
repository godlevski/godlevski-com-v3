// this will accept a number of [start,finish] points as an arguments, 
// and return a single consolidate array of [start,finish] points
// merging interlacing segments
/*
  //Consider following example
  
  // input
  let timeSections = [
    [830,1230]  ,
    [1015,1030],          [1331,1431] ,
    [1000,1100], [1200,1330],         [1500,1700] ,
      [1130,1145],       [1340,1400] ,
    [0,800], [2000, 2400]
  ];

  //output
  [
    [0, 800]
    [830, 1330]
    [1331, 1431]
    [1500, 1700]
    [2000, 2400]
  ]
  
*/

const consolidateSections = (...sections) => {
  if(sections.length === 1) return sections;
  let markers = [], 
      consolidatedSections = [];

  // convert all entries to S and F markers with time values
  sections.forEach( entry => {
    markers.push(['s', entry[0]]);
    markers.push(['f', entry[1]]);
  });

  // sort markers by time values
  markers.sort(function(a, b){
    let an = a[1]*1, bn = b[1]*1; 
    return an === bn ? 0 : (an > bn ? 1 : -1);
  });

  // if doesnt start with 's' marker => something is wrong
  if(markers[0][0] !== 's'){
    console.warn('consolidateSchedulesA: something is wrong with the input');
    return null
  } 

  // consolidate intersecting markers
  let start = 0, 
      bulk = 0;

  markers.forEach(marker => {
    // new bulk ?
    if(bulk === 0){
      start = marker[1];
    }

    if(marker[0] === 's'){
      bulk++
    }

    if(marker[0] === 'f'){
      bulk--
    }

    if(bulk === 0){
      consolidatedSections.push([start, marker[1]]);
    }
  });

  return consolidatedSections;
};

export {consolidateSections};

export default consolidateSections;