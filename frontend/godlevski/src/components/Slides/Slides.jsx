import React, {useState, useEffect, useRef} from "react";

import styles from "./Slides.module.css";

import Loading from "../Loading/Loading.jsx";

import {animated} from "react-spring";

const root = "http://localhost/godlevski/files/slides/";

export const Scroller = ({className, children, reference, ...props}) =>
  <div
    ref={reference}
    className={styles.scroller + ' ' + (className || '')} 
    {...props}>
    {children}
    <style>{"body {user-select: none !important;}"}</style>
  </div>;


export const SlideContainer = ({restrained, children, className, ...props}) => 
  <div 
    className={styles.container + ' ' + (className || '') + ' ' + (restrained ? styles.containerRestrained : '')} 
    {...props}>
    {children}
  </div>;


export const Slides = ({slides=[], style, fullHeight, previewHeight, children, maxHeight, onEffect=function(){}, reference=null}) => {

  useEffect(function(){
    //console.log('use effect fired', onEffect);
    onEffect();

  }, []);

  return <animated.ul
            ref={reference}
            className={styles.slidesBody} 
            style={style}>
    <style>{'.'+styles.slidesBody+'{ max-height:'+ maxHeight +'px; }'}</style>
    {slides.map(slide => Slide({...slide, fullHeight, previewHeight, self: slide}))}
    {children}
  </animated.ul>
}

export const Slide = ({type, ...args}) => {
  switch(type){
    case 'image': 
    default:
      return <li id={args['id']} className={styles.slide+' '+(args['isCurrent'] ? 'current' : '')}>{SlideImg(args)}</li>
      break;
  }
}

const SETTINGS = {
  previewQuality: 0.2,

};

export const SlideImg = ({filename, fullHeight, previewHeight, isCurrent, self={}, reference, minWidth}) => {
  
  const [isLoaded, setLoadedState] = useState(self.loaded && self.loaded[0] >= fullHeight
    ? true
    : false);

  function setLoaded(){
    if( !Array.isArray(self.loaded) ) self.loaded = [];
    self.loaded.push(fullHeight);
    self.loaded.sort((a, b) => b - a);

    setLoadedState(true);
  }

  return <>
    
    <img
      ref={reference}
      className={styles.imgPreview +" "+(isLoaded ? ' loaded': '')} 
      src={filename+'?h='+previewHeight+'&q='+SETTINGS.previewQuality+'&p=true'}
      style={{
        minWidth: minWidth+'px'
      }}

     />
    
    {isCurrent && !isLoaded 
      ? <Loading className={styles.loadingIcon+" "+(isLoaded ? ' loaded': '')} scheme="blue" />
      : null}
    
    <img
      onLoad={setLoaded}
      className={styles.imgFull +(isLoaded ? ' active': '') +(isCurrent ? ' current': '')} 
      src={ isCurrent || isLoaded
        ? filename +'?h='+Math.ceil(fullHeight/200)*200+'&p=true'
        : null } /> 
    
  </>
}


export const Blank = ({className, ...props}) => 
  <div className={styles.blank+' '+(className||'')} {...props}/>
