import React, {useEffect, useState, useRef} from "react";

import {Scroller, Blank, SlideContainer, Slides, Slide} from "../../components/Slides/Slides.jsx";
//import styles from "../../components/Slides/Slides.module.css";

import windowResize from "../../utils/windowResize.js";
import { onScroll, onScrollStop, enableScroll, disableScroll } from "../../utils/scroll.js";

import { useSpring, SpringValue } from 'react-spring';

import {CornerButton}  from "../../components/Navigation/Navigation.jsx";

import Label from "./Label.jsx";

import styles from "../../components/Slides/Slides.module.css";

import { useLocation } from "react-router-dom";

import {slidesIndex} from "../../temp/sample_index_data";

import {slidesKnot, messageKnot} from "../../controllers/Knots.js";
import {useHot} from "../../classes/Knot/Knot";

import settings from "../../backend.settings.js";

const input = []; //slidesIndex;
const index = {};

export default () => {
  
  const {hash} = useLocation();

  const windowSize = useRef(windowResize.getCurrent());

  //const [slidesData] = useHot(slidesKnot);
  const [inputTimestamp, setInputTimestamp] = useState();

  // Example Setup

  function transpileData(data){
    const transpiledInput = data.map(inp => ({
        id: inp.publicId,
        label: inp.client,
        tools: [],
        tags: inp.tags.map( ({tagname}) => tagname ),
        filename: settings.slideImageBase+inp.image,
        tools: inp.tools ? inp.tools.replace(/\s{1,}/g, '').split(',') : [],
        imageSize: {
          width: inp.image_width,
          height: inp.image_height
        }
      })
    );

    input.splice(0, input.length, ...transpiledInput);

    return input;
  }

  //map input
  function indexInput(input){
    input.forEach( item => {
      index[item.id] = item;

      item.reference = {current: null};
    })
  }

  // load slides if empty
  // react 19: effects must not be async (returned promise would be treated
  // as the cleanup fn) — async work runs in an IIFE inside a sync effect
  useEffect(function getSlidesIfEmpty(){ (async () => {

    if(!slidesKnot.state){
      messageKnot.setState('Loading slides');

      //console.log('getting slides')
      const res = await slidesKnot.getSlides();
      //console.log('received respose', res);

      if(res.status != 200){
        messageKnot.setState(res.message+' Try again later');
      }
    }
    else {
      indexData()
    }

  })(); }, [])

  function indexData(){
    //console.log('slides data', slidesKnot.state);
    if(!slidesKnot.state) return;

    transpileData(slidesKnot.state);
    indexInput(input);

    setInputTimestamp(new Date)
  };

  useEffect(function setupDataTranspilerOnRecive(){

    const dataListener = slidesKnot.listeners.addListener(indexData)

    return dataListener.remove;

  }, []);

  useEffect(function readHash(){

    const passedId = hash.replace('#','');
    const selectedSlide =  (index[passedId] && passedId) || currentIdHolder.current || (input[0] && input[0]['id']);

    //console.log('hash read as', selectedSlide)

    softSetSlide( selectedSlide );
    
    //console.log('slide set', selectedSlide, currentIdHolder.current )

    //console.log('readHash invoking adjustSlideView');
    adjustSlideView();
    setSlide(selectedSlide);
    
  }, [hash, inputTimestamp]);

  // MAIN

  // -- scroller filler setup
  const scrollerEl = useRef();
  const currentSlideNum = useRef();

  const scrollListener = function(){

    const scrollerContainer = scrollerEl.current;
    
    const slideNum = scrollerContainer.scrollLeft > 0
      ? Math.floor( (scrollerContainer.scrollLeft - 1) / frameHolder.current.each )
      : 0;

    if(currentSlideNum.current != slideNum){
      currentSlideNum.current = slideNum;
      const slide = input[slideNum];

      if(slide&&slide.id){
        softSetSlide( slide.id );
        //console.log('scroll invoking adjustSlideView');
        adjustSlideView();
      }
      
    }

  }

  useEffect(function hookScrollListener(){
    
    const scrollerContainer = scrollerEl.current;

    scrollerContainer.addEventListener('scroll', scrollListener);

    return function(){
      //console.log('scroller listener removed');
      scrollerContainer.removeEventListener('scroll', scrollListener);
    }
  }, [])

  // -- scroller setup
  const frameHolder = useRef();

  function setFrameHolder(){
    
    const newWidth = window.innerWidth + (window.innerWidth/5 * (input.length-1) );
    const maxScroll = newWidth - window.innerWidth;
    const each = maxScroll / input.length;

    frameHolder.current = {
      width: newWidth,
      maxScroll,
      each
    }
    
    setWidth(newWidth);
  }
  
  useEffect(setFrameHolder, [inputTimestamp]);

  // -- main state and elements

  const currentIdHolder = useRef();
  const [currentId, setCurrentId] = useState();

  function softSetSlide(id){
    currentIdHolder.current = id;
  }

  function setSlide(id){
    currentIdHolder.current = id;
    setCurrentId(id)
  }

  const containerEl = useRef();
  const slidesEl = useRef();

  const [scrollerWidth, setWidth] = useState(null);
  

  useEffect(function scrollToCurrentSlide(){
    if(currentIdHolder.current){
      scrollTo(currentIdHolder.current);
    }
    else {
      scrollTo(null,0);
    }
    
  }, [scrollerWidth])

  // -- navigation functions

  function scrollTo(id, num=null){
    let slidenum = num;

    if(num===null){
      input.forEach( (slide,i) => {
        
        if(slide.id === id){
          slidenum = i;
        }
      }); 
    }

    //console.log('scroll to fired', slidenum, frameHolder.current.each, frameHolder.current.each*slidenum+frameHolder.current.each/2);

    if(slidenum !== null && scrollerEl.current){
      scrollerEl.current.scroll({left: frameHolder.current.each*slidenum+frameHolder.current.each/2})
    }

  }

  function nextSlide(){
    const {current} = currentSlideNum;

    if(current+1 < input.length){
      scrollTo(null, current+1)
    }
  }

  function prevSlide(){
    const {current} = currentSlideNum;

    if(current-1 > -1){
      scrollTo(null, current-1)
    }
  }

  

  // -- slide holder setup
  const [viewOffset,viewOffsetApi] = useSpring(() => ({
    left: 0,
    //height: windowSize.current.height + 'px',
    from: {left: 0},
    onChange: props => {
      //console.log('adjustment step', props.value)
    },
    onRest: spring => {
      if(spring.finished){
        setSlide( currentIdHolder.current );
        //console.log('spring finished');
      }
    }
  }));

  // actions

  function currentTarget(){
    const {current} = currentIdHolder;
    
    try{
      //console.log('index[current]', index[current]);
      //console.log('index[current][reference]', index[current]['reference']);

      const target = index[current]['reference']['current'];

      //console.log('target', target);

      return target;
    }
    catch {
      return null;
    }
  }

  function adjustSlideView(){

    //console.log('adjust slide view called');
    
    const target = currentTarget();

    if(!target){
      return; // console.error('[adjustSlideView] no target found');
    }

    const currentOffset = viewOffset.left instanceof SpringValue ? viewOffset.left.get() : viewOffset.left; //Number(viewOffset.left.replace(/[a-zA-Z]/g, ''));

    const containerBB = {
      width: window.innerWidth
    }

    const targetBB = target.getBoundingClientRect();

    //console.log('target found, currentOffset, containerBB, targetBB', currentOffset, containerBB, targetBB);
    
    const containerToTarget = containerBB.width/targetBB.width;
    //console.log('targetBB', containerBB.width, targetBB.width, containerToTarget);

    const currentHeight = imageHeight.current;
    //console.log('current height', currentHeight);
    // calculate new height based on current height and derived proportions

    const targetHeight = Math.min(containerToTarget * currentHeight, windowResize.getCurrent().height); //; // 100%
    
    const scaler = targetHeight/currentHeight;

    //console.log('scaler is', scaler);

    const offsetValue = 
      (
      // scroll element to match left border 
      currentOffset - targetBB.left
      )*
      // and scale it by height change
      scaler

      // add side border
      + (containerBB.width - targetBB.width*scaler)/2;

    imageHeight.current = targetHeight;
    setImageHeightTimestamp(new Date);

    //console.log('target height', targetHeight);

    viewOffsetApi.start({
      left: offsetValue,
      //height: targetHeight+'px'
    })
  }

  // window.onkeydown = function(key){
  //   //console.log('key hit', key)
  //   if(key.keyCode == 32){
      
  //     adjustSlideView();
  //   }
  // }

  //console.log('slide ID is', currentId, currentIdHolder);


  // -- hook window resize
  

  useEffect(function hookWindowResize(){
    const listener = windowResize.addListener(function(bbox){
      //console.log('window resized', bbox);

      windowSize.current = bbox;

      setFrameHolder();
      adjustSlideView();
    });

    //console.log('window listener', listener, windowResize);

    return function(){
      //console.log('we are out once again', listener.remove)
      listener.remove()
    }
  }, [])

  //console.log('WINDOW SIZE', windowSize.current)

  const imageHeight = useRef(windowSize.current.height);
  const [imageHeightTimestamp, setImageHeightTimestamp] = useState(new Date());

  return (
    <>
    <SlideContainer
      restrained={scrollerWidth !== null ? true : false}
      reference={containerEl} >
      <Slides
        reference={slidesEl}
        style={viewOffset}
        maxHeight={imageHeight.current}>
        {input.map(slide => 
          <Slide
            key={slide.id}
            reference={slide.reference}
            isCurrent={currentId === slide.id} 
            self={slide}
            fullHeight={imageHeight.current} // loads new images with this real height
            previewHeight={200} // loads preview images with this real height
            minWidth={ (slide.imageSize.width/slide.imageSize.height)*imageHeight.current }
            {...slide}
            id={'id_'+slide.id} // mobile safari will give you shit if hash passed matches the id
             />)}
      </Slides>
    </SlideContainer>

    <Scroller
      reference={scrollerEl}>
      <Blank style={{width: scrollerWidth+'px'}} />
    </Scroller>

    {index[currentId]
      ?
      <Label
        id={currentId}
        slide={index[currentId]}
        label={index[currentId]["label"]}
        tools={index[currentId]["tools"]}
        tags={index[currentId]["tags"]}

        />
      : null
    }
    
    <CornerButton
      className={styles.slidePrev+ " "+styles.slideNav}
      onClick={prevSlide}
      edge="left" />

    <CornerButton
      className={styles.slideNext+ " "+styles.slideNav}
      onClick={nextSlide}
      edge="right" />

    </>
    );

}