import {useState, Fragment, useRef, useEffect} from "react";



//import data from "../../temp/sample_intro_data.js";

import styles from "../../pages/Intro/Intro.module.css";

import Loading from "../../components/Loading/Loading";

import Shapefiles from "./Shapefiles.js";
import DotNav from "../../components/DotNav/DotNav";

import PlayControls from "./PlayControls";

import Expandable from "../../components/ExpandableContainer/ExpandableContainer";
import ToolIcon from "../../components/ToolsIcons/ToolsIcons";

import {touchListeners} from "../../utils/mobileHelpers";

import {introDataKnot, messageKnot} from "../../controllers/Knots";
import {useHot} from "../../classes/Knot/Knot";

export default ({children}) => {

  const [slideI, setSlideI] = useState(0);
  const [data] = useHot(introDataKnot);

  const hoverStatus = useRef();

  const timerReset = useRef(new Date());

  useEffect( function getIntroDataIfEmpty(){

    if(!data){
      introDataKnot.getIntro()
    }
  }, [])

  useEffect(function useTouchEventListeners(){
    const listener = touchListeners.addListener(function({ direction, distance }){

      //console.error('it moved', direction, distance)

      if(direction == 'left' || direction == 'up'){
        // forward
        api.current.goNext()
      }
      else if(direction == 'right' || direction == 'down'){
        // backward
        api.current.goPrev()
      }

    })

    return listener.remove;
  },[]);

  function goNext(){

    if(!data) return;
    
    const next = (slideI+1) < data.length ? (slideI+1) : 0;
    timerReset.current = new Date();
    //console.error('!! this is spartaaaaaaaa next', data.length, slideI, next)
    setSlideI(next);
  }

  function goPrev(){

    if(!data) return;
    
    const prev = (slideI-1) >= 0 ? (slideI-1) : data.length-1;
    timerReset.current = new Date();
    //console.error('!! this is spartaaaaaaaa prev', data.length, slideI, prev)
    setSlideI(prev);
  }

  const api = useRef();

  api.current = {
    goNext,
    goPrev
  }

  const slide = data&&data[slideI]||{};
  const {title, text, tags, icons} = slide;

  return (!data ?
  <Loading scheme="white" style={{marginTop: '100px'}}/>
  :
  <>
    <DotNav
      current={slideI}
      className={styles.dotNav}
      count={data.length}
      onClick={(slidenum) => { setSlideI(slidenum) }} />

    <Shapefiles
      viewBox="0 0 560 400"
      className={styles.slidesContainer} 
      slideI={slideI}
      shapefiles={data.map( slide => slide.shapefile )} />

    <PlayControls 
      className={styles.playControls}
      onNext={goNext}
      onPrev={goPrev}
      playing={true}
      hoverRef={hoverStatus}
      autoplayDuration={90} 
      timerReset={timerReset.current} />


    {title&&text ? (['apear every time']).map(() => (
      
      <div
        onMouseEnter={e => {hoverStatus.current = true}}
        onMouseLeave={e => {hoverStatus.current = false}} 
        key={Date.now()+''} className={styles.introDescription+' '+styles.appear}>
        <h1>{title.split(/\n{1,}/g).map( (t,i) => [t,<br key={i} />])}</h1>
        <p>{text}</p>
        
        {tags
          ?
        <Expandable
          className={styles.expoxes+' '+styles.tagsBox}
          theme="white">
          
          {tags.map((tag,i) => tag=="" ? <br key={i}/> : <span key={tag} className={styles.tag}>{tag}</span>)}    
        </Expandable>
          : null
        }

        {icons
          ?
        <Expandable
          className={styles.expoxes+' '+styles.toolBox}
          theme="white">
          
          {icons.map((icon,i) => icon=="" ? <br key={i}/> : <ToolIcon key={icon} name={icon} />)}    
        </Expandable>
          : null
        }

      </div>

      )) : null}

    {children}
  </>

)
}