import {useState, useEffect, useRef} from "react";

import styles from "./ExpandableContainer.module.css";

import SvgIcon from "../SvgIcon/SvgIcon";

export const Expandable = ({
  theme="light", 
  right=false,
  filled=false,
  clickable=false,
  onlyarrow=false,

  onClick=()=>{},

  className, 
  expanded:expandedInput,
  children, 

  ...args
}) => {
  const [expanded, setExpanded] = useState(expandedInput);
  const containerRef = useRef();

  useEffect(function setExpandedInput(){
    setExpanded(expandedInput)
  },[expandedInput]);

  useEffect(function setExpandedOnChildrenChange(){
    setExpanded(expandedInput||false)
  }, [children])

  return <Container
        theme={theme}
        filled={filled}
        clickable={clickable}
        onClick={(e) => {
          if(clickable) setExpanded(!expanded);
          onClick(e);
        }}
        reference={containerRef}
        className={className}
        expanded={expanded}>

        <Section
          theme={theme}
          right={right}
          filled={filled}
          containerRef={containerRef}
          expanded={expanded} {...args}>

          {children}
          
          <MoreButton 
            right={right}
            theme={theme} 
            expanded={expanded} 
            onlyarrow={onlyarrow}
            onClick={() => setExpanded(!expanded)}/>
        
        </Section>
      
      </Container>

}

export const Container = ({
  className="",
  filled=false,
  clickable,
  theme,
  expanded,
  children,
  reference,
  ...args
}) => <div 
  ref={reference}
  className={(clickable?styles['clickable']+' ':'')+(theme?styles[theme]+' ':'')+(filled?styles.filled+' ':'')+(className+' '+styles.container+" "+(expanded?styles.expanded:""))}
  {...args}>
    {children}
</div> 

export const Section = ({
  theme,
  right=false,
  filled=false,
  children,
  className, 
  expanded=false, 
  setExpanded=()=>{},
  expandable=true,
  containerRef=null
}) => {

  const [hasMore, setHasMore] = useState(false);
  const el = useRef();
  const container = containerRef || el;
  const [maxHeight, setMaxHeight] = useState();

  useEffect(function(){

    setTimeout(function determenHasMore(){
      if(expanded) return;
      if(!expandable) return;
      if(!el.current) return;
      
      const scrollHeight = el.current.scrollHeight;
      const {maxHeight, height} = getComputedStyle(container.current);
      const value = Math.min(maxHeight.replace(/[^\d\.]/g,'')*1, height.replace(/[^\d\.]/g,'')*1  );
      
      //console.log('has more', scrollHeight, height, scrollHeight > height + 10, expanded, value, maxHeight, height, children)

      if(scrollHeight > value + 10){
        setHasMore(true);
      }
      else {
        setHasMore(false);
      }

      setMaxHeight(scrollHeight);
    }, 5)
    
  }, [children])

  return (
    <>
      {maxHeight 
        ? 
      <style>
      {`${'.'+styles.container+'.'+styles.expanded}{
        height: 100% !important;
        max-height: ${maxHeight}px;
      }`}
      </style> 
        : null
      }

      <div ref={el} className={(theme?styles[theme]+' ':'')+(filled?styles.filled+' ':'')+(right?styles["right"]:'')+' '+styles.section + " " + (className||'') + " " + (hasMore ? styles["hasMore"] : "") }>
        
        {children}

      </div>
    </>
    )
}

export const MoreButton = ({
  theme="light",
  expanded,
  right,
  onlyarrow,
  className, ...args
}) => <div 
  className={(onlyarrow?styles['onlyarrow']+' ':'')+(right?styles["right"]:'')+' '+styles[theme]+' '+styles.moreButton+" "+(expanded ? styles.up : '')} 
  {...args}>

  <SvgIcon name="trianglearrow" />
</div>

export default Expandable;