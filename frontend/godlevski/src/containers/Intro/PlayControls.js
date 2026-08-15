import {useRef, useEffect, useState} from "react";

import styles from "../../components/PlayControls/PlayControls.module.css";

import Icon from "../../components/SvgIcon/SvgIcon";
import PlayPause from "../../components/Buttons/PlayPause";
import {Animation} from "../../classes/CubicBezier/classes/Iteration";

function PlayControls({
  className='',
  playing:playingInput,

  onNext=()=>{},
  onPrev=()=>{},

  hoverRef={current:false}, // pause if user is pointing at something

  fps=30, //framepersecond value
  autoplayDuration=60, // value in seconds

  timerReset=(new Date())
}){
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(playingInput);
  const animation = useRef();
  const nextCallback = useRef(onNext);
  const prevCallback = useRef(onPrev);

  function onFrame(t, tDiff){
    setT(t)
  }

  function getNext(){
    nextCallback.current();
    animation.current.start();
  }

  const waitToGetNextTimeout = useRef();

  function waitToGetNext(){
    if(hoverRef.current){
      clearTimeout(waitToGetNextTimeout.current);
      waitToGetNextTimeout.current = setTimeout(waitToGetNext, 100)
    }
    else {
      getNext()
    }
  }

  function onTimerOut(){ 
    waitToGetNext()
  }

  function onCallBack(fn){
    //resetTimer
    animation.current.start();
    if(!playing) animation.current.pause();
    // call back
    fn();
  }

  // sync passed input  on change
  useEffect(function syncPassedPlaying(){
    setPlaying(playingInput);
  }, [playingInput]);

  useEffect(function updateCallBack(){
    nextCallback.current = onNext;
  },[onNext]);

  useEffect(function updateCallBack(){
    prevCallback.current = onPrev;
  },[onPrev]);

  // MOUNT hook on frame on mount, kill on out
  useEffect(function hookAnimationOnMount(){

    animation.current = new Animation(onFrame, autoplayDuration*1000, {frameRate: fps});

    animation.current.start();
    animation.current.onFinish = onTimerOut;

    return () => animation.current.stop()
  },[]);

  // listen to playing change
  useEffect(function playPause(){
    if(playing){
      animation.current.resume()
    }
    else {
      animation.current.pause()
    }
  }, [playing])

  // reset on reset
  useEffect(function resetPlaybackOnTimerPropChange(){
    animation.current.start();
  }, [timerReset])

  return (
    
    <div className={styles.playControls+' '+className}>

      <PlayPause
        className={styles.playPause}
        onClick={() => setPlaying(!playing)}
        playing={hoverRef.current ? false : playing}
        timer={t} />

      <Icon 
        onClick={() => onCallBack(prevCallback.current)}
        className={styles.navArrows+' '+styles.prev} name="mediumarrow" style={{transform:"rotate(180deg)"}} />
      <Icon 
        onClick={() => onCallBack(nextCallback.current)}
        className={styles.navArrows+' '+styles.next} name="mediumarrow" />
      
    </div>
  )
}

export default PlayControls;