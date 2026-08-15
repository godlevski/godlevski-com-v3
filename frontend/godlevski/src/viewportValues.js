import windowResize from "./utils/windowResize";

const viewportMeta = document.getElementById('viewportMeta');

let screenWidth = 0;
let screenOrientation = "portrait";

let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);

function setOrientation(){
  // if window orientation
  // Deprecated, but only one supported by safari
  if(window.orientation != undefined){
    const {orientation} = window;

    if(orientation == 90 || orientation == -90){
      screenOrientation = "landscape"
    }
    else {
      screenOrientation = "portrait"
    }
  }
  else if(window.screen.orientation){
    const {orientation} = window.screen;
    if(orientation === "landscape-secondary" || orientation === "landscape-primary"){
      screenOrientation = "landscape"
    }
    else {
      screenOrientation = "portrait"
    }
  }
}

function setContentWidth(){
  
  const renderedScreenWidth = screenOrientation == "portrait" ? window.screen.width : window.screen.height;

  if(screenWidth != renderedScreenWidth){
    
    if(renderedScreenWidth > 640 && renderedScreenWidth < 960){
      viewportMeta.setAttribute('content', 'width=960');
      //console.log('setting to 960');
    }

    if(renderedScreenWidth <= 640){
      viewportMeta.setAttribute('content', 'width=640');
      //console.log('setting to 640');
    }

    screenWidth = renderedScreenWidth;

    // setTimeout(function(){
    //   const cur = windowResize.getCurrent();
    //   //console.log('cur is', cur, window.innerWidth, window.innerHeight);
    //   //console.log('current is '+current.width+' '+current.height+' '+screenOrientation+' | '+window.screen.width+' '+window.screen.height+' | '+renderedScreenWidth)
    //   windowResize.fire( cur )

    // }, 200)

    // timeout is needed for meta tag change to take effect
    // double check that the sizing is done done
    setTimeout(function(){
      const current = windowResize.getCurrent();
      //console.log('cur is', cur, window.innerWidth, window.innerHeight);
      //console.log('current is '+current.width+' '+current.height+' '+screenOrientation+' | '+window.screen.width+' '+window.screen.height+' | '+renderedScreenWidth)
      windowResize.fire( current )

    }, 500)
    

    //windowResize.fire( current )
    
  }

  //console.log('screen width, screen', screenOrientation, renderedScreenWidth, window.screen, viewportMeta.getAttribute('content'));

}

function setValues(){
  setOrientation();
  setContentWidth()
}

setValues()

windowResize.addListener(setValues)