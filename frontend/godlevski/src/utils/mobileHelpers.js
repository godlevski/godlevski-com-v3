import Listeners from "./listeners";

function BindTouches(listeners=(new Listeners())){
  
  document.addEventListener('touchstart', handleTouchStart, false);        
  document.addEventListener('touchmove', handleTouchMove, false);

  let xDown = null;                                                        
  let yDown = null;

  function getTouches(evt) {
    return evt.touches ||             // browser API
           evt.originalEvent.touches; // jQuery
  }                                                     
                                                                           
  function handleTouchStart(evt) {
      const firstTouch = getTouches(evt)[0];                                      
      xDown = firstTouch.clientX;                                      
      yDown = firstTouch.clientY;                                      
  };                                                
                                                                           
  function handleTouchMove(evt) {
      if ( ! xDown || ! yDown ) {
          return;
      }

      const touches = getTouches(evt);
      const xUp = touches[0].clientX;                                    
      const yUp = touches[0].clientY;

      const xDiff = xDown - xUp;
      const yDiff = yDown - yUp;
                                                                           
      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
          if ( xDiff > 0 ) {
              /* left swipe */
              //console.log('swipe left', xDiff, yDiff)
              listeners.fire({
                direction: 'left',
                distance: Math.abs(xDiff),
                diffs: { xDiff, yDiff }
              })
          } else {
              /* right swipe */ 
              //console.log('swipe right', xDiff, yDiff)
              listeners.fire({
                direction: 'right',
                distance: Math.abs(xDiff),
                diffs: { xDiff, yDiff }
              })
          }                       
      } else {
          if ( yDiff > 0 ) {
              /* up swipe */
              //console.log('swipe up', xDiff, yDiff)
              listeners.fire({
                direction: 'up',
                distance: Math.abs(yDiff),
                diffs: { xDiff, yDiff }
              })
          } else { 
              /* down swipe */
              //console.log('swipe down', xDiff, yDiff) 
              listeners.fire({
                direction: 'down',
                distance: Math.abs(yDiff),
                diffs: { xDiff, yDiff }
              })
          }                                                                 
      }
      /* reset values */
      xDown = null;
      yDown = null;                                             
  };

  return listeners;
}

export const touchListeners = BindTouches();


