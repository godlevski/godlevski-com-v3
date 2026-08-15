//import data from "../../temp/sample_intro_data.js";
import {useRef, useEffect, useState} from "react";

import axios from "axios";

import Shapefile from "../Shapefile/Shapefile.js";

import Loading from "../../components/Loading/Loading";

import UID from "../../utils/UID";
import windowResize, {useResizeEffect} from "../../utils/windowResize";

import styles from "../../pages/Intro/Shapefiles.module.css";

import {useSpring} from "react-spring";

function Slides({
  slideI=4,
  shapefiles=[],
  className="",
  viewBox="",
  ...attrs
}){

  // root svg element, used to calculate offsets and staff
  const rootEl = useRef();

  // ------
  // FUNCTIONS

  // FILE LOADING
  // generic files loaded timestamp state
  const [loaded, setLoaded] = useState(false);
  // holder for files that have been loaded
  const loadedFiles = useRef({});

  const loadFile = async function (filename){
    // prevent doable loading
    loadedFiles.current[filename] = null;

    const res = await axios.get(filename);
    const {data} = res;

    if(res.status == 200){
      loadedFiles.current[filename] = {...data, id: UID(), stagedId: Date.now()}
    }
    else {
      loadedFiles.current[filename] = undefined;
    }

    return data;
  }

  // preload current file
  useEffect(async function preloadCurrentFile(){

    const filename = shapefiles[slideI];

    if(loadedFiles.current[filename]||loadedFiles.current[filename] === null) return;

    await loadFile(filename);

    //console.log('current file has loaded', loadedFiles);

    setLoaded(new Date());
    
  }, [slideI]);

  // preload all unpreloaded files
  // async files preloader, invoked on shapefiles array change
  useEffect(async function preloadAllFiles(){
    
    async function loadNext(i){
      const filename = shapefiles[i];

      if(loadedFiles.current[filename] === undefined){
        try{
          await loadFile(filename)
        }
        catch (error){
          console.error('error loading file, loading next')
        }
        
      }

      const next = i+1;

      if(next<shapefiles.length){
        await loadNext(next);
      }
      else {
        return true;
      }
    }

    // load all unloaded files
    await loadNext(0);

    //console.log('all files has loaded', loadedFiles);

    setLoaded(new Date());

  },[shapefiles]);

  // ANIMATION OFFSET VALUE 
  // offset value of start of current element to the end of the window
  // to place next slide to (x value of svg element) for animation
  const startToEndOffset = useRef(null);
  const viewBoxRef = useRef();

  useEffect(function updateviewBox(){
    
    viewBoxRef.current = viewBox;
  
  },[viewBox]);

  function getStartToEndOffset(){

    if(!rootEl.current) return;
    const bBox = rootEl.current.getBoundingClientRect();
    const viewBoxArr = /(\d*)\s{1,}(\d*)$/g.exec(viewBoxRef.current);
    const viewBoxWidth = (viewBoxArr && viewBoxArr[1]) || 0

    const offset = Math.max( window.innerWidth - bBox.x, viewBoxWidth);

    startToEndOffset.current = offset;

    // set current start to end offset on the spring
    mainOffsetApi.set({x1: offset});

    //console.error('START TO END UPDATE', bBox, startToEndOffset.current, mainOffset.x.get(), mainOffset.x1.get());
  }

  useEffect(getStartToEndOffset, []);
  useResizeEffect(getStartToEndOffset);

  // SLIDES QUEUE
  // array of current state to animate between slides
  const [shapefilesQueue, setShapefilesQueue] = useState([]);

  function getSlide(filename){
    //console.log('getting slide', filename);
    if(filename === shapefilesQueue[shapefilesQueue.length-1]) return;
    
    // alternative to using restage prop
    // // if target file preloaded and already in sequence -> give it a new stagedId
    // if(shapefilesQueue.find(fname => fname === filename)){
    //   const targetShapefile = loadedFiles.current[filename];

    //   if(targetShapefile) targetShapefile.stagedId = UID();
    // }

    // soft clear queque (without resetting the state)
    clearQueque(true);

    // push it to queque set new state
    setShapefilesQueue(shapefilesQueue.length 
      ? [shapefilesQueue[shapefilesQueue.length-1], filename]
      : [filename]);

    // roll file loading
    // push filename to slides queque
    // animate queque
  }

  useEffect(() => getSlide(shapefiles[slideI]), [slideI]);

  function getNext(){
    const nextI = slideI+1 < shapefiles.length ? slideI+1 : 0;
    getSlide(shapefiles[nextI])
  }

  // ANIMATION SPRING
  // provides interface to invoke x and x1 animation
  const animationCallback = useRef(() => {});
  const [mainOffset, mainOffsetApi] = useSpring(() => ({
    x: 0,
    x1: 100000,
    from: {x:0, x1:100000},
    config: {
      tension: 80
    },
    onRest: (...arg) => animationCallback.current(...arg)
  }));

  function clearQueque(soft=false){
    mainOffsetApi.set({x: 0, x1: startToEndOffset.current});
    if(soft) return;
    setShapefilesQueue([ shapefilesQueue[shapefilesQueue.length-1] ])
  }

  useEffect(function animateSlides(){

    const queueLength = shapefilesQueue.length;

    //console.log('[shapefiles.js] QUEQUE CHANGED', queueLength, shapefilesQueue)
    function Callback(){
      //console.log('current callback for spring', queueLength);
      clearQueque();
    }
    animationCallback.current = Callback;

    //console.log('queueLength', queueLength)

    if(queueLength > 1) {
      mainOffsetApi.start({
        x: -startToEndOffset.current,
        x1: 0
      });
    }

  }, [shapefilesQueue])

  // CONNECTOR POINTS & MID ANCHORS FOR TRANSITIONAL LINE DRAWING
  // connecting next and current slide via shared points
  // to make for smooth animation
  // if connecting point is not provided, slide will calculate one 
  // from connector to the end of the screen and insert extra path, 
  // wich will then hook to this ref to use for passing to the next slide 
  const curConnectorPointsRef = useRef({});

  let secondSlideStartpoint = [];

  const nextSlideRef = useRef();
  const curSlideRef = useRef();

  useEffect(function adjoinConnectorPoints(){
    if(shapefilesQueue.length <= 1) return;
    // console.log('QUEUE CHANGED: nextSlideRef, curSlideRef, shapefilesQueue', 
    //   (nextSlideRef.current&&{
    //     startPoint: nextSlideRef.current.startPoint,
    //     endPoint: nextSlideRef.current.endPoint
    //   }), 
    //   (curSlideRef.current&&{
    //     startPoint: curSlideRef.current.startPoint,
    //     endPoint: curSlideRef.current.endPoint
    //   }),
    //   {q:shapefilesQueue}
    // );
    if(!nextSlideRef.current || !curSlideRef.current) return;

    //console.log('they all exist');
    //curSlideRef.current.svg.remove();
    //console.log('refs are: startPointRef, curSlideRef', nextSlideRef.current, curSlideRef.current);

    curSlideRef.current.endPoint.update(
      [curSlideRef.current.endPoint[0] + nextSlideRef.current.startPoint[0], 
      nextSlideRef.current.startPoint[1]]
      );

  }, [shapefilesQueue]);

  //console.log('queue', [...shapefilesQueue], mainOffset.x, mainOffset.x1);
  
  return (<>
    <svg
      viewBox={viewBox}
      {...attrs}
      ref={rootEl} 
      className={className+' '+styles.slidesContainer}>

      {  //following loop returns 1 or 2 slide elements
         //keys allow to keep element staged for smoth animation, 
         //while rearranging sequence in queque e.g. replacing first file with the next one
         //second slide will be passed end point of the first one 
         //to keep them linked while animating
         shapefilesQueue.map( (filename,i,queue) => {
          if(i>1) return null;

          const shapefile = loadedFiles.current[filename];

          //console.log('SlideS run', filename, {shapefile}, {shapefile: loadedFiles.current[filename]}, {loaded: {...loadedFiles.current}});

          if(i===0){
            return <Slide

                      key={(shapefile&&shapefile.stagedId)||UID()}
                      showFull={queue.length>1}
                      shapefileObjRef={curSlideRef}
                      shapefile={shapefile}

                      startToEndOffset={startToEndOffset}
                      viewBox={viewBox}

                      x={mainOffset.x} />
          }
          else if(i===1){
            return <Slide
                      className={styles.nextSlide}
                      restage={true}

                      key={(shapefile&&shapefile.stagedId)||UID()}
                      showFull={false}
                      shapefileObjRef={nextSlideRef}
                      shapefile={shapefile}

                      startToEndOffset={startToEndOffset}
                      viewBox={viewBox}

                      x={mainOffset.x1} />
          }
          
        })
      }

    </svg>
  </>);

}

function Slide({
  className="",
  shapefile,
  x=0,
  y=0,
  showFull=false,
  restage=false,

  viewBox="",
  startToEndOffset,

  shapefileObjRef,
  startPoint
}){

  //console.log('slide run', shapefile&&shapefile.id)

  return shapefile

    ? <Shapefile
        restage={restage}
        showFull={showFull}
        shapefileObjRef={shapefileObjRef}
        startPoint={startPoint}
        x={x}

        startToEndOffset={startToEndOffset}
        viewBoxValues={viewBox.split(/\s{1,}/g)}

        className={className+' '+styles.appear}
        shapefile={shapefile} /> 

    : <Loading x={x} viewBox="-360 -360 500 500" width="350" height="150" className={className+' '+styles.appear+' '+styles.loading} />
}

export default Slides;
export {Slide};