import React, {useRef, useEffect, useState} from "react";

import SvgIcon from "../SvgIcon/SvgIcon.jsx";
import styles from "./SlideLabel.module.css";

import NavStyles from "../Navigation/Navigation.module.css";

import { SwitchTransition, CSSTransition } from 'react-transition-group';

import { Link } from "react-router-dom";

import UID from "../../utils/UID.js";

export const LabelContainer = ({id, children, expanded}) => {

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        appear
        key={id}
        timeout={100}
        addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
        classNames={{
           //appear: styles['appear'],
           //appearActive: styles['appear-active'],
           //appearDone: styles['appear-done'],
           enter: styles['enter'],
           enterActive: styles['enter-active'],
           //enterDone: styles['enter-done'],
           exit: styles['exit'],
           exitActive: styles['exit-active'],
           exitDone: styles['done-exit'],
          }}
        >

        <div className={styles.labelContainer}>
          <div className={styles.labelBody+" "+(expanded?styles.expanded:"")}>
            
            {children}
            
          </div> 
        </div>

      </CSSTransition>
    </SwitchTransition> 
  )

}

export const LabelSection = ({children, className, expanded=false, setExpanded=()=>{}, wMore=false}) => {
  
  const [hasMore, setHasMore] = useState(false);
  const el = useRef();

  useEffect(function(){
    if(!wMore) return;
    const height = el.current && el.current.scrollHeight;

    if(height > 90){
      setHasMore(true);
    }
    else if(!expanded){
      setHasMore(false);
    }
  }, [children])

  return (
    <>

      <div ref={el} className={styles.section + " " + (className||'') + " " + (hasMore ? styles["hasMore"] : "") }>
        {children}

        <div 
          className={styles.moreButton+" "+(expanded ? styles.up : '')}
          onClick={() => setExpanded(!expanded)}><SvgIcon name="trianglearrow" /></div>
      </div>
    </>
    )
  
}


export const Navigation = ({children, expanded}) => {
  
  return (
    <LabelSection className={styles.navigation +" "+(expanded?styles.expanded:'')}>
      
      <Link to="/folio" className={styles.indexButton+' '+NavStyles.navElement}><SvgIcon name="corner" style={{transform:"rotate(180deg)"}}/> Folio Index</Link>
      
      {children}
  
    </LabelSection>
    )
}

export const Tools = ({children, ...args}) => {
  return (
      <LabelSection className={styles.tools} wMore={true} {...args}>
        <div className={styles.sectionLabel}>Tools</div>
        {children}
      </LabelSection>
    );
}

export const Label = ({children}) => {
  return (
      <LabelSection className={styles.label}>
        <div className={styles.sectionLabel}>Label</div>
        {children}
      </LabelSection>
    );
}

export const Tags = ({children, ...args}) => {
  return (
      <LabelSection className={styles.last+" "+styles.tags} wMore={true} {...args}>
        <div className={styles.sectionLabel}>Tags</div>
        {children}    
      </LabelSection>
    );
}



