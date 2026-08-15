import React, {useState, useEffect, useRef} from "react";

import {AboutFolioSwitch} from "../StatedComponents/StatedComponents";

import {LabelContainer, Navigation, Tools, Label, Tags} from "../../components/Slides/SlideLabel.jsx";

import ToolsIcons from "../../components/ToolsIcons/ToolsIcons.jsx";

export default ({ slide, label, tools=[], tags=[], children, id }) => {
  
  const [expanded, setExpanded] = useState(false);
  
  useEffect(function(){
    setExpanded(slide.expanded)
  }, [id]);

  useEffect(function(){
    slide.expanded = expanded;
  }, [expanded])

  return (
    <LabelContainer id={id} expanded={expanded}>
      
      <Navigation>

        <AboutFolioSwitch />

      </Navigation>
      
      <Tools expanded={expanded} setExpanded={setExpanded}>
      {tools.map(toolName => {
        const [abbr, fullname]= Array.isArray(toolName) 
          ? toolName
          : [toolName, undefined];

        return (
          <ToolsIcons key={abbr} abbr={abbr} fullname={fullname} />
          )
      })} 
      </Tools>

      <Label>{label}</Label>

      <Tags expanded={expanded} setExpanded={setExpanded}>{tags.join(', ')}</Tags>

      {children}

    </LabelContainer>
  )
}